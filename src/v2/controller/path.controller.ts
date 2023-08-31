import {
	Controller,
	Delete,
	Get,
	Path as URLPath,
	Post,
	Route,
	Security,
	Tags,
	Body,
	Put,
} from "tsoa";
import { Path, InputPath } from "../interfaces";
import PathService from "../service/path.service";

@Route("paths")
@Tags("Paths")
export class PathsController extends Controller {
	private readonly service: PathService = new PathService();

	/**
	 * Creates new path
	 * @param body Input creation data
	 * @returns path created
	 */
	@Post("")
	@Security("bot")
	@Security("discord", ["administrator"])
	public async createPath(@Body() body: InputPath): Promise<Path> {
		return this.service.createPath(body);
	}

	/**
	 * Get path's use by internal id (e.g. 6096bcd96fb8b)
	 * @param {String} id internal id
	 * @returns {Promise<Use | Uses>}
	 */
	@Get("{id}")
	public async getPathById(@URLPath() id: string): Promise<Path> {
		return this.service.getPathById(id);
	}

	/**
	 * Update current path
	 * @param body Input data
	 * @returns path modified
	 */
	@Put("{id}")
	@Security("bot")
	@Security("discord", ["administrator"])
	public async updatePath(
		@URLPath() id: string,
		@Body() body: InputPath | Path
	): Promise<Path> {
		return this.service.updatePathById(id, {
			...body,
			id
		});
	}

	/**
	 * Delete use by internal id (e.g. 6096bcd96fb8b)
	 * @param {String} id internal id
	 * @returns {Promise<void>}
	 */
	@Delete("{id}")
	@Security("bot")
	@Security("discord", ["administrator"])
	public async deleteUse(@URLPath() id: string): Promise<void> {
		return this.service.removePathById(id);
	}
}
