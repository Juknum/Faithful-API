
export interface CreationPath {
	name: string; // texture path ('textures/block/stone.png')
	versions: Array<string>; // MC versions
	mcmeta: boolean; // true if animated
}

export interface InputPath extends CreationPath {
	use: string; // use id
}

export interface Path extends InputPath {
	id: string; // path unique id
}

export interface Paths extends Array<Path> {}

export interface PathRepository {
	getPathsByUseIdsAndVersion(use_ids: string[], version: string): Promise<Paths>;
	createPath(path: InputPath): Promise<Path>;
}
