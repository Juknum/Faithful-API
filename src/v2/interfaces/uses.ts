import { WriteConfirmation } from "firestorm-db";
import { CreationPath, Paths } from "./paths";

export interface BaseUse {
	name: string; // use name
	edition: string; // game edition
}

export interface CreationUse extends BaseUse {
	texture: number; // texture id
}

export interface EntireUseToCreate extends BaseUse {
	paths: CreationPath[]; // all the paths to be created
}

export interface Use extends CreationUse {
	id: string; // use unique id
}

export interface Uses extends Array<Use> {}

export interface FirestormUse extends Use {
	getPaths(): Promise<Paths>;
}

export interface UseRepository {
	getUsesByIdAndEdition(idArr: number[], edition: string): Promise<Uses>;
	getRaw(): Promise<Record<string, Use>>;
	getUseByIdOrName(idOrName: string): Promise<Uses | Use>;
	deleteUse(id: string): Promise<WriteConfirmation[]>;
	set(use: Use): Promise<Use>;
	setMultiple(uses: Uses): Promise<Uses>;
	removeUseById(useID: string): Promise<WriteConfirmation[]>;
	removeUsesByBulk(useIDs: string[]): Promise<WriteConfirmation[][]>;
}
