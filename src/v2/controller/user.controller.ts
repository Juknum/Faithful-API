import { Controller, Get, Path, Route, Tags } from 'tsoa';

import { Addons, Contributions, User } from '../interfaces';
import f from '../service/user.service';

@Route("users")
@Tags("Users")
export class UserController extends Controller {
	@Get('{id}')
	public async getUser(@Path() id: string): Promise<User> {
		return f.get(id);
	}

	@Get('{id}/contributions')
	public async getContributions(@Path() id: string): Promise<Contributions> {
		return f.getContributions(id);
	}

	@Get('{id}/addons')
	public async getAddons(@Path() id: string): Promise<Addons> {
		return f.getAddons(id);
	}

	// todo: implements setter with authentification verification
}
