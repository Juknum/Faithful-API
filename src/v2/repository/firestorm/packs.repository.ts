import { ID_FIELD } from "firestorm-db";
import {
	PackRepository,
	Pack,
	PackTag,
	Packs,
	CreationPack,
	AnyPack,
	PackAll,
	Submission,
	FaithfulPack,
	CreationPackAll,
} from "~/v2/interfaces";
import { packs } from "../../firestorm";
import SubmissionFirestormRepository from "./submissions.repository";

export default class PackFirestormRepository implements PackRepository {
	private readonly submissionRepo = new SubmissionFirestormRepository();
	getRaw(): Promise<Record<string, Pack>> {
		return packs.readRaw();
	}

	getById(id: string): Promise<Pack> {
		return packs.get(id);
	}

	async getWithSubmission(id: FaithfulPack): Promise<PackAll> {
		const pack = await packs.get(id);
		const submission = await this.submissionRepo.getById(id).catch(() => null);

		// faithful pack with no submission information found
		if (!submission) return { ...pack, submission: {} };
		return { ...pack, submission };
	}

	searchByTag(tag: PackTag): Promise<Packs> {
		return packs.search([
			{
				field: "tags",
				criteria: "array-contains",
				value: tag,
			},
		]);
	}

	getAllTags(): Promise<PackTag[]> {
		return packs
			.select({
				fields: ["tags"],
			})
			.then((res: any) =>
				(
					Object.values(res).reduce(
						(acc: Array<string>, cur: any) => [...acc, cur.tags],
						[],
					) as Array<PackTag>
				)
					.flat()
					.filter((e, i, a) => a.indexOf(e) === i)
					.sort(),
			);
	}

	create(packId: string, packToCreate: CreationPack): Promise<Pack> {
		return packs.set(packId, packToCreate).then(() => packs.get(packId));
	}

	createWithSubmission(packId: string, data: CreationPackAll): Promise<CreationPackAll> {
		const submissionData = data.submission;
		delete data.submission;
		const packData = data;
		this.create(packId, packData);
		// no associated pack object found
		if (!Object.keys(submissionData)) return;

		return this.submissionRepo
			.create(packId, submissionData as Submission)
			.then((submission) => ({ id: packId, ...packData, submission }));
	}

	update(packId: AnyPack, newPack: CreationPack): Promise<Pack> {
		const packWithId = { ...newPack, [ID_FIELD]: packId };
		return packs.set(packId, packWithId).then(() => packs.get(packId));
	}

	delete(packId: AnyPack): Promise<void> {
		return packs.remove(packId).then(() => {}); // return nothing
	}
}
