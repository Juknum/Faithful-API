import { Controller, Delete, Get, Path, Route, Security, Tags } from "tsoa";
import { Use, Uses, Paths } from "../interfaces";
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
	 * Get path's use by id
	 * @param {String} id_or_name - Use ID or Use Name
	 * @returns {Promise<Use | Uses>}
	 */
	@Get("{id_or_name}/paths")
	public async getPathUseByIdOrName(
		@Path() id_or_name: string
	): Promise<Paths> {
		return this.service.getPathUseByIdOrName(id_or_name);
	}

	/**
	 * Get use by id
	 * @param {String} id_or_name - Use ID or Use Name
	 * @returns {Promise<Use | Uses>}
	 */
	@Get("{id_or_name}")
	public async getUseByIdOrName(
		@Path() id_or_name: string
	): Promise<Use | Uses> {
		return this.service.getUseByIdOrName(id_or_name);
	}

	/**
	 * Delete use by id
	 * @param {String} id - Use ID
	 * @returns {Promise<void>}
	 */
	@Delete("{id}")
	@Security("discord", ["administrator"])
	public async deleteUse(@Path() id: string): Promise<void> {
		return this.service.deleteUse(id);
	}
}
