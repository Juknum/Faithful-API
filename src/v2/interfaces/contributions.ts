import { WriteConfirmation } from "firestorm-db";
import { PackID } from "./packs";

export interface ContributionCreationParams {
	date: number; // unix timestamp
	resolution: 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096; // texture resolution
	pack: PackID; // resource pack name
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

export type PackRecord = Record<PackID, DayRecord>;
export type PackPercentile = Record<PackID, number>;
export type PackData = Record<PackID, DayData[]>;

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

export interface FirestormContribution extends Contribution {}

export interface ContributionsRepository {
	getContributionById(id: string): Promise<Contribution>;
	addContribution(params: ContributionCreationParams): Promise<Contribution>;
	addContributions(params: ContributionCreationParams[]): Promise<Contributions>;
	deleteContribution(id: string): Promise<WriteConfirmation>;
	updateContribution(id: string, params: ContributionCreationParams): Promise<Contribution>;
	getByDateRange(begin: string, ends: string): Promise<Contributions>;
	getAuthors(): Promise<ContributionsAuthors>;
	getPacks(): Promise<PackID[]>;
	searchByIdAndPacks(
		textureIDs: Array<string>,
		packs: Array<string>,
		users?: Array<string>,
	): Promise<Contributions>;
	searchContributionsFrom(users: Array<string>, packs: Array<string>): Promise<Contributions>;
}
