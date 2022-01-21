import { addons } from "../../firestorm";
import { Files, AddonAll, Addon, Addons, AddonRepository } from "../../interfaces";

export default class AddonFirestormRepository implements AddonRepository {
	getRaw(): Promise<Addons> {
		return addons.read_raw();
	}

	getAddonById(id: number): Promise<Addon> {
		return addons.get(id);
	}

	getFilesById(addonId: number): Promise<Files> {
		return addons.get(addonId).then((addon) => addon.files());
	}
}
