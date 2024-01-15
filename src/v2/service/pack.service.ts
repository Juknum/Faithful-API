import { Pack, PackTag, Packs, AnyPack, FaithfulPack, CreationPackAll } from "../interfaces";
import PackFirestormRepository from "../repository/firestorm/packs.repository";

export class PackService {
	private readonly repository = new PackFirestormRepository();

	public getRaw(): Promise<Record<string, Pack>> {
		return this.repository.getRaw();
	}

	public getById(id: AnyPack): Promise<Pack> {
		return this.repository.getById(id);
	}

	public searchByTag(tag: PackTag): Promise<Packs> {
		return this.repository.searchByTag(tag);
	}

	public getWithSubmission(id: FaithfulPack) {
		return this.repository.getWithSubmission(id);
	}

	public getAllTags(): Promise<PackTag[]> {
		return this.repository.getAllTags();
	}

	public serializeDisplayName(name: string): string {
		return name
			.toLowerCase()
			.trim()
			.replace(/ /g, "_")
			.replace(/\W/g, "") // remove special characters
			.replace(/jappa/g, "") // backwards compatibility
			.replace(/programmer art/g, "progart");
	}

	public create(body: CreationPackAll): Promise<CreationPackAll> {
		if (!body.id) body.id = this.serializeDisplayName(body.name);
		return this.repository.create(body.id, body);
	}

	public update(id: AnyPack, pack: Pack): Promise<Pack> {
		return this.repository.update(id, pack);
	}

	public delete(id: AnyPack): Promise<void> {
		return this.repository.delete(id);
	}
}
