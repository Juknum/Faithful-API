import { FaithfulPack } from "./packs";

export interface SubmissionChannels {
	submit: string;
	council?: string; // not used if council disabled
	results: string;
}

export interface CreationSubmission {
	id: string;
	channels: SubmissionChannels;
	council_enabled: boolean;
	time_to_results: number;
	time_to_council?: number; // not used if council disabled
	contributor_role?: string;
}

export interface Submission extends CreationSubmission {
	id: FaithfulPack;
}

export interface Submissions extends Array<Submission> {}

export interface FirestormSubmission extends Submission {}

export interface SubmissionRepository {
	getRaw(): Promise<Record<string, Submission>>;
	getById(id: string): Promise<Submission>;
	create(packId: string, packToCreate: Submission): Promise<Submission>;
	update(packId: string, newPack: Submission): Promise<Submission>;
	delete(packId: string): Promise<void>;
}
