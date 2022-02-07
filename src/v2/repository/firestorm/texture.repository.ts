import { NotFoundError } from "./../../tools/ApiError";
import firestorm from "firestorm-db";
import { textures, paths, uses, contributions } from "../../firestorm";
import { Contributions, Paths, Texture, Textures, TextureAll, Uses, TextureRepository, Path } from "../../interfaces";
import { mapTexture, mapTextures, OldUse } from "../../tools/mapping/textures";
import { Edition, KnownPacks, TextureProperty } from "~/v2/interfaces/textures";

export default class TextureFirestormRepository implements TextureRepository {
	getRaw = function (): Promise<Textures> {
		return textures.read_raw();
	};

	getURLById(id: number, pack: KnownPacks, version: string) {
		return textures.get(id).then(texture => texture.url(pack, version));
	};

	searchTextureByNameOrId = async function (name_or_id): Promise<Textures | Texture> {
		const res: Texture | Textures = await this.searchTexturePropertyByNameOrId(name_or_id, null);
		return res;
	}

	searchTexturePropertyByNameOrId = function (name_or_id: string | number, property: TextureProperty): Promise<Textures | Texture | Paths | Uses | Contributions> {
		const int_id: number = parseInt(name_or_id as string);
	
		if (isNaN(int_id) || int_id.toString() !== name_or_id.toString()) {
			if (name_or_id.toString().length <= 3) return Promise.reject(new Error("Texture name must be longer than 3 characters."));

			return textures.search([{field: "name", criteria: "includes",	value: name_or_id}])
				.then((textures: Textures) => {
					if (property === null) return mapTextures(textures as any); // todo: (DATA 2.0) use only textures after database rewrite
					return Promise.all(textures.map(t => t[property]()));
				})
		}

		return this.getTextureById(int_id, property);
	};

	getTextureById = function (id: number, property: TextureProperty): Promise<Texture> {
		if (isNaN(id) || id < 0) return Promise.reject(new Error("Texture IDs are integer greater than 0."));
		return textures.get(id)
			.then(t => {
				if (property === null) return mapTexture(t); // todo: (DATA 2.0) remove after database rewrite
				return t[property]();
			})
	};

	getEditions = function () {
		return uses
			.select({
				fields: ["editions"],
			})
			.then((res) => {
				return Object.values(res).reduce((acc: Array<string>, cur: OldUse) => {
					(cur.editions || []).forEach((edi) => {
						if (!acc.includes(edi)) acc.push(edi);
					});
					return acc.sort();
				}, []);
			});
	};

	getResolutions(): Promise<Array<string>> {

		/**
		 *! Resolutions should be the form of "32x" / "64x" and not resulting of contributions resolutions ("c32"...)
		 */

		return contributions
			.select({
				fields: ["res"], // TODO: change with resolution
			})
			.then((res: any) => {
				return (
					Object.values(res).reduce((acc: Array<string>, cur: any) => {
						const res = cur.res; // TODO: change with resolution
						if (!acc.includes(res)) acc.push(res);
						return acc;
					}, []) as Array<string>
				).sort();
			});
	}

	getTags(): Promise<Array<string>> {
		return textures
			.select({
				fields: ["type"], // TODO: change with tags
			})
			.then((res: any) => {
				return (
					Object.values(res).reduce((acc: Array<string>, cur: any) => {
						const types = cur.type;
						acc.push(types);
						return acc;
					}, []) as Array<string>
				)
					.flat()
					.filter((e, i, a) => a.indexOf(e) === i)
					.sort();
			});
	}

	getVersions(): Promise<Array<string>> {
		return paths
			.select({
				fields: ["versions"],
			})
			.then((res) => {
				return Object.values(res).reduce((acc: Array<string>, cur: Path) => {
					(cur.versions || []).forEach((edi) => {
						if (!acc.includes(edi)) acc.push(edi);
					});
					return acc.sort().reverse();
				}, []);
			});
	}

	getVersionByEdition(edition: Edition): Promise<Array<string>> {
		return firestorm
			.collection("settings")
			.get("versions")
			.then((versions) => {
				if (versions[edition] === undefined) throw new NotFoundError("edition not found");
				return versions[edition];
			});
	}
}
