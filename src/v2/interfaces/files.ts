export interface FileParent {
	type: string; // collection name (addon, post...)
	id: string; // id of the parent
}

export interface Files extends Array<File> {}
export interface File {
	id?: string; // file unique id
	name: string | null; // file name when uploaded
	use: "header" | "screenshot" | "file" | "carousel" | "download";
	type: "url" | "b64";
	parent: FileParent;
	source: string; // file content/url (ex: 'database.compliancepack.net/images/test.png')
}

//! needs to be approved & finished by @TheRolfFR
export type FileDataParam = Pick<File, "name" | "use" | "type">;
export interface FileCreationParam extends FileDataParam {}

export interface FileRepository {
	addFile(file: File): Promise<File>;
	getFileByID(id: string): Promise<File>;
	getFilesByParent(parent: FileParent): Promise<Files>;
	setFileById(id: string, file: File): Promise<File>;
	removeFileById(id: string): Promise<void>;
	removeFilesByParent(parent: FileParent): Promise<void>;
	removeFileByPath(path: string): Promise<void>;
}
