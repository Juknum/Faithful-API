import { Controller, Get, Path, Route, Tags } from 'tsoa';

import { Contributions, Paths, Texture, TextureAll, Textures, Uses } from '../interfaces';
import f from '../service/texture.service';

@Route("textures")
@Tags("Textures")
export class TextureController extends Controller {
	@Get('raw')
	public async getRaw(): Promise<Textures> {
		return f.getRaw();
	}

	@Get('{id}')
	public async getUser(@Path() id: number): Promise<Texture> {
		return f.get(id);
	}

	@Get('{id}/uses')
	public async getUses(@Path() id: number): Promise<Uses> {
		return f.getUses(id)
	}

	@Get('{id}/paths')
	public async getPaths(@Path() id: number): Promise<Paths> {
		return f.getPaths(id)
	}

	@Get('{id}/contributions')
	public async getContributions(@Path() id: number): Promise<Contributions> {
		return f.getContributions(id)
	}

	@Get('{id}/all')
	public async getAll(@Path() id: number): Promise<TextureAll> {
		return f.getAll(id)
	}

	// todo: implements setter with authentification verification
}
