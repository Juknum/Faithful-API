import { Edition } from "./textures";

// just the channels
export interface Channels {
	submit: string;
	council?: string; // not used if council disabled
	results: string;
}

export interface Pack {
	id: string;
	display_name: string;
	channels: Channels;
	council_enabled: boolean;
	time_to_results: number;
	time_to_council?: number; // not used if council disabled
	contributor_role?: string;
	github: Record<Edition, { repo: string; org: string }>;
}

export interface Packs extends Array<Pack> {}

export interface FirestormPack extends Pack {}

export interface PackRepository {
	getRaw(): Promise<Record<string, Pack>>;
	getById(id: string): Promise<Pack>;
	create(packId: string, packToCreate: Pack): Promise<Pack>;
	update(packId: string, newPack: Pack): Promise<Pack>;
	delete(packId: string): Promise<void>;
}
