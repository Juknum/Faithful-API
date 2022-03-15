import { contributions } from "../firestorm";
import { Contribution, Contributions } from "../interfaces";
import { ContributionCreationParams, ContributionsRepository } from "../interfaces/contributions";
import ContributionFirestormRepository from "../repository/firestorm/contributions.repository";
import { mapContributions } from "../tools/mapping/textures";

export default class ContributionService {
	private readonly contributionRepo: ContributionsRepository = new ContributionFirestormRepository();

	getRaw(): Promise<Contributions> {
		return contributions.read_raw().then((old: any) => mapContributions(Object.values(old)));
	}

	getById(id: string): Promise<Contribution> {
		return this.contributionRepo.getContributionById(id);
	}

	addContribution(params: ContributionCreationParams): Promise<Contribution> {
		return this.contributionRepo.addContribution(params);
	}

	deleteContribution(id): Promise<void> {
		return this.contributionRepo.deleteContribution(id);
	}

	getByDateRange(begin: string, ends: string): Promise<Contributions> {
		return this.contributionRepo.getByDateRange(begin, ends);
	}
}