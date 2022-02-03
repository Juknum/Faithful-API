import repo from "../../firestorm/files";
import { File, FileParent, FileRepository, Files } from "./../../interfaces/files";
export class FilesFirestormRepository implements FileRepository {
	addFile(file: File): Promise<File> {
		return repo.add(file);
	}
	getFileByID(id: string): Promise<File> {
		return repo.get(id);
	}
	getFilesByParent(parent: FileParent): Promise<Files> {
		return repo.search([
			{
				field: "parent.id",
				criteria: "==",
				value: String(parent.id),
			},
			{
				field: "parent.type",
				criteria: "==",
				value: parent.type,
			},
		]);
	}
	setFileById(id: string, file: File): Promise<File> {
		return repo.set(id, file).then(() => {
			return this.getFileByID(id);
		});
	}
	removeFileById(id: string): Promise<void> {
		return repo.remove(id).then(() => {});
	}

	removeFilesByParent(parent: FileParent): Promise<void> {
		return this.getFilesByParent(parent)
			.then((files: any) => {
				return repo.removeBulk(files.map((f) => f.id));
			})
			.then(() => {});
	}

	removeFileByPath(path: string): Promise<void> {
		return Promise.resolve();
	}
}
