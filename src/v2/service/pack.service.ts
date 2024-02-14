import { WriteConfirmation } from "firestorm-db";
import { contributions } from "../firestorm";
import {
	Pack,
	Packs,
	PackID,
	PackSearch,
	CreationPackAll,
	Contributions,
	PackAll,
} from "../interfaces";
import PackFirestormRepository from "../repository/packs.repository";

export class PackService {
	private readonly repository = new PackFirestormRepository();

	public getRaw(): Promise<Record<string, Pack>> {
		return this.repository.getRaw();
	}

	public getById(id: PackID): Promise<Pack> {
		return this.repository.getById(id);
	}

	public search(params: PackSearch): Promise<Packs> {
		return this.repository.search(params);
	}

	public getWithSubmission(id: PackID): Promise<PackAll> {
		return this.repository.getWithSubmission(id);
	}

	public getAllTags(): Promise<string[]> {
		return this.repository.getAllTags();
	}

	public renamePack(oldPack: PackID, newPack: string): Promise<void> {
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

	public update(id: PackID, pack: Pack): Promise<Pack> {
		return this.repository.update(id, pack);
	}

	public delete(id: PackID): Promise<WriteConfirmation> {
		return this.repository.delete(id);
	}
}
