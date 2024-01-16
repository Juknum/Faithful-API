import axios from "axios";
import firestorm from "firestorm-db";
import {
	Paths,
	Uses,
	Contributions,
	TextureAll,
	Path,
	Use,
	AnyPack,
	FirestormTexture,
	MCMETA,
	PackGitHub,
	Edition,
} from "~/v2/interfaces";
import config from "../config";

import { uses } from "./uses";
import { contributions, packs } from "..";
import { MinecraftSorter } from "../../tools/sorter";
import { NotFoundError } from "../../tools/ApiError";

config();

export const textures = firestorm.collection<FirestormTexture>("textures", (el) => {
	el.uses = async (): Promise<Uses> =>
		uses.search([
			{
				field: "texture",
				criteria: "==",
				value: el[firestorm.ID_FIELD],
			},
		]);

	el.paths = async (): Promise<Paths> =>
		el
			.uses()
			.then((_uses) =>
				Promise.all(_uses.map((_use) => uses.get(_use.id).then((u) => u.getPaths()))),
			)
			.then((arr) => arr.flat());

	el.url = async (pack: AnyPack, version: string): Promise<string> => {
		const baseURL = "https://raw.githubusercontent.com";

		let urls: Partial<Record<Edition, PackGitHub>>;
		let path: Path;

		return packs
			.readRaw()
			.then((p) => {
				urls = p[pack].github;
				return el.paths();
			})
			.then((texturePaths: Paths) => {
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

	el.contributions = async (): Promise<Contributions> =>
		contributions.search([
			{
				field: "texture",
				criteria: "==",
				value: parseInt(el[firestorm.ID_FIELD], 10),
			},
		]);

	el.mcmeta = async (): Promise<MCMETA> =>
		el
			.paths()
			.then((ps: Paths) => ps.find((path: Path) => path.mcmeta) || null)
			.then((p: Path | null) => Promise.all([el.uses(), p]))
			.then(([us, p]: [Uses, Path | null]) => {
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
			.then((res: any | null) => (res ? res.data : {}))
			.catch(() => {});

	el.all = async (): Promise<TextureAll> => {
		const output = { id: el.id, name: el.name, tags: el.tags } as TextureAll;
		return el
			.uses()
			.then((tUses: Uses) => {
				output.uses = tUses;
				return el.paths();
			})
			.then((tPaths: Paths) => {
				output.paths = tPaths;
				return el.mcmeta();
			})
			.then((mcmeta: MCMETA) => {
				output.mcmeta = mcmeta;
				return el.contributions();
			})
			.then((tContribs: Contributions) => {
				output.contributions = tContribs;
				return output;
			});
	};

	return el;
});
