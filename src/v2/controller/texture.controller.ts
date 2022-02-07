import { Controller, Get, Path, Request, Response, Route, SuccessResponse, Tags } from "tsoa";
import { Request as ExRequest, Response as ExResponse } from "express";
import { Texture, Textures } from "../interfaces";
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
	 * Get all textures that have the given string in their name
	 * @param name Searched texture name
	 */
	@Get("name/{name}")
	public async getTextures(@Path() name: string): Promise<Textures> {
		return this.service.getByName(name, null);
	}

	/**
	 * Get more information about all textures that have the given string in their name
	 * @param name Searched texture name
	 * @param property Property from the texture
	 */
	@Get("name/{name}/{property}")
	public async getTexturesProperty(@Path() name: string, @Path() property: TextureProperty): Promise<Textures> {
		return this.service.getByName(name, property);
	}

	/**
	 * Get a texture using it's ID
	 * @param id Texture ID
	 */
	@Get("{id}")
	public async getTexture(@Path() id: number): Promise<Texture> {
		return this.service.getById(id, null);
	}
	
	/**
	 * Get more information about a texture using it's ID
	 * @param id Texture ID
	 * @param property Property from the texture
	 */
	@Get("{id}/{property}")
	public async getTextureProperty(@Path() id: number, @Path() property: TextureProperty): Promise<Texture> {
		return this.service.getById(id, property);
	}

	/**
	 * 
	 */
	@Response<NotFoundError>(404)
	@Get("{id}/url/{pack}/{mc_version}")
	@SuccessResponse(302, "Redirect")
	public async getTextureURL(@Path() id: string, @Path() pack: KnownPacks, @Path() mc_version: string, @Request() request: ExRequest): Promise<string> {
		return this.service.getURLById(parseInt(id), pack, mc_version);
	}

	// todo: implements setter with authentification verification
}
