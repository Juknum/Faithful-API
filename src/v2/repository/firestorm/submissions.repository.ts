import { ID_FIELD } from "firestorm-db";
import { SubmissionRepository, Submission, CreationSubmission } from "~/v2/interfaces";
import { submissions } from "../../firestorm/packs/submissions";

export default class SubmissionFirestormRepository implements SubmissionRepository {
	getRaw(): Promise<Record<string, Submission>> {
		return submissions.readRaw();
	}

	getById(id: string): Promise<Submission> {
		return submissions.get(id);
	}

	create(packId: string, packToCreate: CreationSubmission): Promise<Submission> {
		return submissions.set(packId, packToCreate).then(() => submissions.get(packId));
	}

	update(packId: string, newPack: Submission): Promise<Submission> {
		const packWithId = { ...newPack, [ID_FIELD]: packId };
		return submissions.set(packId, packWithId).then(() => submissions.get(packId));
	}

	delete(packId: string): Promise<void> {
		return submissions.remove(packId).then(() => {}); // return nothing
	}
}
