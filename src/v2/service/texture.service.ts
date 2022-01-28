import { textures } from "../firestorm";
import { Contributions, Paths, Texture, Textures, TextureAll, Uses } from "../interfaces";
import { TextureRepository } from "../interfaces";
import { TextureProperty } from "../interfaces/textures";
import TextureFirestormRepository from "../repository/firestorm/texture.repository";

export default class TextureService {
	private readonly textureRepo: TextureRepository = new TextureFirestormRepository();

	getRaw(): Promise<Textures> {
		return textures.read_raw();
	};

	get(id: number): Promise<Texture> {
		if (isNaN(id) || id < 0) return Promise.reject(new Error("Texture IDs are integer greater than 0"));
		return this.textureRepo.getTextureById(id); // todo: (DATA 2.0) remove after database rewrite
	}

	getUses(id: number): Promise<Uses> {
		if (isNaN(id) || id < 0) return Promise.reject(new Error("Texture IDs are integer greater than 0"));
		return this.textureRepo.getUsesById(id);
	}

	getPaths(id: number): Promise<Paths> {
		if (isNaN(id) || id < 0) return Promise.reject(new Error("Texture IDs are integer greater than 0"));
		return this.textureRepo.getPathsById(id);
	}

	getContributions(id: number): Promise<Contributions> {
		if (isNaN(id) || id < 0) return Promise.reject(new Error("Texture IDs are integer greater than 0"));
		return this.textureRepo.getContributionsById(id);
	}

	getAll(id: number): Promise<TextureAll> {
		if (isNaN(id) || id < 0) return Promise.reject(new Error("Texture IDs are integer greater than 0"));
		return this.textureRepo.getAllById(id);
	}

	getVersions(): Promise<Array<string>> {
		return this.textureRepo.getVersions();
	}

	getVersionByEdition(edition: string): Promise<Array<string>> {
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

	searchByName(name: string, property:  TextureProperty): Promise<Textures> {
		return this.textureRepo.searchTextureByName(name, property);
	}
}
