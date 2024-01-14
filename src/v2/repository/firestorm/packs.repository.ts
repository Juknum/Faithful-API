import { ID_FIELD } from "firestorm-db";
import {
	PackRepository,
	Pack,
	PackTag,
	Packs,
	CreationPack,
	AnyPack,
	PackAll,
} from "~/v2/interfaces";
import { packs } from "../../firestorm/packs";
import { submissions } from "../../firestorm";

export default class PackFirestormRepository implements PackRepository {
	getRaw(): Promise<Record<string, Pack>> {
		return packs.readRaw();
	}

	getById(id: string): Promise<Pack> {
		return packs.get(id);
	}

	async getWithSubmission(id: AnyPack): Promise<PackAll> {
		const pack = await packs.get(id);
		const submission = await submissions.get(id).catch(() => undefined);
		if (!submission) return { ...pack, submission: null };
		return { ...pack, submission };
	}

	searchByTag(tag: PackTag): Promise<Packs> {
		return packs.search([
			{
				field: "tags",
				criteria: "array-contains",
				value: tag,
			},
		]);
	}

	getAllTags(): Promise<PackTag[]> {
		return packs
			.select({
				fields: ["tags"],
			})
			.then((res: any) =>
				(
					Object.values(res).reduce(
						(acc: Array<string>, cur: any) => [...acc, cur.tags],
						[],
					) as Array<PackTag>
				)
					.flat()
					.filter((e, i, a) => a.indexOf(e) === i)
					.sort(),
			);
	}

	create(packId: string, packToCreate: CreationPack): Promise<Pack> {
		return packs.set(packId, packToCreate).then(() => packs.get(packId));
	}

	update(packId: string, newPack: CreationPack): Promise<Pack> {
		const packWithId = { ...newPack, [ID_FIELD]: packId };
		return packs.set(packId, packWithId).then(() => packs.get(packId));
	}

	delete(packId: string): Promise<void> {
		return packs.remove(packId).then(() => {}); // return nothing
	}
}
