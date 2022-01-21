import { Controller, Get, Path, Route, Tags } from "tsoa";

import { Addon, Addons, Files, AddonAll } from "../interfaces";
import AddonService from "../service/addon.service";

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

	// todo: implements setter with authentification verification
}
