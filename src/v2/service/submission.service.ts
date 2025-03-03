import { WriteConfirmation } from "firestorm-db";
import { BadRequestError } from "@common/tools/errors";
import { Submission, CreationSubmission, PackID, PackAll } from "../interfaces";
import SubmissionFirestormRepository from "../repository/submission.repository";
import PackService from "./pack.service";

export default class SubmissionService {
	private readonly packService = new PackService();

	private readonly repo = new SubmissionFirestormRepository();

	public getRaw(): Promise<Record<string, Submission>> {
		return this.repo.getRaw();
	}

	public getEveryPack(): Promise<Record<PackID, PackAll>> {
		return this.repo.getEveryPack();
	}

	public getById(id: PackID): Promise<Submission> {
		return this.repo.getById(id);
	}

	public create(id: PackID, pack: CreationSubmission): Promise<Submission> {
		return this.packService
			.getById(id) // verify parent pack exists already
			.then(() => this.repo.create(id, pack));
	}

	public update(id: PackID, pack: Submission): Promise<Submission> {
		if (id !== pack.id) throw new BadRequestError("Updated ID is different from ID");

		return this.packService
			.getById(id) // verify parent pack exists already
			.then(() => this.repo.update(id, pack));
	}

	public delete(id: PackID): Promise<WriteConfirmation> {
		return this.repo.delete(id);
	}
}
