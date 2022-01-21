import { NotFoundError } from "./../../tools/ApiError";
import firestorm from "firestorm-db";
import { textures, paths, uses, contributions } from "../../firestorm";
import { Contributions, Paths, Texture, Textures, TextureAll, Uses, TextureRepository, Path } from "../../interfaces";
import { mapTexture, OldUse } from "../../tools/mapping/textures";

export default class TextureFirestormRepository implements TextureRepository {
	getRaw = function (): Promise<Textures> {
		return textures.read_raw();
	};

	getTextureById = function (id: number): Promise<Texture> {
		if (isNaN(id) || id < 0) return Promise.reject(new Error("Texture IDs are integer greater than 0"));
		return textures.get(id).then(mapTexture); // todo: (DATA 2.0) remove after database rewrite
	};

	getUsesById = function (id: number): Promise<Uses> {
		if (isNaN(id) || id < 0) return Promise.reject(new Error("Texture IDs are integer greater than 0"));
		return textures.get(id).then((texture) => texture.uses());
	};

	getPathsById = function (id: number): Promise<Paths> {
		if (isNaN(id) || id < 0) return Promise.reject(new Error("Texture IDs are integer greater than 0"));
		return textures.get(id).then((texture) => texture.paths());
	};

	getContributionsById = function (id: number): Promise<Contributions> {
		if (isNaN(id) || id < 0) return Promise.reject(new Error("Texture IDs are integer greater than 0"));
		return textures.get(id).then((texture) => texture.contributions());
	};

	getAllById = function (id: number): Promise<TextureAll> {
		if (isNaN(id) || id < 0) return Promise.reject(new Error("Texture IDs are integer greater than 0"));
		return textures.get(id).then((texture) => texture.all());
	};

	getEditions = function () {
		return uses
			.select({
				fields: ["editions"],
			})
			.then((res) => {
				return Object.values(res).reduce((acc: string[], cur: OldUse) => {
					(cur.editions || []).forEach((edi) => {
						if (!acc.includes(edi)) acc.push(edi);
					});
					return acc.sort();
				}, []);
			});
	};

	getResolutions(): Promise<string[]> {
		return contributions
			.select({
				fields: ["res"], // TODO: change with resolution
			})
			.then((res: any) => {
				return (
					Object.values(res).reduce((acc: string[], cur: any) => {
						const res = cur.res; // TODO: change with resolution
						if (!acc.includes(res)) acc.push(res);
						return acc;
					}, []) as string[]
				).sort();
			});
	}

	getTags(): Promise<string[]> {
		return textures
			.select({
				fields: ["type"], // TODO: change with tags
			})
			.then((res: any) => {
				return (
					Object.values(res).reduce((acc: string[], cur: any) => {
						const types = cur.type;
						acc.push(types);
						return acc;
					}, []) as string[]
				)
					.flat()
					.filter((e, i, a) => a.indexOf(e) === i)
					.sort();
			});
	}

	getVersions(): Promise<string[]> {
		return paths
			.select({
				fields: ["versions"],
			})
			.then((res) => {
				return Object.values(res).reduce((acc: string[], cur: Path) => {
					(cur.versions || []).forEach((edi) => {
						if (!acc.includes(edi)) acc.push(edi);
					});
					return acc.sort().reverse();
				}, []);
			});
	}

	getVersionByEdition(edition: string): Promise<string[]> {
		return firestorm
			.collection("settings")
			.get("versions")
			.then((versions) => {
				if (versions[edition] === undefined) throw new NotFoundError("edition not found");
				return versions[edition];
			});
	}
}
