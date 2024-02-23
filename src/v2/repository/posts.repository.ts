import { ID_FIELD, WriteConfirmation } from "firestorm-db";
import { posts } from "../firestorm";
import { CreateWebsitePost, WebsitePost, WebsitePostRepository } from "../interfaces";

export default class PostFirestormRepository implements WebsitePostRepository {
	getRaw(): Promise<Record<string, WebsitePost>> {
		return posts.readRaw();
	}

	getById(id: number): Promise<WebsitePost> {
		return posts.get(id);
	}

	getByPermalink(permalink: string): Promise<WebsitePost> {
		return posts
			.search([
				{
					criteria: "==",
					field: "permalink",
					value: permalink,
				},
			])
			.then((results) => results[0]);
	}

	create(postToCreate: CreateWebsitePost): Promise<WebsitePost> {
		const { permalink } = postToCreate;
		return posts
			.add(postToCreate)
			.then(() => this.getByPermalink(permalink))
			.then((results) => results[0]);
	}

	update(id: number, post: CreateWebsitePost): Promise<WebsitePost> {
		const postWithId = {
			...post,
		};
		postWithId[ID_FIELD] = String(id);
		return posts.set(id, postWithId).then(() => posts.get(id));
	}

	delete(id: number): Promise<WriteConfirmation> {
		return posts.remove(String(id));
	}
}
