import { Controller, Get, Route, Tags } from "tsoa";
import { Mods } from "../interfaces";
import ModsService from "../service/mods.service";


@Route("mods")
@Tags("Mods")
export class ModsController extends Controller {
	private readonly service: ModsService = new ModsService();

	/**
	 * Get the raw collection of mods
	 */
	@Get("raw")
	public async getRaw(): Promise<Mods> {
		return this.service.getRaw();
	}
}