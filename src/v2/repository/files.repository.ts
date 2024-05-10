import firestorm, { ID_FIELD, WriteConfirmation } from "firestorm-db";
import FormData from "form-data";
import { files } from "../firestorm";
import { File, FileParent, FileRepository, Files, FileUse } from "../interfaces/files";

export class FileFirestormRepository implements FileRepository {
	getRaw(): Promise<Record<string, File>> {
		return files.readRaw();
	}

	addFiles(fileList: Files): Promise<string[]> {
		return files.addBulk(fileList);
	}

	addFile(file: File): Promise<string> {
		return files.add(file);
	}

	getFileById(id: string): Promise<File> {
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
		return files.set(id, file).then(() => this.getFileById(id));
	}

	removeFileById(id: string): Promise<WriteConfirmation> {
		return files.remove(id);
	}

	removeFilesByParent(parent: FileParent): Promise<WriteConfirmation> {
		return this.getFilesByParent(parent).then((_files) =>
			files.removeBulk(_files.map((f) => f[ID_FIELD])),
		);
	}

	removeFilesByParentAndUse(parent: FileParent, use: FileUse): Promise<WriteConfirmation> {
		return this.getFilesByParent(parent).then((_files) =>
			files.removeBulk(_files.filter((f) => f.use === use).map((f) => f[ID_FIELD])),
		);
	}

	removeFileByPath(path: string): Promise<WriteConfirmation> {
		return this.remove(path);
	}

	upload(
		path: string,
		filename: string,
		buffer: Buffer,
		overwrite: Boolean,
	): Promise<WriteConfirmation> {
		const form = new FormData();
		form.append("path", path);
		form.append("file", buffer, filename);
		form.append("overwrite", String(overwrite === true));

		return firestorm.files.upload(form);
	}

	remove(path: string): Promise<WriteConfirmation> {
		return firestorm.files.delete(path);
	}
}
