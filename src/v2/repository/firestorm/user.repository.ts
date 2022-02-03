import { users } from "../../firestorm";
import { Addons, Contributions, UserNames, User, Users, UserCreationParams, UserRepository } from "../../interfaces";

function __tranformUser(user: any): User {
	return {
		id: user.id,
		username: user.username || "",
		uuid: user.uuid || "",
		roles: user.roles || user.type,
		media: user.media,
		warns: user.warns || [],
		muted: user.muted || {
			start: "0",
			end: "0",
		},
	};
}

export default class UserFirestormRepository implements UserRepository {
	getRaw(): Promise<Users> {
		return users.read_raw();
	}

	getNames(): Promise<UserNames> {
		return users.select({ fields: ["username"] })
		// todo: remove empty users
	}

	getUserById(id: string): Promise<User> {
		return users
			.get(id)
			.then((u) => __tranformUser(u))
			.catch((err) => {
				if (err.isAxiosError && err.response.statusCode === 404) {
					let formattedError = new Error("User not found") as any;
					formattedError.code = 404;
					Promise.reject(formattedError);

					return;
				}

				return Promise.reject(err);
			});
	}
	getContributionsById(id: string): Promise<Contributions> {
		return users.get(id).then((u) => u.contributions());
	}
	getAddonsById(id: string): Promise<Addons> {
		return users.get(id).then((u) => u.addons());
	}
	getAddonsApprovedById(id: string): Promise<Addons> {
		return users.get(id).then((u) => u.addons()).then(arr => arr.filter(el => el.approval.status === 'approved'));
	}
	create(id: string, user: UserCreationParams): Promise<User> {
		return this.update(id, user);
	}
	update(id: string, user: UserCreationParams): Promise<User> {
		return users.set(id, user).then(() => {
			return this.getUserById(id);
		});
	}
	delete(id: string): Promise<void> {
		return users.remove(id).then(() => Promise.resolve());
	}
}
