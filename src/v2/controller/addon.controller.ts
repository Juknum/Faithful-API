import { Request as ExRequest, Response as ExResponse } from "express";
import { Controller, Get, Path, Request, Response, Route, Security, SuccessResponse, Tags } from "tsoa";
import { Addon, Addons, Files, AddonAll, AddonProperty, AddonDownload, AddonStatus, AddonStatusValues, AddonStats, AddonStatsAdmin } from "../interfaces";

import AddonService from "../service/addon.service";
import { NotAvailableEror, NotFoundError, PermissionError } from "../tools/ApiError";
import { extract } from "../tools/extract";

@Route("addons")
@Tags("Addons")
export class AddonController extends Controller {
	private readonly service: AddonService = new AddonService();

	private async getAddonProperty(id: number, property: AddonProperty): Promise<Addon | Files> {
		switch (property) {
		case "files":
			return (await this.service.getFiles(id)).map((f) => {
				if ((f.use === "header" || f.use === "screenshot") && f.source.startsWith("/"))
					f.source = process.env.DB_IMAGE_ROOT + f.source;

				if (f.use === "download" && !f.source.startsWith("https://") && !f.source.startsWith("http://"))
					f.source = `http://${f.source}`;

				return f;
			});

		case "all":
		default:
			return this.service.getAll(id).then((addon: AddonAll) => {
				addon.files = addon.files.map((f) => {
					if ((f.use === "header" || f.use === "screenshot") && f.source.startsWith("/"))
						f.source = process.env.DB_IMAGE_ROOT + f.source;

					if (f.use === "download" && !f.source.startsWith("https://") && !f.source.startsWith("http://"))
						f.source = `http://${f.source}`;

					return f;
				});

				return addon;
			});
		}
	}

	/**
	 * Get the raw collection
	 */
	@Response<NotFoundError>(404)
	@Response<PermissionError>(403)
	@Security("discord", ["administrator"])
	@Get("/")
	public async getRaw(): Promise<Record<string, Addon>> {
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
	 * Get all add-ons stats for public
	 */
	@Response<NotAvailableEror>(408)
	@Get("stats")
	public async getStats(): Promise<AddonStats> {
		return this.service.getStats(false)
			.then(res => extract<AddonStats>({
				approved: true,
				numbers: true
			})(res))
	}

	/**
	 * Get all add-ons stats for admins
	 */
	@Response<NotFoundError>(404)
	@Response<PermissionError>(403)
	@Security("discord", ["administrator"])
	@Get("stats-admin")
	public async getStatsAdmin(): Promise<AddonStatsAdmin> {
		return this.service.getStats(true)
	}

	/**
	 * Get any add-on with id or slug (needs to be authentified for non-approved add-on), Get any add-on using their status (needs authentification for non-approved)
	 * @param id_or_slug Desired addon id or slug or addons per status
	 */
	@Response<PermissionError>(403)
	@Security("discord", ["addon:approved", "administrator"])
	@Get("{id_or_slug}")
	public async getAddon(@Path() id_or_slug: string): Promise<Addon | Addons> {
	  if (AddonStatusValues.includes(id_or_slug as any)) return this.getAddonsByStatus(id_or_slug as AddonStatus);
	  return this.service.getAddonFromSlugOrId(id_or_slug).then((r) => r[1]);
	}

	/**
	 * Get a redirect URL for the requested add-on header
	 * @param id_or_slug ID or slug of the requested add-on
	 */
	@Response<NotFoundError>(404)
	@Response<PermissionError>(403)
	@Security("discord", ["addon:approved", "administrator"])
	@Get("{id_or_slug}/header")
	@SuccessResponse(302, "Redirect")
	public async getHeaderFile(@Path() id_or_slug: string, @Request() request: ExRequest): Promise<void> {
	  const id = (await this.service.getAddonFromSlugOrId(id_or_slug))[0];
	  let headerFileURL = await this.service.getHeaderFileURL(id);
	  if (headerFileURL.startsWith("/")) headerFileURL = process.env.DB_IMAGE_ROOT + headerFileURL;

	  const response = (<any>request).res as ExResponse;
	  response.redirect(headerFileURL);
	}

	/**
	 * Get any add-on property with id or slug
	 */
	@Response<NotFoundError>(404)
	@Response<PermissionError>(403)
	@Security("discord", ["addon:approved", "administrator"])
	@Get("{id_or_slug}/{property}")
	public async getAddonPropertyById(@Path() id_or_slug: string, property: AddonProperty): Promise<Addon | Files> {
	  return this.service
	    .getAddonFromSlugOrId(id_or_slug)
	    .then((value: [number, Addon]) => this.getAddonProperty(value[0], property));
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
	  return this.service
	    .getAddonFromSlugOrId(id_or_slug)
	    .then((value: [number, Addon]) => this.service.getScreenshots(value[0]))
	    .then((screens) => screens.map((s) => (s.startsWith("/") ? process.env.DB_IMAGE_ROOT + s : s)));
	}

	/**
	 * Get an array of URLs of all screenshots for the requested add-on
	 * @param id_or_slug ID or slug of the requested add-on
	 */
	@Response<NotFoundError>(404)
	@Response<PermissionError>(403)
	@Security("discord", ["addon:approved", "administrator"])
	@Get("{id_or_slug}/files/downloads")
	public async getDownloads(@Path() id_or_slug: string): Promise<Array<AddonDownload>> {
	  return this.service
	    .getAddonFromSlugOrId(id_or_slug)
	    .then((res) => this.service.getFiles(res[0]))
	    .then((files) =>
	      Object.values(
	        files
	          .filter((f) => f.use === "download")
	          .map((f) => {
	            if (!f.source.startsWith("https://") && !f.source.startsWith("http://")) f.source = `http://${f.source}`;
	            return f;
	          })
	          .reduce((acc, file) => {
	            if (acc[file.name] === undefined) {
	              acc[file.name] = {
	                key: file.name,
	                links: [],
	              };
	            }
	            acc[file.name].links.push(file.source);

	            return acc;
	          }, {}),
	      ),
	    );
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

	@Response<NotFoundError>(404)
	@Response<PermissionError>(403)
	@Security("discord", ["addon:approved", "administrator"])
	@Get("{id_or_slug}/files/header")
	public async getHeaderURL(@Path() id_or_slug: string): Promise<string> {
	  const id = (await this.service.getAddonFromSlugOrId(id_or_slug))[0];
	  let headerFileURL = await this.service.getHeaderFileURL(id);
	  if (headerFileURL.startsWith("/")) headerFileURL = process.env.DB_IMAGE_ROOT + headerFileURL;

	  return headerFileURL;
	}
}
