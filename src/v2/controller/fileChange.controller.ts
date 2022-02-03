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

	/**
	 * TODO
	 * Create a file
	 * @param body 
	 * @param request 
	 */
	@Post("")
	@SuccessResponse(201, "File created")
	@Security("discord", [])
	public async createFile(@Body() body: FileCreationParam, @Request() request: any): Promise<File> {
		return;
	}

	/**
	 * TODO
	 * Delete a file with it's given ID
	 * @param id file ID
	 * @param request 
	 */
	@Response<PermissionError>(403)
	@Delete("{id}")
	@SuccessResponse(204)
	@Security("discord", [])
	public async deleteFile(@Path() id: number, @Request() request: any): Promise<void> {
		return;
	}

	/**
	 * TODO
	 * Update a file with it's given ID
	 * @param id file ID
	 * @param body 
	 * @param request 
	 */
	@Response<PermissionError>(403)
	@Put("{id}")
	@SuccessResponse(201, "File Updated")
	@Security("discord", [])
	public async updateFile(@Path() id: number, @Body() body: any, @Request() request: any): Promise<void> {
		return;
	}
}
