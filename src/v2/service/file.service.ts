import { WriteConfirmation } from "firestorm-db";
import { FilesFirestormRepository } from "../repository/firestorm/files.repository";
import { FileParent, FileUse, File, Files } from "../interfaces/files";

export class FileService {
	private readonly repo = new FilesFirestormRepository();

	public removeFileByPath(path: string): Promise<WriteConfirmation> {
		return this.repo.removeFileByPath(path);
	}

	public removeFilesByParentAndUse(parent: FileParent, use: FileUse) {
		return this.repo.removeFilesByParentAndUse(parent, use);
	}

	public removeFilesByParent(parent: FileParent) {
		return this.repo.removeFilesByParent(parent);
	}

	public addFile(file: File): Promise<string> {
		return this.repo.addFile(file);
	}

	public addFiles(files: Files): Promise<string[]> {
		return this.repo.addFiles(files);
	}

	public removeFileById(id: string) {
		return this.repo.removeFileById(id);
	}

	public upload(path: string, filename: string, buffer: Buffer, overwrite: Boolean = false) {
		return this.repo.upload(path, filename, buffer, overwrite);
	}

	public remove(path: string) {
		return this.repo.remove(path);
	}

	public getRaw() {
		return this.repo.getRaw();
	}
}
