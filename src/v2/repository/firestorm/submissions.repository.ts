import { ID_FIELD } from "firestorm-db";
import {
	SubmissionRepository,
	Submission,
	CreationSubmission,
	FaithfulPack,
	PackAll,
} from "~/v2/interfaces";
import { submissions } from "../../firestorm/packs/submissions";
import { packs } from "../../firestorm/packs";

export default class SubmissionFirestormRepository implements SubmissionRepository {
	getRaw(): Promise<Record<string, Submission>> {
		return submissions.readRaw();
	}

	getById(id: FaithfulPack): Promise<Submission> {
		return submissions.get(id);
	}

	async getEveryPack(): Promise<PackAll> {
		const submissionPacks = await submissions.readRaw().then((packs) => Object.values(packs));
		const fullPackPromises = submissionPacks.map(async (p) => ({
			...(await packs.get(p.id)),
			submission: p,
		}));
		return Promise.all(fullPackPromises) as any;
	}

	create(packId: string, packToCreate: CreationSubmission): Promise<Submission> {
		return submissions.set(packId, packToCreate).then(() => submissions.get(packId));
	}

	update(packId: FaithfulPack, newPack: Submission): Promise<Submission> {
		const packWithId = { ...newPack, [ID_FIELD]: packId };
		return submissions.set(packId, packWithId).then(() => submissions.get(packId));
	}

	delete(packId: FaithfulPack): Promise<void> {
		return submissions.remove(packId).then(() => {}); // return nothing
	}
}
