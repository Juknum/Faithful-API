import { ID_FIELD, WriteConfirmation } from "firestorm-db";
import { Use, UseRepository, Uses } from "../interfaces";
import { paths, uses } from "../firestorm";

export default class UseFirestormRepository implements UseRepository {
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

	async lastCharCode(textureID: string): Promise<number> {
		const foundUses = await uses.search([
			{
				field: "texture",
				criteria: "==",
				value: textureID,
			},
		]);

		return foundUses.reduce(
			(best, cur) => {
				const letter = (cur[ID_FIELD] as string).match(/\D/g)?.[0];
				if (!letter) return best;

				if (letter.charCodeAt(0) > best) return letter.charCodeAt(0);
				return best;
			},
			// subtract one since we're adding one later
			"a".charCodeAt(0) - 1,
		);
	}

	deleteUse(id: string): Promise<WriteConfirmation[]> {
		return this.removeUseById(id);
	}

	set(use: Use): Promise<Use> {
		// Clone object because Firestorm removes ID fields internally
		// JS objects work on references so use.id would become undefined after being set
		return uses.set(use.id, structuredClone(use)).then(() => uses.get(use.id));
	}

	async setMultiple(useArray: Uses): Promise<Uses> {
		const useIDs = useArray.map((u) => u.id);
		await uses.setBulk(useIDs, useArray);
		return uses.searchKeys(useIDs);
	}

	async removeUseById(useID: string): Promise<[WriteConfirmation, WriteConfirmation]> {
		const gatheredUse = await uses.get(useID); // assure you find the texture and get path method
		const foundPaths = await gatheredUse.getPaths();
		return Promise.all([
			uses.remove(useID),
			paths.removeBulk(foundPaths.map((p) => p[ID_FIELD])), // delete all paths
		]);
	}

	removeUsesByBulk(useIDs: string[]): Promise<[WriteConfirmation, WriteConfirmation][]> {
		return Promise.all(useIDs.map((useID) => this.removeUseById(useID)));
	}
}
