import { InputPath, Path, Paths, PathRepository } from "~/v2/interfaces";
import { mapPath, unmapPath, mapPaths } from "../../tools/mapping/textures";
import { paths } from "../../firestorm/textures/paths";

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
	
	createPath(path: InputPath): Promise<Path> {
		return paths.add(unmapPath(path)).then((id) => paths.get(id))
			.then(mapPath);
	}
}