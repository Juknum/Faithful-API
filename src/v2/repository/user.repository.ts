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
		return (
			users
				.readRaw()
				.then(Object.entries)
				// convert to entries to map, convert back to object after mapping done
				.then((arr: [string, User][]) => arr.map(([key, el]) => [key, __transformUser(el)]))
				.then(Object.fromEntries)
		);
	}

	getNames(): Promise<Usernames> {
		return (
			users
				.select({ fields: ["id", "username", "uuid", "anonymous"] })
				// calling Object.values as a callback gets rid of type inference
				.then((res) => Object.values(res))
				.then((_users: Pick<User, "id" | "username" | "uuid" | "anonymous">[]) =>
					_users.map((el) => ({
						id: el.id,
						username: el.anonymous ? undefined : el.username,
						uuid: el.anonymous ? undefined : el.uuid,
					})),
				)
		);
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
			.then((u) => __transformUser(u))
			.catch((err) => {
				if (err.isAxiosError && err.response && err.response.statusCode === 404) {
					const empty: User = {
						anonymous: false,
						roles: [],
						username: "",
						uuid: "",
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
			.then((arr: Users) => arr.map(__transformUser));
	}

	getUsersFromRole(role: string, username?: string): Promise<Users> {
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

		return users.search(options).then((arr: Users) => arr.map((el) => __transformUser(el)));
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
		return users.set(id, user).then(() => this.getUserById(id));
	}

	delete(id: string): Promise<WriteConfirmation> {
		return users.remove(id);
	}

	getUserProfiles(searchedUsers: string[]): Promise<UserProfile[]> {
		return users.searchKeys(searchedUsers).then((u) =>
			u.map((el) => ({
				id: el.id,
				username: el.anonymous ? undefined : el.username,
				// ensure anonymous stays anonymous
				uuid: el.anonymous ? undefined : el.uuid || undefined,
				media: el.anonymous ? undefined : el.media || [],
			})),
		);
	}
}
