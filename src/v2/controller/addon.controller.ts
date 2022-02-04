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
	 * Util method to get id from
	 * @param id_or_slug ID or slug of the requested add-on
	 */
	private async getIdFromPath(id_or_slug: string): Promise<[number, Addon | undefined]> {
		const int_id = parseInt(id_or_slug);

		// if slug
		if (isNaN(int_id)) {
			const addon = await this.service.getAddonBySlug(id_or_slug);
			if (!addon) throw new NotFoundError("Addon not found");
			return [addon.id as number, addon];
		}

		// else if id
		return [int_id, undefined];
	}

	private async getIdAndAddonFromPath(id_or_slug: string): Promise<[number, Addon]> {
		let [id, addon] = await this.getIdFromPath(id_or_slug);

		if (!addon) addon = await this.service.getAddon(id);

		if (!addon) throw new NotFoundError("Addon not found");

		return [id, addon];
	}

	/**
	 * Get the raw collection
	 */
	@Get("/")
	public async getRaw(): Promise<Addons> {
		return this.service.getRaw();
	}

	/**
	 * Get add-ons using their approval status value
	 * @param status Status value
	 */
	@Response<NotFoundError>(404)
	@Get("/status/{status}")
	public async getAddonByStatus(@Path() status: AddonStatus): Promise<Addons> {
		return this.service.getAddonByStatus(status);
	}

	/**
	 * Get add-on by ID or slug
	 * @param id_or_slug ID or slug of the requested add-on
	 */
	@Response<NotFoundError>(404)
	@Get("{id_or_slug}")
	public async getAddon(@Path() id_or_slug: string): Promise<Addon> {
		return (await this.getIdAndAddonFromPath(id_or_slug))[1];
	}

	/**
	 * Get all information of an add-on using it's ID
	 * @param id_or_slug ID or slug of the requested add-on
	 */
	@Response<NotFoundError>(404)
	@Get("{id_or_slug}/all")
	public async getAll(@Path() id_or_slug: string): Promise<AddonAll> {
		const id = (await this.getIdFromPath(id_or_slug))[0];

		return this.service.getAll(id);
	}

	/**
	 * Get files of an add-on using it's ID
	 * @param id_or_slug ID or slug of the requested add-on
	 */
	@Response<NotFoundError>(404)
	@Get("{id_or_slug}/files")
	public async getFiles(@Path() id_or_slug: string): Promise<Files> {
		const id = (await this.getIdFromPath(id_or_slug))[0];

		return this.service.getFiles(id);
	}

	/**
	 * Get an array of URLs of all screenshots for the requested add-on
	 * @param id_or_slug ID or slug of the requested add-on
	 */
	@Response<NotFoundError>(404)
	@Get("{id_or_slug}/files/screenshots")
	public async getScreenshots(@Path() id_or_slug: string) {
		const id = (await this.getIdFromPath(id_or_slug))[0];

		return this.service.getScreenshots(id);
	}

	/**
	 * Get a redirect URL for the requested screenshot
	 * @param id_or_slug ID or slug of the requested add-on
	 * @param index Screenshot index, starts at 0
	 */
	@Get("{id_or_slug}/files/screenshots/{index}")
	@SuccessResponse(302, "Redirect")
	public async getScreenshot(@Path() id_or_slug: string, @Path() index: number, @Request() request: ExRequest) {
		const id = (await this.getIdFromPath(id_or_slug))[0];
		const screenshotURL = await this.service.getSreenshotURL(id, index);
		const response = (<any>request).res as ExResponse;
		response.redirect(screenshotURL);
	}

	/**
	 * Get a redirect URL for the requested add-on header
	 * @param id_or_slug ID or slug of the requested add-on
	 */
	@Get("{id_or_slug}/files/header")
	@SuccessResponse(302, "Redirect")
	public async getHeaderFile(@Path() id_or_slug: string, @Request() request: ExRequest): Promise<void> {
		const id = (await this.getIdFromPath(id_or_slug))[0];
		const headerFileURL = await this.service.getHeaderFileURL(id);
		const response = (<any>request).res as ExResponse;
		response.redirect(headerFileURL);
	}
}
