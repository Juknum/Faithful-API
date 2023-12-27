import { ID_FIELD } from "firestorm-db";
import { PackRepository, Pack, PackTag, Packs } from "~/v2/interfaces";
import { packs } from "../../firestorm/packs";

export default class PackFirestormRepository implements PackRepository {
	getRaw(): Promise<Record<string, Pack>> {
		return packs.readRaw();
	}

	getById(id: string): Promise<Pack> {
		return packs.get(id);
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

	create(packId: string, packToCreate: Pack): Promise<Pack> {
		return packs.set(packId, packToCreate).then((id) => packs.get(id));
	}

	update(packId: string, newPack: Pack): Promise<Pack> {
		const packWithId = { ...newPack, [ID_FIELD]: packId };
		return packs.set(packId, packWithId).then((id) => packs.get(id));
	}

	delete(packId: string): Promise<void> {
		return packs.remove(packId).then(() => {}); // return nothing
	}
}
