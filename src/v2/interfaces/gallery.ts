import { Uses } from "./uses";
import { Texture, MCMETA } from "./textures";
import { Contributions } from "./contributions";
import { AnyPack } from "./packs";
import { Paths } from "./paths";

export interface GalleryResult {
	name: string;
	pathID: string;
	tags: string[];
	textureID: string;
	mcmeta: MCMETA;
	url: string;
	useID: string;
}

export type AcceptedRes = "16x" | "32x" | "64x";

export interface GalleryModalResult {
	contributions: Contributions;
	texture: Texture;
	uses: Uses;
	paths: Paths;
	mcmeta: MCMETA;
	urls: Record<AnyPack, string>;
}
