import { Controller, Get, Route, Tags } from "tsoa";
import { ModVersion } from "../interfaces";
import ModsVersionsService from "../service/mods-versions.service";

@Route("mods-versions")
@Tags("Mods Versions")
export class ModsVersionsController extends Controller {
	private readonly service = new ModsVersionsService();

	/**
	 * Get the raw collection of mods
	 */
	@Get("raw")
	public getRaw(): Promise<Record<string, ModVersion>> {
		return this.service.getRaw();
	}
}
