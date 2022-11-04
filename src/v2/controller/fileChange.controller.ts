/* eslint-disable */

import {
	Body,
	Controller,
	Delete,
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
import { PermissionError } from "../tools/ApiError";
import { FileCreationParam } from "../interfaces/files";
import { FileService } from "../service/file.service";

// TODO: remove when code done
/* eslint @typescript-eslint/no-unused-vars: "warn" */

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
	public async createFile(
		@Body() body: FileCreationParam,
		@Request() request: any
	): Promise<void> {
		return Promise.resolve();
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
	public async deleteFile(
		@Path() id: number,
		@Request() request: any
	): Promise<void> {
		return Promise.resolve();
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
	public async updateFile(
		@Path() id: number,
		@Body() body: any,
		@Request() request: any
	): Promise<void> {
		return Promise.resolve();
	}
}
