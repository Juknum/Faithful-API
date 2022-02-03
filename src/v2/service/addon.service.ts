import { BadRequestError } from "./../tools/ApiError";
import { UserService } from "./user.service";
import { FileService } from "./file.service";
import { Addons, Addon, AddonStatus, AddonAll, AddonRepository, Files, File, FileParent } from "../interfaces";
import { AddonCreationParam, AddonDataParam, AddonReview } from "../interfaces/addons";
import AddonFirestormRepository from "../repository/firestorm/addon.repository";
import { NotFoundError } from "../tools/ApiError";
import { FilesFirestormRepository } from "../repository/firestorm/files.repository";

function to_slug(value: string) {
	return value.split(" ").join("_");
}

export default class AddonService {
	private readonly userService: UserService = new UserService();
	private readonly fileService: FileService = new FileService();
	private readonly addonRepo: AddonRepository = new AddonFirestormRepository();

	getRaw(): Promise<Addons> {
		return this.addonRepo.getRaw();
	}

	getAddon(id: number): Promise<Addon> {
		if (isNaN(id) || id < 0) return Promise.reject(new Error("Addons IDs are integer greater than 0"));
		return this.addonRepo.getAddonById(id);
	}

	getFiles(id: number): Promise<Files> {
		if (isNaN(id) || id < 0) return Promise.reject(new Error("Addons IDs are integer greater than 0"));
		return this.addonRepo.getFilesById(id);
	}

	getAll(id: number): Promise<AddonAll> {
		if (isNaN(id) || id < 0) return Promise.reject(new Error("Addons IDs are integer greater than 0"));

		return Promise.all([this.getAddon(id), this.getFiles(id)]).then((results) => {
			return {
				...results[0],
				files: results[1],
			};
		});
	}

	async getScreenshots(id): Promise<Array<string>> {
		return this.getFiles(id)
			.then((files: Files) => {
				return files.filter((f: File) => f.use === "screenshot" || f.use === "carousel"); // todo: only keep screenshots
			})
			.then((files: Files) => {
				return Object.values(files).map((f: File) => f.source);
			});
	}

	async getSreenshotURL(id: number, index: number): Promise<string> {
		const files = await this.getFiles(id);

		// if no files, not found
		if (files === undefined) {
			throw new NotFoundError("Files not found");
		}

		const screenshotFile = files.filter((f) => f.use === "screenshot" || (f as any).use === "carousel")[index]; // todo: only keep screenshots

		// if no header file, not found
		if (screenshotFile === undefined) {
			throw new NotFoundError("File not found");
		}

		return screenshotFile.source;
	}

	async getHeaderFileURL(id: number): Promise<string> {
		const files = await this.getFiles(id);

		// if no files, not found
		if (files === undefined) {
			throw new NotFoundError("Files not found");
		}

		const headerFile = files.filter((f) => f.use === "header")[0];

		// if no header file, not found
		if (headerFile === undefined) {
			throw new NotFoundError("File not found");
		}

		return headerFile.source;
	}

	getAddonBySlug(slug: string): Promise<Addon> {
		return this.addonRepo.getAddonBySlug(slug);
	}

	getAddonByStatus(status: AddonStatus): Promise<Addons> {
		return this.addonRepo.getAddonByStatus(status);
	}

	/**
	 * Check body and adds a new addon
	 * @param body Body which will be controlled
	 * @returns {Addon | PromiseLike<Addon>} created addon
	 */
	async create(body: AddonCreationParam): Promise<Addon> {
		// authentification was already made
		// tag values have already been verified

		// remove double authors
		body.authors = body.authors.filter((v, i, a) => a.indexOf(v) === i);

		// verify existing authors
		// return value not interesting
		await Promise.all(body.authors.map((authorID) => this.userService.get(authorID))).catch((err) => {
			throw new BadRequestError("One author ID or more don't exist");
		});

		// get the slug
		const slugValue = to_slug(body.name);

		// throw if already existing
		const existingAddon = await this.getAddonBySlug(slugValue);
		if (!!existingAddon) {
			throw new BadRequestError("The slug corresponding to this addon name already exists");
		}

		const downloads = body.downloads;
		delete body.downloads;

		const addonDataParams = body as AddonDataParam;

		const addon: Addon = {
			...addonDataParams,
			slug: body.name.split(" ").join("_"),
			approval: {
				status: "pending",
				author: null,
				reason: null,
			},
		};

		let addonCreated: Addon;
		return this.addonRepo
			.create(addon)
			.then((addon) => {
				addonCreated = addon;
				const id = addon.id;

				let files: Files = [];
				downloads.forEach((d) => {
					const f: File = {
						name: d.key,
						use: "download",
						type: "url",
						parent: {
							type: "addons",
							id: String(id),
						},
						source: "",
					};
					d.links.forEach((link) => {
						f.source = link;
						files.push(f);
					});
				});

				return Promise.all(files.map((file) => this.fileService.addFile(file)));
			})
			.then(() => {
				return addonCreated;
			});
	}

	async update(id: number, body: AddonCreationParam): Promise<Addon> {
		// authentification was already made
		// tag values have already been verified

		// remove double authors
		body.authors = body.authors.filter((v, i, a) => a.indexOf(v) === i);

		// verify existing authors
		// return value not interesting
		await Promise.all(body.authors.map((authorID) => this.userService.get(authorID))).catch((err) => {
			throw new BadRequestError("One author ID or more don't exist");
		});

		const downloads = body.downloads;
		delete body.downloads;

		let files: Files = [];
		downloads.forEach((d) => {
			const f: File = {
				name: d.key,
				use: "download",
				type: "url",
				parent: {
					type: "addons",
					id: String(id),
				},
				source: "",
			};
			d.links.forEach((link) => {
				f.source = link;
				files.push(f);
			});
		});

		await this.fileService
			.removeFilesByParent({
				type: "addons",
				id: String(id),
			})
			.catch((err) => {
				throw new BadRequestError(err);
			});

		const addonDataParams: AddonDataParam = body;
		const addon: Addon = {
			...addonDataParams,
			slug: body.name.split(" ").join("_"),
			approval: {
				status: "pending",
				author: null,
				reason: null,
			},
		};

		// update addon, reupload download links
		return Promise.all([this.addonRepo.update(id, addon), ...files.map((file) => this.fileService.addFile(file))]).then(
			(results) => {
				return results[0];
			},
		);
	}

	public async delete(id: number): Promise<void> {
		const parent: FileParent = {
			type: "addons",
			id: String(id),
		};

		const files = await this.getFiles(id);

		const realFiles = files
			.filter((f) => f.use == "carousel" || f.use == "header" || f.use == "screenshot")
			.map((f) => f.source.replace(/^http[s]?:\/\/.+?\//, ""))
			.map((s) => this.fileService.removeFileByPath(s));

		// remove addon
		// rmeove addon links
		// remove real files
		const deletePromises = [this.addonRepo.delete(id), this.fileService.removeFilesByParent(parent), ...realFiles];

		return Promise.allSettled(deletePromises).then(() => {});
	}

	async review(id: number, review: AddonReview): Promise<void> {
		const addon = await this.getAddon(id);

		addon.approval = review;

		this.addonRepo.update(id, addon);
	}
}
