import { textures } from "../firestorm";
import { Texture, Textures } from "../interfaces";
import { TextureRepository } from "../interfaces";
import { Edition, TextureProperty } from "../interfaces/textures";
import TextureFirestormRepository from "../repository/firestorm/texture.repository";

export default class TextureService {
	private readonly textureRepo: TextureRepository = new TextureFirestormRepository();

	getRaw(): Promise<Textures> {
		return textures.read_raw();
	};

	getById(id: number, property: TextureProperty): Promise<Texture> {
		if (isNaN(id) || id < 0) return Promise.reject(new Error("Texture IDs are integer greater than 0"));
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

	getByName(name: string, property: TextureProperty): Promise<Textures> {
		return this.textureRepo.searchTextureByName(name, property);
	}
}
