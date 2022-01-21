import { addons } from "../firestorm";
import { Addons, Addon, AddonAll, AddonRepository, Files } from "../interfaces";
import AddonFirestormRepository from "../repository/firestorm/addon.repository";

export default class AddonService {
	private readonly addonRepo: AddonRepository = new AddonFirestormRepository();

	getRaw(): Promise<Addons> {
		return this.addonRepo.getRaw();
	}

	getAddon(id: number): Promise<Addon> {
		if (isNaN(id) || id < 0) return Promise.reject(new Error("Addons IDs are integer greater than 0"));
		return this.addonRepo.getAddonById(id);
	}

	getFiles(id: number): Promise<Files> {
		if (isNaN(id) || id < 0) return Promise.reject(new Error("Addons IDs are integer greater than 0"));
		return this.addonRepo.getFilesById(id);
	}

	getAll(id: number): Promise<AddonAll> {
		if (isNaN(id) || id < 0) return Promise.reject(new Error("Addons IDs are integer greater than 0"));
		return this.addonRepo.getAllById(id);
	}

	// todo: implements setter with authentification verification
}
