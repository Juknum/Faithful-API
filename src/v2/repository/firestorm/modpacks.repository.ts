import { modpacks } from "../../firestorm";
import { Modpacks, ModpacksRepository } from "../../interfaces";

export default class ModpacksFirestormRepository implements ModpacksRepository {
	public getRaw(): Promise<Modpacks> {
		return modpacks.read_raw();
	}
}