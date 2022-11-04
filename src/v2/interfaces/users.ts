import { Contributions } from "./contributions";
import { Addons } from "./addons";

export interface Media {
	type:
		| "CurseForge"
		| "GitHub"
		| "Patreon"
		| "Paypal"
		| "Planet Minecraft"
		| "PSN"
		| "Reddit"
		| "Steam"
		| "Twitter"
		| "Website"
		| "Xbox"
		| "YouTube"
		| "Other";
	link: string;
}
export interface Medias extends Array<Media> {}

export interface UserCreationParams {
	username: string; // username displayed online
	uuid: string; // MC UUID
	anonymous: boolean; // true if the user is anonymous
	roles: Array<string>; // discord roles the user have, that can be modified by admin only
}

export interface UserName {
	id: string;
	username: string;
	uuid: string;
}
export interface UserNames extends Array<UserName> {}

export interface UserProfile {
	media: Media[];
	username: string;
	uuid: string;
}

export interface User extends UserCreationParams {
	warns: Array<string>; // list of all warns
	id: string; // discord user id
	media: Medias;
}
export interface Users extends Array<User> {}

export interface UserStats {
	total: number;
	total_anonymous: number;
	total_roles: number;
	total_per_roles: Record<string, number>;
}

/* eslint-disable no-unused-vars */
export interface UserRepository {
	getWarns(id: string): Promise<User["warns"]>;
	addWarn(id: string, warn: string): Promise<User>;
	getRaw(): Promise<Users>;
	getNames(): Promise<any>;
	getUserById(id: string): Promise<User>;
	getUsersByName(name: string): Promise<Users>;
	getContributionsById(id: string): Promise<Contributions>;
	getAddonsApprovedById(id: string): Promise<Addons>;
	getAddonsById(id: string): Promise<Addons>;
	update(id: string, user: User): Promise<User>;
	delete(id: string): Promise<void>;
	getUsersFromRole(role: string, username?: string): Promise<Users>;
	getRoles(): Promise<User["roles"]>;
}
