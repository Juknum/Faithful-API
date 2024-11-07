import { WriteConfirmation } from "firestorm-db";
import { contributions } from "../firestorm";
import { Contribution, Contributions, PackID } from "../interfaces";
import {
	ContributionCreationParams,
	ContributionsAuthors,
	ContributionSearch,
	ContributionStats,
	PackData,
	PackPercentile,
	PackRecord,
} from "../interfaces/contributions";
import ContributionFirestormRepository from "../repository/contribution.repository";
import { lastDay, lastMonth, lastWeek, startOfDay } from "../tools/utils";
import TextureService from "./texture.service";

export default class ContributionService {
	private readonly contributionRepo = new ContributionFirestormRepository();

	private readonly textureService = new TextureService();

	getRaw(): Promise<Record<string, Contribution>> {
		return contributions.readRaw();
	}

	async getStats(): Promise<ContributionStats> {
		const cs = await this.getRaw();

		// set ensures unique values much more quickly than a check object/array iteration
		const authors = new Set();

		let total_last_week = 0;
		let total_last_month = 0;
		let total_last_day = 0;

		const last_month = startOfDay(lastMonth()).getTime();
		const last_week = startOfDay(lastWeek()).getTime();
		const last_day = startOfDay(lastDay()).getTime();

		const aggregate: PackRecord = {} as PackRecord;

		Object.values(cs).forEach((cur) => {
			cur.authors.forEach((a) => authors.add(a));

			const { pack, date } = cur;
			//! Group data by the start of date if time dont coincide
			const start_of_day = startOfDay(date).getTime();

			aggregate[pack] ||= {};
			aggregate[pack][start_of_day] ||= {
				date: start_of_day,
				count: 0,
			};
			aggregate[pack][start_of_day].count++;

			if (date >= last_week) total_last_week += 1;
			if (date >= last_month) total_last_month += 1;
			if (date >= last_day) total_last_day += 1;
		});

		const finalActivity = {} as PackData;
		const percentiles = {} as PackPercentile;
		Object.entries(aggregate).forEach(([pack, packAggregate]) => {
			finalActivity[pack] = Object.values(packAggregate);

			const counts = Object.values(packAggregate)
				.map((e) => e.count) // ? No need to filter 0 as the contruction of the record makes it impossible
				.sort();

			percentiles[pack] = counts[Math.round((counts.length * 95) / 100)];
		});

		return {
			total_authors: authors.size,
			total_contributions: Object.keys(cs).length,
			total_last_day,
			total_last_week,
			total_last_month,
			activity: finalActivity,
			percentiles,
		};
	}

	getPacks(): Promise<PackID[]> {
		return this.contributionRepo.getPacks();
	}

	getAuthors(): Promise<ContributionsAuthors> {
		return this.contributionRepo.getAuthors();
	}

	searchContributionsFrom(users: string[], packs: string[]): Promise<Contributions> {
		return this.contributionRepo.searchContributionsFrom(users, packs);
	}

	async search(params: ContributionSearch): Promise<Contributions> {
		let result: Contributions;
		if (params.search) {
			let res = await this.textureService.getByNameOrId(params.search);
			if (!Array.isArray(res)) res = [res];

			const textureIDs = res.map((t) => t.id);

			result = await this.contributionRepo.searchByIdAndPacks(
				textureIDs,
				params.packs,
				params.users,
			);
		} else {
			result = await this.searchContributionsFrom(params.users, params.packs);
		}

		return result;
	}

	getById(id: string): Promise<Contribution> {
		return this.contributionRepo.getContributionById(id);
	}

	addContribution(params: ContributionCreationParams): Promise<Contribution> {
		return this.contributionRepo.addContribution(params);
	}

	addContributions(params: ContributionCreationParams[]): Promise<Contributions> {
		return this.contributionRepo.addContributions(params);
	}

	deleteContribution(id: string): Promise<WriteConfirmation> {
		return this.contributionRepo.deleteContribution(id);
	}

	updateContribution(id: string, params: ContributionCreationParams): Promise<Contribution> {
		return this.contributionRepo.updateContribution(id, params);
	}

	getByDateRange(begin: string, ends: string): Promise<Contributions> {
		return this.contributionRepo.getByDateRange(begin, ends);
	}
}
