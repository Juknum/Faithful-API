import { Uses } from "./uses";
import { Texture, MCMETA, Edition } from "./textures";
import { Contributions } from "./contributions";
import { PackID } from "./packs";
import { Paths } from "./paths";

export interface GalleryResult {
	id: string;
	useID: string;
	pathID: string;
	name: string;
	tags: string[];
	mcmeta: MCMETA; // unused currently
	url: string;
}

export type AcceptedRes = "16x" | "32x" | "64x";

export type GalleryEdition = Edition | "all";

export interface GalleryModalResult {
	contributions: Contributions;
	texture: Texture;
	uses: Uses;
	paths: Paths;
	mcmeta: MCMETA;
	urls: Record<PackID, string>;
}
