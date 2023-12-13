import { users } from "../../firestorm";
import {
	Addons,
	Contributions,
	Media,
	UserNames,
	User,
	Users,
	UserCreationParams,
	UserRepository,
	UserName,
	UserProfile,
} from "../../interfaces";

// eslint-disable-next-line no-underscore-dangle
const __transformUser = (user: any): User => ({
	// falsy checking and remove warns field (unused)
	id: user.id,
	username: user.username || "",
	uuid: user.uuid || "",
	roles: user.roles || [],
	media: user.media,
	anonymous: user.anonymous || false,
});

export default class UserFirestormRepository implements UserRepository {
	getNameById(id: string): Promise<UserName> {
		return users.get(id).then((res) => ({
			id: res.id,
			username: res.anonymous ? undefined : res.username,
			uuid: res.anonymous ? undefined : res.uuid,
		}));
	}

	getRaw(): Promise<Record<string, User>> {
		return (
			users
				.read_raw()
				.then((res: Record<string, User>) => Object.entries(res))
				// convert to entries to map, convert back to object after mapping done
				.then((arr: [string, User][]) => arr.map(([key, el]) => [key, __transformUser(el)]))
				.then((arr: [string, User][]) => Object.fromEntries(arr))
		);
	}

	getNames(): Promise<UserNames> {
		return users
			.select({ fields: ["id", "username", "uuid", "anonymous"] })
			.then((obj: any) => Object.values(obj))
			.then(
				(
					_users: Array<{
						id: string;
						username: string;
						uuid: string;
						anonymous: boolean;
					}>,
				) =>
					_users.map((el) => ({
						id: el.id,
						username: el.anonymous ? undefined : el.username,
						uuid: el.anonymous ? undefined : el.uuid,
					})),
			);
	}

	getUserById(id: string): Promise<User> {
		return users
			.get(id)
			.then((u) => __transformUser(u))
			.catch((err) => {
				if (err.isAxiosError && err.response && err.response.statusCode === 404) {
					const formattedError = new Error("User not found") as any;
					formattedError.code = 404;

					return Promise.reject(formattedError);
				}

				return Promise.reject(err);
			});
	}

	getProfileOrCreate(id: string): User | PromiseLike<User> {
		return users
			.get(id)
			.then((u) => __transformUser(u))
			.catch((err) => {
				if (err.isAxiosError && err.response && err.response.statusCode === 404) {
					const empty: User = {
						anonymous: false,
						roles: [],
						username: "",
						uuid: "",
						warns: [],
						id,
						media: [],
					};
					return users.set(id, empty).then(() => this.getUserById(id));
				}

				return Promise.reject(err);
			});
	}

	getUsersByName(name: string): Promise<Users> {
		if (!name || name.length < 3)
			return Promise.reject(new Error("User search requires at least 3 letters"));

		return users
			.search([
				{
					field: "username",
					criteria: "includes",
					value: name,
					ignoreCase: true,
				},
			])
			.then((arr: Array<User>) => arr.map((el) => __transformUser(el)));
	}

	getUsersFromRole(role: string, username?: string): Promise<Users> {
		if (role === "all" && !username) return users.read_raw().then((res: any) => Object.values(res));
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

		return users.search(options).then((arr: Array<User>) => arr.map((el) => __transformUser(el)));
	}

	getRoles(): Promise<Array<string>> {
		return users.select({ fields: ["roles"] }).then(
			(obj) =>
				Object.values(obj)
					.map((el) => el.roles || []) // get roles or none
					.flat() // flat array
					.filter((el, index, array) => array.indexOf(el) === index), // remove duplicates
		);
	}

	getContributionsById(id: string): Promise<Contributions> {
		return users.get(id).then((u) => u.contributions());
	}

	getAddonsById(id: string): Promise<Addons> {
		return users.get(id).then((u) => u.addons());
	}

	getAddonsApprovedById(id: string): Promise<Addons> {
		return users
			.get(id)
			.then((u) => u.addons())
			.then((arr) => arr.filter((el) => el.approval.status === "approved"));
	}

	update(id: string, user: UserCreationParams): Promise<User> {
		/** @todo fix weird user types here */
		return users.set(id, user as any).then(() => this.getUserById(id));
	}

	delete(id: string): Promise<void> {
		return users.remove(id).then(() => Promise.resolve());
	}

	getUserProfiles(searched_users: string[]): Promise<UserProfile[]> {
		return users.searchKeys(searched_users).then(
			(
				_users: Array<{
					id: string;
					username: string;
					uuid: string;
					anonymous: boolean;
					media: Media[];
				}>,
			) =>
				_users.map((el) => ({
					id: el.id,
					username: el.anonymous ? undefined : el.username,
					uuid: el.anonymous ? undefined : el.uuid || undefined,
					media: el.anonymous ? undefined : el.media || [],
				})),
		);
	}
}
