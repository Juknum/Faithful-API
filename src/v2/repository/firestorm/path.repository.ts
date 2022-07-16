import { InputPath, Path, PathRepository } from "~/v2/interfaces";
import { mapPath, unmapPath } from "../../tools/mapping/textures";
import { paths } from "../../firestorm/textures/paths";

export class PathFirestormRepository implements PathRepository {
	createPath(path: InputPath): Promise<Path> {
		return paths.add(unmapPath(path)).then((id) => paths.get(id))
			.then(mapPath);
	}
}