import { Request as ExRequest, Response as ExResponse } from "express";
import { Controller, Get, Path, Request, Response, Route, SuccessResponse, Tags } from "tsoa";

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

	@Response<ApiError>(404)
	@Get("{id}/files/screenshots/{index}")
	@SuccessResponse(302, "Redirect")
	public async getScreenshot(@Path() id: number, @Path() index: number, @Request() request: ExRequest) {
		const screenshotURL = await this.service.getSreenshotURL(id, index);
		const response = (<any>request).res as ExResponse;
		response.redirect(screenshotURL);
	}

	@Response<NotFoundError>(404)
	@Get("{id}/files/header")
	@SuccessResponse(302, "Redirect")
	public async getHeaderFile(@Path() id: number, @Request() request: ExRequest): Promise<void> {
		const headerFileURL = await this.service.getHeaderFileURL(id);
		const response = (<any>request).res as ExResponse;
		response.redirect(headerFileURL);
	}
}
