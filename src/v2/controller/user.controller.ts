import {
	Body,
	Controller,
	Delete,
	Get,
	Path,
	Post,
	Put,
	Request,
	Response,
	Route,
	Security,
	Tags,
} from "tsoa";
import { BadRequestError, ForbiddenError, NotAvailableError } from "../tools/ApiError";
import {
	Addons,
	Contributions,
	UserNames,
	Users,
	User,
	UserCreationParams,
	UserStats,
	UserProfile,
	UserName,
} from "../interfaces";
import { UserService } from "../service/user.service";
import cache from "../tools/cache";

@Route("users")
@Tags("Users")
export class UserController extends Controller {
	private userService = new UserService();

	@Get("profile")
	@Security("discord", [])
	public getProfile(@Request() request: any): Promise<User> {
		return this.userService.getUserById(request.user);
	}

	@Post("profile")
	@Security("discord", [])
	public async setProfile(@Body() body: UserProfile, @Request() request: any): Promise<void> {
		await this.userService.setProfileById(request.user, body);
	}

	@Post("newprofile")
	@Security("discord", [])
	public async createProfile(@Request() request: any): Promise<User> {
		return this.userService.getProfileOrCreate(request.user);
	}

	/**
	 * Get the raw collection of users
	 */
	@Get("raw")
	public async getRaw(): Promise<Record<string, User>> {
		return this.userService.getRaw();
	}

	/**
	 * Get all public user stats
	 */
	@Response<NotAvailableError>(408)
	@Get("stats")
	public async getStats(): Promise<UserStats> {
		return cache.handle("user-stats", () => this.userService.getStats());
	}

	/**
	 * Get all usernames the database has
	 */
	@Get("names")
	public async getNames(): Promise<UserNames> {
		return this.userService.getNames();
	}

	/**
	 * Get all discord roles the database has
	 */
	@Get("roles")
	public async getRoles(): Promise<Array<string>> {
		return this.userService.getRoles();
	}

	/**
	 * Get users that have a specific role
	 * @param role The role to search for
	 */
	@Get("role/{role}")
	public async getUsersFromRole(@Path() role: string): Promise<Users> {
		return this.userService.getUsersFromRole(role, null);
	}

	/**
	 * Get users that have a specific role
	 * @param role Role name
	 * @param username Discord user username
	 */
	@Get("role/{role}/{username}")
	public async getUsersFromRoleAndUsername(
		@Path() role: string,
		@Path() username: string,
	): Promise<Users> {
		return this.userService.getUsersFromRole(role, username);
	}

	/**
	 * Get a user by their ID or username
	 * @param id_or_username User ID/Username (join by "," if multiple)
	 */
	@Get("{id_or_username}")
	public async getUser(@Path() id_or_username: string): Promise<User | Users> {
		if (typeof id_or_username === "string" && id_or_username.includes(",")) {
			const idArray = id_or_username.split(",");
			return Promise.allSettled(idArray.map((id) => this.userService.getUsersByNameOrId(id))).then(
				(res) =>
					res
						.filter((p) => p.status === "fulfilled")
						.map((p: any) => p.value)
						.flat(),
			);
		}

		return this.userService.getUsersByNameOrId(id_or_username);
	}

	/**
	 * Get all contributions a user has made
	 * @param id User ID
	 */
	@Get("{id}/contributions")
	public async getContributions(@Path() id: string): Promise<Contributions> {
		return this.userService.getContributions(id);
	}

	/**
	 * Get the corresponding username for a given user ID
	 * @param id User ID
	 */
	@Get("{id}/name")
	public async getName(@Path() id: string): Promise<UserName> {
		return this.userService.getNameById(id);
	}

	/**
	 * Get all approved add-ons from a given user
	 * @param id User ID
	 */
	@Get("{id}/addons/approved")
	public async getAddons(@Path() id: string): Promise<Addons> {
		return this.userService.getAddons(id);
	}

	/**
	 * Get all add-ons by a given user
	 * @param id User ID
	 */
	@Get("{id}/addons")
	@Security("discord", [])
	@Security("bot")
	public async getAllAddons(@Path() id: string, @Request() request: any): Promise<Addons> {
		if (id !== request.user) {
			// check if admin
			const user = await new UserService().getUserById(request.user);
			if (!user.roles.includes("Administrator"))
				throw new BadRequestError("Addon author must include the authored user");
		}

		return this.userService.getAllAddons(id);
	}

	/**
	 * Create user data
	 * @param body User data
	 */
	@Post("{id}")
	@Security("discord", [])
	@Security("bot")
	public async create(@Path() id: string, @Body() body: UserCreationParams): Promise<User> {
		return this.userService.create(id, { ...body, id, media: [] });
	}

	/**
	 * Update user data for the given user ID
	 * @param id User ID
	 * @param body User data
	 * @param request
	 */
	@Put("{id}")
	@Security("discord", [])
	@Security("bot")
	public async set(
		@Path() id: string,
		@Body() body: UserCreationParams,
		@Request() request: any,
	): Promise<User> {
		// the security middleware adds a key user with anything inside when validated, see security middleware Promise return type
		if (id !== request.user) {
			const user = await this.userService.getUserById(id).catch(() => {});

			// admin can modify if they want
			if (user && !user.roles.includes("Administrator"))
				throw new ForbiddenError("Cannot set another user");
		}

		const user = await this.userService.getUserById(id).catch(() => {});

		const media = user ? user.media || [] : [];

		// add properties
		const sent: User = { ...body, id, media };
		return this.userService.update(id, sent);
	}

	/**
	 * Set roles for a user with the given user ID
	 * @param id User ID
	 * @param roles Role names (not IDs!)
	 */
	@Put("{id}/roles")
	@Security("discord", ["administrator"])
	@Security("bot")
	public async setRoles(@Path() id: string, @Body() roles: Array<string>): Promise<User> {
		return this.userService.setRoles(id, roles);
	}

	/**
	 * Delete the user with the given ID
	 * @param id User ID to be deleted
	 */
	@Delete("{id}")
	@Security("discord", ["administrator"])
	@Security("bot")
	public async delete(@Path() id: string): Promise<void> {
		return this.userService.delete(id);
	}
}
