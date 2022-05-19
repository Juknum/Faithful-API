import { Mods, ModsRepository, PackVersions } from "~/v2/interfaces";
import { mods } from "../firestorm";
import { pack_versions } from "../firestorm/modding/pack_versions";
import ModsFirestormRepository from "../repository/firestorm/mods.repository";

export default class ModsService {
	private readonly modsRepo: ModsRepository = new ModsFirestormRepository();
  
	getRaw(): Promise<Mods> {
		return mods.read_raw();
	}

	getPackVersions(): Promise<PackVersions> {
		return pack_versions.read_raw();
	}

	getThumbnail(id: number): Promise<string> {
		return this.modsRepo.getThumbnail(id);
	}
}