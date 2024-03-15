import { WriteConfirmation } from "firestorm-db";
import { Use, Uses, Paths, CreationUse } from "../interfaces";
import UseFirestormRepository from "../repository/use.repository";
import { BadRequestError, NotFoundError } from "../tools/ApiError";
import PathService from "./path.service";

export default class UseService {
	constructor();

	constructor(pathService: PathService);

	constructor(...args: any[]) {
		// eslint-disable-next-line prefer-destructuring
		if (args.length) this.pathService = args[0];
		else this.pathService = new PathService(this);
	}

	private readonly repo = new UseFirestormRepository();

	private readonly pathService: PathService;

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

	getUsesByEdition(edition: string): Promise<Uses> {
		return this.repo.getUsesByEdition(edition);
	}

	async createUse(use: Use): Promise<Use> {
		console.log(use.id);
		const exists = await this.doesUseExist(use.id);
		if (exists) throw new BadRequestError(`Texture use ID ${use.id} already exists`);

		return this.repo.set(use);
	}

	async createMultipleUses(uses: Uses): Promise<Uses> {
		const exists = await Promise.all(uses.map((u) => this.doesUseExist(u.id)));
		if (exists.some((v) => v)) throw new BadRequestError(`A use ID already exists`);
		return this.repo.setMultiple(uses);
	}
}
