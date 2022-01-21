import { Files } from "./files";

export interface Addons extends Array<Addon> {}
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
		status: "approved" | "denied" | "pending";
		author: null | string; // approval/deny author
		reason: null | string; // reason of deny
	};
}

export interface AddonsAll extends Array<AddonAll> {}
export interface AddonAll extends Addon {
	files: Files;
}

export interface AddonRepository {
	getRaw(): Promise<Addons>;
	getAddonById(id: number): Promise<Addon>;
	getAllById(id: number): Promise<AddonAll>;
	getFilesById(addonId: number): Promise<Files>;
}
