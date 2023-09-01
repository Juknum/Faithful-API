import { InputPath, Path, Paths, PathRepository } from "~/v2/interfaces";
import { mapPath, unmapPath, mapPaths } from "../../tools/mapping/textures";
import { paths } from "../../firestorm/textures/paths";

export default class PathFirestormRepository implements PathRepository {
	getPathsByUseIdsAndVersion(
		use_ids: string[],
		version: string
	): Promise<Paths> {
		return paths
			.search([
				{
					field: "useID",
					criteria: "in",
					value: use_ids,
				},
				{
					field: "versions",
					criteria: "array-contains",
					value: version,
				},
			])
			.then(mapPaths);
	}

	getPathUseById(use_id: string): Promise<Paths> {
		return paths
			.search([
				{
					field: "useID",
					criteria: "==",
					value: use_id,
				},
			])
			.then(mapPaths);
	}

	createPath(path: InputPath): Promise<Path> {
		return paths
			.add(unmapPath(path))
			.then((id) => paths.get(id))
			.then(mapPath);
	}

	removePathById(path_id: string): Promise<void> {
		return paths.remove(path_id).then(() => {});
	}

	removePathsByBulk(path_ids: string[]): Promise<void> {
		return paths.removeBulk(path_ids).then(() => {});
	}

	getPathById(path_id: string): Promise<Path> {
		return paths.get(path_id).then((p) => mapPath(p));
	}

	updatePath(path_id: string, path: Path): Promise<Path> {
		return paths.set(path_id, unmapPath(path)).then(() => this.getPathById(path_id));
	}

	getRaw() {
		return paths.read_raw();
	}
}
