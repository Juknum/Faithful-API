import { WriteConfirmation } from "firestorm-db";
import { Use, Uses, Paths, CreationUse, EntireUseToCreate, InputPath } from "../interfaces";
import UseFirestormRepository from "../repository/use.repository";
import { BadRequestError, NotFoundError } from "../tools/ApiError";
import PathService from "./path.service";

export default class UseService {
	private readonly pathService: PathService;

	// workaround for the classes requiring each other (infinite loop)
	constructor(service?: PathService) {
		if (service !== undefined) this.pathService = service;
		else this.pathService = new PathService(this);
		// this.textureService = TextureService.getInstance();
	}

	private readonly repo = new UseFirestormRepository();

	async getPathUseByIdOrName(idOrName: string): Promise<Paths> {
		const use = await this.getUseByIdOrName<true>(idOrName);
		return this.pathService.getPathByUseId(use.id);
	}

	getRaw(): Promise<Record<string, Use>> {
		return this.repo.getRaw();
	}

	getUseByIdOrName<AlwaysID extends boolean = false>(
		idOrName: string,
	): Promise<AlwaysID extends true ? Use : Use | Uses> {
		return this.repo.getUseByIdOrName(idOrName) as any;
	}

	async doesUseExist(idOrName: string): Promise<boolean> {
		const res = await this.getUseByIdOrName(idOrName);
		return Array.isArray(res) ? res.length > 0 : res !== undefined;
	}

	async updateUse(id: string, modifiedUse: CreationUse): Promise<Use> {
		const exists = await this.doesUseExist(id);
		if (!exists) throw new NotFoundError("Use ID not found");
		return this.repo.set({
			id,
			...modifiedUse,
		});
	}

	deleteUse(id: string): Promise<WriteConfirmation[]> {
		return this.repo.deleteUse(id);
	}

	getUsesByIdsAndEdition(idArr: number[], edition: string): Promise<Uses> {
		return this.repo.getUsesByIdAndEdition(idArr, edition);
	}

	async createUse(use: Use): Promise<Use> {
		const exists = await this.doesUseExist(use.id);
		if (exists) throw new BadRequestError(`Texture use ID ${use.id} already exists`);

		return this.repo.set(use);
	}

	async appendUse(textureID: string, use: EntireUseToCreate): Promise<void> {
		const bestLetter = await this.repo.getLastUseLetter(textureID);
		const nextLetter = String.fromCharCode(bestLetter.charCodeAt(0) + 1);
		const newUseID = `${textureID}${nextLetter}`;
		const pathsWithUse: InputPath[] = use.paths.map((p) => ({ ...p, use: newUseID }));

		const useToCreate = {
			id: newUseID,
			name: use.name,
			edition: use.edition,
			texture: Number(textureID),
		};

		await this.createUse(useToCreate);
		if (pathsWithUse.length) await this.pathService.createMultiplePaths(pathsWithUse);
	}

	async createMultipleUses(uses: Uses): Promise<Uses> {
		const exists = await Promise.all(uses.map((u) => this.doesUseExist(u.id)));
		if (exists.some((v) => v)) throw new BadRequestError(`A use ID already exists`);
		return this.repo.setMultiple(uses);
	}
}
