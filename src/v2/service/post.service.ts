import {
	WebsitePostDownloadRecord,
	WebsitePostChangelogRecord,
	WebsitePost,
	CreateWebsitePost,
} from "../interfaces";
import { NotFoundError } from "../tools/ApiError";
import PostFirestormRepository from "../repository/firestorm/posts.repository";

export default class PostService {
	private readonly postRepo = new PostFirestormRepository();

	public async getByIdOrPermalink(id_or_permalink: string): Promise<WebsitePost> {
		let postFound: WebsitePost | undefined; // undefined
		const parsed = Number.parseInt(id_or_permalink, 10);

		if (!Number.isNaN(parsed)) {
			postFound = await this.getById(parsed).catch(() => undefined);
		}

		if (postFound === undefined)
			postFound = await this.getByPermalink(id_or_permalink).catch(() => undefined);

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

	getDownloadsForId(id: number): Promise<WebsitePostDownloadRecord | null> {
		return this.getById(id).then((post) => post.downloads || null);
	}

	getChangelogForId(id: number): Promise<WebsitePostChangelogRecord | null> {
		return this.getById(id).then((post) => post.changelog || null);
	}

	create(post: CreateWebsitePost): Promise<WebsitePost> {
		return this.postRepo.create(post);
	}

	update(id: number, post: CreateWebsitePost): Promise<WebsitePost> {
		return this.postRepo.update(id, post);
	}

	delete(id: number): Promise<void> {
		return this.postRepo.delete(id);
	}
}
