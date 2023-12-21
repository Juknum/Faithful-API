/* eslint-disable arrow-body-style */
import { Use, UseRepository, Uses } from "~/v2/interfaces";
import { ID_FIELD } from "firestorm-db";
import { paths as pathsCollection, uses } from "../../firestorm";

export default class UseFirestormRepository implements UseRepository {
	getUsesByEdition(edition: string): Promise<Uses> {
		return uses.search([
			{
				field: "edition",
				criteria: "==",
				value: edition,
			},
		]);
	}

	getUsesByIdAndEdition(id_arr: number[], edition: string): Promise<Uses> {
		return uses.search([
			{
				field: "texture",
				criteria: "in",
				value: id_arr,
			},
			{
				field: "edition",
				criteria: "==",
				value: edition,
			},
		]);
	}

	getRaw(): Promise<Record<string, Use>> {
		return uses.readRaw();
	}

	getUseByIdOrName(id_or_name: string): Promise<Uses | Use> {
		return uses.get(id_or_name).catch(
			() =>
				uses
					.search([
						{
							field: "name",
							criteria: "includes",
							value: id_or_name,
							ignoreCase: true,
						},
					])
					.then((out: Uses) => out.filter((use: Use) => use.name !== null)), // remove null names
		);
	}

	deleteUse(id: string): Promise<void> {
		return this.removeUseById(id);
	}

	set(use: Use): Promise<Use> {
		// breaks without structuredClone, not sure why
		return uses.set(use.id, structuredClone(use)).then(() => uses.get(use.id));
	}

	setMultiple(useArray: Use[]): Promise<Use[]> {
		const use_ids = useArray.map((u) => u.id);
		return uses.setBulk(use_ids, useArray).then(() => uses.searchKeys(use_ids));
	}

	removeUseById(use_id: string): Promise<void> {
		return uses
			.get(use_id) // assure you find the texture and get path method
			.then((gatheredUse) => {
				return gatheredUse.getPaths();
			})
			.then((foundPaths) => {
				return Promise.all([
					uses.remove(use_id),
					pathsCollection.removeBulk(foundPaths.map((p) => p[ID_FIELD])), // delete all paths
				]);
			})
			.then(() => {});
	}

	removeUsesByBulk(use_ids: string[]): Promise<void> {
		return Promise.all(use_ids.map((u_id) => this.removeUseById(u_id))).then(() => {});
	}
}
