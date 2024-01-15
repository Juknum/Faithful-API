import { contributions } from "../firestorm";
import {
	Pack,
	PackTag,
	Packs,
	AnyPack,
	FaithfulPack,
	CreationPackAll,
	Contributions,
} from "../interfaces";
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

	public renamePack(oldPack: AnyPack, newPack: string): Promise<void> {
		this.repository.renamePack(oldPack, newPack);

		return contributions
			.readRaw()
			.then((r) => {
				const old: Contributions = Object.values(r);
				const filtered = old.filter((c) => c.pack === oldPack);
				const edits = filtered.map((p) => ({
					id: p.id,
					field: "pack",
					operation: "set" as const,
					value: newPack,
				}));

				return contributions.editFieldBulk(edits);
			})
			.then(() => {});
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
