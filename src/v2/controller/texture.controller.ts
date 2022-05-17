import { Controller, Get, Path, Request, Response, Route, SuccessResponse, Tags } from "tsoa";
import { Request as ExRequest, Response as ExResponse } from "express";
import { Contributions, Paths, Texture, Textures, Uses } from "../interfaces";
import { Edition, KnownPacks, TextureProperty } from "../interfaces/textures";
import TextureService from "../service/texture.service";
import { NotFoundError } from "../tools/ApiError";

@Route("textures")
@Tags("Textures")
export class TextureController extends Controller {
	private readonly service: TextureService = new TextureService();

	/**
	 * Get the raw collection of textures
	 */
	@Get("raw")
	public async getRaw(): Promise<Textures> {
		return this.service.getRaw();
	}

	/**
	 * Get games editions supported by the database
	 */
	@Get("editions")
	public async getEditions(): Promise<Array<string>> {
	  return this.service.getEditions();
	}

	/**
	 * Get all the tags from all textures (Block, UI, ...)
	 */
	@Get("tags")
	public async getTags(): Promise<Array<string>> {
	  return this.service.getTags();
	}

	/**
	 * Get supported resolutions by the database
	 *! currently returning contributions resolution instead of pack resolution (32x != c32)
	 */
	@Get("resolutions")
	public async getResolutions(): Promise<Array<string>> {
	  return this.service.getResolutions();
	}

	/**
	 * Get versions trough all textures paths
	 */
	@Get("versions")
	public async getVersions(): Promise<Array<string>> {
	  return this.service.getVersions();
	}

	/**
	 * Get versions from the settings collection using an edition
	 * @param edition Existing edition inside the settings collection
	 * @returns
	 */
	@Get("versions/{edition}")
	public getVersionByEdition(@Path() edition: Edition): Promise<Array<string>> {
	  return this.service.getVersionByEdition(edition);
	}

	/**
	 * Get a texture using it's ID
	 * @param id_or_name Texture ID or texture name, splitted by "," if multiple
	 */
	@Get("{id_or_name}")
	public async getTexture(@Path() id_or_name: string | number): Promise<Texture | Texture[]> {
		if(typeof id_or_name === 'string' && id_or_name.includes(',')) {
			const id_array = id_or_name.split(',');
			return Promise.allSettled(id_array.map(id => this.service.getByNameOrId(id)))
				.then(res => res.filter(p => p.status === "fulfilled").map((p: any) => p.value).flat());
		}
	  return this.service.getByNameOrId(id_or_name);
	}

	/**
	 * Get more information about all textures that have the given string in their name
	 * @param name Searched texture name, splitted by "," if multiple
	 * @param property Property from the texture
	 */
	@Get("{id_or_name}/{property}")
	public async getTexturesProperty(
		@Path() id_or_name: string | number,
		@Path() property: TextureProperty,
	): Promise<Textures | Texture | Paths | Uses | Contributions | (Textures | Texture | Paths | Uses | Contributions)[]> {
		if(typeof id_or_name === 'string' && id_or_name.includes(',')) {
			const id_array = id_or_name.split(',');
			return (Promise.allSettled(id_array.map(id => this.service.getPropertyByNameOrId(id, property)))
				.then(res => res.filter(p => p.status === "fulfilled").map((p: any) => p.value).flat())) as Promise<(Textures | Texture | Paths | Uses | Contributions)[]>;
		}
		
	  return this.service.getPropertyByNameOrId(id_or_name, property);
	}

	/**
	 *
	 */
	@Response<NotFoundError>(404)
	@Get("{id}/url/{pack}/{mc_version}")
	@SuccessResponse(302, "Redirect")
	public async getTextureURL(
		@Path() id: string,
		@Path() pack: KnownPacks,
		@Path() mc_version: string,
		@Request() request: ExRequest,
	): Promise<void> {
	  const response = (<any>request).res as ExResponse;
	  response.redirect(await this.service.getURLById(parseInt(id, 10), pack, mc_version));
	}

	// todo: implements setter with authentification verification
}
