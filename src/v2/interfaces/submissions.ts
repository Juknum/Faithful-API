export interface SubmissionChannels {
	submit: string;
	council?: string; // not used if council disabled
	results: string;
}

export interface Submission {
	channels: SubmissionChannels;
	council_enabled: boolean;
	time_to_results: number;
	time_to_council?: number; // not used if council disabled
	contributor_role?: string;
}

export interface Submissions extends Array<Submission> {}

export interface FirestormSubmission extends Submission {}
