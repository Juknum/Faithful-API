import { WriteConfirmation } from "firestorm-db";
import {
	Addons,
	Contributions,
	Usernames,
	User,
	Users,
	UserStats,
	UserProfile,
	Username,
} from "../interfaces";
import UserFirestormRepository from "../repository/user.repository";
import { BadRequestError } from "../tools/ApiError";

export default class UserService {
	private readonly repo = new UserFirestormRepository();

	public getRaw(): Promise<Record<string, User>> {
		return this.repo.getRaw();
	}

	public async getStats(): Promise<UserStats> {
		const allRoles = [] as string[];
		const users = await this.getRaw();
		return Object.values(users).reduce(
			(acc, user) => {
				acc.total++;
				if (user.anonymous) acc.total_anonymous++;

				user.roles.forEach((role) => {
					if (!allRoles.includes(role)) {
						allRoles.push(role);
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
	}

	public getNames(): Promise<Usernames> {
		return this.repo.getNames();
	}

	public getNameById(id: string): Promise<Username> {
		return this.repo.getNameById(id);
	}

	public getRoles(): Promise<Array<string>> {
		return this.repo.getRoles();
	}

	public getUsersFromRole(role: string, username?: string): Promise<Users> {
		return this.repo.getUsersFromRole(role, username);
	}

	public getUsersByNameOrId(idOrUsername: string): Promise<User | Users> {
		// can't parse discord ids directly into a number because precision can be lost
		const int = idOrUsername.split("").map((s) => parseInt(s, 10));
		const str = idOrUsername.split("");
		let same = true;
		int.forEach((i, index) => {
			same = !!(i.toString() === str[index] && same === true);
		});

		if (same) return this.getUserById(idOrUsername);
		return this.getUsersByName(idOrUsername);
	}

	public getUserById(id: string): Promise<User> {
		return this.repo.getUserById(id);
	}

	public getUsersByName(username: string): Promise<Users> {
		return this.repo.getUsersByName(username);
	}

	public getContributions(id: string): Promise<Contributions> {
		return this.repo.getContributionsById(id);
	}

	public getUserProfiles(users: string[]): Promise<UserProfile[]> {
		return this.repo.getUserProfiles(users);
	}

	public getAddons(id: string): Promise<Addons> {
		return this.repo.getAddonsApprovedById(id);
	}

	public getAllAddons(id: string): Promise<Addons> {
		return this.repo.getAddonsById(id);
	}

	public changeUserID(oldID: string, newID: string): Promise<WriteConfirmation> {
		return this.repo.changeUserID(oldID, newID);
	}

	public getProfileOrCreate(id: string): Promise<User> {
		return this.repo.getProfileOrCreate(id);
	}

	public async setProfileById(id: string, body: UserProfile): Promise<void> {
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

	public async setRoles(id: string, roles: string[]): Promise<User> {
		const user = await this.getUserById(id);
		user.roles = roles;
		return this.update(id, user);
	}

	public create(id: string, user: User): Promise<User> {
		return this.repo.update(id, user);
	}

	public update(id: string, user: User): Promise<User> {
		return this.repo.update(id, user);
	}

	public delete(id: string): Promise<WriteConfirmation> {
		return this.repo.delete(id);
	}
}
