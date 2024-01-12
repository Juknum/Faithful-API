import { Submission, CreationSubmission } from "../interfaces";
import SubmissionFirestormRepository from "../repository/firestorm/submissions.repository";

export class SubmissionService {
	private readonly repository = new SubmissionFirestormRepository();

	public getRaw(): Promise<Record<string, Submission>> {
		return this.repository.getRaw();
	}

	public getById(id: string): Promise<Submission> {
		return this.repository.getById(id);
	}

	public create(id: string, pack: CreationSubmission): Promise<Submission> {
		return this.repository.create(id, pack);
	}

	public update(id: string, pack: Submission): Promise<Submission> {
		return this.repository.update(id, pack);
	}

	public delete(id: string): Promise<void> {
		return this.repository.delete(id);
	}
}
