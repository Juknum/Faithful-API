import { Controller, Get, Route, Tags, Security } from "tsoa";
import { FileService } from "../service/file.service";
import { File } from "../interfaces";

@Route("files")
@Tags("Files")
export class FileController extends Controller {
	private readonly service = new FileService();

	/**
	 * Get the raw collection of files
	 */
	@Get("raw")
	@Security("bot")
	public async getRaw(): Promise<Record<string, File>> {
		return this.service.getRaw();
	}
}
