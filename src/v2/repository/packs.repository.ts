import { ID_FIELD, SearchOption, WriteConfirmation } from "firestorm-db";
import {
	PackRepository,
	Pack,
	Packs,
	CreationPack,
	PackAll,
	Submission,
	PackID,
	CreationPackAll,
	PackSearch,
	FirestormPack,
} from "~/v2/interfaces";
import { contributions, packs } from "../firestorm";
import SubmissionFirestormRepository from "./submissions.repository";
import { selectDistinct } from "../tools/firestorm";

export default class PackFirestormRepository implements PackRepository {
	private readonly submissionRepo = new SubmissionFirestormRepository();

	getRaw(): Promise<Record<string, Pack>> {
		return packs.readRaw();
	}

	getById(id: string): Promise<Pack> {
		return packs.get(id);
	}

	async getWithSubmission(id: PackID): Promise<PackAll> {
		const pack = await packs.get(id);
		const submission = await this.submissionRepo.getById(id).catch(() => null);

		// faithful pack with no submission information found
		if (!submission) return { ...pack, submission: {} };
		return { ...pack, submission };
	}

	getAllTags(): Promise<string[]> {
		return selectDistinct(packs, "tags", true).then((res) => res.sort());
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

	async renamePack(oldPack: PackID, newPack: string): Promise<void> {
		const data: CreationPackAll = await this.getById(oldPack);
		data.id = newPack;
		const submission = await this.submissionRepo.getById(oldPack).catch(() => null);
		if (submission) data.submission = submission;
		this.delete(oldPack);
		this.submissionRepo.delete(oldPack);
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

	update(packId: PackID, newPack: CreationPack): Promise<Pack> {
		const packWithId = { ...newPack, [ID_FIELD]: packId };
		return packs.set(packId, packWithId).then(() => packs.get(packId));
	}

	delete(packId: PackID): Promise<WriteConfirmation> {
		// try removing submission data if exists too
		this.submissionRepo.delete(packId).catch(() => {});

		// remove associated contributions
		return contributions
			.search([
				{
					field: "pack",
					criteria: "==",
					value: packId,
				},
			])
			.then((contribs) => contributions.removeBulk(contribs.map((c) => c[ID_FIELD])))
			.then(() => packs.remove(packId));
	}
}
