import { Mod, PackVersions } from "~/v2/interfaces";
import { mods } from "../firestorm";
import { pack_versions } from "../firestorm/modding/pack_versions";
import ModsFirestormRepository from "../repository/firestorm/mods.repository";

export default class ModsService {
	private readonly modsRepo = new ModsFirestormRepository();

	getRaw(): Promise<Record<string, Mod>> {
		return mods.read_raw();
	}

	getPackVersions(): Promise<PackVersions> {
		return pack_versions.read_raw();
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
