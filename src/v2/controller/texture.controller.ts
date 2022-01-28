import { Controller, Get, Path, Route, Tags } from "tsoa";

import { Contributions, Paths, Texture, TextureAll, Textures, Uses } from "../interfaces";
import { TextureProperty } from "../interfaces/textures";
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
	public async getEditions(): Promise<Array<string>> {
		return this.service.getEditions();
	}

	@Get("tags")
	public async getTags(): Promise<Array<string>> {
		return this.service.getTags();
	}

	@Get("resolutions")
	public async getResolutions(): Promise<Array<string>> {
		return this.service.getResolutions();
	}

	@Get("versions")
	public async getVersions(): Promise<Array<string>> {
		return this.service.getVersions();
	}

	@Get("versions/{edition}")
	public getVersionByEdition(@Path() edition: string): Promise<Array<string>> {
		return this.service.getVersionByEdition(edition);
	}

	@Get("name/{name}")
	public async getTextures(@Path() name: string): Promise<Textures> {
		return this.service.getByName(name, null);
	}

	@Get("name/{name}/{property}")
	public async getTexturesProperty(@Path() name: string, @Path() property: TextureProperty): Promise<Textures> {
		return this.service.getByName(name, property);
	}

	@Get("{id}")
	public async getTexture(@Path() id: number): Promise<Texture> {
		return this.service.getById(id, null);
	}
	
	@Get("{id}/{property}")
	public async getTextureProperty(@Path() id: number, @Path() property: TextureProperty): Promise<Texture> {
		return this.service.getById(id, property);
	}

	// todo: implements setter with authentification verification
}
