import { WriteConfirmation } from "firestorm-db";
import {
	WebsitePostDownloadRecord,
	WebsitePostChangelogRecord,
	WebsitePost,
	CreateWebsitePost,
} from "../interfaces";
import { NotFoundError } from "../tools/errors";
import PostFirestormRepository from "../repository/posts.repository";

export default class PostService {
	private readonly postRepo = new PostFirestormRepository();

	public async getByIdOrPermalink(idOrPermalink: string): Promise<WebsitePost> {
		let postFound: WebsitePost | undefined; // undefined
		const parsed = Number(idOrPermalink);

		if (!Number.isNaN(parsed)) postFound = await this.getById(parsed).catch(() => undefined);

		if (postFound === undefined)
			postFound = await this.getByPermalink(idOrPermalink).catch(() => undefined);

		if (postFound !== undefined) return postFound;

		throw new NotFoundError("Post not found");
	}

	getRaw(): Promise<Record<string, WebsitePost>> {
		return this.postRepo.getRaw();
	}

	getById(id: number): Promise<WebsitePost> {
		return this.postRepo
			.getById(id)
			.catch(() => Promise.reject(new NotFoundError("Post not found")));
	}

	getByPermalink(permalink: string): Promise<WebsitePost> {
		return this.postRepo
			.getByPermalink(permalink)
			.catch(() => Promise.reject(new NotFoundError("Post not found")));
	}

	async getDownloadsForId(id: number): Promise<WebsitePostDownloadRecord | null> {
		const post = await this.getById(id);
		return post.downloads || null;
	}

	async getChangelogForId(id: number): Promise<WebsitePostChangelogRecord | null> {
		const post = await this.getById(id);
		return post.changelog || null;
	}

	create(post: CreateWebsitePost): Promise<WebsitePost> {
		return this.postRepo.create(post);
	}

	update(id: number, post: CreateWebsitePost): Promise<WebsitePost> {
		return this.postRepo.update(id, post);
	}

	delete(id: number): Promise<WriteConfirmation> {
		return this.postRepo.delete(id);
	}
}
