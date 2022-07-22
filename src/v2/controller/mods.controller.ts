import { Controller, Get, Path, Request, Route, SuccessResponse, Tags } from "tsoa";
import { Request as ExRequest, Response as ExResponse } from "express";
import { Mods, PackVersions } from "../interfaces";
import ModsService from "../service/mods.service";
import cache from "../tools/cache";

@Route("mods")
@Tags("Mods")
export class ModsController extends Controller {
	private readonly service: ModsService = new ModsService();

	/**
	 * Get the raw collection of mods
	 */
	@Get("raw")
	public async getRaw(): Promise<Mods> {
		return this.service.getRaw();
	}

	@Get("pack_versions")
	public async getPackVersions(): Promise<PackVersions> {
		return this.service.getPackVersions();
	}

	@Get("{id}/thumbnail")
	@SuccessResponse(302, "Redirect")
	public async getThumbnail(@Path() id: string, @Request() request: ExRequest): Promise<void> {
		const url = await cache.handle(`mods-thumbnail-${id}`, () => this.service.getThumbnail(parseInt(id, 10)));
		const response = (<any>request).res as ExResponse;
		response.redirect(url);
	}

	@Get("{id}/curseforge/name")
	public async getCurseForgeInfo(@Path() id: string): Promise<string> {
		return cache.handle(`mods-curseforge-name-${id}`, () => this.service.getCurseForgeName(parseInt(id, 10)));
	}
}