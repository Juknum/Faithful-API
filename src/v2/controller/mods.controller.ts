import { Controller, Get, Path, Request, Route, SuccessResponse, Tags, Response } from "tsoa";
import { Request as ExRequest, Response as ExResponse } from "express";
import { Mod } from "../interfaces";
import { NotFoundError } from "../tools/ApiError";
import ModsService from "../service/mods.service";
import cache from "../tools/cache";

@Route("mods")
@Tags("Mods")
export class ModsController extends Controller {
	private readonly service = new ModsService();

	/**
	 * Get the raw collection of mods
	 */
	@Get("raw")
	public async getRaw(): Promise<Record<string, Mod>> {
		return this.service.getRaw();
	}

	@Get("{id}/thumbnail")
	@Response<NotFoundError>(404)
	@SuccessResponse(302, "Redirect")
	public async getThumbnail(@Path() id: string, @Request() request: ExRequest): Promise<void> {
		const response = (<any>request).res as ExResponse;

		// if id is a number, it's a CurseForge ID
		if (Number.isNaN(parseInt(id, 10))) {
			response.sendStatus(404);
			return;
		}

		const url = await cache.handle(`mods-thumbnail-${id}`, () =>
			this.service.getThumbnail(parseInt(id, 10)),
		);
		response.redirect(url);
	}

	@Get("{id}/curseforge/name")
	public async getCurseForgeInfo(@Path() id: string): Promise<string> {
		// if id is a number, it's a CurseForge ID
		if (Number.isNaN(parseInt(id, 10))) {
			return cache.handle(`mods-curseforge-name-${id}`, () => this.service.getNameInDatabase(id));
		}

		return cache.handle(`mods-curseforge-name-${id}`, () =>
			this.service.getCurseForgeName(parseInt(id, 10)),
		);
	}
}
