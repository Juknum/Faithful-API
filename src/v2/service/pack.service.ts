import { EditField, WriteConfirmation } from "firestorm-db";
import { contributions } from "../firestorm";
import {
	Pack,
	Packs,
	PackID,
	PackSearch,
	CreationPackAll,
	PackAll,
	Contribution,
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

	public async renamePack(oldPack: PackID, newPack: string): Promise<{ success: boolean[] }> {
		this.repository.renamePack(oldPack, newPack);

		const r = await contributions.readRaw();
		const old = Object.values(r);
		const filtered = old.filter((c) => c.pack === oldPack);
		const edits: EditField<Contribution>[] = filtered.map((p) => ({
			id: p.id,
			field: "pack",
			operation: "set",
			value: newPack,
		}));
		return contributions.editFieldBulk(edits);
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
