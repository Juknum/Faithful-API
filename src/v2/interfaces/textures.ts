import { Uses } from "./uses";
import { Paths } from "./paths";
import { Contributions } from "./contributions";

export interface TexturesAll extends Array<TextureAll> {}
export interface TextureAll extends Texture {
	uses: Uses;
	paths: Paths;
	contributions: Contributions;
}

export interface Textures extends Array<Texture> {}
export interface Texture {
	id: string; // texture unique id
	name: string | number; // texture name
	tags: Array<string>; // texture tags (block, item...)
}

export type Edition = "java" | "bedrock" | "dungeons";
export type TextureProperty =  "uses" | "paths" | "contributions" | "all" | null;

export interface TextureRepository {
	getRaw(): Promise<Textures>;
	getTextureById(id: number, property: TextureProperty): Promise<Texture>;
	getVersions(): Promise<string[]>;
	getEditions(): Promise<string[]>;
	getResolutions(): Promise<string[]>;
	getTags(): Promise<string[]>;
	getVersionByEdition(edition: Edition): Promise<string[]>;
	searchTextureByName(name: string, property: TextureProperty): Promise<Textures>;
}
