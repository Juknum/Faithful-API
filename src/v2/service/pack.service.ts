import { Pack, PackTag, Packs } from "../interfaces";
import PackFirestormRepository from "../repository/firestorm/packs.repository";

export class PackService {
	private readonly repository = new PackFirestormRepository();

	public getRaw(): Promise<Record<string, Pack>> {
		return this.repository.getRaw();
	}

	public getById(id: string): Promise<Pack> {
		return this.repository.getById(id);
	}

	public searchByTag(tag: PackTag): Promise<Packs> {
		return this.repository.searchByTag(tag);
	}

	public getAllTags(): Promise<PackTag[]> {
		return this.repository.getAllTags();
	}

	public create(id: string, pack: Pack): Promise<Pack> {
		return this.repository.update(id, pack);
	}

	public update(id: string, pack: Pack): Promise<Pack> {
		return this.repository.update(id, pack);
	}

	public delete(id: string): Promise<void> {
		return this.repository.delete(id);
	}
}
