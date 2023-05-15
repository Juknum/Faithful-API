import { Request as ExRequest, Response as ExResponse } from "express";
import {
	Controller,
	Get,
	Path,
	Request,
	Response,
	Route,
	Post,
	Security,
	SuccessResponse,
	Tags,
	Body,
	Put,
	Delete,
} from "tsoa";
import DOMPurify from 'isomorphic-dompurify';
import {
	WebsitePostDownloadRecord,
	WebsitePostChangelogRecord,
	WebsitePost,
	CreateWebsitePost
} from "../interfaces";

import {
	BadRequestError,
	NotFoundError,
	PermissionError,
} from "../tools/ApiError";
import cache from "../tools/cache";
import PostService from "../service/post.service";
import { filterRecord } from "../tools/extract";

@Route("posts")
@Tags("Posts")
export class PostController extends Controller {
	private readonly service: PostService = new PostService();

	/**
	 * Get the raw collection
	 */
	@Response<PermissionError>(403)
	@Response<NotFoundError>(404)
	@Security("discord", ["administrator"])
	@Get("/raw")
	public async getRaw(): Promise<Record<string, WebsitePost>> {
		return this.service.getRaw();
	}

	/**
	 * Get all the published posts
	 */
	@Response<NotFoundError>(404)
	@Get("/")
	public async getAll(): Promise<Record<string, WebsitePost>> {
		return this.service.getRaw()
			.then(r => filterRecord(r, p => p.published));
	}

	/**
	 * Get any post with id or permalink
	 * @param id_or_permalink Desired post id or permalink
	 */
	@Response<NotFoundError>(404)
	@Get("{id_or_permalink}")
	public async getPost(@Path() id_or_permalink: string): Promise<WebsitePost> {
		return cache.handle(`website-post-${encodeURI(id_or_permalink)}`,
			() => this.service.getByIdOrPermalink(decodeURI(id_or_permalink)));
	}

	/**
	 * Get a redirect URL for the requested post header
	 * @param id_or_permalink ID or permalink of the requested post
	 */
	@Response<NotFoundError>(404)
	@Get("{id_or_permalink}/header")
	@SuccessResponse(302, "Redirect")
	public async getHeaderForPost(
		@Path() id_or_permalink: string,
		@Request() request: ExRequest
	): Promise<void> {
		const post = await this.service.getByIdOrPermalink(id_or_permalink);
		console.log(post)
		const { headerImg } = post;

		if (!headerImg) throw new NotFoundError("Post header image not found");

		const response = (<any>request).res as ExResponse;
		response.redirect(headerImg, 302);
	}

	/**
	 * Get the possible downloads for the given post
	 * @param id ID of the requested post
	 */
	@Response<NotFoundError>(404)
	@Get("{id}/downloads")
	public async getPostDownloads(@Path() id: number): Promise<WebsitePostDownloadRecord | null> {
		return cache.handle(`website-post-downloads-${id}`,
			() => this.service.getDownloadsForId(id));
	}

	/**
	 * Get the possible changelog for the given post
	 * @param id ID of the requested post
	 */
	@Response<NotFoundError>(404)
	@Get("{id}/changelog")
	public async getPostChangelog(@Path() id: number): Promise<WebsitePostChangelogRecord | null> {
		return this.service.getChangelogForId(id)
	}

	private sanitizeDescription(input: string): string {
		return DOMPurify.sanitize(input);
	}

	/**
	 * Creates post and returns the created post
	 * @param postToCreate 
	 * @returns 
	 */
	@Response<BadRequestError>(400)
	@Response<PermissionError>(403)
	@Security("discord", ["administrator"])
	@Post("")
	public async createPost(@Body() postToCreate: CreateWebsitePost): Promise<WebsitePost> {
		postToCreate.description = this.sanitizeDescription(postToCreate.description);
		return this.service.create(postToCreate);
	}

	/**
	 * Updates the post to the given id
	 * @param id post id
	 * @param postToCreate body
	 * @returns updated article
	 */
	@Response<BadRequestError>(400)
	@Response<PermissionError>(403)
	@Security("discord", ["administrator"])
	@Put("{id}")
	public updatePost(@Path() id: number, @Body() postToCreate: CreateWebsitePost): Promise<WebsitePost> {
		postToCreate.description = this.sanitizeDescription(postToCreate.description);
		return this.service.update(id, postToCreate);
	}

	/**
	 * Deletes the post with the given id
	 * @param id post id
	 * @returns nothing
	 */
	@Response<BadRequestError>(400)
	@Response<PermissionError>(403)
	@Security("discord", ["administrator"])
	@Delete("{id}")
	public deletePost(@Path() id: number): Promise<void> {
		return this.service.delete(id);
	}
}
