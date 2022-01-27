import { addons } from "../../firestorm";
import { Files, AddonAll, Addon, Addons, AddonRepository } from "../../interfaces";

export default class AddonFirestormRepository implements AddonRepository {
	getRaw(): Promise<Addons> {
		return addons.read_raw();
	}

	getAddonById(id: number): Promise<Addon> {
		return addons.get(id);
	}

	getFilesById(addonId: number): Promise<Files> {
		return addons.get(addonId).then((addon) => addon.files());
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
}
