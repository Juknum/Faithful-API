export interface Use {
	id: string; // use unique id
	name: string; // use name
	texture: number; // texture id
	edition: string; // game edition
	assets: string; // assets folder name (empty for bedrock)
}
export interface Uses extends Array<Use> {}
