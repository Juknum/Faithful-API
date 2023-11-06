import { InputPath, Path, Paths, PathRepository } from "~/v2/interfaces";
import { paths } from "../../firestorm/textures/paths";

export default class PathFirestormRepository implements PathRepository {
	getPathsByUseIdsAndVersion(use_ids: string[], version: string): Promise<Paths> {
		return paths.search([
			{
				field: "use",
				criteria: "in",
				value: use_ids,
			},
			{
				field: "versions",
				criteria: "array-contains",
				value: version,
			},
		]);
	}

	getPathUseById(use_id: string): Promise<Paths> {
		return paths.search([
			{
				field: "use",
				criteria: "==",
				value: use_id,
			},
		]);
	}

	createPath(path: InputPath): Promise<Path> {
		return paths.then((id) => paths.get(id));
	}

	removePathById(path_id: string): Promise<void> {
		return paths.remove(path_id).then(() => {});
	}

	removePathsByBulk(path_ids: string[]): Promise<void> {
		return paths.removeBulk(path_ids).then(() => {});
	}

	getPathById(path_id: string): Promise<Path> {
		return paths.get(path_id);
	}

	updatePath(path_id: string, path: Path): Promise<Path> {
		return paths.set(path_id, path).then(() => this.getPathById(path_id));
	}

	/**
	 * Changes all the old version presence in all paths with the new one
	 * @param old_version old version to remove on paths versions array
	 * @param new_version new version to replace the old version
	 */
	modifyVersion(old_version: string, new_version: string): void | PromiseLike<void> {
		return this.getRaw()
			.then((r) => {
				const old: Path[] = Object.values(r);
				const filtered = old.filter((p) => p.versions.includes(old_version));
				const edits = filtered.map((p) => ({
					id: p.id,
					field: "versions",
					operation: "set",
					value: p.versions.map((v) => (v === old_version ? new_version : v)),
				}));

				return paths.editFieldBulk(edits);
			})
			.then(() => {});
	}

	addNewVersionToVersion(version: string, newVersion: string): void | PromiseLike<void> {
		return this.getRaw()
			.then((r) => {
				const old: Path[] = Object.values(r);
				const filtered = old.filter((p) => p.versions.includes(version));
				const edits = filtered.map((p) => ({
					id: p.id,
					field: "versions",
					operation: "array-push",
					value: newVersion,
				}));

				return paths.editFieldBulk(edits);
			})
			.then(() => {});
	}

	getRaw() {
		return paths.read_raw();
	}
}
