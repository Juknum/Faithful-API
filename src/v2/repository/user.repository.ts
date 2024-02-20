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
import { selectDistinct } from "../tools/firestorm";

// you can get a discord username from a discord id but to my knowledge they aren't shown anywhere on the frontend
const anonymizeUser = (user: Partial<User>): User => ({
	id: user.id,
	username: user.anonymous ? user.username : null,
	uuid: user.anonymous ? user.uuid : null,
	roles: user.anonymous ? user.roles || [] : null,
	media: user.anonymous ? user.media : null,
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
		return users.readRaw(); // protected endpoint, no need to anonymize
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
			.then(anonymizeUser)
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
			.get(id) // protected endpoint
			.catch((err) => {
				if (err.isAxiosError && err.response && err.response.statusCode === 404) {
					const empty: User = {
						id,
						roles: [],
						username: "",
						uuid: "",
						media: [],
						anonymous: false,
					};
					return users.set(id, empty).then(() => this.getUserById(id));
				}

				return Promise.reject(err);
			});
	}

	getUsersByName(name: string): Promise<Users> {
		return users
			.search([
				{
					field: "username",
					criteria: name.length < 3 ? "==" : "includes",
					value: name,
					ignoreCase: true,
				},
			])
			.then((arr) => arr.map(anonymizeUser));
	}

	getUsersFromRole(role: string, username?: string): Promise<Users> {
		if (role === "all" && !username)
			return users
				.readRaw()
				.then(Object.values)
				.then((arr) => arr.map(anonymizeUser));

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

		return users.search(options).then((arr) => arr.map(anonymizeUser));
	}

	getRoles(): Promise<Array<string>> {
		return selectDistinct(users, "roles", true);
	}

	getContributionsById(id: string): Promise<Contributions> {
		return users.get(id).then((u) => u.contributions());
	}

	getAddonsById(id: string): Promise<Addons> {
		return users.get(id).then((u) => u.addons());
	}

	getAddonsApprovedById(id: string): Promise<Addons> {
		return this.getAddonsById(id).then((arr) =>
			arr.filter((el) => el.approval.status === "approved"),
		);
	}

	update(id: string, user: UserCreationParams): Promise<User> {
		return users.set(id, user).then(() => this.getUserById(id));
	}

	delete(id: string): Promise<WriteConfirmation> {
		return users.remove(id);
	}

	getUserProfiles(searchedUsers: string[]): Promise<UserProfile[]> {
		return users.searchKeys(searchedUsers).then((u) => u.map(anonymizeUser));
	}
}
