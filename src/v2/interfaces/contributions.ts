import { KnownPacks } from "./textures";

export interface ContributionCreationParams {
	date: number; // unix timestamp
	resolution: 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096; // texture resolution
	pack: Exclude<KnownPacks, "default">; // resource pack name
	authors: Array<string>; // discords users ids
	texture: string; // texture id
}

export interface Contribution extends ContributionCreationParams {
	id: string; // contribution unique id
}
export interface Contributions extends Array<Contribution> {}

export interface ContributionsRepository {
	getContributionById(id: string): Promise<Contribution>;
	addContribution(params: ContributionCreationParams): Promise<Contribution>;
	deleteContribution(id: string): Promise<void>;
	getByDateRange(begin: string, ends: string): Promise<Contributions>;
}