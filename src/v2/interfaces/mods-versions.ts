import { Mod } from "./mods";

export const MOD_LOADERS = ["FORGE", "FABRIC"] as const;

export interface ModVersion {
	/**
	 * The database ID of the mod version
	 */
	id: string;
	/**
	 * The parent mod *database* ID
	 */
	mod: string;
	/**
	 * The version of the mod
	*/
	version: string;
	/**
	 * Supported Mod Loader
	 * @default []
	*/
	modLoaders: typeof MOD_LOADERS[number][];
}

export interface FirestormModVersion extends ModVersion {
	/**
	 * Get the parent mod
	 */
	getMod(): Promise<Mod>;
}

export interface ModVersionsRepository {}