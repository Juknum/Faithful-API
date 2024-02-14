/* eslint-disable arrow-body-style */
import { Use, UseRepository, Uses } from "~/v2/interfaces";
import { ID_FIELD, WriteConfirmation } from "firestorm-db";
import { paths as pathsCollection, uses } from "../firestorm";

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

	getUsesByIdAndEdition(idArr: number[], edition: string): Promise<Uses> {
		return uses.search([
			{
				field: "texture",
				criteria: "in",
				value: idArr,
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

	getUseByIdOrName(idOrName: string): Promise<Uses | Use> {
		return uses.get(idOrName).catch(
			() =>
				uses
					.search([
						{
							field: "name",
							criteria: "includes",
							value: idOrName,
							ignoreCase: true,
						},
					])
					.then((out: Uses) => out.filter((use: Use) => use.name !== null)), // remove null names
		);
	}

	deleteUse(id: string): Promise<WriteConfirmation[]> {
		return this.removeUseById(id);
	}

	set(use: Use): Promise<Use> {
		// breaks without structuredClone, not sure why
		return uses.set(use.id, structuredClone(use)).then(() => uses.get(use.id));
	}

	setMultiple(useArray: Uses): Promise<Uses> {
		const useIDs = useArray.map((u) => u.id);
		return uses.setBulk(useIDs, useArray).then(() => uses.searchKeys(useIDs));
	}

	removeUseById(useID: string): Promise<WriteConfirmation[]> {
		return uses
			.get(useID) // assure you find the texture and get path method
			.then((gatheredUse) => gatheredUse.getPaths())
			.then((foundPaths) => {
				return Promise.all([
					uses.remove(useID),
					pathsCollection.removeBulk(foundPaths.map((p) => p[ID_FIELD])), // delete all paths
				]);
			});
	}

	removeUsesByBulk(useIDs: string[]): Promise<WriteConfirmation[][]> {
		return Promise.all(useIDs.map((useID) => this.removeUseById(useID)));
	}
}
