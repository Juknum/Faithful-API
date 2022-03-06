import { Contribution } from "./contributions";

export interface Change {
	id: string; // change unique id
	contribution?: Contribution;
	comment: string; // additional comment
}
export interface Changes extends Array<Change> {}

export interface Changelog {
	id: string; // changelog unique id
	name: string; // changelog name (ex: 'Beta 2')
	added: Changes;
	modified: Changes;
	removed: Changes;
	fixed: Changes;
}
export interface Changelogs extends Array<Changelog> {}
