import { Controller, Get, Path, Route, Tags } from 'tsoa';

import { Addon, AddonFiles, AddonAll } from '../interfaces';
import f from '../service/addon.service';

@Route("addons")
@Tags('Addons')
export class AddonController extends Controller {
	@Get('{addonId}')
	public async getUser(@Path() addonId: number): Promise<Addon> {
		return f.get(addonId);
	}

	@Get('{addonId}/all')
	public async getAll(@Path() addonId: number): Promise<AddonAll> {
		return f.all(addonId)
	}

	@Get('{addonId}/files')
	public async getFiles(@Path() addonId: number): Promise<AddonFiles> {
		return f.files(addonId)
	}
}
