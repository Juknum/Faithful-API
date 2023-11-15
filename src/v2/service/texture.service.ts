import { Contributions, Paths, Texture, Textures, Uses, TextureRepository } from "../interfaces";
import {
	Edition,
	EntireTextureToCreate,
	KnownPacks,
	TextureCreationParam,
	TextureMCMETA,
	TextureProperty,
} from "../interfaces/textures";
import TextureFirestormRepository from "../repository/firestorm/texture.repository";
import PathService from "./path.service";
import UseService from "./use.service";

export default class TextureService {
	private readonly textureRepo: TextureRepository = new TextureFirestormRepository();

	private readonly useService = new UseService();

	private readonly pathService = new PathService();

	// eslint-disable-next-line no-use-before-define
	static instance: TextureService | null = null;

	static getInstance() {
		if (TextureService.instance === null) TextureService.instance = new TextureService();
		return TextureService.instance;
	}

	constructor() {
		TextureService.instance = this;
	}

	getRaw(): Promise<Record<string, Texture>> {
		return this.textureRepo.getRaw();
	}

	getById(id: number, property: TextureProperty): Promise<Texture> {
		if (Number.isNaN(id) || id < 0)
			return Promise.reject(new Error("Texture IDs are integers greater than 0"));
		return this.textureRepo.getTextureById(id, property);
	}

	getByNameIdAndTag(tag: string | undefined, search: string | undefined) {
		return this.textureRepo.getByNameIdAndTag(tag, search);
	}

	searchByNameIdAndTag(tag: string | undefined, search: string | undefined): Promise<Textures> {
		return this.textureRepo.getByNameIdAndTag(tag, search, true);
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
		property: TextureProperty,
	): Promise<Textures | Texture | Paths | Uses | Contributions | TextureMCMETA> {
		return this.textureRepo
			.searchTexturePropertyByNameOrId(name_or_id, property)
			.catch(() => Promise.reject(new Error("Service failed to make request")));
	}

	getByNameOrId(name_or_id: string | number): Promise<Textures | Texture> {
		return this.textureRepo.searchTextureByNameOrId(name_or_id);
	}

	getURLById(id: number, pack: KnownPacks, version: string): Promise<string> {
		return this.textureRepo.getURLById(id, pack, version);
	}

	createTexture(texture: TextureCreationParam): Promise<Texture> {
		return this.textureRepo.createTexture(texture);
	}

	async createEntireTexture(input: EntireTextureToCreate): Promise<Texture> {
		const created_texture = await this.createTexture({
			name: input.name,
			tags: input.tags,
		});
		const texture_id = created_texture.id;

		// create uses
		const uses_created = await Promise.all(
			input.uses.map(async (u, ui) => {
				const use_id = String(texture_id) + String.fromCharCode("a".charCodeAt(0) + ui);
				return this.useService.createUse({
					name: u.name,
					edition: u.edition,
					texture: Number.parseInt(texture_id, 10),
					id: use_id,
				});
			}),
		);

		// create paths
		await Promise.all(
			uses_created.map((u, ui) => {
				const use_id_created = u.id;
				return Promise.all(
					input.uses[ui].paths.map((p) =>
						this.pathService.createPath({
							...p,
							use: use_id_created,
						}),
					),
				);
			}),
		);

		return created_texture;
	}

	async createEntireTextures(body: EntireTextureToCreate[]): Promise<Textures> {
		// create textures
		return Promise.all(body.map((t) => this.createEntireTexture(t)));
	}

	changeTexture(id: string, body: TextureCreationParam): Texture | PromiseLike<Texture> {
		return this.getByNameOrId(id).then(() => this.textureRepo.changeTexture(id, body));
	}

	deleteTexture(id: string): Promise<void> {
		return this.textureRepo.deleteTexture(id);
	}
}
