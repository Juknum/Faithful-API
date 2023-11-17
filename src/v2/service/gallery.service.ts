/* eslint-disable no-await-in-loop */

import { textures } from "../firestorm";
import { AcceptedRes, GalleryResult, Path, TextureMCMETA, Textures, Use } from "../interfaces";
import PathFirestormRepository from "../repository/firestorm/path.repository";
import { SettingsService } from "./settings.service";
import TextureService from "./texture.service";
import UseService from "./use.service";

export default class GalleryService {
	private readonly pathRepo = new PathFirestormRepository();

	private readonly useService = new UseService();

	private readonly textureService = new TextureService();

	private readonly settingsService = new SettingsService();

	async UrlsFromTextures(
		pack: string,
		edition: string,
		mc_version: string,
		texture_ids: string[],
		texture_to_use: Record<string, Use>,
		use_to_path: Record<string, Path>,
	) {
		return this.settingsService
			.raw()
			.then((settings) => settings.repositories.raw[pack])
			.then((urls) => `${urls[edition]}${mc_version}/`)
			.then((url) =>
				texture_ids
					.filter((t_id) => texture_to_use[t_id])
					.map((t_id) => texture_to_use[t_id])
					.map((use: Use) => use_to_path[use.id].name)
					.map((str) => url + str),
			);
	}

	async search(
		res: AcceptedRes,
		edition: string,
		mc_version: string,
		tag?: string,
		search?: string,
	): Promise<GalleryResult[]> {
		// ? it is more optimized to go down when searching because we have less textures than paths
		// ? texture -> texture found => uses -> uses found => paths -> paths found

		const textures_found = await this.textureService.getByNameIdAndTag(tag, search);

		if (textures_found.length === 0) return Promise.resolve([]);
		const ids = textures_found.map((t) => Number.parseInt(t.id, 10));

		const uses_found = await this.useService.getUsesByIdsAndEdition(ids, edition);
		if (uses_found.length === 0) return Promise.resolve([]);
		const use_ids = uses_found.map((u) => u.id);

		const paths_found = await this.pathRepo.getPathsByUseIdsAndVersion(use_ids, mc_version);
		if (paths_found.length === 0) return Promise.resolve([]);

		// ? From this we can go up, to filter with the found results
		// ? because a texture may not have a matching use or a use a matching path
		// ? paths found -> uses filtered -> textures filtered
		// ? no need to filter paths because they are totally matching the result (descending)

		// * make two in one with reduce

		// first filter with matching uses
		const {
			use_to_path,
			uses_filtered,
		}: {
			use_to_path: Record<string, Path>;
			uses_filtered: Use[];
		} = uses_found.reduce(
			(acc, u) => {
				const path = paths_found.find((p) => p.use === u.id);

				if (path) {
					acc.use_to_path[u.id] = path;
					acc.uses_filtered.push(u);
				}

				return acc;
			},
			{
				use_to_path: {},
				uses_filtered: [],
			},
		);

		// then filter matching textures
		const {
			texture_to_use,
			textures_filtered,
		}: {
			texture_to_use: Record<string, Use>;
			textures_filtered: Textures;
		} = textures_found.reduce(
			(acc, t) => {
				const use = uses_filtered.find((u) => String(u.texture) === t.id);

				if (use && use_to_path[use.id]) {
					acc.texture_to_use[String(t.id)] = use;
					acc.textures_filtered.push(t);
				}

				return acc;
			},
			{
				texture_to_use: {},
				textures_filtered: [],
			},
		);

		// TODO: optimize this to take less computation time
		const animations: { [key: string]: TextureMCMETA } = {};
		// eslint-disable-next-line no-restricted-syntax
		for (const useId of Object.keys(use_to_path)) {
			if (use_to_path[useId] && use_to_path[useId].mcmeta === true) {
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

		const urls = await this.UrlsFromTextures(
			pack,
			edition,
			mc_version,
			ids.map((id) => String(id)),
			texture_to_use,
			use_to_path,
		);

		return textures_filtered
			.map((t, i) => {
				const t_id = t.id;
				const u_id = texture_to_use[t_id].id;

				const path = use_to_path[u_id];

				return {
					name: String(t.name),
					tags: t.tags,
					pathID: path.id,
					textureID: t_id,
					mcmeta: animations[t_id] ?? null,
					url: urls[i],
					useID: u_id,
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
