import { Files } from "./files";

export interface AddonDownload {
	key: string;
	links: string[];
}

export const AddonTagValues = ["Java", "32x", "Bedrock", "64x"] as const;

export type AddonTag = typeof AddonTagValues;
export type AddonTagArray = Array<AddonTag[number]>;

export const AddonNotApprovedValues = [
	"archived",
	"denied",
	"pending",
] as const;
export type AddonProperty = "files" | "all";
export type AddonNotApproved = typeof AddonNotApprovedValues[number];
export const AddonStatusApproved = "approved" as const;
export const AddonStatusValues = [
	...AddonNotApprovedValues,
	AddonStatusApproved,
] as const;
export type AddonStatus = typeof AddonStatusValues[number];

export interface AddonReviewBody {
	status: null | AddonStatus;
	reason: null | string; // reason of deny
}

export interface AddonReview extends AddonReviewBody {
	author: null | string; // approval/deny author -> Discord ID
}

export interface Addon {
	id?: number | string;
	name: string; // addon name (> 5 && < 30)
	slug: string; // used in link & as comments id (ex: 'www.faithfulpack.net/addons/Faithful3D')
	description: string; // addon description (> 256 && < 4096)
	authors: Array<string>; // discord users IDs
	options: {
		comments: boolean; // true if comments are enabled on this addon
		optifine: boolean; // true if the pack require optifine to work properly
		tags: AddonTagArray; // Edition + Resolution
	};
	embed_description?: string;
	last_updated?: number;
	approval: AddonReview;
}
export interface Addons extends Array<Addon> {}

export type AddonDataParam = Pick<
	Addon,
	"name" | "description" | "authors" | "options" | "embed_description"
>;

export interface AddonCreationParam extends AddonDataParam {
	downloads: AddonDownload[];
}

export interface AddonUpdateParam extends AddonCreationParam {
	reason: string
}

export interface AddonAll extends Addon {
	files: Files;
}
export interface AddonsAll extends Array<AddonAll> {}

export interface AddonStats {
	approved: number;
	numbers: Record<AddonTag[number], number>;
}

export interface AddonStatsAdmin extends AddonStats {
	pending: number;
	denied: number;
	archived: number;
}

export interface AddonRepository {
	getRaw(): Promise<Record<string, Addon>>;
	getAddonById(id: number): Promise<Addon>;
	getAddonBySlug(slug: string): Promise<Addon | undefined>;
	getAddonByStatus(status: AddonStatus): Promise<Addons>;
	getFilesById(addonId: number): Promise<Files>;
	create(addon: Addon): Promise<Addon>;
	delete(id: number): Promise<void>;
	update(id: number, addon: Addon): Promise<Addon>;
}
