import files from "../../firestorm/files";
import { File, FileParent, FileRepository, Files } from "./../../interfaces/files";
export class FilesFirestormRepository implements FileRepository {
	addFile(file: File): Promise<File> {
		return files.add(file);
	}
	getFileByID(id: string): Promise<File> {
		return files.get(id);
	}
	getFilesByParent(parent: FileParent): Promise<Files> {
		return files.search([
			{
				field: "parent.type",
				criteria: "==",
				value: parent.type,
			},
			{
				field: "parent.id",
				criteria: "==",
				value: parent.id,
			},
		]);
	}
	setFileById(id: string, file: File): Promise<File> {
		return files.set(id, file).then(() => {
			return this.getFileByID(id);
		});
	}
	removeFileById(id: string): Promise<void> {
		return files.remove(id).then(() => {});
	}

	removeFilesByParent(parent: FileParent): Promise<void> {
		return this.getFilesByParent(parent)
			.then((files: any) => {
				return files.removeBulk(files.map((f) => f.id));
			})
			.then(() => {});
	}
}
