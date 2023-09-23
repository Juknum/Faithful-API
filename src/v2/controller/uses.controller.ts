import { Body, Controller, Delete, Get, Path, Post, Put, Route, Security, Tags } from "tsoa";
import { Use, Uses, Paths, CreationUse } from "../interfaces";
import UseService from "../service/use.service";

@Route("uses")
@Tags("Uses")
export class UsesController extends Controller {
	private readonly service: UseService = new UseService();

	/**
	 * Get the raw collection of uses
	 * @returns {Promise<Uses>}
	 */
	@Get("raw")
	public async getRaw(): Promise<Uses> {
		return this.service.getRaw();
	}

	/**
	 * Adds a new texture use to the database for a given texture ID and body
	 * @param body Texture use to create
	 * @returns {Promise<Use>} Created use
	 */
	@Post("")
	@Security("discord", ["administrator"])
	public async createUse(@Body() body: CreationUse & { id: string }): Promise<Use> {
		return this.service.createUse({
			...body,
		});
	}

	/**
	 * Get a path's use by ID
	 * @param {String} id_or_name - Use ID or Use Name
	 * @returns {Promise<Use | Uses>}
	 */
	@Get("{id_or_name}/paths")
	public async getPathUseByIdOrName(@Path() id_or_name: string): Promise<Paths> {
		return this.service.getPathUseByIdOrName(id_or_name);
	}

	/**
	 * Get a use by ID
	 * @param {String} id_or_name Use ID or Use Name
	 * @returns {Promise<Use | Uses>}
	 */
	@Get("{id_or_name}")
	public async getUseByIdOrName(@Path() id_or_name: string): Promise<Use | Uses> {
		return this.service.getUseByIdOrName(id_or_name);
	}

	/**
	 * Update texture use by use ID
	 * @param {String} id Use ID
	 * @returns {Promise<void>}
	 */
	@Put("{id}")
	@Security("discord", ["administrator"])
	public async changeUse(@Path() id: string, @Body() modifiedUse: CreationUse): Promise<Use> {
		return this.service.updateUse(id, modifiedUse);
	}

	/**
	 * Remove texture use by use ID with its associated paths
	 * @param {String} id Use ID
	 * @returns {Promise<void>}
	 */
	@Delete("{id}")
	@Security("discord", ["administrator"])
	public async deleteUse(@Path() id: string): Promise<void> {
		return this.service.deleteUse(id);
	}
}
