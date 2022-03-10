import { Controller, Get, Route, Tags } from "tsoa";
import { Modpacks } from "../interfaces";
import ModpacksService from "../service/modpacks.service";


@Route("modpacks")
@Tags("Modpacks")
export class ModpacksController extends Controller {
	private readonly service: ModpacksService = new ModpacksService();

	/**
	 * Get the raw collection of mods
	 */
	@Get("raw")
	public async getRaw(): Promise<Modpacks> {
		return this.service.getRaw();
	}
}