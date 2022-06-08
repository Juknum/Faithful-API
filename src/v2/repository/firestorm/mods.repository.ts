import axios from "axios";
import { mods, pack_versions } from "../../firestorm";
import { Mods, ModsRepository, PackVersions } from "../../interfaces";

export default class ModsFirestormRepository implements ModsRepository {
	public getRaw(): Promise<Mods> {
		return mods.read_raw();
	}

	public getPackVersion(): Promise<PackVersions> {
		return pack_versions.read_raw();
	}

	public getThumbnail(id: number): Promise<string> {
		return axios(`https://api.curseforge.com/v1/mods/${id}`, { headers: { "x-api-key": process.env.CURSE_FORGE_API_KEY }})
			.then(res => res.data.data.logo.thumbnailUrl);
	}

	public getCurseForgeName(id: number): Promise<string> {
		return axios(`https://api.curseforge.com/v1/mods/${id}`, { headers: { "x-api-key": process.env.CURSE_FORGE_API_KEY }})
			.then(res => res.data.data.name);
	}
}