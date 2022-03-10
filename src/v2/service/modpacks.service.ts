import { Modpacks, ModpacksRepository } from "~/v2/interfaces";
import { modpacks } from "../firestorm";
import ModpacksFirestormRepository from "../repository/firestorm/modpacks.repository";

export default class ModsService {
	private readonly modsRepo: ModpacksRepository = new ModpacksFirestormRepository();
  
	getRaw(): Promise<Modpacks> {
		return modpacks.read_raw();
	}
}