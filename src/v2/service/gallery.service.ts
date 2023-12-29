/* eslint-disable no-await-in-loop */

import { textures } from "../firestorm";
import {
	AcceptedRes,
	GalleryResult,
	Path,
	TextureMCMETA,
	Textures,
	Use,
	Uses,
} from "../interfaces";
import PathFirestormRepository from "../repository/firestorm/path.repository";
import { SettingsService } from "./settings.service";
import TextureService from "./texture.service";
import UseService from "./use.service";

export default class GalleryService {
	private readonly pathRepo = new PathFirestormRepository();

	private readonly useService = new UseService();

	private readonly textureService = new TextureService();

	private readonly settingsService = new SettingsService();

	async urlsFromTextures(
		pack: string,
		edition: string,
		mcVersion: string,
		textureIDs: string[],
		textureToUse: Record<string, Use>,
		useToPath: Record<string, Path>,
	) {
		return this.settingsService
			.raw()
			.then((settings) => settings.repositories.raw[pack])
			.then((urls) => `${urls[edition]}${mcVersion}/`)
			.then((url) =>
				textureIDs
					.filter((textureID) => textureToUse[textureID])
					.map((textureID) => textureToUse[textureID])
					.map((use: Use) => useToPath[use.id].name)
					.map((str) => url + str),
			);
	}

	async search(
		res: AcceptedRes,
		edition: string,
		mcVersion: string,
		tag?: string,
		search?: string,
	): Promise<GalleryResult[]> {
		// ? it is more optimized to go down when searching because we have less textures than paths
		// ? texture -> texture found => uses -> uses found => paths -> paths found

		const texturesFound = await this.textureService.getByNameIdAndTag(tag, search);

		if (texturesFound.length === 0) return Promise.resolve([]);
		const ids = texturesFound.map((t) => Number.parseInt(t.id, 10));

		const usesFound = await this.useService.getUsesByIdsAndEdition(ids, edition);
		if (usesFound.length === 0) return Promise.resolve([]);
		const useIDs = usesFound.map((u) => u.id);

		const pathsFound = await this.pathRepo.getPathsByUseIdsAndVersion(useIDs, mcVersion);
		if (pathsFound.length === 0) return Promise.resolve([]);

		// ? From this we can go up, to filter with the found results
		// ? because a texture may not have a matching use or a use a matching path
		// ? paths found -> uses filtered -> textures filtered
		// ? no need to filter paths because they are totally matching the result (descending)

		// * make two in one with reduce

		// first filter with matching uses
		const {
			useToPath,
			usesFiltered,
		}: {
			useToPath: Record<string, Path>;
			usesFiltered: Uses;
		} = usesFound.reduce(
			(acc, u) => {
				const path = pathsFound.find((p) => p.use === u.id);

				if (path) {
					acc.useToPath[u.id] = path;
					acc.usesFiltered.push(u);
				}

				return acc;
			},
			{
				useToPath: {},
				usesFiltered: [],
			},
		);

		// then filter matching textures
		const {
			textureToUse,
			texturesFiltered,
		}: {
			textureToUse: Record<string, Use>;
			texturesFiltered: Textures;
		} = texturesFound.reduce(
			(acc, t) => {
				const use = usesFiltered.find((u) => String(u.texture) === t.id);

				if (use && useToPath[use.id]) {
					acc.textureToUse[String(t.id)] = use;
					acc.texturesFiltered.push(t);
				}

				return acc;
			},
			{
				textureToUse: {},
				texturesFiltered: [],
			},
		);

		// TODO: optimize this to take less computation time
		const animations: Record<string, TextureMCMETA> = {};
		// eslint-disable-next-line no-restricted-syntax
		for (const useId of Object.keys(useToPath)) {
			if (useToPath[useId] && useToPath[useId].mcmeta === true) {
				const t = await textures.get(Number.parseInt(useId, 10));
				animations[`${Number.parseInt(useId, 10)}`] = await t.mcmeta();
			}
		}

		// TODO: setup pack as query params instead of using given resolution
		const RES_TO_PACKS: Record<AcceptedRes, string> = {
			"16x": "default",
			"32x": "faithful_32x",
			"64x": "faithful_64x",
		};

		const pack = RES_TO_PACKS[res];

		const urls = await this.urlsFromTextures(
			pack,
			edition,
			mcVersion,
			ids.map((id) => String(id)),
			textureToUse,
			useToPath,
		);

		return texturesFiltered
			.map((t, i) => {
				const textureID = t.id;
				const useID = textureToUse[textureID].id;

				const path = useToPath[useID];

				return {
					name: String(t.name),
					tags: t.tags,
					pathID: path.id,
					textureID,
					mcmeta: animations[textureID] ?? null,
					url: urls[i],
					useID,
				};
			})
			.sort((a, b) => {
				if (a.name < b.name) {
					return -1;
				}
				if (a.name > b.name) {
					return 1;
				}
				return 0;
			});
	}
}
