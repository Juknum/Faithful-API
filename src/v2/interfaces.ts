export interface Error {
	error: string;
}

export interface TexturesAll extends Array<TextureAll> { }
export interface TextureAll extends Texture {
	uses: Uses;
	paths: Paths;
	contributions: Contributions;
}

export interface Textures extends Array<Texture> { }
export interface Texture {
	id: string; // texture unique id
	name: string | number; // texture name
	tags: Array<string>; // texture tags (block, item...)
}

export interface Uses extends Array<Use> { }
export interface Use {
	id: string; // use unique id
	name: string; // use name
	texture: number; // texture id
	edition: string; // game edition
	assets: string; // assets folder name (empty for bedrock)
}

export interface Paths extends Array<Path> { }
export interface Path {
	id: string; // path unique id
	name: string; // texture path ('textures/block/stone.png')
	use: string; // use id
	versions: Array<string>; // MC versions
	mcmeta: boolean; // true if animated
}

export interface Contributions extends Array<Contribution> { }
export interface Contribution {
	id: string; // contribution unique id
	date: number; // unix timestamp
	resolution: '32x' | '64x'; // texture resolution
	authors: Array<string>; // discords users ids
	texture: string; // texture id
}

export interface Users extends Array<User> { }
export interface User {
	id: string; // discord user id
	username: string; // username displayed online
	roles: Array<string>; // discord roles the user have
	uuid: string; // MC UUID
	muted: {
		// todo: use discord timeout instead
		start: string; // unix timestamp of the beginning of the mute
		end: string; // unix timestamp of the end of the mute
	};
	warns: Array<string>; // list of all warns
}

export interface Addons extends Array<Addon> { }
export interface Addon {
	id: string; // addon unique id
	name: string; // addon name (> 5 && < 30)
	slug: string; // used in link & as comments id (ex: 'www.compliancepack.net/addons/compliance3D')
	description: string; // addon description (> 256 && < 4096)
	authors: Array<string>; // discord users IDs
	options: {
		comments: boolean; // true if comments are enabled on this addon
		optifine: boolean; // true if the pack require optifine to work properly
		tags: Array<string>; // Edition + Resolution
	};
	approval: {
		status: "approved" | "denied" | "pending",
		author: null | string; // approval/deny author
		reason: null | string; // reason of deny
	}
}

export interface AddonsAll extends Array<AddonAll> { }
export interface AddonAll extends Addon {
	files: Files
}

export interface Posts extends Array<Post> { }
export interface Post {
	id: string; // post unique id
	name: string; // addon name (> 5 && < 30)
	description: string; // addon description (> 256 && < 4096)
	authors: Array<string>; // discord users IDs
	comments: boolean; // true if comments are enabled on this addon
	slug: string; // used in link & as comments id (ex: 'www.compliancepack.net/addons/compliance3D')
}

export interface Files extends Array<File> { }
export interface File {
	id: string; // file unique id
	name: string | null; // file name when uploaded
	use: "header" | "screenshot" | "file";
	type: "url" | "b64";
	parent: {
		type: string; // collection name (addon, post...)
		id: string; // id of the parent
	};
	source: string; // file content/url (ex: 'database.compliancepack.net/images/test.png')
}

export interface Changelogs extends Array<Changelog> { }
export interface Changelog {
	id: string; // changelog unique id
	name: string; // changelog name (ex: 'Beta 2')
	added: Changes;
	modified: Changes;
	removed: Changes;
	fixed: Changes;
}

export interface Changes extends Array<Change> { }
export interface Change {
	id: string; // change unique id
	contribution?: Contribution;
	comment: string; // additional comment
}

export interface Mods extends Array<Mod> { }
export interface Mod {
	id: string; // mod id (curseforge project id) (custom if not curseforge)
	name: string; // mod name (ex: Industrial Craft 2)
	aliases: Array<string>; // mod aliases (ex: IC2)
	curse_url: string; // curseforge project url (if not: undefined)
	resource_pack: {
		blacklist: Array<string>; // mc versions without textures
		versions: Array<string>; // mc versions supported
		git_repository: string; // github repository link
	};
	blacklisted: boolean; // if true, the mod is fully blacklisted
}

export interface Modpacks extends Array<Mod> { }
export interface Modpack {
	id: string; // modpack id (curseforge project id)
	name: string; // modpack name
	authors: Array<string>; // modpacks authors
	versions: Array<{
		id: string; // modpack version
		minecraft: string; // minecraft version (ex: "1.18")
		mods: Mods;
	}>;
}
