import { InputPath, Path, PathRepository } from "../interfaces";
import PathFirestormRepository from "../repository/firestorm/path.repository";

export default class PathService {
  
	private readonly repository: PathRepository = new PathFirestormRepository();

	async createPath(path: InputPath): Promise<Path> {
		return this.repository.createPath(path);
	}
}