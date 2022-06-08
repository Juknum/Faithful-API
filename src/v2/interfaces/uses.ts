export interface Use {
	id: string; // use unique id
	name: string; // use name
	texture: number; // texture id
	edition: string; // game edition
	assets: string; // assets folder name (empty for bedrock)
}
export interface Uses extends Array<Use> {}

export interface UseRepository {
	getRaw(): Promise<Uses>;
	getUseByIdOrName(id_or_name: string): Promise<Uses | Use>;
	deleteUse(id: string): Promise<void>;
}