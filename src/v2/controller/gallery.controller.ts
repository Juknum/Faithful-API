import { Controller, Get, Path, Query, Route, Tags } from "tsoa";
import {
	AcceptedRes,
	GalleryModalResult,
	GalleryResult,
	KnownPacksArr,
	TextureAll,
	KnownPacks,
	Texture,
} from "../interfaces";
import GalleryService from "../service/gallery.service";
import TextureService from "../service/texture.service";
import cache from "../tools/cache";

@Route("gallery")
@Tags("Gallery")
export class GalleryController extends Controller {
	private readonly textureService: TextureService = new TextureService();

	private readonly service: GalleryService = new GalleryService();

	@Get("{res}/{edition}/{mc_version}/{tag}/")
	public async search(
		@Path() res: AcceptedRes,
		@Path() edition: string,
		@Path() mc_version: string,
		@Path() tag: string,
		@Query() search?: string,
	): Promise<GalleryResult[]> {
		return cache.handle(`gallery-${res}-${edition}-${mc_version}-${tag}-${search ?? ""}`, () =>
			this.service.search(
				res,
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
		const urls: any[] = (
			await Promise.allSettled(
				KnownPacksArr.map((p) => this.textureService.getURLById(id, p, mc_version)),
			)
		)
			.map((e, i) => [KnownPacksArr[i], e])
			.filter((p: [KnownPacks, any]) => p[1].status === "fulfilled")
			.reduce((acc: any, p: any) => ({ ...acc, [p[0]]: p[1].value }), {});

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
