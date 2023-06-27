import { OurPacksArr } from "./textures";

export const ContributionPacksArr = OurPacksArr;
export type ContributionsPack = typeof ContributionPacksArr[number];
export type ContributionsPacks = Array<ContributionsPack>;
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

export interface DayData {
	date: number; // day as timestamp
	count: number; // number of contributions
}
export type DayRecord = Record<number, DayData>;

export type PackRecord = Record<ContributionsPack, DayRecord>;
export type PackPercentile = Record<ContributionsPack, number>;
export type PackData = Record<ContributionsPack, DayData[]>;

export interface ContributionStats {
	total_contributions: number; // number of total contributions
	total_authors: number; // number of users on contributions
	total_last_week: number;
	total_last_month: number;
	activity: PackData;
	percentiles: PackPercentile;
}

// evolve this interface as parameter instead of function parameters
export interface ContributionSearch {
	packs?: string[];
	users?: string[];
	search?: string;
}

export interface ContributionsAuthors extends Array<ContributionsAuthor> {}

export interface ContributionsRepository {
	getContributionById(id: string): Promise<Contribution>;
	addContribution(params: ContributionCreationParams): Promise<Contribution>;
	deleteContribution(id: string): Promise<void>;
	updateContribution(
		id: string,
		params: ContributionCreationParams
	): Promise<Contribution>;
	getByDateRange(begin: string, ends: string): Promise<Contributions>;
	getAuthors(): Promise<ContributionsAuthors>;
	getPacks(): ContributionsPacks;
	searchByIdAndPacks(
		texture_ids: Array<string>,
		packs: Array<string>,
		users?: Array<string>
	): Promise<Contributions>;
	searchContributionsFrom(
		users: Array<string>,
		packs: Array<string>
	): Promise<Contributions>;
}
