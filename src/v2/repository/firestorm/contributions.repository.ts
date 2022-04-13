import { Contribution, ContributionCreationParams, Contributions, ContributionsRepository, ContributionsAuthors, ContributionsPacks, KnownPacksArr  } from "../../interfaces";
import { contributions, users } from "../../firestorm";

export default class ContributionFirestormRepository implements ContributionsRepository {
	getContributionById(id: string): Promise<Contribution> {
		return contributions.get(id);
	}

	getPacks(): ContributionsPacks {
		return KnownPacksArr.filter((pack: string) => pack !== "default");
	}

	searchContributionsFrom(authors: Array<string>, packs: Array<string>): Promise<Contributions> {
		const options = [{
			field: "authors",
			criteria: "array-contains-any",
			value: authors
		}];

		if (packs !== null) options.push({ field: "pack", criteria: "in", value: packs });
		return contributions.search(options)
			.then((res: Contributions) => res.filter((c: Contribution) => packs === null ? true : packs.includes(c.pack)))
	}

	getAuthors(): Promise<ContributionsAuthors> {
		const out = {}

		return contributions.select({ fields: [ "authors" ] })
			.then((obj: any) => Object.values(obj).map((o: any) => o.authors).flat())
			.then((authors: Array<string>) => authors.forEach((id: string) => {
				if (!out[id]) out[id] = { id, contributions: 1 }
				else out[id].contributions++;
			}))
			.then(() => users.select({ fields: [ "id", "username", "uuid" ] }))
			.then((obj: any) => Object.values(obj).map((o: any) => o))
			.then((_users: Array<{ id: string, username: string, uuid: string }>) => Object.values(out).map((author: { id: string, contributions: number }) => ({
				id: author.id,
				username: _users.find(u => u.id === author.id)?.username,
				uuid: _users.find(u => u.id === author.id)?.uuid,
				contributions: author.contributions,
			})))
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