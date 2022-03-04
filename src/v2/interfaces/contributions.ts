import { KnownPacks } from './textures';

export interface Contributions extends Array<Contribution> {}
export interface Contribution {
	id: string; // contribution unique id
	date: number; // unix timestamp
	resolution: '32x' | '64x'; // texture resolution
	pack: KnownPacks; // resource pack name
	authors: Array<string>; // discords users ids
	texture: string; // texture id
}
