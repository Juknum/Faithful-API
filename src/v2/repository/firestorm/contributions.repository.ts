import { Contribution, ContributionCreationParams, Contributions, ContributionsRepository } from "~/v2/interfaces/contributions";
import { contributions } from "../../firestorm";

export default class ContributionFirestormRepository implements ContributionsRepository {
	getContributionById(id: string): Promise<Contribution> {
		return contributions.get(id);
	}

	searchContributionsFrom(users: Array<string>, packs: Array<string>): Promise<Contributions> {
		const options = [{
			field: "authors",
			criteria: "array-contains-any",
			value: users
		}];

		if (packs !== null) options.push({ field: "pack", criteria: "in", value: packs });
		return contributions.search(options)
			.then((res: Contributions) => res.filter((c: Contribution) => packs === null ? true : packs.includes(c.pack)))
	}

	getPacks(): Promise<Array<string>> {
		const packs: Array<string> = [];

		return contributions.select({ fields: [ "res", "pack" ] }) // todo remove "res" after rewrite
			.then((obj: any) => Object.values(obj).map((o: any) => o.pack || o.res))
			.then((res: Array<string>) => res.forEach(r => !packs.includes(r) ? packs.push(r) : null ))
			.then(() => packs);
	}

	addContribution(params: ContributionCreationParams): Promise<Contribution> {
		return contributions.add(params).then((id: string) => contributions.get(id));
	}

	updateContribution(id: string, params: ContributionCreationParams): Promise<Contribution> {
		return contributions.set(id, params).then(() => contributions.get(id));
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
			.then((endsContribution: any) => ({...res, ...endsContribution}))
	}
} 