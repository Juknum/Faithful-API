import { Submission } from "./submissions";
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

export interface Pack {
	id: AnyPack;
	tags: PackTag[];
	display_name: string;
	resolution: number;
	github: Record<Edition, PackGitHub>;
}

export interface Packs extends Array<Pack> {}

export interface FirestormPack extends Pack {
	submission(): Promise<Submission>;
}

export interface PackRepository {
	getRaw(): Promise<Record<string, Pack>>;
	getById(id: string): Promise<Pack>;
	getAllTags(): Promise<PackTag[]>;
	searchByTag(tag: PackTag): Promise<Packs>;
	create(packId: string, packToCreate: Pack): Promise<Pack>;
	update(packId: string, newPack: Pack): Promise<Pack>;
	delete(packId: string): Promise<void>;
}
