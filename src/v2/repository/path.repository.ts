import { InputPath, Path, Paths, PathRepository } from "~/v2/interfaces";
import { EditField, ID_FIELD, WriteConfirmation } from "firestorm-db";
import { paths } from "../firestorm/textures/paths";

export default class PathFirestormRepository implements PathRepository {
	getPathsByUseIdsAndVersion(useIDs: string[], version: string): Promise<Paths> {
		return paths.search([
			{
				field: "use",
				criteria: "in",
				value: useIDs,
			},
			{
				field: "versions",
				criteria: "array-contains",
				value: version,
			},
		]);
	}

	getPathUseById(useID: string): Promise<Paths> {
		return paths.search([
			{
				field: "use",
				criteria: "==",
				value: useID,
			},
		]);
	}

	createPath(path: InputPath): Promise<Path> {
		// breaks without structuredClone, not sure why
		return paths.add(structuredClone(path)).then((id) => ({ ...structuredClone(path), id }));
	}

	createPathBulk(pathArray: InputPath[]): Promise<Paths> {
		return paths.addBulk(pathArray).then((ids) => paths.searchKeys(ids));
	}

	removePathById(pathID: string): Promise<WriteConfirmation> {
		return paths.remove(pathID);
	}

	removePathsByBulk(pathIDs: string[]): Promise<WriteConfirmation> {
		return paths.removeBulk(pathIDs);
	}

	getPathById(pathID: string): Promise<Path> {
		return paths.get(pathID);
	}

	updatePath(pathID: string, path: Path): Promise<Path> {
		// breaks without structuredClone, not sure why
		return paths.set(pathID, structuredClone(path)).then(() => this.getPathById(pathID));
	}

	/**
	 * Changes all the old version presence in all paths with the new one
	 * @param oldVersion old version to remove on paths versions array
	 * @param newVersion new version to replace the old version
	 */
	modifyVersion(oldVersion: string, newVersion: string): Promise<void> {
		return this.getRaw()
			.then((r) => {
				const old = Object.values(r);
				const filtered = old.filter((p) => p.versions.includes(oldVersion));
				const edits: EditField<Path>[] = filtered.map((p) => ({
					id: p.id,
					field: "versions",
					operation: "set",
					value: p.versions.map((v) => (v === oldVersion ? newVersion : v)),
				}));

				return paths.editFieldBulk(edits);
			})
			.then(() => {});
	}

	addNewVersionToVersion(version: string, newVersion: string): Promise<void> {
		return this.getRaw()
			.then((r) => {
				const old = Object.values(r);
				const filtered = old.filter((p) => p.versions.includes(version));
				const edits: EditField<Path>[] = filtered.map((p) => ({
					id: p[ID_FIELD],
					field: "versions",
					operation: "array-push",
					value: newVersion,
				}));

				return paths.editFieldBulk(edits);
			})
			.then(() => {});
	}

	getRaw(): Promise<Record<string, Path>> {
		return paths.readRaw();
	}
}
