import { Controller, Get, Post, Route, Security, Tags, UploadedFiles } from "tsoa";
import { Mod, MulterFile } from "../interfaces";
import ModsService from "../service/mods.service";

@Route("mods")
@Tags("Mods")
export class ModsController extends Controller {
	private readonly service = new ModsService();

	/**
	 * Get the raw collection of mods
	 */
	@Get("raw")
	public getRaw(): Promise<Record<string, Mod>> {
		return this.service.getRaw();
	}

	@Post("upload")
	@Security("discord", ["Administrator", "Developer"])
	public async uploadMod(@UploadedFiles("files") files: MulterFile[]): Promise<Mod[]> {
		return this.service.addMods(files);
	}
}
