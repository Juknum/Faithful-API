import { ID_FIELD } from "firestorm-db";
import { packs } from "../../firestorm/settings/packs";
import { PackRepository, Pack } from "~/v2/interfaces";

export default class PackFirestormRepository implements PackRepository {
	getRaw(): Promise<Record<string, Pack>> {
		return packs.readRaw();
	}

	getById(id: string): Promise<Pack> {
		return packs.get(id);
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
