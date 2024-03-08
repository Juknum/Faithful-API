import { WriteConfirmation } from "firestorm-db";
import { users } from "../firestorm";
import {
	Addons,
	Contributions,
	Usernames,
	User,
	Users,
	UserCreationParams,
	UserRepository,
	Username,
	UserProfile,
} from "../interfaces";

// eslint-disable-next-line no-underscore-dangle
const __transformUser = (user: Partial<User>): User => ({
	// falsy checking
	id: user.id,
	username: user.username || "",
	uuid: user.uuid || "",
	roles: user.roles || [],
	media: user.media,
	anonymous: user.anonymous || false,
});

export default class UserFirestormRepository implements UserRepository {
	getNameById(id: string): Promise<Username> {
		return users.get(id).then((res) => ({
			id: res.id,
			username: res.anonymous ? undefined : res.username,
			uuid: res.anonymous ? undefined : res.uuid,
		}));
	}

	getRaw(): Promise<Record<string, User>> {
		return users.readRaw();
	}

	async getNames(): Promise<Usernames> {
		const fields = await users.select({ fields: ["id", "username", "uuid", "anonymous"] });
		return Object.values(fields).map((el) => ({
			id: el.id,
			username: el.anonymous ? undefined : el.username,
			uuid: el.anonymous ? undefined : el.uuid,
		}));
	}

	getUserById(id: string): Promise<User> {
		return users
			.get(id)
			.then((u) => __transformUser(u))
			.catch((err) => {
				if (err.isAxiosError && err.response && err.response.statusCode === 404) {
					const formattedError: any = new Error("User not found");
					formattedError.code = 404;

					return Promise.reject(formattedError);
				}

				return Promise.reject(err);
			});
	}

	getProfileOrCreate(id: string): Promise<User> {
		return users
			.get(id)
			.then(__transformUser)
			.catch((err) => {
				if (err.isAxiosError && err.response && err.response.statusCode === 404) {
					const empty: User = {
						id,
						anonymous: false,
						roles: [],
						username: "",
						uuid: "",
						media: [],
					};
					return users.set(id, empty).then(() => this.getUserById(id));
				}

				return Promise.reject(err);
			});
	}

	async getUsersByName(name: string): Promise<Users> {
		if (!name) return Promise.reject(new Error("A name must be provided"));

		const arr = await users.search([
			{
				field: "username",
				criteria: name.length < 3 ? "==" : "includes",
				value: name,
				ignoreCase: true,
			},
		]);
		return arr.map(__transformUser);
	}

	async getUsersFromRole(role: string, username?: string): Promise<Users> {
		if (role === "all" && !username) return users.readRaw().then(Object.values);
		const options = [];

		if (role !== "all")
			options.push({
				field: "roles",
				criteria: "array-contains",
				value: role,
				ignoreCase: true,
			});

		if (username)
			options.push({
				field: "username",
				criteria: "includes",
				value: username,
				ignoreCase: true,
			});

		const arr = await users.search(options);
		return arr.map(__transformUser);
	}

	getRoles(): Promise<Array<string>> {
		return users.values({ field: "roles", flatten: true });
	}

	async getContributionsById(id: string): Promise<Contributions> {
		const u = await users.get(id);
		return u.contributions();
	}

	async getAddonsById(id: string): Promise<Addons> {
		const u = await users.get(id);
		return u.addons();
	}

	async getAddonsApprovedById(id: string): Promise<Addons> {
		const arr = await this.getAddonsById(id);
		return arr.filter((el) => el.approval.status === "approved");
	}

	async update(id: string, user: UserCreationParams): Promise<User> {
		await users.set(id, user);
		return this.getUserById(id);
	}

	delete(id: string): Promise<WriteConfirmation> {
		return users.remove(id);
	}

	async getUserProfiles(searchedUsers: string[]): Promise<UserProfile[]> {
		const u = await users.searchKeys(searchedUsers);
		return u.map((el) => ({
			id: el.id,
			username: el.anonymous ? undefined : el.username,
			// ensure anonymous stays anonymous
			uuid: el.anonymous ? undefined : el.uuid || undefined,
			media: el.anonymous ? undefined : el.media || [],
		}));
	}
}
