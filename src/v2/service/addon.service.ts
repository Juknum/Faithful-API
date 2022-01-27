import { BadRequestError } from "./../tools/ApiError";
import { UserService } from "./user.service";
import { Addons, Addon, AddonAll, AddonRepository, Files, File } from "../interfaces";
import { AddonCreationParam, AddonDataParam } from "../interfaces/addons";
import AddonFirestormRepository from "../repository/firestorm/addon.repository";
import { NotFoundError } from "../tools/ApiError";

function to_slug(value: string) {
	return value.split(" ").join("_");
}

export default class AddonService {
	private readonly userService: UserService = new UserService();
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

		return this.addonRepo.create(addon);
	}

	public delete(id: number) {
		return this.addonRepo.delete(id);
	}
}
