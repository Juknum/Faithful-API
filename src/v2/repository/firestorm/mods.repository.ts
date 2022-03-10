import { mods, pack_versions } from "../../firestorm";
import { Mods, ModsRepository, PackVersions } from "../../interfaces";

export default class ModsFirestormRepository implements ModsRepository {
	public getRaw(): Promise<Mods> {
		return mods.read_raw();
	}

	public getPackVersion(): Promise<PackVersions> {
		return pack_versions.read_raw();
	}
}