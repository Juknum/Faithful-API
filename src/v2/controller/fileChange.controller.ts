import { PermissionError } from "../tools/ApiError";
import {
	Body,
	Controller,
	Delete,
	Patch,
	Path,
	Post,
	Put,
	Request,
	Response,
	Route,
	Security,
	SuccessResponse,
	Tags,
} from "tsoa";
import { File } from "../interfaces";
import { FileCreationParam } from "../interfaces/files";
import { FileService } from "../service/file.service";

@Route("files")
@Tags("Files")
export class FileChangeController extends Controller {
	private readonly service: FileService = new FileService();

	@Post("")
	@SuccessResponse(201, "File created")
	@Security("discord", [])
	public async createFile(@Body() body: FileCreationParam, @Request() request: any): Promise<File> {
		return;
	}

	@Response<PermissionError>(403)
	@Delete("{id}")
	@SuccessResponse(204)
	@Security("discord", [])
	public async deleteFile(@Path() id: number, @Request() request: any): Promise<void> {}

	// todo : add file update
}
