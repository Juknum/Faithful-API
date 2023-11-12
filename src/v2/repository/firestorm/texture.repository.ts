import firestorm, { ID_FIELD } from "firestorm-db";
import {
	Edition,
	KnownPacks,
	TextureCreationParam,
	TextureMCMETA,
	TextureProperty,
} from "~/v2/interfaces/textures";
import { NotFoundError } from "../../tools/ApiError";
import { textures, paths, uses, contributions } from "../../firestorm";
import {
	Contributions,
	Paths,
	Texture,
	Textures,
	Uses,
	TextureRepository,
	Path,
	Use,
} from "../../interfaces";

export default class TextureFirestormRepository implements TextureRepository {
	async getByNameIdAndTag(
		tag: string | undefined,
		search: string | undefined,
		forcePartial: boolean = false,
	): Promise<Textures> {
		// * none, read raw
		if (tag === undefined && search === undefined) {
			return this.getRaw();
		}

		// * number id: get + includes tag?
		const number_id: number = search !== undefined ? Number.parseInt(search, 10) : Number.NaN;
		if (!Number.isNaN(number_id)) {
			const tex: Texture = await textures.get(number_id).catch(() => undefined);

			if (tex === undefined) return Promise.resolve([]);

			if (tag === undefined || tex.tags.includes(tag)) return Promise.resolve([tex]);

			return Promise.resolve([]);
		}

		// tag or string search
		const criterias = [];

		if (tag !== undefined) {
			criterias.push({
				field: "tags",
				criteria: "array-contains",
				value: tag,
			});
		}

		// with search
		let partial = false || forcePartial;
		if (search !== undefined) {
			partial = search.startsWith("_") || search.endsWith("_") || forcePartial;

			criterias.push({
				field: "name",
				criteria: partial ? "includes" : "==",
				value: search,
				ignoreCase: true,
			});
		}

		const results: Textures = await textures.search(criterias);
		if (results.length && search === undefined && !partial) return Promise.resolve(results);

		// fallback string search criteria to include if empty results
		criterias[criterias.length - 1].criteria = "includes";

		return textures.search(criterias);
	}

	public getRaw() {
		return textures.read_raw().then((res: any) => Object.values(res));
	}

	public getURLById(id: number, pack: KnownPacks, version: string) {
		return textures.get(id).then((texture) => texture.url(pack, version));
	}

	public async searchTextureByNameOrId(name_or_id): Promise<Textures | Texture> {
		const res = (await this.searchTexturePropertyByNameOrId(name_or_id, null)) as
			| Texture
			| Textures;
		return res;
	}

	public async searchTexturePropertyByNameOrId(
		name_or_id: string | number,
		property: TextureProperty,
	): Promise<Textures | Texture | Paths | Uses | Contributions | TextureMCMETA> {
		const int_id: number = parseInt(name_or_id as string, 10);

		if (Number.isNaN(int_id) || int_id.toString() !== name_or_id.toString()) {
			name_or_id = name_or_id.toString();

			if (name_or_id.length < 3)
				return Promise.reject(new Error("Texture name must be longer than 2 characters."));

			/**
			 * What do we do ? How do we search ?
			 * - if it starts/ends with an "_", the name is considered as incomplete => include mode
			 * - if not, the name is considered as full                              => exact match mode
			 * 		- if no results for the exact match, use the include mode instead
			 */
			if (name_or_id.startsWith("_") || name_or_id.endsWith("_")) {
				return textures
					.search([{ field: "name", criteria: "includes", value: name_or_id, ignoreCase: true }])
					.then((texturesFound: Textures) => {
						if (property === null) return texturesFound;
						return Promise.all(texturesFound.map((t) => t[property]()));
					});
			}

			return textures
				.search([{ field: "name", criteria: "==", value: name_or_id, ignoreCase: true }])
				.then((res: Textures) => {
					if (res.length === 0)
						return textures.search([
							{ field: "name", criteria: "includes", value: name_or_id, ignoreCase: true },
						]);
					return res;
				})
				.then((otherTexturesFound: Textures) => {
					if (property === null) return otherTexturesFound;
					return Promise.all(otherTexturesFound.map((t) => t[property]()));
				});
		}

		return this.getTextureById(int_id, property);
	}

	public getTextureById(id: number, property: TextureProperty): Promise<Texture> {
		if (Number.isNaN(id) || id < 0)
			return Promise.reject(new Error("Texture IDs must be integers greater than 0."));
		return textures.get(id).then((t) => {
			if (property === null) return t;
			return t[property]();
		});
	}

	public getEditions() {
		return uses
			.select({
				fields: ["edition"],
			})
			.then((res) =>
				Object.values(res).reduce((acc: Array<string>, cur: Use) => {
					if (!acc.includes(cur.edition)) acc.push(cur.edition);
					return acc.sort();
				}, []),
			);
	}

	public getResolutions(): Promise<Array<number>> {
		return contributions
			.select({
				fields: ["resolution"],
			})
			.then((response: any) =>
				(
					Object.values(response).reduce(
						(resolutionList: Array<number>, currentContribution: any) => {
							const { resolution: contributionResolution } = currentContribution;
							if (!resolutionList.includes(contributionResolution))
								resolutionList.push(contributionResolution);
							return resolutionList;
						},
						[],
					) as Array<number>
				).sort(),
			);
	}

	public getTags(): Promise<Array<string>> {
		return textures
			.select({
				fields: ["tags"],
			})
			.then((res: any) =>
				(
					Object.values(res).reduce(
						(acc: Array<string>, cur: any) => [...acc, cur.tags],
						[],
					) as Array<string>
				)
					.flat()
					.filter((e, i, a) => a.indexOf(e) === i)
					.sort(),
			);
	}

	public getVersions(): Promise<Array<string>> {
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

	public getVersionByEdition(edition: Edition): Promise<Array<string>> {
		return firestorm
			.collection("settings")
			.get("versions")
			.then((versions) => {
				if (versions[edition] === undefined) throw new NotFoundError("edition not found");
				return versions[edition];
			});
	}

	public createTexture(texture: TextureCreationParam): Promise<Texture> {
		return textures.add(texture).then((id: string) => this.searchTextureByNameOrId(id));
	}

	public async deleteTexture(id: string): Promise<void> {
		const foundTexture = await textures.get(id);
		const foundUses = await foundTexture.uses();
		const foundPaths = await foundTexture.paths();

		const promises = [];
		promises.push(textures.remove(id));
		promises.push(uses.removeBulk(foundUses.map((u) => u[ID_FIELD])));
		promises.push(paths.removeBulk(foundPaths.map((p) => p[ID_FIELD])));

		return Promise.all(promises).then(() => {});
	}

	public async changeTexture(id: string, body: TextureCreationParam): Promise<Texture> {
		const unmapped = {
			id,
			...body,
		};

		return textures.set(id, unmapped).then(() => this.searchTextureByNameOrId(id));
	}
}
