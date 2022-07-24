import { UseRepository, Use, Uses } from "../interfaces";
import UseFirestormRepository from "../repository/firestorm/use.repository";

export default class UseService {
	private readonly useRepo: UseRepository = new UseFirestormRepository();

	getRaw(): Promise<Uses> {
		return this.useRepo.getRaw();
	}

	getUseByIdOrName(id_or_name: string): Promise<Uses | Use> {
		return this.useRepo.getUseByIdOrName(id_or_name);
	}

	deleteUse(id: string): Promise<void> {
		return this.useRepo.deleteUse(id);
	}

	getUsesByIdsAndEdition(id_arr: number[], edition: string): Promise<Uses> {
		return this.useRepo.getUsesByIdAndEdition(id_arr, edition)
	}
	
	createUse(use: Use): Promise<Use> {
		return this.useRepo.set(use);
	}
}