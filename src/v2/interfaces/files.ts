import { WriteConfirmation } from "firestorm-db";

export interface FileParent {
	type: string; // collection name (addon, post...)
	id: string; // id of the parent
}

export type FileUse = "download" | "header" | "screenshot" | "carousel";
export interface File {
	id?: string; // file unique id
	name: string | null; // file name when uploaded
	use: FileUse;
	type: "url" | "b64";
	parent: FileParent;
	source: string; // file content/url (ex: 'database.faithfulpack.net/images/test.png')
}
export type Files = File[];

//! needs to be approved & finished by @TheRolfFR
export type FileDataParam = Pick<File, "name" | "use" | "type">;
export interface FileCreationParam extends FileDataParam {}

export interface FirestormFile extends File {}

export interface FileRepository {
	getRaw(): Promise<Record<string, File>>;
	addFile(file: File): Promise<string>;
	addFiles(files: Files): Promise<string[]>;
	getFileById(id: string): Promise<File>;
	getFilesByParent(parent: FileParent): Promise<Files>;
	setFileById(id: string, file: File): Promise<File>;
	removeFileById(id: string): Promise<WriteConfirmation>;
	removeFilesByParent(parent: FileParent): Promise<WriteConfirmation>;
	removeFilesByParentAndUse(parent: FileParent, use: FileUse): Promise<WriteConfirmation>;
	removeFileByPath(path: string): Promise<WriteConfirmation>;
	upload(
		path: string,
		filename: string,
		buffer: Buffer,
		overwrite: boolean,
	): Promise<WriteConfirmation>;
	remove(path: string): Promise<WriteConfirmation>;
}
