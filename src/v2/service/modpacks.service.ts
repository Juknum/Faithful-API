import { Modpacks, ModpacksRepository } from "~/v2/interfaces";
import { modpacks } from "../firestorm";
import ModpacksFirestormRepository from "../repository/firestorm/modpacks.repository";

export default class ModpacksService {
	private readonly modsRepo: ModpacksRepository =
		new ModpacksFirestormRepository();

	getRaw(): Promise<Modpacks> {
		return modpacks.read_raw();
	}

	getThumbnail(id: number): Promise<string> {
		return this.modsRepo.getThumbnail(id);
	}
}
