import { Contributions } from "./contributions";
import { Addons } from "./addons";

export interface Media {
	type: "CurseForge|GitHub|Patreon|Paypal|Planet Minecraft|PSN|Reddit|Steam|Twitter|Website|Xbox|YouTube|Other";
	link: string;
}
export interface Medias extends Array<Media> {}

export interface UserCreationParams {
	username: string; // username displayed online
	uuid: string; // MC UUID
	muted: {
		// todo: use discord timeout instead
		start: string; // unix timestamp of the beginning of the mute
		end: string; // unix timestamp of the end of the mute
	};
	warns: Array<string>; // list of all warns
	media: Medias;
}

export interface UserRepository {
	getUserById(id: string): Promise<User>;
	getContributionsById(id: string): Promise<Contributions>;
	getAddonsById(id: string): Promise<Addons>;
	create(id: string, user: UserCreationParams): Promise<User>;
	update(id: string, user: User): Promise<User>;
	delete(id: string): Promise<void>;
}

export interface Users extends Array<User> {}
export interface User extends UserCreationParams {
	roles: Array<string>; // discord roles the user have, that can be modified by admin only
	id: string; // discord user id
}
