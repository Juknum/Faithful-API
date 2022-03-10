import { Mods, ModsRepository } from "~/v2/interfaces";
import { mods } from "../firestorm";
import ModsFirestormRepository from "../repository/firestorm/mods.repository";

export default class ModsService {
	private readonly modsRepo: ModsRepository = new ModsFirestormRepository();
  
	getRaw(): Promise<Mods> {
		return mods.read_raw();
	}
}