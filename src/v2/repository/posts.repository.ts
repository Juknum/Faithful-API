import { ID_FIELD, WriteConfirmation } from "firestorm-db";
import { posts } from "../firestorm";
import { CreateWebsitePost, WebsitePost, WebsitePostRepository, WebsitePosts } from "../interfaces";

export default class PostFirestormRepository implements WebsitePostRepository {
	getRaw(): Promise<Record<string, WebsitePost>> {
		return posts.readRaw();
	}

	getApproved(): Promise<WebsitePosts> {
		return posts.search([
			{
				field: "published",
				criteria: "==",
				value: true,
			},
		]);
	}

	getById(id: number): Promise<WebsitePost> {
		return posts.get(id);
	}

	async getByPermalink(permalink: string): Promise<WebsitePost> {
		const results = await posts.search([
			{
				criteria: "==",
				field: "permalink",
				value: permalink,
			},
		]);
		return results[0];
	}

	create(postToCreate: CreateWebsitePost): Promise<WebsitePost> {
		const { permalink } = postToCreate;
		return posts.add(postToCreate).then(() => this.getByPermalink(permalink));
	}

	update(id: number, post: CreateWebsitePost): Promise<WebsitePost> {
		const postWithId = {
			...post,
			[ID_FIELD]: String(id),
		};
		return posts.set(id, postWithId).then(() => posts.get(id));
	}

	delete(id: number): Promise<WriteConfirmation> {
		return posts.remove(id);
	}
}
