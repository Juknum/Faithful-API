import { Addons, Contributions, UserNames, User, Users, UserRepository, UserStats, UserProfile } from "../interfaces";
import UserFirestormRepository from "../repository/firestorm/user.repository";
import { BadRequestError } from "../tools/ApiError";

export class UserService {
	private repository: UserRepository = new UserFirestormRepository();

	public getRaw(): Promise<Users> {
		return this.repository.getRaw();
	}

	public getStats(): Promise<UserStats> {
		return this.getRaw()
			.then(users => {
				const all_roles = [] as string[]
				return users.reduce((acc, user) => {
					acc.total++;
					if(user.anonymous) acc.total_anonymous++;
					
					user.roles.forEach(role => {
						if(!all_roles.includes(role)) {
							all_roles.push(role)
							acc.total_roles++;
							
							acc.total_per_roles[role] = 0;
						}
						acc.total_per_roles[role]++;
					})

					return acc
				}, {
					total: 0,
					total_anonymous: 0,
					total_roles: 0,
					total_per_roles: {}
				} as UserStats)
			})
	}

	public getNames(): Promise<UserNames> {
		return this.repository.getNames();
	}

	public getRoles(): Promise<Array<string>> {
		return this.repository.getRoles();
	}

	public getUsersFromRole(role: string, username?: string): Promise<Users> {
		return this.repository.getUsersFromRole(role, username);
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

	public getAddons(id: string): Promise<Addons> {
		return this.repository.getAddonsApprovedById(id);
	}

	public getAllAddons(id: string): Promise<Addons> {
		return this.repository.getAddonsById(id);
	}

	public addWarn(id: string, data: { warn: string }): Promise<User> {
		return this.repository.addWarn(id, data.warn);
	}

	public getWarns(id: string): Promise<User['warns']> {
		return this.repository.getWarns(id);
	}
	
	public async setProfileById(id: string, body: UserProfile) {
		const user = await this.getUserById(id);

		const username = (body.username || "").trim();
		if(username.length === 0) {
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
