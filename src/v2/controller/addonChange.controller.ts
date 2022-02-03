import { AddonReview } from "./../interfaces/addons";
import { PermissionError } from "./../tools/ApiError";
import { UserService } from "./../service/user.service";
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
import AddonService from "../service/addon.service";
import { Addon, AddonCreationParam, AddonReviewBody } from "../interfaces/addons";
import { BadRequestError } from "../tools/ApiError";

@Route("addons")
@Tags("Addons")
export class AddonChangeController extends Controller {
	private readonly service: AddonService = new AddonService();

	@Post("")
	@SuccessResponse(201, "Addon created")
	@Security("discord", [])
	public async addonCreate(@Body() body: AddonCreationParam, @Request() request: any): Promise<Addon> {
		if (!body.authors.includes(request.user)) throw new BadRequestError("Addon author must include the authed user");
		return this.service.create(body);
	}

	@Response<PermissionError>(403)
	@Delete("{id}")
	@SuccessResponse(204)
	@Security("discord", [])
	public async addonDelete(@Path() id: number, @Request() request: any): Promise<void> {
		const addon = await this.service.getAddon(id);

		// if not an author wants to delete the addon
		if (!addon.authors.includes(request.user)) {
			// check if admin
			const user = await new UserService().get(request.user);
			if (!user.roles.includes("Administrator") && !user.roles.includes("Moderator")) throw new PermissionError();
		}

		this.service.delete(id);
	}

	@Response<PermissionError>(403)
	@Patch("{id}")
	@SuccessResponse(204)
	@Security("discord", [])
	public async addonUpdate(
		@Path() id: number,
		@Body() body: AddonCreationParam,
		@Request() request: any,
	): Promise<Addon> {
		if (!body.authors.includes(request.user)) throw new BadRequestError("Addon author must include the authed user");
		const addon = await this.service.getAddon(id);

		// if not an author wants to delete the addon
		if (!addon.authors.includes(request.user)) {
			// check if admin
			const user = await new UserService().get(request.user);
			if (!user.roles.includes("administrator")) throw new PermissionError();
		}

		return this.service.update(id, body);
	}

	@Response<PermissionError>(403)
	@Put("{id}/review")
	@SuccessResponse(204)
	@Security("discord", ["Administrator", "Moderator"])
	public async reviewAddon(@Path() id: number, @Body() data: AddonReviewBody, @Request() request: any): Promise<void> {
		const review: AddonReview = {
			...data,
			author: String(request.user),
		};

		await this.service.review(id, review);
	}
}
