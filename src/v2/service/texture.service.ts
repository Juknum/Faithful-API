import {
	Contributions,
	Paths,
	Texture,
	Textures,
	Uses,
	TextureRepository,
} from "../interfaces";
import {
	Edition,
	CreatedTextures,
	KnownPacks,
	TextureCreationParam,
	TextureMCMETA,
	TextureProperty,
} from "../interfaces/textures";
import TextureFirestormRepository from "../repository/firestorm/texture.repository";
import PathService from "./path.service";
import UseService from "./use.service";

export default class TextureService {
	private readonly textureRepo: TextureRepository =
		new TextureFirestormRepository();

	private readonly useService = new UseService();

	private readonly pathService = new PathService();

	getRaw(): Promise<Textures> {
		return this.textureRepo.getRaw();
	}

	getById(id: number, property: TextureProperty): Promise<Texture> {
		if (Number.isNaN(id) || id < 0)
			return Promise.reject(
				new Error("Texture IDs are integer greater than 0")
			);
		return this.textureRepo.getTextureById(id, property);
	}

	getByNameIdAndTag(tag?: string, search?: string) {
		return this.textureRepo.getByNameIdAndTag(tag, search);
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

	getResolutions(): Promise<Array<number>> {
		return this.textureRepo.getResolutions();
	}

	getPropertyByNameOrId(
		name_or_id: string | number,
		property: TextureProperty
	): Promise<
		Textures | Texture | Paths | Uses | Contributions | TextureMCMETA
	> {
		return this.textureRepo
			.searchTexturePropertyByNameOrId(name_or_id, property)
			.catch(() => Promise.reject(new Error("Service failed to make request")));
	}

	getByNameOrId(name_or_id: string | number): Promise<Textures | Texture> {
		return this.textureRepo
			.searchTextureByNameOrId(name_or_id)
			.catch(() => Promise.reject(new Error("Service failed to make request")));
	}

	getURLById(id: number, pack: KnownPacks, version: string): Promise<string> {
		return this.textureRepo.getURLById(id, pack, version);
	}

	createTexture(texture: TextureCreationParam): Promise<Texture> {
		return this.textureRepo.createTexture(texture);
	}

	async createEntireTextures(body: CreatedTextures): Promise<Textures> {
		const tex = await Promise.all(body.map((t) => this.createTexture(t)));
		const tex_id = tex.map((t) => t.id);

		await Promise.all(
			body
				.map((t) => t.uses)
				.map((tex_uses, i) =>
					tex_uses.map((u, ui) => {
						const use_id =
							tex_id[i] + String.fromCharCode("a".charCodeAt(0) + ui);
						return this.useService.createUse({
							...u,
							id: use_id,
						});
					})
				)
				.flat()
		);

		await Promise.all(
			body
				.map((t) => t.uses)
				.map((tex_uses, i) =>
					tex_uses.map((u, ui) => {
						const use_id =
							tex_id[i] + String.fromCharCode("a".charCodeAt(0) + ui);

						return u.paths.map((p) =>
							this.pathService.createPath({
								...p,
								use: use_id,
							})
						);
					})
				)
				.flat(2)
		);

		return tex;
	}

	changeTexture(
		id: string,
		body: TextureCreationParam
	): Texture | PromiseLike<Texture> {
		return this.getByNameOrId(id).then(() =>
			this.textureRepo.changeTexture(id, body)
		);
	}

	deleteTexture(id: string): Promise<void> {
		return this.textureRepo.deleteTexture(id);
	}
}
