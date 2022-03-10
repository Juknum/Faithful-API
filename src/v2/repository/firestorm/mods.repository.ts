import { mods } from "../../firestorm";
import { Mods, ModsRepository } from "../../interfaces";

export default class ModsFirestormRepository implements ModsRepository {
	public getRaw(): Promise<Mods> {
		return mods.read_raw();
	}
}