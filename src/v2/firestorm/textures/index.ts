import axios from "axios";
import firestorm from "firestorm-db";
import {
	Paths,
	Uses,
	Contributions,
	TextureAll,
	Path,
	Use,
	PackID,
	FirestormTexture,
	MCMETA,
	PackGitHub,
	Edition,
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

	el.paths = (): Promise<Paths> =>
		el
			.uses()
			.then((_uses) =>
				Promise.all(_uses.map((_use) => uses.get(_use.id).then((u) => u.getPaths()))),
			)
			.then((arr) => arr.flat());

	el.url = (pack: PackID, version: string): Promise<string> => {
		const baseURL = "https://raw.githubusercontent.com";

		let urls: Partial<Record<Edition, PackGitHub>>;
		let path: Path;

		return packs
			.get(pack)
			.then((p) => {
				urls = p.github;
				return el.paths();
			})
			.then((texturePaths) => {
				// eq to [0]
				if (version === "latest") {
					[path] = texturePaths;
					version = path.versions.sort(MinecraftSorter).at(-1);
				} else path = texturePaths.find((p: Path) => p.versions.includes(version));

				return el.uses();
			})
			.then((_uses: Uses) => {
				const { edition } = _uses.find((u: Use) => u.id === path.use);
				if (!urls[edition])
					throw new NotFoundError(`Pack ${pack} doesn't support this edition yet!`);
				return `${baseURL}/${urls[edition].org}/${urls[edition].repo}/${version}/${path.name}`;
			});
	};

	el.contributions = (): Promise<Contributions> =>
		contributions.search([
			{
				field: "texture",
				criteria: "==",
				value: parseInt(el[firestorm.ID_FIELD], 10),
			},
		]);

	el.mcmeta = (): Promise<MCMETA> =>
		el
			.paths()
			.then((ps) => ps.find((path: Path) => path.mcmeta) || null)
			.then((p) => Promise.all([el.uses(), p]))
			.then(([us, p]) => {
				if (p === null) return [null, null];
				return [us.find((use: Use) => use.id === p.use), p];
			})
			.then(([u, p]: [Use, Path | null]) => {
				if (u === null || p === null) return null;
				return axios
					.get(
						`https://raw.githubusercontent.com/Faithful-Pack/Default-Java/${
							p.versions.sort(MinecraftSorter).reverse()[0]
						}/${p.name}.mcmeta`,
					)
					.catch(() => null); // avoid crash if mcmeta file cannot be found
			})
			.then((res) => (res ? res.data : {}))
			.catch(() => {});

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
