import { Edition } from "./textures";

export const FaithfulPacksArr = [
	"faithful_32x",
	"faithful_64x",
	"classic_faithful_32x",
	"classic_faithful_32x_progart",
	"classic_faithful_64x",
] as const;

export const DefaultPacksArr = ["default", "progart"] as const;
export const AnyPackArr = [...DefaultPacksArr, ...FaithfulPacksArr] as const;

export type FaithfulPack = (typeof FaithfulPacksArr)[number];
export type DefaultPack = (typeof DefaultPacksArr)[number];
export type AnyPack = (typeof AnyPackArr)[number];

export interface SubmissionChannels {
	submit: string;
	council?: string; // not used if council disabled
	results: string;
}

export interface PackGitHub {
	repo: string;
	org: string;
}

export type PackTags = "vanilla" | "faithful" | "classic_faithful" | "jappa" | "progart";

export interface Pack {
	id: AnyPack;
	tags: PackTags[];
	display_name: string;
	resolution: number;
	submission?: {
		channels: SubmissionChannels;
		council_enabled: boolean;
		time_to_results: number;
		time_to_council?: number; // not used if council disabled
		contributor_role?: string;
	};
	github: Record<Edition, PackGitHub>;
}

export interface Packs extends Array<Pack> {}

export interface FirestormPack extends Pack {}

export interface PackRepository {
	getRaw(): Promise<Record<string, Pack>>;
	getById(id: string): Promise<Pack>;
	create(packId: string, packToCreate: Pack): Promise<Pack>;
	update(packId: string, newPack: Pack): Promise<Pack>;
	delete(packId: string): Promise<void>;
}
