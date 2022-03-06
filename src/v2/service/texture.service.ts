import { textures } from "../firestorm";
import { Contributions, Paths, Texture, Textures, Uses, TextureRepository } from "../interfaces";
import { Edition, KnownPacks, TextureProperty } from "../interfaces/textures";
import TextureFirestormRepository from "../repository/firestorm/texture.repository";

export default class TextureService {
	private readonly textureRepo: TextureRepository = new TextureFirestormRepository();

	getRaw(): Promise<Textures> {
		return textures.read_raw();
	}

	getById(id: number, property: TextureProperty): Promise<Texture> {
		if (Number.isNaN(id) || id < 0) return Promise.reject(new Error("Texture IDs are integer greater than 0"));
		return this.textureRepo.getTextureById(id, property);
	}

	getVersions(): Promise<Array<string>> {
		return this.textureRepo.getVersions();
	}

	getVersionByEdition(edition: Edition): Promise<Array<string>> {
		return this.textureRepo.getVersionByEdition(edition);
	}

	getEditions(): Promise<Array<string>> {
		return this.textureRepo.getEditions();
	}

	getTags(): Promise<Array<string>> {
		return this.textureRepo.getTags();
	}

	getResolutions(): Promise<Array<string>> {
		return this.textureRepo.getResolutions();
	}

	getPropertyByNameOrId(
		name_or_id: string | number,
		property: TextureProperty,
	): Promise<Textures | Texture | Paths | Uses | Contributions> {
		return this.textureRepo.searchTexturePropertyByNameOrId(name_or_id, property);
	}

	getByNameOrId(name_or_id: string | number): Promise<Textures | Texture> {
		return this.textureRepo.searchTextureByNameOrId(name_or_id);
	}

	getURLById(id: number, pack: KnownPacks, version: string): Promise<string> {
		return this.textureRepo.getURLById(id, pack, version);
	}
}
