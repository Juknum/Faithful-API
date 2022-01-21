import { Path, Paths } from "./paths";
import { Post, Posts } from "./posts";
import { Texture, TextureAll, Textures, TexturesAll, TextureRepository } from "./textures";
import { User, Users, UserCreationParams, UserRepository } from "./users";
import { Uses, Use } from "./uses";
import { Contribution, Contributions } from "./contributions";
import { File, Files } from "./files";
import { Mod, Mods } from "./mods";
import { Modpack, Modpacks } from "./modpacks";
import { Addon, AddonAll, Addons, AddonsAll, AddonRepository } from "./addons";
import { Change, Changes, Changelog, Changelogs } from "./changelogs";

export interface Error {
	error: string;
}

export {
	Addon,
	AddonAll,
	Addons,
	AddonsAll,
	AddonRepository,
	Changelog,
	Changelogs,
	Change,
	Changes,
	Contributions,
	Contribution,
	File,
	Files,
	Modpack,
	Modpacks,
	Mod,
	Mods,
	Path,
	Paths,
	Post,
	Posts,
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
