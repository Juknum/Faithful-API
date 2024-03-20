import { textures } from "../firestorm";
import { Edition, GalleryResult, PackID, Path, MCMETA, Textures, Use, Uses } from "../interfaces";
import { NotFoundError } from "../tools/ApiError";
import PackService from "./pack.service";
import PathService from "./path.service";
import TextureService from "./texture.service";
import UseService from "./use.service";

export default class GalleryService {
	private readonly pathService = new PathService();

	private readonly useService = new UseService();

	private readonly textureService = new TextureService();

	private readonly packService = new PackService();

	async urlsFromTextures(
		pack: PackID,
		edition: Edition,
		mcVersion: string,
		textureIDs: string[],
		textureToUse: Record<string, Use>,
		useToPath: Record<string, Path>,
	): Promise<string[]> {
		const baseURL = "https://raw.githubusercontent.com";
		const urls = await this.packService.getById(pack).then((res) => res.github[edition]);
		if (!urls) throw new NotFoundError(`Pack ${pack} doesn't support this edition yet!`);

		return textureIDs
			.filter((textureID) => textureToUse[textureID])
			.map((textureID) => textureToUse[textureID])
			.map((use: Use) => useToPath[use.id].name)
			.map((path) => `${baseURL}/${urls.org}/${urls.repo}/${mcVersion}/${path}`);
	}

	async search(
		pack: PackID,
		edition: Edition,
		mcVersion: string,
		tag?: string,
		search?: string,
	): Promise<GalleryResult[]> {
		// ? it is more optimized to go down when searching because we have less textures than paths
		// ? texture -> texture found => uses -> uses found => paths -> paths found

		const texturesFound = await this.textureService.getByNameIdAndTag(tag, search);

		if (texturesFound.length === 0) return [];
		const ids = texturesFound.map((t) => Number.parseInt(t.id, 10));

		const usesFound = await this.useService.getUsesByIdsAndEdition(ids, edition);
		if (usesFound.length === 0) return [];
		const useIDs = usesFound.map((u) => u.id);

		const pathsFound = await this.pathService.getPathsByUseIdsAndVersion(useIDs, mcVersion);
		if (pathsFound.length === 0) return [];

		// ? From this we can go up, to filter with the found results
		// ? because a texture may not have a matching use or a use a matching path
		// ? paths found -> uses filtered -> textures filtered
		// ? no need to filter paths because they are totally matching the result (descending)

		// * make two in one with reduce

		// first filter with matching uses
		const { useToPath, usesFiltered } = usesFound.reduce(
			(acc, u) => {
				const path = pathsFound.find((p) => p.use === u.id);

				if (path) {
					acc.useToPath[u.id] = path;
					acc.usesFiltered.push(u);
				}

				return acc;
			},
			{
				useToPath: {} as Record<string, Path>,
				usesFiltered: [] as Uses,
			},
		);

		// then filter matching textures
		const { textureToUse, texturesFiltered } = texturesFound.reduce(
			(acc, t) => {
				const use = usesFiltered.find((u) => String(u.texture) === t.id);

				if (use && useToPath[use.id]) {
					acc.textureToUse[String(t.id)] = use;
					acc.texturesFiltered.push(t);
				}

				return acc;
			},
			{
				textureToUse: {} as Record<string, Use>,
				texturesFiltered: [] as Textures,
			},
		);

		const animations: Record<string, MCMETA> = {};

		// mcmetas are all loaded after the Promise.all finishes (faster than loop)
		await Promise.all(
			Object.keys(useToPath)
				.filter((useId) => useToPath[useId]?.mcmeta)
				.map((useId) =>
					textures
						.get(Number.parseInt(useId, 10))
						.then((t) => t.mcmeta())
						.then((mcmeta) => {
							animations[Number.parseInt(useId, 10)] = mcmeta;
						}),
				),
		);

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
				if (a.name < b.name) return -1;
				if (a.name > b.name) return 1;
				return 0;
			});
	}
}
