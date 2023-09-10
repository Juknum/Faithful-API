import { FilesFirestormRepository } from "../repository/firestorm/files.repository";
import {
	FileRepository,
	FileParent,
	FileUse,
	File,
	Files,
} from "../interfaces/files";

export class FileService {
	private readonly repo: FileRepository = new FilesFirestormRepository();

	public async removeFileByPath(path: string): Promise<void> {
		return this.repo.removeFileByPath(path);
	}

	public async removeFilesByParentAndUse(parent: FileParent, use: FileUse) {
		return this.repo.removeFilesByParentAndUse(parent, use);
	}

	public async removeFilesByParent(parent: FileParent) {
		return this.repo.removeFilesByParent(parent);
	}

	public async addFile(file: File): Promise<string> {
		return this.repo.addFile(file);
	}

	public async addFiles(files: Files): Promise<string[]> {
		return this.repo.addFiles(files);
	}

	public async removeFileById(id: string) {
		return this.repo.removeFileById(id);
	}

	public async upload(
		path: string,
		filename: string,
		buffer: Buffer,
		overwrite: Boolean = false
	) {
		return this.repo.upload(path, filename, buffer, overwrite);
	}

	public async remove(path: string) {
		return this.repo.remove(path);
	}

	public async getRaw() {
		return this.repo.getRaw();
	}
}
