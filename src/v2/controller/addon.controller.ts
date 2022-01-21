import { Controller, Get, Path, Route, Tags } from "tsoa";

import { Addon, Files, AddonAll } from "../interfaces";
import f from "../service/addon.service";

@Route("addons")
@Tags("Addons")
export class AddonController extends Controller {
	@Get("{id}")
	public async getAddon(@Path() id: number): Promise<Addon> {
		return f.get(id);
	}

	@Get("{id}/all")
	public async getAll(@Path() id: number): Promise<AddonAll> {
		return f.getAll(id);
	}

	@Get("{id}/files")
	public async getFiles(@Path() id: number): Promise<Files> {
		return f.getFiles(id);
	}

	// todo: implements setter with authentification verification
}
