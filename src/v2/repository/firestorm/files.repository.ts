import firestorm from "firestorm-db";
import FormData from "form-data";
import { files } from "../../firestorm";
import { File, FileParent, FileRepository, Files, FileUse } from "../../interfaces/files";

export class FilesFirestormRepository implements FileRepository {
	addFile(file: File): Promise<string> {
		return files.add(file);
	}

	getFileByID(id: string): Promise<File> {
		return files.get(id);
	}

	getFilesByParent(parent: FileParent): Promise<Files> {
		return files.search([
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
		return files.set(id, file).then(() => this.getFileByID(id));
	}

	removeFileById(id: string): Promise<void> {
		return files.remove(id).then(() => {});
	}

	removeFilesByParent(parent: FileParent): Promise<void> {
		return this.getFilesByParent(parent)
			.then((_files: any) => _files.removeBulk(_files.map((f) => f.id)))
			.then(() => {});
	}

	removeFilesByParentAndUse(parent: FileParent, use: FileUse): Promise<void> {
		return this.getFilesByParent(parent)
			.then((_files: any) => _files.removeBulk(_files.filter((f) => f.use === use).map((f) => f.id)))
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
