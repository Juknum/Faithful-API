import {
	PackID,
	Contributions,
	Paths,
	Texture,
	Textures,
	InputPath,
	Uses,
	FirestormUse,
} from "../interfaces";
import {
	Edition,
	EntireTextureToCreate,
	TextureCreationParam,
	MCMETA,
	TextureProperty,
	TextureAll,
} from "../interfaces/textures";
import TextureFirestormRepository from "../repository/firestorm/texture.repository";
import PathService from "./path.service";
import UseService from "./use.service";

export default class TextureService {
	private readonly textureRepo = new TextureFirestormRepository();

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
		nameOrID: string | number,
		property: TextureProperty,
	): Promise<Textures | Texture | Paths | Uses | Contributions | MCMETA> {
		return this.textureRepo
			.searchTexturePropertyByNameOrId(nameOrID, property)
			.catch(() => Promise.reject(new Error("Service failed to make request")));
	}

	getByNameOrId(nameOrID: string | number): Promise<Textures | Texture> {
		return this.textureRepo.searchTextureByNameOrId(nameOrID);
	}

	getURLById(id: number, pack: PackID, version: string): Promise<string> {
		return this.textureRepo.getURLById(id, pack, version);
	}

	async mergeTextures(addID: string, removeID: string) {
		// so basically we append the uses of the removed texture to the uses of the kept texture
		const addTexture: TextureAll = (await this.getPropertyByNameOrId(addID, "all")) as any;

		// get most recent use id from texture to add
		const latestLetter = addTexture.uses
			.reduce((best, cur) => {
				const letter = cur.id.at(-1);
				if (best > letter) return best;
				return letter;
			}, "a")
			.charCodeAt(0);
		const usesToRemove: FirestormUse[] = (await this.getPropertyByNameOrId(
			removeID,
			"uses",
		)) as any;

		// two dimensional array
		const pathsToRemove = await Promise.all(usesToRemove.map((a) => a.getPaths()));

		const pathsToAdd = [];

		const usesToAdd = usesToRemove.map((use, i) => {
			// find set of paths where at least one path
			const pathsWithUse = pathsToRemove.find((p) => p?.[0]?.use === use.id);
			use.id = addID + String.fromCharCode(latestLetter + i + 1);
			use.texture = Number(addID);

			if (!pathsWithUse) return use;

			pathsToAdd.push(
				...pathsWithUse.map((p) => {
					// randomly generated when added later
					delete p.id;
					p.use = use.id;
					return p;
				}),
			);

			return use;
		});

		// use names, etc are all preserved
		if (usesToAdd.length) await this.useService.createMultipleUses(usesToAdd);
		if (pathsToAdd.length) await this.pathService.createMultiplePaths(pathsToAdd);
		await this.deleteTexture(removeID);
	}

	createTexture(texture: TextureCreationParam): Promise<Texture> {
		return this.textureRepo.createTexture(texture);
	}

	async createEntireTexture(input: EntireTextureToCreate): Promise<Texture> {
		const createdTexture = await this.createTexture({
			name: input.name,
			tags: input.tags,
		});
		const textureID = createdTexture.id;

		// create uses
		const [useIDs, fullUsesToCreate]: [string[], Uses] = input.uses.reduce(
			(acc, u, ui) => {
				const useID = String(textureID) + String.fromCharCode("a".charCodeAt(0) + ui);
				const use = {
					name: u.name,
					edition: u.edition,
					texture: Number.parseInt(textureID, 10),
					id: useID,
				};
				acc[0].push(useID);
				acc[1].push(use);
				return acc;
			},
			[[], []],
		);
		await this.useService.createMultipleUses(fullUsesToCreate);

		// create paths
		const pathsToAdd = input.uses.reduce((acc, u, ui) => {
			const paths: InputPath[] = u.paths.map((p) => ({
				...p,
				use: useIDs[ui],
			}));
			return [...acc, ...paths];
		}, [] as InputPath[]);
		await this.pathService.createMultiplePaths(pathsToAdd);

		return createdTexture;
	}

	createEntireTextures(body: EntireTextureToCreate[]): Promise<Textures> {
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
