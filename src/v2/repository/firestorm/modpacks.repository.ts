import axios from "axios";
import { modpacks } from "../../firestorm";
import { Modpack, ModpacksRepository } from "../../interfaces";

export default class ModpacksFirestormRepository implements ModpacksRepository {
	public getRaw(): Promise<Record<string, Modpack>> {
		return modpacks.read_raw();
	}

	public getThumbnail(id: number): Promise<string> {
		return axios(`https://api.curseforge.com/v1/mods/${id}`, {
			headers: { "x-api-key": process.env.CURSEFORGE_API_KEY },
		}).then((res) => res.data.data.logo.thumbnailUrl);
	}
}
