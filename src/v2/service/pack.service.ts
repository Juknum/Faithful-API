import { Pack } from "../interfaces";
import PackFirestormRepository from "../repository/firestorm/packs.repository";

export class PackService {
	private readonly repository = new PackFirestormRepository();

	public getRaw(): Promise<Record<string, Pack>> {
		return this.repository.getRaw();
	}

	public getById(id: string) {
		return this.repository.getById(id);
	}

	public async create(id: string, pack: Pack): Promise<Pack> {
		return this.repository.update(id, pack);
	}

	public async update(id: string, pack: Pack): Promise<Pack> {
		return this.repository.update(id, pack);
	}

	public delete(id: string): Promise<void> {
		return this.repository.delete(id);
	}
}
