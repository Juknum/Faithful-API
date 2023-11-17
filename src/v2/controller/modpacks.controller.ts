import { Controller, Get, Path, Request, Route, SuccessResponse, Tags } from "tsoa";
import { Request as ExRequest, Response as ExResponse } from "express";
import { Modpack } from "../interfaces";
import ModpacksService from "../service/modpacks.service";
import cache from "../tools/cache";

@Route("modpacks")
@Tags("Modpacks")
export class ModpacksController extends Controller {
	private readonly service = new ModpacksService();

	/**
	 * Get the raw collection of mods
	 */
	@Get("raw")
	public async getRaw(): Promise<Record<string, Modpack>> {
		return this.service.getRaw();
	}

	@Get("{id}/thumbnail")
	@SuccessResponse(302, "Redirect")
	public async getThumbnail(@Path() id: string, @Request() request: ExRequest): Promise<void> {
		const url = await cache.handle(`modpacks-thumbnail-${id}`, () =>
			this.service.getThumbnail(parseInt(id, 10)),
		);
		const response = (<any>request).res as ExResponse;
		response.redirect(url);
	}
}
