import { mods } from "../firestorm";
import { Mod, ModsRepository } from "../interfaces";

export default class ModsFirestormRepository implements ModsRepository {
	public getRaw(): Promise<Record<string, Mod>> {
		return mods.readRaw();
	}
}
