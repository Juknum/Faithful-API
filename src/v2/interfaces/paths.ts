import { WriteConfirmation } from "firestorm-db";
import { Edition } from "./textures";

export interface CreationPath {
	name: string; // texture path ('textures/block/stone.png')
	versions: Array<string>; // MC versions
	mcmeta: boolean; // true if animated
}

export interface InputPath extends CreationPath {
	use: string; // use id
}

export interface Path extends InputPath {
	id: string; // path unique id
}

export interface Paths extends Array<Path> {}

export interface FirestormPath extends Path {}

export interface PathRepository {
	addNewVersionToVersion(version: string, newVersion: string): Promise<void>;
	getPathById(pathID: string): Promise<Path>;
	getPathUseById(useID: string): Promise<Paths>;
	getPathsByUseIdsAndVersion(useIDs: string[], version: string): Promise<Paths>;
	createPath(path: InputPath): Promise<Path>;
	createPathBulk(paths: InputPath[]): Promise<Paths>;
	updatePath(pathID: string, path: Path): Promise<Path>;
	modifyVersion(oldVersion: string, newVersion: string): Promise<void>;
	removePathById(pathID: string): Promise<WriteConfirmation>;
	removePathsByBulk(pathIDs: string[]): Promise<WriteConfirmation>;
	getRaw(): Promise<Record<string, Path>>;
}

export interface PathNewVersionParam {
	edition: Edition;
	version: string;
	newVersion: string;
}
