import { Uses } from "./uses";
import { Paths } from "./paths";
import { Contributions } from "./contributions";

export interface Texture {
	id: string; // texture unique id
	name: string | number; // texture name
	tags: Array<string>; // texture tags (block, item...)
}
export interface Textures extends Array<Texture> {}

export interface TextureAll extends Texture {
	uses: Uses;
	paths: Paths;
	contributions: Contributions;
}
export interface TexturesAll extends Array<TextureAll> {}

export const KnownPacksArr: Array<string> = [ "default", "faithful_32x", "faithful_64x", "classic_faithful_32x", "classic_faithful_32x_progart", "classic_faithful_64x" ]
export type KnownPacks = typeof KnownPacksArr[number];
export type Edition = "java" | "bedrock" | "dungeons";
export type TextureProperty = "uses" | "paths" | "contributions" | "all" | null;

export interface TextureRepository {
	getTextureById(id: number, property: TextureProperty): Promise<Texture>;
	getVersions(): Promise<string[]>;
	getEditions(): Promise<string[]>;
	getResolutions(): Promise<string[]>;
	getTags(): Promise<string[]>;
	getVersionByEdition(edition: Edition): Promise<string[]>;
	searchTexturePropertyByNameOrId(
		name_or_id: string | number,
		property: TextureProperty,
	): Promise<Textures | Texture | Paths | Uses | Contributions>;
	searchTextureByNameOrId(name_or_id: string | number): Promise<Textures | Texture>;
	getURLById(id: number, pack: KnownPacks, version: string): Promise<string>;
}
