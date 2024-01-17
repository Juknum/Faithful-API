import { FirstCreationSubmission, Submission } from "./submissions";
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

export interface PackGitHub {
	repo: string;
	org: string;
}

export type PackTag = "vanilla" | "faithful" | "classic_faithful" | "jappa" | "progart";

export type PackType = "submission" | "default" | "all";

export interface PackSearch {
	tag?: PackTag;
	name?: string;
	resolution?: number;
	type?: PackType;
}

export interface CreationPack {
	// either can be specified manually or serialized automatically
	id?: string;
	name: string;
	tags: PackTag[];
	logo: string;
	resolution: number;
	// not all editions are required
	github: Partial<Record<Edition, PackGitHub>>;
}

export interface Pack extends CreationPack {
	// override since now you know what packs exist
	id: AnyPack;
}

export interface PackAll extends Pack {
	submission: Submission | {};
}

export interface CreationPackAll extends CreationPack {
	submission?: FirstCreationSubmission;
}

export interface Packs extends Array<Pack> {}

export interface FirestormPack extends Pack {
	submission(): Promise<Submission>;
}

export interface PackRepository {
	getRaw(): Promise<Record<string, Pack>>;
	getById(id: AnyPack): Promise<Pack>;
	getWithSubmission(id: AnyPack): Promise<PackAll>;
	getAllTags(): Promise<PackTag[]>;
	search(params: PackSearch): Promise<Packs>;
	renamePack(oldPack: AnyPack, newPack: string): Promise<void>;
	create(packId: string, packToCreate: CreationPackAll): Promise<CreationPackAll>;
	update(packId: AnyPack, newPack: Pack): Promise<Pack>;
	delete(packId: AnyPack): Promise<void>;
}
