import {
	Body,
	Controller,
	Get,
	Path,
	Post,
	Response,
	Route,
	Security,
	SuccessResponse,
	Tags,
} from "tsoa";
import { WriteConfirmation } from "firestorm-db";
import { NotFoundError, PermissionError } from "@common/tools/errors";
import SettingsService from "../service/settings.service";

@Route("settings")
@Tags("Settings")
export class SettingsController extends Controller {
	private readonly settingsService = new SettingsService();

	/**
	 * Get the raw collection
	 */
	@SuccessResponse(200)
	@Get("raw")
	public getRaw(): Promise<Record<string, any>> {
		return this.settingsService.raw();
	}

	/**
	 * Get particular setting from path
	 * @param path Settings path split by "."
	 */
	@SuccessResponse(200)
	@Response<NotFoundError>(404)
	@Get("{path}")
	public async get(@Path() path: string): Promise<any> {
		const splitPath = path.split(".");

		const response = await this.settingsService.get(splitPath);
		if (response === undefined) throw new NotFoundError(`No setting found for key '${path}'`);
		return response;
	}

	/**
	 * Update the whole collection with the sent content
	 * @param body Entire settings JSON
	 */
	@SuccessResponse(204)
	@Response<PermissionError>(403)
	@Post("/raw")
	@Security("discord", ["administrator", "developer"])
	public update(@Body() body: Record<string, any>): Promise<WriteConfirmation> {
		return this.settingsService.update(body);
	}
}
