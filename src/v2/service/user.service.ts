import {
	Addons,
	Contributions,
	UserNames,
	User,
	Users,
	UserStats,
	UserProfile,
	UserName,
} from "../interfaces";
import UserFirestormRepository from "../repository/firestorm/user.repository";
import { BadRequestError } from "../tools/ApiError";

export class UserService {
	private readonly repository = new UserFirestormRepository();

	public getRaw(): Promise<Record<string, User>> {
		return this.repository.getRaw();
	}

	public getStats(): Promise<UserStats> {
		return this.getRaw()
			.then((raw) => Object.values(raw))
			.then((users) => {
				const all_roles = [] as string[];
				return users.reduce(
					(acc, user) => {
						acc.total++;
						if (user.anonymous) acc.total_anonymous++;

						user.roles.forEach((role) => {
							if (!all_roles.includes(role)) {
								all_roles.push(role);
								acc.total_roles++;

								acc.total_per_roles[role] = 0;
							}
							acc.total_per_roles[role]++;
						});

						return acc;
					},
					{
						total: 0,
						total_anonymous: 0,
						total_roles: 0,
						total_per_roles: {},
					} as UserStats,
				);
			});
	}

	public getNames(): Promise<UserNames> {
		return this.repository.getNames();
	}

	public getNameById(id: string): Promise<UserName> {
		return this.repository.getNameById(id);
	}

	public getRoles(): Promise<Array<string>> {
		return this.repository.getRoles();
	}

	public getUsersFromRole(role: string, username?: string): Promise<Users> {
		return this.repository.getUsersFromRole(role, username);
	}

	public getUsersByNameOrId(id_or_username: string): Promise<User | Users> {
		// can't parse discord ids directly into a number because precision can be lost
		const int = id_or_username.split("").map((s) => parseInt(s, 10));
		const str = id_or_username.split("");
		let same = true;
		int.forEach((i, index) => {
			same = !!(i.toString() === str[index] && same === true);
		});

		if (same) return this.getUserById(id_or_username);
		return this.getUsersByName(id_or_username);
	}

	public getUserById(id: string): Promise<User> {
		return this.repository.getUserById(id);
	}

	public getUsersByName(username: string): Promise<Users> {
		return this.repository.getUsersByName(username);
	}

	public getContributions(id: string): Promise<Contributions> {
		return this.repository.getContributionsById(id);
	}

	getUserProfiles(users: string[]): Promise<UserProfile[]> {
		return this.repository.getUserProfiles(users);
	}

	public getAddons(id: string): Promise<Addons> {
		return this.repository.getAddonsApprovedById(id);
	}

	public getAllAddons(id: string): Promise<Addons> {
		return this.repository.getAddonsById(id);
	}

	public async getProfileOrCreate(id: string): Promise<User> {
		return this.repository.getProfileOrCreate(id);
	}

	public async setProfileById(id: string, body: UserProfile) {
		const user = await this.getUserById(id);

		const username = (body.username || "").trim();
		if (username.length === 0) {
			throw new BadRequestError("Username cannot be empty");
		}
		user.username = username;

		user.uuid = body.uuid;
		user.media = body.media;

		await this.update(id, user);
	}

	//! We don't make verifications here, it's in the controllers

	public async setRoles(id: string, roles: string[]) {
		const user = await this.getUserById(id);
		user.roles = roles;
		return this.update(id, user);
	}

	public async create(id: string, user: User): Promise<User> {
		return this.repository.update(id, user);
	}

	public async update(id: string, user: User): Promise<User> {
		return this.repository.update(id, user);
	}

	public delete(id: string): Promise<void> {
		return this.repository.delete(id);
	}
}
