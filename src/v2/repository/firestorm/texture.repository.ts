import firestorm from "firestorm-db";
import { Edition, KnownPacks, TextureProperty } from "~/v2/interfaces/textures";
import { NotFoundError } from "../../tools/ApiError";
import { textures, paths, uses, contributions } from "../../firestorm";
import { Contributions, Paths, Texture, Textures, Uses, TextureRepository, Path } from "../../interfaces";
import { mapTexture, mapTextures, OldUse } from "../../tools/mapping/textures";

export default class TextureFirestormRepository implements TextureRepository {
	public getRaw(): Promise<Textures> {
		return textures.read_raw();
	}

	public getURLById(id: number, pack: KnownPacks, version: string) {
		return textures.get(id).then((texture) => texture.url(pack, version));
	}

	public async searchTextureByNameOrId(name_or_id): Promise<Textures | Texture> {
		const res = (await this.searchTexturePropertyByNameOrId(name_or_id, null)) as Texture | Textures;
		return res;
	}

	public async searchTexturePropertyByNameOrId(
		name_or_id: string | number,
		property: TextureProperty,
	): Promise<Textures | Texture | Paths | Uses | Contributions> {
		const int_id: number = parseInt(name_or_id as string, 10);

		if (Number.isNaN(int_id) || int_id.toString() !== name_or_id.toString()) {
			name_or_id = name_or_id.toString();

			if (name_or_id.length < 3) return Promise.reject(new Error("Texture name must be longer than 2 characters."));

			/**
			 * What do we do ? How do we search ?
			 * - if it starts/ends with an "_", the name is considered as incomplete => include mode
			 * - if not, the name is considered as full                              => exact match mode
			 * 		- if no results for the exact match, use the include mode instead
			 */
			if (name_or_id.startsWith("_") || name_or_id.endsWith("_")) {
				return textures
					.search([{ field: "name", criteria: "includes", value: name_or_id }])
					.then((texturesFound: Textures) => {
						if (property === null) return mapTextures(texturesFound as any); // todo: (DATA 2.0) use only textures after database rewrite
						return Promise.all(texturesFound.map((t) => t[property]()));
					});
			}

			return textures
				.search([{ field: "name", criteria: "==", value: name_or_id }])
				.then((res: Textures) => {
					if (res.length === 0) return textures.search([{ field: "name", criteria: "includes", value: name_or_id }]);
					return res;
				})
				.then((otherTexturesFound: Textures) => {
					if (property === null) return mapTextures(otherTexturesFound as any); // todo: (DATA 2.0) use only textures after database rewrite
					return Promise.all(otherTexturesFound.map((t) => t[property]()));
				});
		}

		return this.getTextureById(int_id, property);
	}

	public getTextureById(id: number, property: TextureProperty): Promise<Texture> {
		if (Number.isNaN(id) || id < 0) return Promise.reject(new Error("Texture IDs are integer greater than 0."));
		return textures.get(id).then((t) => {
			if (property === null) return mapTexture(t); // todo: (DATA 2.0) remove after database rewrite
			return t[property]();
		});
	}

	public getEditions() {
		return uses
			.select({
				fields: ["editions"],
			})
			.then((res) =>
				Object.values(res).reduce((acc: Array<string>, cur: OldUse) => {
					(cur.editions || []).forEach((edi) => {
						if (!acc.includes(edi)) acc.push(edi);
					});
					return acc.sort();
				}, []),
			);
	}

	getResolutions(): Promise<Array<string>> {
		/**
		 *! Resolutions should be the form of "32x" / "64x" and not resulting of contributions resolutions ("c32"...)
		 */

		return contributions
			.select({
				fields: ["res"], // TODO: change with resolution
			})
			.then((response: any) =>
				(
					Object.values(response).reduce((resolutionList: Array<string>, currentContribution: any) => {
					  const { res: contributionResolution } = currentContribution; // TODO: change with resolution
					  if (!resolutionList.includes(contributionResolution)) resolutionList.push(contributionResolution);
					  return resolutionList;
					}, []) as Array<string>
				).sort(),
			);
	}

	getTags(): Promise<Array<string>> {
		return textures
			.select({
				fields: ["type"], // TODO: change with tags
			})
			.then((res: any) =>
				(
					Object.values(res).reduce((acc: Array<string>, cur: any) => {
					  const types = cur.type;
					  acc.push(types);
					  return acc;
					}, []) as Array<string>
				)
					.flat()
					.filter((e, i, a) => a.indexOf(e) === i)
					.sort(),
			);
	}

	getVersions(): Promise<Array<string>> {
		return paths
			.select({
				fields: ["versions"],
			})
			.then((res) =>
				Object.values(res).reduce((acc: Array<string>, cur: Path) => {
					(cur.versions || []).forEach((edi) => {
						if (!acc.includes(edi)) acc.push(edi);
					});
					return acc.sort().reverse();
				}, []),
			);
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
