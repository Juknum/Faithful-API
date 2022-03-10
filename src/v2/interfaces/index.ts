import { Path, Paths } from './paths';
import { Post, Posts } from './posts';
import {
	Texture, TextureAll, Textures, TexturesAll, TextureRepository,
} from './textures';
import {
	User, UserNames, UserName, Users, UserCreationParams, UserRepository,
} from './users';
import { Uses, Use } from './uses';
import { Contribution, Contributions } from './contributions';
import {
	File, FileParent, FileRepository, Files,
} from './files';
import { Mod, Mods, ModsRepository } from './mods';
import { Modpack, Modpacks, ModpacksRepository } from './modpacks';
import {
	Addon, AddonAll, AddonProperty, AddonNotApproved, Addons, AddonsAll, AddonRepository, AddonStatus, AddonDownload, AddonStatusValues
} from './addons';
import {
	Change, Changes, Changelog, Changelogs,
} from './changelogs';
import { SettingsRepository } from './settings';

export interface Error {
	error: string;
}

export {
	Addon,
	AddonAll,
	Addons,
	AddonsAll,
	AddonNotApproved,
	AddonProperty,
	AddonStatus,
	AddonRepository,
	AddonDownload,
	AddonStatusValues,
	Changelog,
	Changelogs,
	Change,
	Changes,
	Contributions,
	Contribution,
	File,
	Files,
	FileParent,
	FileRepository,
	Modpack,
	Modpacks,
	Mod,
	Mods,
	ModsRepository,
	ModpacksRepository,
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
	UserName,
	UserNames,
	UserCreationParams,
	UserRepository,
	Use,
	Uses,
};
