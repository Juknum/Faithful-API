import axios from "axios";
import { NotFoundError } from "../../tools/ApiError";
import { mods } from "../../firestorm";
import { Mod, ModsRepository } from "../../interfaces";

export default class ModsFirestormRepository implements ModsRepository {
	public getRaw(): Promise<Record<string, Mod>> {
		return mods.read_raw();
	}

	public getThumbnail(id: number): Promise<string> {
		return axios(`https://api.curseforge.com/v1/mods/${id}`, {
			headers: { "x-api-key": process.env.CURSEFORGE_API_KEY },
		}).then((res) => {
			const url = res?.data?.data?.logo?.thumbnailUrl;
			if (url) {
				return url;
			}

			// else
			throw new NotFoundError("No thumbnail found for this mod");
		}); // fixes bug where no logo provided : 400 : Cannot read 'thumbnailUrl' of null
	}

	public getCurseForgeName(id: number): Promise<string> {
		return axios(`https://api.curseforge.com/v1/mods/${id}`, {
			headers: { "x-api-key": process.env.CURSEFORGE_API_KEY },
		}).then((res) => {
			const name = res?.data?.data?.name;
			if (name) {
				return name;
			}

			// else
			throw new NotFoundError("No name found for this mod");
		}); // Preventive fix if there is somehow no name
	}

	public getNameInDatabase(id: string): Promise<string> {
		return mods.get(id).then((res: Mod) => res.name);
	}
}
