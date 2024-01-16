import { Submission, CreationSubmission, FaithfulPack, AnyPack, PackAll } from "../interfaces";
import SubmissionFirestormRepository from "../repository/firestorm/submissions.repository";
import { BadRequestError } from "../tools/ApiError";
import { PackService } from "./pack.service";

export class SubmissionService {
	private readonly packService = new PackService();

	private readonly repository = new SubmissionFirestormRepository();

	public getRaw(): Promise<Record<string, Submission>> {
		return this.repository.getRaw();
	}

	public getEveryPack(): Promise<PackAll> {
		return this.repository.getEveryPack();
	}

	public getById(id: FaithfulPack): Promise<Submission> {
		return this.repository.getById(id);
	}

	public create(id: AnyPack, pack: CreationSubmission): Promise<Submission> {
		return this.packService
			.getById(id) // verify parent pack exists already
			.then(() => this.repository.create(id, pack));
	}

	public update(id: FaithfulPack, pack: Submission): Promise<Submission> {
		if (id !== pack.id) throw new BadRequestError("Updated ID is different from ID");

		return this.packService
			.getById(id) // verify parent pack exists already
			.then(() => this.repository.update(id, pack));
	}

	public delete(id: FaithfulPack): Promise<void> {
		return this.repository.delete(id);
	}
}
