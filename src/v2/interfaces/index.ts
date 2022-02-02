import { Path, Paths } from "./paths";
import { Post, Posts } from "./posts";
import { Texture, TextureAll, Textures, TexturesAll, TextureRepository } from "./textures";
import { User, Users, UserCreationParams, UserRepository } from "./users";
import { Uses, Use } from "./uses";
import { Contribution, Contributions } from "./contributions";
import { File, FileRepository, Files } from "./files";
import { Mod, Mods } from "./mods";
import { Modpack, Modpacks } from "./modpacks";
import { Addon, AddonAll, Addons, AddonsAll, AddonRepository, AddonStatus } from "./addons";
import { Change, Changes, Changelog, Changelogs } from "./changelogs";
import { SettingsRepository } from "./settings";

export interface Error {
	error: string;
}

export {
	Addon,
	AddonAll,
	Addons,
	AddonsAll,
	AddonStatus,
	AddonRepository,
	Changelog,
	Changelogs,
	Change,
	Changes,
	Contributions,
	Contribution,
	File,
	Files,
	FileRepository,
	Modpack,
	Modpacks,
	Mod,
	Mods,
	Path,
	Paths,
	Post,
	Posts,
	SettingsRepository,
	Texture,
	TextureAll,
	Textures,
	TexturesAll,
	TextureRepository,
	Users,
	User,
	UserCreationParams,
	UserRepository,
	Use,
	Uses,
};
