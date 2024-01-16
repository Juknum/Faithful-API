import { AnyPack, FaithfulPack } from "./packs";

export interface SubmissionChannels {
	submit: string;
	council?: string; // not used if council disabled
	results: string;
}

export interface FirstCreationSubmission {
	// when created at the same time as pack, id isn't required (duplicated otherwise)
	id?: string;
	channels: SubmissionChannels;
	council_enabled: boolean;
	time_to_results: number;
	time_to_council?: number; // not used if council disabled
	contributor_role?: string;
}

export interface CreationSubmission extends FirstCreationSubmission {
	// adding submission pack separately needs parent pack
	id: AnyPack;
}

export interface Submission extends CreationSubmission {
	id: FaithfulPack;
}

export interface Submissions extends Array<Submission> {}

export interface FirestormSubmission extends Submission {}

export interface SubmissionRepository {
	getRaw(): Promise<Record<string, Submission>>;
	getById(id: FaithfulPack): Promise<Submission>;
	create(packId: AnyPack, packToCreate: Submission): Promise<Submission>;
	update(packId: FaithfulPack, newPack: Submission): Promise<Submission>;
	delete(packId: FaithfulPack): Promise<void>;
}
