import firestorm from "firestorm-db";
import FormData from "form-data";
import repo from "../../firestorm/files";
import { File, FileParent, FileRepository, Files, FileUse } from "../../interfaces/files";

export class FilesFirestormRepository implements FileRepository {
	addFile(file: File): Promise<string> {
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
		return repo.set(id, file).then(() => this.getFileByID(id));
	}

	removeFileById(id: string): Promise<void> {
		return repo.remove(id).then(() => {});
	}

	removeFilesByParent(parent: FileParent): Promise<void> {
		return this.getFilesByParent(parent)
			.then((files: any) => repo.removeBulk(files.map((f) => f.id)))
			.then(() => {});
	}

	removeFilesByParentAndUse(parent: FileParent, use: FileUse): Promise<void> {
		return this.getFilesByParent(parent)
			.then((files: any) => repo.removeBulk(files.filter((f) => f.use === use).map((f) => f.id)))
			.then(() => {});
	}

	removeFileByPath(path: string): Promise<void> {
		return this.remove(path).finally(() => {});
	}

	upload(path: string, filename: string, buffer: Buffer, overwrite: Boolean): Promise<void> {
		const form = new FormData();
		form.append("path", path);
		form.append("file", buffer, filename);
		form.append("overwrite", String(overwrite === true));

		return firestorm.files.upload(form);
	}

	remove(path: string): Promise<void> {
		return firestorm.files.delete(path).then(() => {});
	}
}
