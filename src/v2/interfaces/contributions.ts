import { KnownPacks } from "./textures";

export type ContributionsPack = Exclude<KnownPacks, "default">
export type ContributionsPacks = Array<ContributionsPack>
export interface ContributionCreationParams {
	date: number; // unix timestamp
	resolution: 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096; // texture resolution
	pack: ContributionsPack; // resource pack name
	authors: Array<string>; // discords users ids
	texture: string; // texture id
}

export interface Contribution extends ContributionCreationParams {
	id: string; // contribution unique id
}
export interface Contributions extends Array<Contribution> {}
export interface ContributionsAuthor {
	id: string; // discord user id
	username: string; // display name
	uuid: string; // user Minecraft uuid
	contributions: number; // number of contributions for that user
}
export interface ContributionsAuthors extends Array<ContributionsAuthor> {}

export interface ContributionsRepository {
	getContributionById(id: string): Promise<Contribution>;
	addContribution(params: ContributionCreationParams): Promise<Contribution>;
	deleteContribution(id: string): Promise<void>;
	updateContribution(id: string, params: ContributionCreationParams): Promise<Contribution>;
	getByDateRange(begin: string, ends: string): Promise<Contributions>;
	getAuthors(): Promise<ContributionsAuthors>;
	getPacks(): ContributionsPacks;
	searchContributionsFrom(users: Array<string>, packs: Array<string>): Promise<Contributions>;
}