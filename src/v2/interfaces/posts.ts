import { WriteConfirmation } from "firestorm-db";

export interface Post {
	id: string; // post unique id
	name: string; // post name (> 5 && < 30)
	description: string; // post description (> 256 && < 4096)
	authors: Array<string>; // discord users IDs
	slug: string; // used in link (ex: 'www.faithfulpack.net/faithful32x/R2')
}
export interface Posts extends Array<Post> {}

interface WebsitePostDownload {
	name: string; // download label
	url: string; // download URL
}
export type WebsitePostDownloadRecord = Record<string, WebsitePostDownload[]>;
export type WebsitePostChangelogRecord = Record<string, Record<string, string[]>>;

export interface CreateWebsitePost {
	title: string; // Post main title
	permalink: string; // link to the post
	date: string; // date with format MM-DD-YYY
	headerImg?: string; // header image url
	description: string; // post HTML content
	published: boolean;
	downloads?: WebsitePostDownloadRecord; // possible downloads attached
	changelog?: WebsitePostChangelogRecord; // possible article changelog attached
}

export interface WebsitePost extends CreateWebsitePost {
	id: string;
}

export interface FirestormPost extends WebsitePost {}

export interface WebsitePostRepository {
	getRaw(): Promise<Record<string, WebsitePost>>;
	getById(id: number): Promise<WebsitePost>;
	getByPermalink(permalink: string): Promise<WebsitePost>;
	create(post: CreateWebsitePost): Promise<WebsitePost>;
	update(id: number, post: CreateWebsitePost): Promise<WebsitePost>;
	delete(id: number): Promise<WriteConfirmation>;
}
