import { Textures, Texture, Use, Uses, Path, Paths, Contributions, Contribution } from "~/v2/interfaces";

export interface OldUse {
	textureID: number;
	textureUseName: string;
	editions: Array<string>;
	id: string;
}

interface OldUses extends Array<OldUse> {}

export function mapUse(old: OldUse): Use {
	return {
		id: old.id,
		name: old.textureUseName,
		edition: old.editions[0],
		assets: old.editions[0] === "java" ? "minecraft" : null,
	} as Use;
}

export function mapUses(data: OldUses): Uses {
	return data.map(mapUse);
}

interface OldTexture {
	name: string;
	id: string;
	type: Array<string>;
}
interface OldTextures extends Array<OldTexture> {}

export function mapTexture(old: OldTexture): Texture {
	return {
		id: old.id,
		name: old.name,
		tags: old.type,
	} as Texture;
}
export function mapTextures(data: OldTextures): Textures {
	return data.map(mapTexture);
}

interface OldPath {
	useID: string;
	path: string;
	versions: Array<string>;
	id: string;
	mcmeta: boolean;
}
interface OldPaths extends Array<OldPath> {}

export function mapPath(old: OldPath): Path {
	return {
		id: old.id,
		use: old.useID,
		name: old.path.replace("assets/minecraft/", ""), // specified in the use
		mcmeta: old.mcmeta,
		versions: old.versions,
	};
}
export function mapPaths(data: OldPaths): Paths {
	return data.map(mapPath);
}

export interface OldContribution {
	date: number;
	res: "c32" | "c64";
	textureID: number;
	contributors: Array<string>;
	id: string;
}
export interface OldContributions extends Array<OldContribution> {}

export function mapContribution(old: OldContribution): Contribution {
	if (old.res === undefined) return old as any; // new contribution

	return {
		id: old.id,
		date: old.date,
		texture: old.textureID.toString(),
		resolution: old.res === "c32" ? 32 : 64, // map old values
		pack: old.res === "c32" ? "faithful_32x" : "faithful_64x",
		authors: old.contributors,
	};
}
export function mapContributions(data: OldContributions): Contributions {
	return data.map(mapContribution);
}
