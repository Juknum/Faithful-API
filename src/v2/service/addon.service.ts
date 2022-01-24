import { Addons, Addon, AddonAll, AddonRepository, Files } from "../interfaces";
import AddonFirestormRepository from "../repository/firestorm/addon.repository";
import { NotFoundError } from "../tools/ApiError";

export default class AddonService {
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

	async getSreenshotURL(id: number, index: number): Promise<string> {
		const files = await this.getFiles(id);

		// if no files, not found
		if (files === undefined) {
			throw new NotFoundError("Files not found");
		}

		const screenshotFile = files.filter((f) => f.use === "screenshot" || (f as any).use === "carousel")[index];

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

	// todo: implements setter with authentification verification
}
