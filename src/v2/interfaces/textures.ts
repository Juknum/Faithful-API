import { CreatedUse, Uses } from "./uses";
import { Paths } from "./paths";
import { Contributions } from "./contributions";

export interface TextureCreationParam {
	name: string | number; // texture name
	tags: Array<string>; // texture tags (block, item...)
}
export interface Texture extends TextureCreationParam {
	id: string; // texture unique id
}
export interface Textures extends Array<Texture> {}

export interface TextureMCMETA {
	animation: {
		interpolate?: true;
		frametime?: number;
		frames?: Array<number | { index: number; time: number }>;
	};
}

export interface TextureAll extends Texture {
	uses: Uses;
	paths: Paths;
	mcmeta: TextureMCMETA;
	contributions: Contributions;
}
export interface TexturesAll extends Array<TextureAll> {}

// 🐰 🤲 OUR PACKS
export const OurPacksArr = [
	"faithful_32x",
	"faithful_64x",
	"classic_faithful_32x",
	"classic_faithful_32x_progart",
	"classic_faithful_64x",
] as const;
export const DefaultPacksArr = ["default", "progart"] as const;
export const KnownPacksArr = [...DefaultPacksArr, ...OurPacksArr] as const;

export interface CreatedTexture extends TextureCreationParam {
	uses: CreatedUse[];
}

export interface CreatedTextures extends Array<CreatedTexture> {}
export type KnownPacks = (typeof KnownPacksArr)[number];
export type Edition = "java" | "bedrock" | "dungeons";
export type TextureProperty = "uses" | "paths" | "contributions" | "mcmeta" | "all" | null;

export interface TextureRepository {
	changeTexture(id: string, body: TextureCreationParam): Promise<Texture>;
	getRaw(): Promise<Textures>;
	getByNameIdAndTag(tag?: string, search?: string): Promise<Textures>;
	getTextureById(id: number, property: TextureProperty): Promise<Texture>;
	getVersions(): Promise<Array<string>>;
	getEditions(): Promise<Array<string>>;
	getResolutions(): Promise<Array<number>>;
	getTags(): Promise<Array<string>>;
	getVersionByEdition(edition: Edition): Promise<Array<string>>;
	searchTexturePropertyByNameOrId(
		name_or_id: string | number,
		property: TextureProperty,
	): Promise<Textures | Texture | Paths | Uses | Contributions | TextureMCMETA>;
	searchTextureByNameOrId(name_or_id: string | number): Promise<Textures | Texture>;
	getURLById(id: number, pack: KnownPacks, version: string): Promise<string>;
	createTexture(texture: TextureCreationParam): Promise<Texture>;
	deleteTexture(id: string);
}
