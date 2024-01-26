import {
	Contribution,
	ContributionCreationParams,
	Contributions,
	ContributionsRepository,
	ContributionsAuthors,
	PackID,
	User,
} from "../../interfaces";
import { contributions, users } from "../../firestorm";

export default class ContributionFirestormRepository implements ContributionsRepository {
	getContributionById(id: string): Promise<Contribution> {
		return contributions.get(id);
	}

	getPacks(): Promise<PackID[]> {
		return contributions.select({ fields: ["pack"] }).then((res: Contributions) =>
			(
				Object.values(res).reduce(
					(acc: Array<string>, cur: any) => [...acc, cur.pack],
					[],
				) as Array<PackID>
			)
				.flat()
				.filter((e, i, a) => a.indexOf(e) === i)
				.sort(),
		);
	}

	searchContributionsFrom(authors: Array<string>, packs: Array<string>): Promise<Contributions> {
		const options: any[] = authors.map((a) => ({
			field: "authors",
			criteria: "array-contains",
			value: a as any,
		}));

		if (packs !== null) options.push({ field: "pack", criteria: "in", value: packs });
		return contributions
			.search(options)
			.then((res: Contributions) =>
				res.filter((c: Contribution) => (packs === null ? true : packs.includes(c.pack))),
			);
	}

	searchByIdAndPacks(
		textureIDs: string[],
		packs?: string[],
		authors?: string[],
	): Promise<Contributions> {
		const options = [];
		if (authors) {
			authors.forEach((a) => {
				options.push({
					field: "authors",
					criteria: "array-contains",
					value: a as any,
				});
			});
		}

		if (packs) options.push({ field: "pack", criteria: "in", value: packs });

		options.push({
			field: "texture",
			criteria: "in",
			value: textureIDs,
		});

		return contributions.search(options);
	}

	getAuthors(): Promise<ContributionsAuthors> {
		const out = {};

		return contributions
			.select({ fields: ["authors"] })
			.then((obj: any) =>
				Object.values(obj)
					.map((o: any) => o.authors)
					.flat(),
			)
			.then((authors: Array<string>) =>
				authors.forEach((id: string) => {
					if (!out[id]) out[id] = { id, contributions: 1 };
					else out[id].contributions++;
				}),
			)
			.then(() => users.select({ fields: ["id", "username", "uuid", "anonymous"] }))
			.then(Object.values)
			.then((_users: Pick<User, "id" | "username" | "uuid" | "anonymous">[]) =>
				Object.values(out).map((author: any) => {
					const user = _users.find((u) => u.id === author.id);

					if (user)
						return {
							...author,
							username: user.anonymous ? undefined : user.username,
							uuid: user.anonymous ? undefined : user.uuid,
						};

					return author;
				}),
			);
	}

	addContribution(params: ContributionCreationParams): Promise<Contribution> {
		return contributions.add(params).then((id) => contributions.get(id));
	}

	addContributions(params: ContributionCreationParams[]): Promise<Contribution[]> {
		return contributions
			.addBulk(params)
			.then((ids) => Promise.all(ids.map((id) => contributions.get(id))));
	}

	updateContribution(id: string, params: ContributionCreationParams): Promise<Contribution> {
		return contributions.set(id, params).then(() => contributions.get(id));
	}

	deleteContribution(id: string): Promise<string> {
		return contributions.remove(id);
	}

	getByDateRange(begin: string, ends: string): Promise<Contributions> {
		// if ends > begin date : ------[B-----E]------
		// elif begin > ends :    -----E]-------[B-----

		if (ends >= begin)
			return contributions.search([
				{
					field: "date",
					criteria: ">=",
					value: begin,
				},
				{
					field: "date",
					criteria: "<=",
					value: ends,
				},
			]);

		let res: Contributions;
		return contributions
			.search([
				{
					field: "date",
					criteria: ">=",
					value: "0",
				},
				{
					field: "date",
					criteria: "<=",
					value: ends,
				},
			])
			.then((startContribution) => {
				res = startContribution;
				return contributions.search([
					{
						field: "date",
						criteria: ">=",
						value: begin,
					},
					{
						field: "date",
						criteria: "<=",
						value: new Date().getTime(),
					},
				]);
			})
			.then((endsContribution: any) => ({ ...res, ...endsContribution }));
	}
}
