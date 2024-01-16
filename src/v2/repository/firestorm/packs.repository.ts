import { ID_FIELD, SearchOption } from "firestorm-db";
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
	PackSearch,
	FirestormPack,
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

	search(params: PackSearch): Promise<Packs> {
		const { tag, name, resolution, type } = params;
		const options: SearchOption<Pack>[] = [];
		if (name)
			options.push({
				field: "name",
				criteria: "==",
				value: name,
				ignoreCase: true,
			});
		if (tag)
			options.push({
				field: "tags",
				criteria: "array-contains",
				value: tag,
			});
		if (resolution)
			options.push({
				field: "resolution",
				criteria: "==",
				value: resolution,
			});
		const searchPromise: Promise<FirestormPack[]> = options.length
			? packs.search(options)
			: packs.readRaw().then(Object.values);

		return searchPromise.then(async (searched) => {
			if (!type || type === "all") return searched;
			const out = (
				await Promise.all(
					searched.map((pack) =>
						pack
							.submission()
							.then(() => pack)
							.catch(() => undefined),
					),
				)
			).filter((v) => v !== undefined);

			if (type === "submission") return out;
			return searched.filter((p) => !out.includes(p));
		});
	}

	async renamePack(oldPack: AnyPack, newPack: string): Promise<void> {
		const data: CreationPackAll = await this.getById(oldPack);
		data.id = newPack;
		const submission = await this.submissionRepo.getById(oldPack as FaithfulPack).catch(() => null);
		if (submission) data.submission = submission;
		this.delete(oldPack);
		this.submissionRepo.delete(oldPack as FaithfulPack);
		this.create(newPack, data);
	}

	async create(packId: string, data: CreationPackAll): Promise<CreationPackAll> {
		const out = {} as CreationPackAll;
		if (data.submission) {
			// submission is stored separately so we get rid of it from main json
			const submissionData = { id: packId, ...data.submission };
			delete data.submission;
			await this.submissionRepo.create(packId, submissionData as Submission).then((submission) => {
				out.submission = submission;
			});
		}

		return packs.set(packId, data).then(() => ({ id: packId, ...data, ...out }));
	}

	update(packId: AnyPack, newPack: CreationPack): Promise<Pack> {
		const packWithId = { ...newPack, [ID_FIELD]: packId };
		return packs.set(packId, packWithId).then(() => packs.get(packId));
	}

	delete(packId: AnyPack): Promise<void> {
		// try removing submission data if exists too
		this.submissionRepo.delete(packId as FaithfulPack).catch(() => {});
		return packs.remove(packId).then(() => {});
	}
}
