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
	FirstCreationSubmission,
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

	async create(packId: string, data: CreationPackAll): Promise<CreationPackAll> {
		const out = {} as CreationPackAll;
		if (data.submission) {
			// submission is stored separately so we get rid of it from main json
			const submissionData = { id: packId, ...data.submission };
			delete data.submission;
			await this.submissionRepo
				.create(packId, submissionData as Submission)
				.then((submission) => (out.submission = submission));
		}

		return packs.set(packId, data).then(() => ({ id: packId, ...data, ...out }));
	}

	update(packId: AnyPack, newPack: CreationPack): Promise<Pack> {
		const packWithId = { ...newPack, [ID_FIELD]: packId };
		return packs.set(packId, packWithId).then(() => packs.get(packId));
	}

	delete(packId: AnyPack): Promise<void> {
		return packs.remove(packId).then(() => {}); // return nothing
	}
}
