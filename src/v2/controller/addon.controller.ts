import { Request as ExRequest, Response as ExResponse } from "express";
import { Controller, Get, Path, Request, Response, Route, Security, SuccessResponse, Tags } from "tsoa";

import { Addon, AddonNotApproved, Addons, Files, AddonAll, AddonProprety } from "../interfaces";
import { AddonNotApprovedValues, AddonStatus, AddonStatusValues } from "../interfaces/addons";
import AddonService from "../service/addon.service";
import { NotFoundError, ApiError, PermissionError } from "./../tools/ApiError";

@Route("addons")
@Tags("Addons")
export class AddonController extends Controller {
	private readonly service: AddonService = new AddonService();

	private async getAddonProperty(id: number, property: AddonProprety): Promise<Addon | Files> {
		switch (property) {
			case "files":
				return this.service.getFiles(id);

			case "all":
			default:
				return this.service.getAll(id);
		}
	}

	/**
	 * Get the raw collection
	 */
	@Response<NotFoundError>(404)
	@Response<PermissionError>(403)
	@Security("discord", ["administrator"])
	@Get("/")
	public async getRaw(@Request() request: ExRequest): Promise<Record<string,Addon>> {
		return this.service.getRaw();
	}

	/**
	 * Get all add-ons using their status
	 * @param status Add-on status add-on
	 */
	public async getAddonsByStatus(status: AddonStatus): Promise<Addons> {
		return this.service.getAddonByStatus(status);
	}

	/**
	 * Get any add-on with id or slug (needs to be authentified for non-approved add-on), Get any add-on using their status (needs authentification for non-approved)
	 * @param id_or_slug Desired addon id or slug or addons per status
	 */
	@Response<PermissionError>(403)
	@Security("discord", ["addon:approved", "administrator"])
	@Get("{id_or_slug}")
	public async getAddon(@Path() id_or_slug: string): Promise<Addon | Addons> {
		console.log(id_or_slug, AddonStatusValues);
		if (AddonStatusValues.includes(id_or_slug as any)) return this.getAddonsByStatus(id_or_slug as AddonStatus);
		return this.service.getAddonFromSlugOrId(id_or_slug).then(r => r[1]);
	}

	/**
	 * Get any add-on property with id or slug
	 */
	@Response<NotFoundError>(404)
	@Response<PermissionError>(403)
	@Security("discord", ["addon:approved", "administrator"])
	@Get("{id_or_slug}/{property}")
	public async getAddonPropertyById(@Path() id_or_slug: string, property: AddonProprety): Promise<Addon | Files> {
		return this.service.getAddonFromSlugOrId(id_or_slug).then((value: [number, Addon]) => this.getAddonProperty(value[0], property));
	}

	/**
	 * Get an array of URLs of all screenshots for the requested add-on
	 * @param id_or_slug ID or slug of the requested add-on
	 */
	@Response<NotFoundError>(404)
	@Response<PermissionError>(403)
	@Security("discord", ["addon:approved", "administrator"])
	@Get("{id_or_slug}/files/screenshots")
	public async getScreenshots(@Path() id_or_slug: string): Promise<Array<string>> {
		return this.service.getAddonFromSlugOrId(id_or_slug).then((value: [number, Addon]) => this.service.getScreenshots(value[0]));
	}

	/**
	 * Get a redirect URL for the requested screenshot
	 * @param id_or_slug ID or slug of the requested add-on
	 * @param index Screenshot index, starts at 0
	 */
	@Response<NotFoundError>(404)
	@Response<PermissionError>(403)
	@Security("discord", ["addon:approved", "administrator"])
	@Get("{id_or_slug}/files/screenshots/{index}")
	@SuccessResponse(302, "Redirect")
	public async getScreenshot(@Path() id_or_slug: string, @Path() index: number, @Request() request: ExRequest) {
		const id = (await this.service.getAddonFromSlugOrId(id_or_slug))[0];
		const screenshotURL = await this.service.getSreenshotURL(id, index);
		const response = (<any>request).res as ExResponse;
		response.redirect(screenshotURL);
	}

	/**
	 * Get a redirect URL for the requested add-on header
	 * @param id_or_slug ID or slug of the requested add-on
	 */
	@Response<NotFoundError>(404)
	@Response<PermissionError>(403)
	@Security("discord", ["addon:approved", "administrator"])
	@Get("{id_or_slug}/files/header")
	@SuccessResponse(302, "Redirect")
	public async getHeaderFile(@Path() id_or_slug: string, @Request() request: ExRequest): Promise<void> {
		const id = (await this.service.getAddonFromSlugOrId(id_or_slug))[0];
		const headerFileURL = await this.service.getHeaderFileURL(id);
		const response = (<any>request).res as ExResponse;
		response.redirect(headerFileURL);
	}
}
