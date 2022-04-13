import { contributions } from "../firestorm";
import { Contribution, Contributions } from "../interfaces";
import { ContributionCreationParams, ContributionsRepository } from "../interfaces/contributions";
import ContributionFirestormRepository from "../repository/firestorm/contributions.repository";

export default class ContributionService {
	private readonly contributionRepo: ContributionsRepository = new ContributionFirestormRepository();

	getRaw(): Promise<Contributions> {
		return contributions.read_raw().then((res: any) => Object.values(res));
	}

	getPacks(): Promise<Array<string>> {
		return this.contributionRepo.getPacks();
	}

	searchContributionsFrom(users: Array<string>, packs: Array<string>): Promise<Contributions> {
		return this.contributionRepo.searchContributionsFrom(users, packs);
	}

	getById(id: string): Promise<Contribution> {
		return this.contributionRepo.getContributionById(id);
	}

	addContribution(params: ContributionCreationParams): Promise<Contribution> {
		return this.contributionRepo.addContribution(params);
	}

	deleteContribution(id: string): Promise<void> {
		return this.contributionRepo.deleteContribution(id);
	}

	updateContribution(id: string, params: ContributionCreationParams): Promise<Contribution> {
		return this.contributionRepo.updateContribution(id, params);
	}

	getByDateRange(begin: string, ends: string): Promise<Contributions> {
		return this.contributionRepo.getByDateRange(begin, ends);
	}
}