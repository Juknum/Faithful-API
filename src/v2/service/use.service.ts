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

	private readonly useRepo = new UseFirestormRepository();

	private readonly pathService: PathService;

	async getPathUseByIdOrName(idOrName: string): Promise<Paths> {
		const use = await this.getUseByIdOrName<true>(idOrName);
		return this.pathService.getPathByUseId(use.id);
	}

	getRaw(): Promise<Record<string, Use>> {
		return this.useRepo.getRaw();
	}

	getUseByIdOrName<AlwaysID extends boolean = false>(
		idOrName: string,
	): Promise<AlwaysID extends true ? Use : Use | Uses> {
		return this.useRepo.getUseByIdOrName(idOrName) as any;
	}

	async getUseByIdOrNameAndCatch(idOrName: string): Promise<Uses | Use> {
		const res = await this.getUseByIdOrName(idOrName);
		if (Array.isArray(res) ? res.length > 0 : res !== undefined) return res;
		throw new NotFoundError(`Use ID not found`);
	}

	updateUse(id: string, modifiedUse: CreationUse): Promise<Use> {
		return this.getUseByIdOrNameAndCatch(id).then(() =>
			this.useRepo.set({
				id,
				...modifiedUse,
			}),
		);
	}

	deleteUse(id: string): Promise<WriteConfirmation[]> {
		return this.useRepo.deleteUse(id);
	}

	getUsesByIdsAndEdition(idArr: number[], edition: string): Promise<Uses> {
		return this.useRepo.getUsesByIdAndEdition(idArr, edition);
	}

	getUsesByEdition(edition: string): Promise<Uses> {
		return this.useRepo.getUsesByEdition(edition);
	}

	createUse(use: Use): Promise<Use> {
		return new Promise((resolve, reject) => {
			this.getUseByIdOrNameAndCatch(use.id)
				.then(() => {
					reject(new BadRequestError(`Texture use ID ${use.id} already exists`));
				})
				.catch(() => {
					this.useRepo
						.set(use)
						.then(() => this.getUseByIdOrName(use.id))
						.then((res) => resolve(res as Use))
						.catch((...args) => reject(args));
				});
		});
	}

	createMultipleUses(uses: Uses): Promise<Uses> {
		return Promise.all(
			uses.map(
				(u) =>
					new Promise((resolve, reject) => {
						this.getUseByIdOrNameAndCatch(u.id)
							.then(() => reject())
							.catch(() => resolve(undefined));
					}),
			),
		).then(() => this.useRepo.setMultiple(uses));
	}
}
