import { WriteConfirmation } from "firestorm-db";
import { EntireUseToCreate, Uses } from "./uses";
import { Paths } from "./paths";
import { Contributions } from "./contributions";
import { PackID } from "./packs";

export interface TextureCreationParam {
	name: string | number; // texture name
	tags: Array<string>; // texture tags (block, item...)
}
export interface Texture extends TextureCreationParam {
	id: string; // texture unique id
}
export type Textures = Texture[];

export interface MCMETA {
	animation?: {
		interpolate?: boolean;
		frametime?: number;
		frames?: Array<number | { index: number; time: number }>;
	};
}

export interface TextureAll extends Texture {
	uses: Uses;
	paths: Paths;
	mcmeta: MCMETA;
	contributions: Contributions;
}

export type TexturesAll = TextureAll[];

export interface EntireTextureToCreate extends TextureCreationParam {
	uses: EntireUseToCreate[];
}

export type Edition = "java" | "bedrock";
export type TextureProperty = null | "uses" | "paths" | "contributions" | "mcmeta" | "all";

// average typescript experience
export type PropertyToOutput<T extends TextureProperty> = T extends null
	? Texture | Textures
	: T extends "uses"
		? Uses
		: T extends "paths"
			? Paths
			: T extends "contributions"
				? Contributions
				: T extends "mcmeta"
					? MCMETA
					: T extends "all"
						? TextureAll
						: never;

export interface FirestormTexture extends Texture {
	uses(): Promise<Uses>;
	paths(): Promise<Paths>;
	url(pack: PackID, version: string): Promise<string>;
	contributions(): Promise<Contributions>;
	mcmeta(): Promise<MCMETA>;
	all(): Promise<TextureAll>;
}

export interface TextureRepository {
	changeTexture(id: string, body: TextureCreationParam): Promise<Texture>;
	getRaw(): Promise<Record<string, Texture>>;
	getByNameIdAndTag(
		tag: string | undefined,
		search: string | undefined,
		forcePartial?: boolean,
	): Promise<Textures>;
	getTextureById(id: number, property: TextureProperty): Promise<PropertyToOutput<TextureProperty>>;
	getVersions(): Promise<Array<string>>;
	getEditions(): Promise<Array<string>>;
	getResolutions(): Promise<Array<number>>;
	getTags(): Promise<Array<string>>;
	getVersionByEdition(edition: Edition): Promise<Array<string>>;
	searchTexturePropertyByNameOrId(
		nameOrID: string | number,
		property: TextureProperty,
	): Promise<Textures | Texture | Paths | Uses | Contributions | MCMETA>;
	searchTextureByNameOrId(nameOrID: string | number): Promise<Textures | Texture>;
	getURLById(id: number, pack: PackID, version: string): Promise<string>;
	createTexture(texture: TextureCreationParam): Promise<Texture>;
	deleteTexture(id: string): Promise<WriteConfirmation[]>;
}
