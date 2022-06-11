import { Uses } from "./uses";
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
		interpolate?: true,
		frametime?: number;
		frames?: Array<number | { index: number, time: number }>;
	}
}

export interface TextureAll extends Texture {
	uses: Uses;
	paths: Paths;
	contributions: Contributions;
}
export interface TexturesAll extends Array<TextureAll> {}

export const KnownPacksArr: Array<string> = [ "default", "faithful_32x", "faithful_64x", "classic_faithful_32x", "classic_faithful_32x_progart", "classic_faithful_64x" ]
export type KnownPacks = typeof KnownPacksArr[number];
export type Edition = "java" | "bedrock" | "dungeons";
export type TextureProperty = "uses" | "paths" | "contributions" | "mcmeta" | "all" | null;

export interface TextureRepository {
	getRaw(): Promise<Textures>;
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
