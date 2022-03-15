import { Contribution, ContributionCreationParams, Contributions, ContributionsRepository } from "~/v2/interfaces/contributions";
import { mapContribution, mapContributions } from "../../tools/mapping/textures";
import { contributions } from "../../firestorm";

export default class ContributionFirestormRepository implements ContributionsRepository {
	getContributionById(id: string): Promise<Contribution> {
		return contributions.get(id).then(mapContribution);
	}

	addContribution(params: ContributionCreationParams): Promise<Contribution> {
		return contributions.add(params).then((id: string) => contributions.get(id));
	}

	deleteContribution(id: string): Promise<void> {
		return contributions.remove(id);
	}

	getByDateRange(begin: string, ends: string): Promise<Contributions> {
		// if ends > begin date : ------[B-----E]------
		// elif begin > ends :    -----E]-------[B-----

		if (ends >= begin) return contributions.search([
			{
				field: "date",
				criteria: ">=",
				value: begin
			},
			{
				field: "date",
				criteria: "<=",
				value: ends
			}
		])

		let res: Contributions;
		return contributions.search([
			{
				field: "date",
				criteria: ">=",
				value: "0"
			},
			{
				field: "date",
				criteria: "<=",
				value: ends,
			}
		])
			.then((startContribution: any) => {
				res = startContribution;
				return contributions.search([
					{
						field: "date",
						criteria: ">=",
						value: begin
					},
					{
						field: "date",
						criteria: "<=",
						value: new Date().getTime(),
					}
				])
			})
			.then((endsContribution: any) => mapContributions(Object.values({...res, ...endsContribution})))
	}
} 