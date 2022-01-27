import { PermissionError } from "./../tools/ApiError";
import { UserService } from "./../service/user.service";
import { Body, Controller, Delete, Path, Post, Request, Response, Route, Security, SuccessResponse } from "tsoa";
import AddonService from "../service/addon.service";
import { Addon, AddonCreationParam } from "../interfaces/addons";
import { BadRequestError } from "../tools/ApiError";

@Route("addons")
export class AddonChangeController extends Controller {
	private readonly service: AddonService = new AddonService();

	@Post("")
	@SuccessResponse(201, "Addon created")
	@Security("discord", [])
	public async createAddonData(@Body() body: AddonCreationParam, @Request() request: any): Promise<Addon> {
		if (!body.authors.includes(request.user)) throw new BadRequestError("Addon author must include the authed user");
		return this.service.create(body);
	}

	@Response<PermissionError>(403)
	@Delete("{id}")
	@SuccessResponse(204)
	@Security("discord", [])
	public async deleteAddon(@Path() id: number, @Request() request: any): Promise<void> {
		const addon = await this.service.getAddon(id);

		// if not an author wants to delete the addon
		if (!addon.authors.includes(request.user)) {
			// check if admin
			const user = await new UserService().get(request.user);
			if (!user.roles.includes("administrator")) throw new PermissionError();
		}

		this.service.delete(id);
	}
}
