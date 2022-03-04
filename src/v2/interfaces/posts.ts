export interface Posts extends Array<Post> {}
export interface Post {
	id: string; // post unique id
	name: string; // addon name (> 5 && < 30)
	description: string; // addon description (> 256 && < 4096)
	authors: Array<string>; // discord users IDs
	comments: boolean; // true if comments are enabled on this addon
	slug: string; // used in link & as comments id (ex: 'www.compliancepack.net/addons/compliance3D')
}
