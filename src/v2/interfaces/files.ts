export interface Files extends Array<File> {}
export interface File {
	id: string; // file unique id
	name: string | null; // file name when uploaded
	use: "header" | "screenshot" | "file" | "carousel";
	type: "url" | "b64";
	parent: {
		type: string; // collection name (addon, post...)
		id: string; // id of the parent
	};
	source: string; // file content/url (ex: 'database.compliancepack.net/images/test.png')
}

//! needs to be approved & finished by @TheRolfFR
export type FileDataParam = Pick<File, "name" | "use" | "type">
export interface FileCreationParam extends FileDataParam {}