import { Files } from "./files";

export interface AddonDownload {
	key: string;
	links: string[];
}

export const AddonTagValues = ["Java", "32x", "Bedrock", "64x"] as const;

export type AddonTag = typeof AddonTagValues;
export type AddonTagArray = Array<AddonTag[number]>;

export interface Addons extends Array<Addon> {}
export interface Addon {
	name: string; // addon name (> 5 && < 30)
	slug: string; // used in link & as comments id (ex: 'www.compliancepack.net/addons/compliance3D')
	description: string; // addon description (> 256 && < 4096)
	authors: Array<string>; // discord users IDs
	options: {
		comments: boolean; // true if comments are enabled on this addon
		optifine: boolean; // true if the pack require optifine to work properly
		tags: AddonTagArray; // Edition + Resolution
	};
	approval: {
		status: "approved" | "denied" | "pending";
		author: null | string; // approval/deny author
		reason: null | string; // reason of deny
	};
}

export type AddonDataParam = Pick<Addon, "name" | "description" | "authors" | "options">;

export interface AddonCreationParam extends AddonDataParam {
	downloads: AddonDownload[];
}

export interface AddonsAll extends Array<AddonAll> {}
export interface AddonAll extends Addon {
	files: Files;
}

export interface AddonRepository {
	getRaw(): Promise<Addons>;
	getAddonById(id: number): Promise<Addon>;
	getAddonBySlug(slug: string): Promise<Addon>;
	getFilesById(addonId: number): Promise<Files>;
	create(addon: Addon): Promise<Addon>;
	delete(id: number): Promise<void>;
}
