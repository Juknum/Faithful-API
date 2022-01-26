import { Request as ExRequest, Response as ExResponse } from "express";
import { Body, Controller, Delete, Get, Patch, Path, Put, Request, Response, Route, Security, SuccessResponse, Tags } from "tsoa";

import { Addon, Addons, Files, AddonAll } from "../interfaces";
import AddonService from "../service/addon.service";
import { NotFoundError, ApiError } from "./../tools/ApiError";

@Route("addons")
@Tags("Addons")
export class AddonController extends Controller {
	private readonly service: AddonService = new AddonService();

	@Get("raw")
	public async getRaw(): Promise<Addons> {
		return this.service.getRaw();
	}

	@Get("{id}")
	public async getAddon(@Path() id: number): Promise<Addon> {
		return this.service.getAddon(id);
	}

	@Get("{id}/all")
	public async getAll(@Path() id: number): Promise<AddonAll> {
		return this.service.getAll(id);
	}

	@Get("{id}/files")
	public async getFiles(@Path() id: number): Promise<Files> {
		return this.service.getFiles(id);
	}

	@Get("{id}/files/screenshots")
	public async getScreenshots(@Path() id: number) {
		return this.service.getScreenshots(id);
	}

	//! DOESN'T SEEMS TO WORK PROPERLY @Juknum
	// to reproduce: use addon id 26 and any index
	@Response<ApiError>(404)
	@Get("{id}/files/screenshots/{index}")
	@SuccessResponse(302, "Redirect")
	public async getScreenshot(@Path() id: number, @Path() index: number, @Request() request: ExRequest) {
		const screenshotURL = await this.service.getSreenshotURL(id, index);
		const response = (<any>request).res as ExResponse;
		response.redirect(screenshotURL);
	}

	//! DOESN'T SEEMS TO WORK PROPERLY @Juknum
	// to reproduce: use addon id 0
	@Response<NotFoundError>(404)
	@Get("{id}/files/header")
	@SuccessResponse(302, "Redirect")
	public async getHeaderFile(@Path() id: number, @Request() request: ExRequest): Promise<void> {
		const headerFileURL = await this.service.getHeaderFileURL(id);
		const response = (<any>request).res as ExResponse;
		response.redirect(headerFileURL);
	}

	/**
	 * This is used for all types of files:
	 * headers, screenshots, downloads..
	 * 
	 * - can be managed by an admin or the addon owner
	 */
	@Put("{id}/files")
	@Security("discord", ["administrator"]) // add addon owner
	public async addAddonFile(@Path() id:string, @Body() data: {roles: Array<string>, user: string}): Promise<void> {}

	@Delete("{id}/files/{fileId}")
	@Security("discord", ["administrator"]) // add addon owner
	public async deleteAddonFile(@Path() id:string, @Body() data: {roles: Array<string>, user: string}): Promise<void> {}

	@Patch("{id}/update")
	public async updateAddon(@Path() id: string, @Body() data: any): Promise<void> {}

	@Put("{id}/review/accept")
	public async acceptAddon(@Path() id: string, @Body() roles: Array<string>): Promise<void> {}

	@Put("{id}/review/deny")
	public async denyAddon(@Path() id: string, @Body() data: { roles: Array<string>, reason: string }): Promise<void> {}

}
