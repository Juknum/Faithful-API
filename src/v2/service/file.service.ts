import { FilesFirestormRepository } from "./../repository/firestorm/files.repository";
import { FileRepository, FileParent, File } from "./../interfaces/files";
export class FileService {
	private readonly repo: FileRepository = new FilesFirestormRepository();

	public async removeFileByPath(path: string): Promise<void> {
		return this.repo.removeFileByPath(path);
	}

	public async removeFilesByParent(parent: FileParent) {
		return this.repo.removeFilesByParent(parent);
	}

	public async addFile(file: File) {
		return this.repo.addFile(file);
	}
}
