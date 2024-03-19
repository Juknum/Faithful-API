import { Modpack } from "../interfaces";
import { modpacks } from "../firestorm";
import ModpacksFirestormRepository from "../repository/modpacks.repository";

export default class ModpacksService {
	private readonly modsRepo = new ModpacksFirestormRepository();

	getRaw(): Promise<Record<string, Modpack>> {
		return modpacks.readRaw();
	}

	getThumbnail(id: number): Promise<string> {
		return this.modsRepo.getThumbnail(id);
	}
}
