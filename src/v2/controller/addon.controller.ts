import { Request as ExRequest, Response as ExResponse } from "express";
import { Controller, Get, Path, Request, Response, Route, SuccessResponse, Tags } from "tsoa";

import { Addon, AddonStatus, Addons, Files, AddonAll } from "../interfaces";
import AddonService from "../service/addon.service";
import { NotFoundError, ApiError } from "./../tools/ApiError";

@Route("addons")
@Tags("Addons")
export class AddonController extends Controller {
	private readonly service: AddonService = new AddonService();

	/**
	 * Get the raw collection
	 */
	@Get("raw")
	public async getRaw(): Promise<Addons> {
		return this.service.getRaw();
	}

	/**
	 * Get add-on using the slug of this add-on
	 * @param slug Add-on slug
	 */
	@Response<NotFoundError>(404)
	@Get("/slug/{slug}")
	public async getAddonBySlug(@Path() slug: string): Promise<Addon> {
		const res = await this.service.getAddonBySlug(slug);
		if (res === undefined) throw new NotFoundError("Addon not found");
		return res;
	}

	/**
	 * Get add-ons using their approval status value
	 * @param status status value
	 */
	@Response<NotFoundError>(404)
	@Get("/status/{status}")
	public async getAddonByStatus(@Path() status: AddonStatus): Promise<Addons> {
		return this.service.getAddonByStatus(status);
	}

	/**
	 * Get add-on by ID
	 * @param id ID of the requested add-on
	 */
	@Get("{id}")
	public async getAddon(@Path() id: number): Promise<Addon> {
		return this.service.getAddon(id);
	}

	/**
	 * Get all information of an add-on using it's ID
	 * @param id ID of the requested add-on
	 */
	@Get("{id}/all")
	public async getAll(@Path() id: number): Promise<AddonAll> {
		return this.service.getAll(id);
	}

	/**
	 * Get files of an add-on using it's ID
	 * @param id ID of the requested add-on
	 */
	@Get("{id}/files")
	public async getFiles(@Path() id: number): Promise<Files> {
		return this.service.getFiles(id);
	}

	/**
	 * Get an array of URLs of all screenshots for the requested add-on
	 * @param id ID of the requested add-on
	 */
	@Get("{id}/files/screenshots")
	public async getScreenshots(@Path() id: number) {
		return this.service.getScreenshots(id);
	}

	/**
	 * Get a redirect URL for the requested screenshot
	 * @param id ID of the requested add-on
	 * @param index Screenshot index, starts at 0
	 */
	@Response<ApiError>(404)
	@Get("{id}/files/screenshots/{index}")
	@SuccessResponse(302, "Redirect")
	public async getScreenshot(@Path() id: number, @Path() index: number, @Request() request: ExRequest) {
		const screenshotURL = await this.service.getSreenshotURL(id, index);
		const response = (<any>request).res as ExResponse;
		response.redirect(screenshotURL);
	}

	/**
	 * Get a redirect URL for the requested add-on header
	 * @param id ID of the requested add-on
	 */
	@Response<NotFoundError>(404)
	@Get("{id}/files/header")
	@SuccessResponse(302, "Redirect")
	public async getHeaderFile(@Path() id: number, @Request() request: ExRequest): Promise<void> {
		const headerFileURL = await this.service.getHeaderFileURL(id);
		const response = (<any>request).res as ExResponse;
		response.redirect(headerFileURL);
	}
}
