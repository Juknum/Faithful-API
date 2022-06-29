import { mapPaths } from "../../tools/mapping/textures";
import { paths } from "../../firestorm";
import { PathRepository, Paths } from "../../interfaces";

export default class PathFirestormRepository implements PathRepository {
	getPathsByUseIdsAndVersion(use_ids: string[], version: string): Promise<Paths> {
		return paths.search([{
			field: "useID",
			criteria: "in",
			value: use_ids,
		}, {
			field: "versions",
			criteria: "array-contains",
			value: version,
		}])
			.then(mapPaths)
	}
}