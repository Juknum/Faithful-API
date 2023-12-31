import { Controller, Get, Path, Query, Route, Tags } from "tsoa";
import {
	AcceptedRes,
	GalleryModalResult,
	GalleryResult,
	AnyPackArr,
	TextureAll,
	AnyPack,
	Texture,
	Edition,
} from "../interfaces";
import GalleryService from "../service/gallery.service";
import TextureService from "../service/texture.service";
import cache from "../tools/cache";

@Route("gallery")
@Tags("Gallery")
export class GalleryController extends Controller {
	private readonly textureService = new TextureService();

	private readonly service = new GalleryService();

	@Get("{pack}/{edition}/{mc_version}/{tag}/")
	public async search(
		@Path() pack: AcceptedRes | AnyPack,
		@Path() edition: Edition,
		@Path() mc_version: string,
		@Path() tag: string,
		@Query() search?: string,
	): Promise<GalleryResult[]> {
		const RES_TO_PACKS: Record<AcceptedRes, string> = {
			"16x": "default",
			"32x": "faithful_32x",
			"64x": "faithful_64x",
		};

		// legacy translation layer
		const packID: AnyPack = Object.keys(RES_TO_PACKS).includes(pack) ? RES_TO_PACKS[pack] : pack;

		return cache.handle(`gallery-${packID}-${edition}-${mc_version}-${tag}-${search ?? ""}`, () =>
			this.service.search(
				packID,
				edition,
				mc_version,
				tag.toLowerCase() !== "all" ? tag : undefined,
				search !== undefined && search.trim() !== "" ? search.trim() : undefined,
			),
		);
	}

	/**
	 * Get modal information with urls, mcmeta, texture, uses and paths
	 * @param id Searched texture name
	 * @param mc_version Minecraft version needed for the images
	 */
	@Get("modal/{id}/{mc_version}")
	public async modal(@Path() id: number, @Path() mc_version: string): Promise<GalleryModalResult> {
		const urls: Record<AnyPack, string> = (
			await Promise.allSettled(
				AnyPackArr.map((p) => this.textureService.getURLById(id, p, mc_version)),
			)
		)
			.map((e, i) => [AnyPackArr[i], e])
			.filter((p: [AnyPack, PromiseFulfilledResult<string>]) => p[1].status === "fulfilled")
			.reduce(
				(acc, p: [AnyPack, PromiseFulfilledResult<string>]) => ({ ...acc, [p[0]]: p[1].value }),
				{} as Record<AnyPack, string>,
			);

		const all = (await this.textureService.getPropertyByNameOrId(id, "all")) as TextureAll;

		const texture = (await this.textureService.getByNameOrId(id)) as Texture;

		return Promise.resolve({
			contributions: all.contributions,
			uses: all.uses,
			paths: all.paths,
			mcmeta: all.mcmeta,
			urls,
			texture,
		});
	}
}
