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

export type TextureProperty =  "uses" | "paths" | "contributions" | "all" | null;

export interface TextureRepository {
	getRaw(): Promise<Textures>;
	getTextureById(id: number): Promise<Texture>;
	getUsesById(id: number): Promise<Uses>;
	getPathsById(id: number): Promise<Paths>;
	getContributionsById(id: number): Promise<Contributions>;
	getAllById(id: number): Promise<TextureAll>;
	getVersions(): Promise<string[]>;
	getEditions(): Promise<string[]>;
	getResolutions(): Promise<string[]>;
	getTags(): Promise<string[]>;
	getVersionByEdition(edition: string): Promise<string[]>;
	searchTextureByName(name: string, property: TextureProperty): Promise<Textures>;
}
