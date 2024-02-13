import { WriteConfirmation } from "firestorm-db";
import { PackID, PackAll } from "./packs";

export interface SubmissionChannels {
	submit: string;
	council?: string; // not used if council disabled
	results: string;
}

export interface FirstCreationSubmission {
	// when created at the same time as pack, id isn't required (duplicated otherwise)
	id?: string;
	reference: PackID | null;
	channels: SubmissionChannels;
	council_enabled: boolean;
	time_to_results: number;
	time_to_council?: number; // not used if council disabled
	contributor_role?: string;
}

export interface CreationSubmission extends FirstCreationSubmission {
	// adding submission pack separately needs parent pack
	id: PackID;
}

export interface Submission extends CreationSubmission {
	id: PackID;
}

export interface Submissions extends Array<Submission> {}

export interface FirestormSubmission extends Submission {}

export interface SubmissionRepository {
	getRaw(): Promise<Record<string, Submission>>;
	getEveryPack(): Promise<Record<PackID, PackAll>>;
	getById(id: PackID): Promise<Submission>;
	create(packId: PackID, packToCreate: Submission): Promise<Submission>;
	update(packId: PackID, newPack: Submission): Promise<Submission>;
	delete(packId: PackID): Promise<WriteConfirmation>;
}
