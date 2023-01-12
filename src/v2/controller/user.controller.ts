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
import {
	BadRequestError,
	ForbiddenError,
	NotAvailableError,
} from "../tools/ApiError";
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
	private userService: UserService = new UserService();

	@Get("profile")
	@Security("discord", [])
	public getProfile(@Request() request: any): Promise<User> {
		return this.userService.getUserById(request.user);
	}

	@Post("profile")
	@Security("discord", [])
	public async setProfile(
		@Body() body: UserProfile,
		@Request() request: any
	): Promise<void> {
		await this.userService.setProfileById(request.user, body);
	}

	/**
	 * Get the raw collection of users
	 * @returns {Promise<Users>}
	 */
	@Get("raw")
	@Security("discord", ["administrator"]) // avoid warns info to be shown
	@Security("bot")
	public async getRaw(): Promise<Users> {
		return this.userService.getRaw();
	}

	/**
	 * Get all user stats for public
	 */
	@Response<NotAvailableError>(408)
	@Get("stats")
	public async getStats(): Promise<UserStats> {
		return cache.handle("user-stats", () => this.userService.getStats());
	}

	/**
	 * Get all usernames the database has
	 * @returns {Promise<UserNames>}
	 */
	@Get("names")
	public async getNames(): Promise<UserNames> {
		return this.userService.getNames();
	}

	/**
	 * Get all discord roles the database has
	 * @returns {Promise<Array<String>>}
	 */
	@Get("roles")
	public async getRoles(): Promise<Array<string>> {
		return this.userService.getRoles();
	}

	/**
	 * Get users that have a specific role
	 * @param {String} role - The role to search for
	 * @returns {Promise<Users>}
	 */
	@Get("role/{role}")
	@Security("discord", ["administrator"]) // avoid warns info to be shown
	@Security("bot")
	public async getUsersFromRole(@Path() role: string): Promise<Users> {
		return this.userService.getUsersFromRole(role, null);
	}

	/**
	 * Get users that have a specific role
	 * @param {String} role - role name
	 * @param {String} username - discord user username
	 */
	@Get("role/{role}/{username}")
	@Security("discord", ["administrator"]) // avoid warns info to be shown
	@Security("bot")
	public async getUsersFromRoleAndUsername(
		@Path() role: string,
		@Path() username: string
	): Promise<Users> {
		return this.userService.getUsersFromRole(role, username);
	}

	/**
	 * Get a user by it's ID/username
	 * @param {String} id_or_username - User ID/Username
	 * @returns {Promise<User|Users>}
	 */
	@Get("{id_or_username}")
	@Security("discord", ["administrator"]) // avoid warns info to be shown
	@Security("bot")
	public async getUser(@Path() id_or_username: string): Promise<User | Users> {
		// can't parse discord ids directly into a number because of floating point numbers precision (lasts bits are lost)
		const int: Array<number> = id_or_username
			.split("")
			.map((s) => parseInt(s, 10));
		const str: Array<string> = id_or_username.split("");
		let same: boolean = true;
		int.forEach((i, index) => {
			same = !!(i.toString() === str[index] && same === true);
		});

		if (same) return this.userService.getUserById(id_or_username);
		return this.userService.getUsersByName(id_or_username);
	}

	/**
	 * Get all contributions a user has made
	 * @param {String} id - User ID
	 * @returns {Promise<Contributions>}
	 */
	@Get("{id}/contributions")
	public async getContributions(@Path() id: string): Promise<Contributions> {
		return this.userService.getContributions(id);
	}

	/**
	 * Get the name for the given ID
	 * @param {String} id - User ID
	 * @returns {Promise<UserName>}
	 */
	@Get("{id}/name")
	public async getName(@Path() id: string): Promise<UserName> {
		return this.userService.getNameById(id);
	}

	/**
	 * Get all approved add-ons from that user
	 * @param {String} id - User ID
	 * @returns {Promise<Addons>}
	 */
	@Get("{id}/addons/approved")
	public async getAddons(@Path() id: string): Promise<Addons> {
		return this.userService.getAddons(id);
	}

	/**
	 * Get all add-ons from that user
	 * @param {String} id - User ID
	 * @returns {Promise<Addons>}
	 */
	@Get("{id}/addons")
	@Security("discord", [])
	@Security("bot")
	public async getAllAddons(
		@Path() id: string,
		@Request() request: any
	): Promise<Addons> {
		if (id !== request.user) {
			// check if admin
			const user = await new UserService().getUserById(request.user);
			if (!user.roles.includes("Administrator"))
				throw new BadRequestError(
					"Addon author must include the authored user"
				);
		}

		return this.userService.getAllAddons(id);
	}

	/**
	 * Create user data
	 * @param {UserCreationParams} body - user data
	 * @returns {Promise<User>}
	 */
	@Post("{id}")
	@Security("discord", [])
	@Security("bot")
	public async create(
		@Path() id: string,
		@Body() body: UserCreationParams
	): Promise<User> {
		return this.userService.create(id, { ...body, id, media: [], warns: [] });
	}

	/**
	 * Add a warn to specified the user
	 * @param {String} id - User ID
	 * @param {Object<{warn: String}>} body - warn string
	 */
	@Put("{id}/warns")
	@Security("discord", ["administrator"])
	@Security("bot")
	public async addWarn(
		@Path() id: string,
		@Body() body: { warn: string }
	): Promise<User> {
		return this.userService.addWarn(id, body);
	}

	/**
	 * Add a warn to specified the user
	 * @param {String} id - User ID
	 */
	@Get("{id}/warns")
	@Security("discord", ["administrator"])
	@Security("bot")
	public async getWarns(@Path() id: string): Promise<User["warns"]> {
		return this.userService.getWarns(id);
	}

	/**
	 * Update user data for the given user ID
	 * @param {String} id - User ID
	 * @param {UserCreationParams} body - user data
	 * @param request
	 * @returns {Promise<User>}
	 */
	@Put("{id}")
	@Security("discord", [])
	@Security("bot")
	public async set(
		@Path() id: string,
		@Body() body: UserCreationParams,
		@Request() request: any
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
		const warns = user ? user.warns || [] : [];

		// add properties
		const sent: User = { ...body, id, media, warns };
		return this.userService.update(id, sent);
	}

	/**
	 * Set roles for a user with the given user ID
	 * @param {String} id - User ID
	 * @param {Array<String>} roles - Role names (not IDs!)
	 * @returns {Promise<User>}
	 */
	@Put("{id}/roles")
	@Security("discord", ["administrator"])
	@Security("bot")
	public async setRoles(
		@Path() id: string,
		@Body() roles: Array<string>
	): Promise<User> {
		return this.userService.setRoles(id, roles);
	}

	/**
	 * Delete the user with the given ID
	 * @param {String} id - User ID to be deleted
	 * @returns {Promise<void>}
	 */
	@Delete("{id}")
	@Security("discord", ["administrator"])
	@Security("bot")
	public async delete(@Path() id: string): Promise<void> {
		return this.userService.delete(id);
	}
}
