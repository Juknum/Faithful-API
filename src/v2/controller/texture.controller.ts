import {
	Body,
	Controller,
	Delete,
	Get,
	Path,
	Post,
	Put,
	Query,
	Request,
	Response,
	Route,
	Security,
	SuccessResponse,
	Tags,
} from "tsoa";
import { Request as ExRequest, Response as ExResponse } from "express";
import {
	Contributions,
	Paths,
	Texture,
	Textures,
	Uses,
	Edition,
	PackID,
	TextureCreationParam,
	MCMETA,
	TextureProperty,
	TextureAll,
	TexturesAll,
	EntireTextureToCreate,
} from "../interfaces";
import TextureService from "../service/texture.service";
import { NotFoundError } from "../tools/ApiError";

@Route("textures")
@Tags("Textures")
export class TextureController extends Controller {
	private readonly service = new TextureService();

	/**
	 * Get the raw collection of textures
	 */
	@Get("raw")
	public async getRaw(): Promise<Record<string, Texture>> {
		return this.service.getRaw();
	}

	/**
	 * Get Minecraft editions supported by the database
	 */
	@Get("editions")
	public async getEditions(): Promise<Array<string>> {
		return this.service.getEditions();
	}

	/**
	 * Get all the tags from all textures (Block, UI, etc)
	 */
	@Get("tags")
	public async getTags(): Promise<Array<string>> {
		return this.service.getTags();
	}

	/**
	 * Get current contributed resolutions in the database
	 * Integer array of square 2
	 */
	@Get("resolutions")
	public async getResolutions(): Promise<Array<number>> {
		return this.service.getResolutions();
	}

	/**
	 * Get all existing Minecraft versions supported in the database
	 */
	@Get("versions")
	public async getVersions(): Promise<Array<string>> {
		return this.service.getVersions();
	}

	/**
	 * Get all existing Minecraft versions for a given edition
	 * @param edition Existing edition inside the settings collection
	 */
	@Get("versions/{edition}")
	public getVersionByEdition(@Path() edition: Edition): Promise<Array<string>> {
		return this.service.getVersionByEdition(edition);
	}

	@Get("search")
	public searchTexture(@Query() tag?: string, @Query() name?: string): Promise<Textures> {
		return this.service.searchByNameIdAndTag(tag, name);
	}

	/**
	 * Get a texture by ID or name
	 * @param id_or_name Texture ID or texture name (join by "," if multiple)
	 */
	@Get("{id_or_name}")
	public async getTexture(@Path() id_or_name: string | number): Promise<Texture | Textures> {
		if (typeof id_or_name === "string" && id_or_name.includes(",")) {
			const id_array = id_or_name.split(",");
			return Promise.allSettled(id_array.map((id) => this.service.getByNameOrId(id))).then((res) =>
				res
					.filter((p) => p.status === "fulfilled")
					.map((p: any) => p.value)
					.flat(),
			);
		}
		return this.service.getByNameOrId(id_or_name);
	}

	/**
	 * Get more information about all textures that have the given string in their name
	 * @param id_or_name Texture search by name or id (join by ',' if multiple)
	 * @param property Property from the texture
	 */
	@Get("{id_or_name}/{property}")
	public async getTexturesProperty(
		@Path() id_or_name: string | number,
		@Path() property: TextureProperty,
	): Promise<
		| Textures
		| Texture
		| Paths
		| Uses
		| Contributions
		| MCMETA
		| TextureAll
		| (MCMETA | Textures | Texture | Paths | Uses | Contributions | TexturesAll)[]
	> {
		if (typeof id_or_name === "string" && id_or_name.includes(",")) {
			const id_array = id_or_name.split(",");
			return Promise.allSettled(
				id_array.map((id) => this.service.getPropertyByNameOrId(id, property)),
			).then((res) =>
				res
					.filter((p) => p.status === "fulfilled")
					.map((p: any) => p.value)
					.flat(),
			) as Promise<(Textures | Texture | Paths | Uses | Contributions)[]>;
		}

		return this.service.getPropertyByNameOrId(id_or_name, property);
	}

	/**
	 * Get GitHub URL based on specified parameters
	 * @param id Texture ID
	 * @param pack Pack to search from
	 * @param mc_version Version to choose from ('latest' to always get the latest version where texture exists)
	 */
	@Response<NotFoundError>(404)
	@Get("{id}/url/{pack}/{mc_version}")
	@SuccessResponse(302, "Redirect")
	public async getTextureURL(
		@Path() id: string,
		@Path() pack: PackID,
		@Path() mc_version: string,
		@Request() request: ExRequest,
	): Promise<void> {
		const response = (<any>request).res as ExResponse;
		const url = await this.service.getURLById(parseInt(id, 10), pack, mc_version);
		response.redirect(url);
	}

	/**
	 * Create a texture
	 * @param body Texture information
	 */
	@Post("")
	@Security("bot")
	@Security("discord", ["administrator"])
	public async createTexture(@Body() body: TextureCreationParam): Promise<Texture> {
		return this.service.createTexture(body);
	}

	/**
	 * Create multiple textures at once
	 * @param body Texture information
	 */
	@Post("multiple")
	@Security("bot")
	@Security("discord", ["administrator"])
	public async createMultipleTextures(@Body() body: EntireTextureToCreate[]): Promise<Textures> {
		return this.service.createEntireTextures(body);
	}

	/**
	 * Edit an existing texture
	 * @param id Texture ID
	 * @param body Texture information
	 */
	@Put("{id}")
	@Security("bot")
	@Security("discord", ["administrator"])
	public async changeTexture(
		@Path() id: string,
		@Body() body: TextureCreationParam,
	): Promise<Texture> {
		return this.service.changeTexture(id, body);
	}

	/**
	 * Deletes the ENTIRE texture, with uses and paths included
	 * @param id Texture ID
	 */
	@Delete("{id}")
	@Security("bot")
	@Security("discord", ["administrator"])
	public async deleteTexture(id: string): Promise<void> {
		return this.service.deleteTexture(id);
	}
}
