import { ForbiddenError } from './../tools/ApiError';
import { Body, Controller, Delete, Get, Path, Put, Request, Route, Security, Tags } from 'tsoa';
import { Addons, Contributions, User, UserCreationParams } from '../interfaces';
import { UserService } from '../service/user.service';

@Route("users")
@Tags("Users")
export class UserController extends Controller {

	private userService: UserService = new UserService();

	@Get('{id}')
	public async getUser(@Path() id: string): Promise<User> {
		return this.userService.get(id);
	}

	@Get('{id}/contributions')
	public async getContributions(@Path() id: string): Promise<Contributions> {
		return this.userService.getContributions(id);
	}

	@Get('{id}/addons')
	public async getAddons(@Path() id: string): Promise<Addons> {
		return this.userService.getAddons(id);
	}

	// todo: implements setter with authentification verification

	@Put("{id}")
	@Security("discord", [])
	public async set(@Path() id: string, @Body() body: UserCreationParams, @Request() request: any): Promise<User> {
		// the security middleware adds a key user with anything inside when validated, see security middleware Promise return type
		if(id !== request.user) {
			let user = await this.userService.get(id);

			// admin can modify if they want
			if(!user.roles.includes("administrator"))
				throw new ForbiddenError('Cannot delete another user')
		}

		return this.userService.create(id, body);
	}

	@Put("{id}/roles")
	@Security("discord", ["administrator"])
	public async setRoles(@Path() id: string, @Body() roles: string[]) {
		return this.userService.setRoles(id, roles)
	}

	@Delete("{id}")
	@Security("discord", ["administrator"])
	public async delete(@Path() id: string): Promise<void> {
		return this.userService.delete(id);
	}
}
