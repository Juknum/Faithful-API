import { WriteConfirmation } from "firestorm-db";
import { addons } from "../../firestorm";
import { Files, AddonStatus, Addon, Addons, AddonRepository } from "../../interfaces";

export default class AddonFirestormRepository implements AddonRepository {
	getRaw(): Promise<Record<string, Addon>> {
		return addons.readRaw();
	}

	getAddonById(id: number): Promise<Addon> {
		return addons.get(id);
	}

	getFilesById(addonId: number): Promise<Files> {
		return addons.get(addonId).then((addon) => addon.getFiles());
	}

	getAddonByStatus(status: AddonStatus): Promise<Addons> {
		return addons.search([
			{
				criteria: "==",
				field: "approval.status",
				value: status,
			},
		]);
	}

	getAddonBySlug(slug: string): Promise<Addon> {
		return addons
			.search([
				{
					criteria: "==",
					field: "slug",
					value: slug,
				},
			])
			.then((results) => results[0]);
	}

	create(addon: Addon): Promise<Addon> {
		const { slug } = addon;
		return addons
			.add(addon)
			.then(() =>
				addons.search([
					{
						field: "slug",
						criteria: "==",
						value: slug,
					},
				]),
			)
			.then((results) => results[0]);
	}

	delete(id: number): Promise<WriteConfirmation> {
		return addons.remove(String(id));
	}

	update(id: number, addon: Addon): Promise<Addon> {
		return addons.set(id, addon).then(() => addons.get(id));
	}
}
