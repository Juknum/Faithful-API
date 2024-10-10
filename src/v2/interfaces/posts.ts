import { WriteConfirmation } from "firestorm-db";

export type PostDownload =
	| Record<string, Record<string, string>> // each category: names -> links
	| Record<string, string>; // just names -> links

interface NestedChangelog {
	// recursive type (can be arbitrarily grouped)
	[key: string]: NestedChangelog | string | string[];
}

// workaround for index signatures not being supported by validation
export type PostChangelog = Record<string, NestedChangelog>;

export interface CreateWebsitePost {
	title: string; // Post main title
	permalink: string; // link to the post
	date: string; // date with format MM-DD-YYY
	header_img?: string; // header image url
	description: string; // post HTML content
	published: boolean;
	downloads?: PostDownload; // attached downloads
	changelog?: PostChangelog; // attached article changelog
}

export interface WebsitePost extends CreateWebsitePost {
	id: string;
}

export type WebsitePosts = WebsitePost[];

export interface FirestormPost extends WebsitePost {}

export interface WebsitePostRepository {
	getRaw(): Promise<Record<string, WebsitePost>>;
	getApproved(): Promise<WebsitePost[]>;
	getById(id: number): Promise<WebsitePost>;
	getByPermalink(permalink: string): Promise<WebsitePost>;
	create(post: CreateWebsitePost): Promise<WebsitePost>;
	update(id: number, post: CreateWebsitePost): Promise<WebsitePost>;
	delete(id: number): Promise<WriteConfirmation>;
}
