import { CreationPath } from "./paths";

interface CreationUse {
	name: string; // use name
	texture: number; // texture id
	edition: string; // game edition
	assets: string; // assets folder name (empty for bedrock)
}

export interface Use extends CreationUse {
	id: string; // use unique id
}

export interface Uses extends Array<Use> {}

export interface CreatedUse extends CreationUse {
	paths: CreationPath[];
}

export interface UseRepository {
	getUsesByIdAndEdition(id_arr: number[], edition: string): Promise<Uses>;
	getRaw(): Promise<Uses>;
	getUseByIdOrName(id_or_name: string): Promise<Uses | Use>;
	deleteUse(id: string): Promise<void>;
	set(use: Use): Promise<Use>;
	removeUseById(use_id: string): Promise<void>;
	removeUsesByBulk(use_ids: string[]): Promise<void>;
}
