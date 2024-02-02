import firestorm, { ID_FIELD } from "firestorm-db";
import FormData from "form-data";
import { files } from "../../firestorm";
import { File, FileParent, FileRepository, Files, FileUse } from "../../interfaces/files";

export class FilesFirestormRepository implements FileRepository {
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
				// @ts-ignore
				field: "parent.id",
				criteria: "==",
				value: String(parent.id),
			},
			{
				// @ts-ignore
				field: "parent.type",
				criteria: "==",
				value: parent.type,
			},
		]);
	}

	setFileById(id: string, file: File): Promise<File> {
		return files.set(id, file).then(() => this.getFileById(id));
	}

	removeFileById(id: string): Promise<void> {
		return files.remove(id).then(() => {});
	}

	removeFilesByParent(parent: FileParent): Promise<void> {
		return this.getFilesByParent(parent)
			.then((_files) => files.removeBulk(_files.map((f) => f[ID_FIELD])))
			.then(() => {});
	}

	removeFilesByParentAndUse(parent: FileParent, use: FileUse): Promise<void> {
		return this.getFilesByParent(parent)
			.then((_files) =>
				files.removeBulk(_files.filter((f) => f.use === use).map((f) => f[ID_FIELD])),
			)
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

		// @ts-ignore
		return firestorm.files.upload(form);
	}

	remove(path: string): Promise<void> {
		// @ts-ignore
		return firestorm.files.delete(path).then(() => {});
	}

	getRaw(): Promise<Record<string, File>> {
		return files.readRaw();
	}
}
