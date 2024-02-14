import { Mod } from "~/v2/interfaces";
import { mods } from "../firestorm";
import ModsFirestormRepository from "../repository/mods.repository";

export default class ModsService {
	private readonly modsRepo = new ModsFirestormRepository();

	getRaw(): Promise<Record<string, Mod>> {
		return mods.readRaw();
	}

	getThumbnail(id: number): Promise<string> {
		return this.modsRepo.getThumbnail(id);
	}

	getCurseForgeName(id: number): Promise<string> {
		return this.modsRepo.getCurseForgeName(id);
	}

	getNameInDatabase(id: string): Promise<string> {
		return this.modsRepo.getNameInDatabase(id);
	}
}
