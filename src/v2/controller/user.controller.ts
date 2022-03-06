import { Body, Controller, Delete, Get, Path, Put, Request, Route, Security, Tags } from 'tsoa';
import { BadRequestError, ForbiddenError } from '../tools/ApiError';
import { Addons, Contributions, UserNames, Users, User, UserCreationParams } from '../interfaces';
import { UserService } from '../service/user.service';

@Route('users')
@Tags('Users')
export class UserController extends Controller {
	private userService: UserService = new UserService();

    /**
     * Get the raw collection of users
     */
    @Get('raw')
    @Security('discord', ['administrator']) // avoid warns info to be shown
    @Security('bot')
	public async getRaw(): Promise<Users> {
		return this.userService.getRaw();
	}

    /**
     * Get all usernames the database has
     */
    @Get('names')
    public async getNames(): Promise<UserNames> {
    	return this.userService.getNames();
    }

    /**
     * Get a user by it's ID
     * @param id User ID
     */
    @Get('{id}')
    @Security('discord', ['administrator']) // avoid warns info to be shown
    @Security('bot')
    public async getUser(@Path() id: string): Promise<User> {
    	return this.userService.get(id);
    }

    /**
     * Get all contributions a user has made
     * @param id User ID
     */
    @Get('{id}/contributions')
    public async getContributions(@Path() id: string): Promise<Contributions> {
    	return this.userService.getContributions(id);
    }

    /**
     * Get all approved add-ons from that user
     * @param id User ID
     */
    @Get('{id}/addons/approved')
    public async getAddons(@Path() id: string): Promise<Addons> {
    	return this.userService.getAddons(id);
    }

    /**
     * Get all add-ons from that user
     * @param id User ID
     */
    @Get('{id}/addons')
    @Security('discord', [])
    @Security('bot')
    public async getAllAddons(@Path() id: string, @Request() request: any): Promise<Addons> {
    	if (id !== request.user) {
    		// check if admin
    		const user = await new UserService().get(request.user);
    		if (!user.roles.includes('Administrator'))
    			throw new BadRequestError('Addon author must include the authed user');
    	}

    	return this.userService.getAllAddons(id);
    }

    // todo: implements setter with authentification verification

    /**
     * Update user data for the given user ID
     * @param id User ID
     * @param body
     * @param request
     */
    @Put('{id}')
    @Security('discord', [])
    @Security('bot')
    public async set(@Path() id: string, @Body() body: UserCreationParams, @Request() request: any): Promise<User> {
    	// the security middleware adds a key user with anything inside when validated, see security middleware Promise return type
    	if (id !== request.user) {
    		const user = await this.userService.get(id).catch(() => {});

    		// admin can modify if they want
    		if (user && !user.roles.includes('Administrator')) throw new ForbiddenError('Cannot set another user');
    	}

    	const user = await this.userService.get(id).catch(() => {});

    	const roles = user ? user.roles || [] : [];

    	// add roles and ID
    	const sent: User = {
    		...body,
    		roles,
    		id,
    	};

    	return this.userService.update(id, sent);
    }

    /**
     * Set roles for a user with the given user ID
     * @param id User ID
     * @param roles Role names (not IDs!)
     */
    @Put('{id}/roles')
    @Security('discord', ['administrator'])
    @Security('bot')
    public async setRoles(@Path() id: string, @Body() roles: string[]) {
    	return this.userService.setRoles(id, roles);
    }

    /**
     * Delete the user with the given ID
     * @param id User ID to be deleted
     */
    @Delete('{id}')
    @Security('discord', ['administrator'])
    @Security('bot')
    public async delete(@Path() id: string): Promise<void> {
    	return this.userService.delete(id);
    }
}
