import { Mod } from "./mods";

export interface Modpack {
	id: string; // modpack id (curseforge project id)
	name: string; // modpack name
	authors: string[]; // modpacks authors
	versions: Array<{
		id: string; // modpack version
		minecraft: string; // minecraft version (ex: "1.18")
		mods: Mod[];
	}>;
}

export type Modpacks = Modpack[];

export interface FirestormModpack extends Modpack {}

export interface ModpacksRepository {
	getRaw(): Promise<Record<string, Modpack>>;
	getThumbnail(id: number): Promise<string>;
}
