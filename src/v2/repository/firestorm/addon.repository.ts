import { addons } from "../../firestorm";
import { Files, AddonStatus, Addon, Addons, AddonRepository } from "../../interfaces";

export default class AddonFirestormRepository implements AddonRepository {
	getRaw(): Promise<Record<string,Addon>> {
		return addons.read_raw();
	}

	getAddonById(id: number): Promise<Addon> {
		return addons.get(id);
	}

	getFilesById(addonId: number): Promise<Files> {
		return addons.get(addonId).then((addon) => addon.files());
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
			.then((results) => {
				return results[0];
			});
	}

	create(addon: Addon): Promise<Addon> {
		const slug = addon.slug;
		return addons
			.add(addon)
			.then(() => {
				return addons.search([
					{
						field: "slug",
						criteria: "==",
						value: slug,
					},
				]);
			})
			.then((results) => {
				return results[0];
			});
	}

	delete(id: number): Promise<void> {
		return addons.remove(String(id)).then(() => {}); // return nothing
	}

	update(id: number, addon: Addon): Promise<Addon> {
		return addons.set(id, addon).then(() => {
			return addons.get(id);
		});
	}
}
