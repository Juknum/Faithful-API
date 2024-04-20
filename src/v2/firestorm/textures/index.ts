import axios from "axios";
import firestorm from "firestorm-db";
import {
	Paths,
	Contributions,
	TextureAll,
	Path,
	Uses,
	PackID,
	FirestormTexture,
	MCMETA,
} from "../../interfaces";
import "../config";

import { uses } from "./uses";
import { contributions, packs } from "..";
import { MinecraftSorter } from "../../tools/sorter";
import { NotFoundError } from "../../tools/ApiError";

export const textures = firestorm.collection<FirestormTexture>("textures", (el) => {
	el.uses = (): Promise<Uses> =>
		uses.search([
			{
				field: "texture",
				criteria: "==",
				value: el[firestorm.ID_FIELD],
			},
		]);

	el.paths = async (): Promise<Paths> => {
		const textureUses = await el.uses();
		const proms = await Promise.all(
			textureUses.map((_use) => uses.get(_use.id).then((u) => u.getPaths())),
		);
		return proms.flat();
	};

	el.url = async (pack: PackID, version: string): Promise<string> => {
		const baseURL = "https://raw.githubusercontent.com";

		const { github } = await packs.get(pack);
		const texturePaths = await el.paths();

		// get matching path for version
		let path: Path;
		if (version === "latest") {
			path = texturePaths[0];
			version = path.versions.sort(MinecraftSorter).at(-1);
		} else path = texturePaths.find((p) => p.versions.includes(version));

		const textureUses = await el.uses();
		const { edition } = textureUses.find((u) => u.id === path.use);
		if (!github[edition]) throw new NotFoundError(`Pack ${pack} doesn't support this edition yet!`);
		return `${baseURL}/${github[edition].org}/${github[edition].repo}/${version}/${path.name}`;
	};

	el.contributions = (): Promise<Contributions> =>
		contributions.search([
			{
				field: "texture",
				criteria: "==",
				value: parseInt(el[firestorm.ID_FIELD], 10),
			},
		]);

	el.mcmeta = async (): Promise<MCMETA> => {
		const texturePaths = await el.paths();
		const foundPath = texturePaths.find((path) => path.mcmeta === true);
		if (!foundPath) return {};
		return axios
			.get(
				// mcmetas only exist on java edition
				`https://raw.githubusercontent.com/Faithful-Pack/Default-Java/${foundPath.versions
					.sort(MinecraftSorter)
					.at(-1)}/${foundPath.name}.mcmeta`,
			)
			.then((res) => (res ? res.data : {}))
			.catch(() => ({})); // avoid crash if mcmeta file cannot be found
	};

	el.all = async (): Promise<TextureAll> => ({
		id: el.id,
		name: el.name,
		tags: el.tags,
		uses: await el.uses(),
		paths: await el.paths(),
		mcmeta: await el.mcmeta(),
		contributions: await el.contributions(),
	});

	return el;
});
