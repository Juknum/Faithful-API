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
} from 'tsoa';
import { File } from '../interfaces/files';
import {
  AddonReview, Addon, AddonCreationParam, AddonReviewBody,
} from '../interfaces/addons';
import { PermissionError, BadRequestError } from '../tools/ApiError';
import { UserService } from '../service/user.service';
import AddonService from '../service/addon.service';

@Route('addons')
@Tags('Addons submission')
export class AddonChangeController extends Controller {
  private readonly service: AddonService = new AddonService();

	/**
	 * Create an add-on
	 * @param body
	 * @param request
	 */
	@Post('')
	@SuccessResponse(201, 'Addon created')
	@Security('discord', [])
  public async addonCreate(@Body() body: AddonCreationParam, @Request() request: any): Promise<Addon> {
    if (!body.authors.includes(request.user)) throw new BadRequestError('Addon author must include the authed user');
    return this.service.create(body);
  }

	/**
	 * Update an add-on using it's ID
	 * @param id_or_slug ID or slug of the updated add-on
	 * @param body
	 * @param request
	 */
	@Response<PermissionError>(403)
	@Patch('{id_or_slug}')
	@SuccessResponse(204)
	@Security('discord', ['addon:own'])
	public async addonUpdate(
		@Path() id_or_slug: string,
		@Body() body: AddonCreationParam,
		@Request() request: any,
	): Promise<Addon> {
	  const [id, addon] = await this.service.getAddonFromSlugOrId(id_or_slug);

	  // if not an author wants to delete the addon
	  if (!addon.authors.includes(request.user)) {
	    // check if admin
	    const user = await new UserService().get(request.user);
	    if (!user.roles.includes('Administrator')) throw new BadRequestError('Addon author must include the authed user');
	  }

	  return this.service.update(id, body);
	}

	/**
	 * Set the review value of the add-on using the given ID
	 * @param id_or_slug ID or slug of the reviewed add-on
	 * @param data Data containing, the status (pending, approved or denied) & the reason if denied (null otherwise)
	 * @param request
	 */
	@Response<PermissionError>(403)
	@Put('{id_or_slug}/review')
	@SuccessResponse(204)
	@Security('discord', ['Administrator', 'Moderator'])
	public async addonReview(
		@Path() id_or_slug: string,
		@Body() data: AddonReviewBody,
		@Request() request: any,
	): Promise<void> {
	  const int_id = parseInt(id_or_slug);

	  const addonId = (await this.service.getIdFromPath(id_or_slug))[0];

	  const review: AddonReview = {
	    ...data,
	    author: String(request.user),
	  };

	  await this.service.review(addonId, review);
	}

	/**
	 * Delete an add-on using it's ID
	 * @param id_or_slug ID or slug of the deleted add-on
	 * @param request
	 */
	@Response<PermissionError>(403)
	@Delete('{id_or_slug}')
	@SuccessResponse(204)
	@Security('discord', ['addon:own'])
	public async addonDelete(@Path() id_or_slug: string): Promise<void> {
	  const addonId = (await this.service.getIdFromPath(id_or_slug))[0];

	  this.service.delete(addonId);
	}

	public async postHeader(id_or_slug: string, file: Express.Multer.File): Promise<File | void> {
	  return this.service.postHeader(id_or_slug, file.originalname, file.buffer);
	}

	public async addonAddScreenshot(id_or_slug: string, file: Express.Multer.File): Promise<File | void> {
	  return this.service.postScreenshot(id_or_slug, file.originalname, file.buffer);
	}

	/**
	 * Delete an add-on screenshot
	 * @param id_or_slug ID or slug of the deleted add-on screenshot
	 * @param index Deleted add-on screenshot index
	 */
	@Response<PermissionError>(403)
	@Delete('{id_or_slug}/screenshots/{index}')
	@SuccessResponse(204)
	@Security('discord', ['addon:own'])
	public async addonDeleteScreenshot(@Path() id_or_slug: string, @Path() index: number): Promise<void> {
	  return this.service.deleteScreenshot(id_or_slug, index);
	}

	/**
	 * Delete an add-on screenshot
	 * @param id_or_slug ID or slug of the deleted add-on screenshot
	 * @param index Deleted add-on screenshot index
	 */
	@Response<PermissionError>(403)
	@Delete('{id_or_slug}/header/')
	@SuccessResponse(204)
	@Security('discord', ['addon:own'])
	public async addonDeleteHeader(@Path() id_or_slug: string): Promise<void> {
	  return this.service.deleteHeader(id_or_slug);
	}
}
