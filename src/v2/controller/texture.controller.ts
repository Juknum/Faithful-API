import { Controller, Get, Path, Route, Tags } from "tsoa";

import { Contributions, Paths, Texture, TextureAll, Textures, Uses } from "../interfaces";
import TextureService from "../service/texture.service";

@Route("textures")
@Tags("Textures")
export class TextureController extends Controller {
	private readonly service: TextureService = new TextureService();

	@Get("raw")
	public async getRaw(): Promise<Textures> {
		return this.service.getRaw();
	}

	@Get("editions")
	public async getEditions(): Promise<string[]> {
		return this.service.getEditions();
	}

	@Get("versions")
	public async getVersions(): Promise<string[]> {
		return this.service.getVersions();
	}

	@Get("versions/{edition}")
	public getVersionByEdition(@Path() edition: string): Promise<string[]> {
		return this.service.getVersionByEdition(edition);
	}

	@Get("resolutions")
	public async getResolutions(): Promise<string[]> {
		return this.service.getResolutions();
	}

	//! ORDER IS VERY IMPORTANT PUT prefixed BEFORE ID
	// else get Validation error with id number with value 'editions'
	@Get("{id}")
	public async getUser(@Path() id: number): Promise<Texture> {
		return this.service.get(id);
	}

	@Get("{id}/uses")
	public async getUses(@Path() id: number): Promise<Uses> {
		return this.service.getUses(id);
	}

	@Get("{id}/paths")
	public async getPaths(@Path() id: number): Promise<Paths> {
		return this.service.getPaths(id);
	}

	@Get("{id}/contributions")
	public async getContributions(@Path() id: number): Promise<Contributions> {
		return this.service.getContributions(id);
	}

	@Get("{id}/all")
	public async getAll(@Path() id: number): Promise<TextureAll> {
		return this.service.getAll(id);
	}

	// todo: implements setter with authentification verification
}
