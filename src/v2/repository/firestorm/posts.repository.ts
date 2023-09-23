import { ID_FIELD } from "firestorm-db";
import { posts } from "../../firestorm";
import { CreateWebsitePost, WebsitePost as Post, WebsitePostRepository } from "../../interfaces";

export default class PostFirestormRepository implements WebsitePostRepository {
	getRaw(): Promise<Record<string, Post>> {
		return posts.read_raw();
	}

	getById(id: number): Promise<Post> {
		return posts.get(id);
	}

	getByPermalink(permalink: string): Promise<Post> {
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

	create(postToCreate: CreateWebsitePost): Promise<Post> {
		const { permalink } = postToCreate;
		return posts
			.add(postToCreate)
			.then(() => this.getByPermalink(permalink))
			.then((results) => results[0]);
	}

	update(id: number, post: CreateWebsitePost): Promise<Post> {
		const postWithId = {
			...post,
		};
		postWithId[ID_FIELD] = String(id);
		return posts.set(id, postWithId).then(() => posts.get(id));
	}

	delete(id: number): Promise<void> {
		return posts.remove(String(id)).then(() => {}); // return nothing
	}
}
