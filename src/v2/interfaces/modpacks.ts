import { Mods } from "./mods";

export interface Modpack {
	id: string; // modpack id (curseforge project id)
	name: string; // modpack name
	authors: Array<string>; // modpacks authors
	versions: Array<{
		id: string; // modpack version
		minecraft: string; // minecraft version (ex: "1.18")
		mods: Mods;
	}>;
}

export interface Modpacks extends Array<Modpack> {}
