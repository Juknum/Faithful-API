import { WriteConfirmation } from "firestorm-db";
import { Submission, CreationSubmission, PackID, PackAll } from "../interfaces";
import SubmissionFirestormRepository from "../repository/firestorm/submissions.repository";
import { BadRequestError } from "../tools/ApiError";
import { PackService } from "./pack.service";

export class SubmissionService {
	private readonly packService = new PackService();

	private readonly repository = new SubmissionFirestormRepository();

	public getRaw(): Promise<Record<string, Submission>> {
		return this.repository.getRaw();
	}

	public getEveryPack(): Promise<Record<PackID, PackAll>> {
		return this.repository.getEveryPack();
	}

	public getById(id: PackID): Promise<Submission> {
		return this.repository.getById(id);
	}

	public create(id: PackID, pack: CreationSubmission): Promise<Submission> {
		return this.packService
			.getById(id) // verify parent pack exists already
			.then(() => this.repository.create(id, pack));
	}

	public update(id: PackID, pack: Submission): Promise<Submission> {
		if (id !== pack.id) throw new BadRequestError("Updated ID is different from ID");

		return this.packService
			.getById(id) // verify parent pack exists already
			.then(() => this.repository.update(id, pack));
	}

	public delete(id: PackID): Promise<WriteConfirmation> {
		return this.repository.delete(id);
	}
}
