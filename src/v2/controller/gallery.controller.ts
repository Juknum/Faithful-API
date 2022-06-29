import { Controller, Get, Path, Query, Route, Tags } from "tsoa";
import { AcceptedRes, GalleryResult } from "../interfaces";
import GalleryService from "../service/gallery.service";

@Route("gallery")
@Tags("Gallery")
export class GalleryController extends Controller {
	private readonly service: GalleryService = new GalleryService();

	@Get("{res}/{edition}/{mc_version}/{tag}/")
	public async search(
		@Path() res: AcceptedRes,
		@Path() edition: string,
		@Path() mc_version: string,
    @Path() tag: string,
    @Query() search?: string,
	): Promise<GalleryResult[]> {
		return this.service.search(res, edition, mc_version,
			tag.toLowerCase() !== 'all' ? tag : undefined,
			(search !== undefined && search.trim() !== '') ? search.trim() : undefined);
	}
}