export interface Paths extends Array<Path> {}
export interface Path {
	id: string; // path unique id
	name: string; // texture path ('textures/block/stone.png')
	use: string; // use id
	versions: Array<string>; // MC versions
	mcmeta: boolean; // true if animated
}
