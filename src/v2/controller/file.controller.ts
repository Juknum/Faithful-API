import { Controller, Get, Route, Tags, Security } from "tsoa";
import { FileService } from "../service/file.service";

@Route("files")
@Tags("Files")
export class FileController extends Controller {
	private readonly service: FileService = new FileService();
	/**
	 * Get the raw collection of files
	 */
	@Get("raw")
	@Security("bot")
	public async getRaw(): Promise<any> {
		return this.service.getRaw();
	}
}
