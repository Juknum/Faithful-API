import { URL } from "url";
import { APIEmbedField, RESTPostAPIChannelMessageJSONBody } from "discord-api-types/v10";
import axios from "axios";
import { UserProfile } from "../interfaces/users";
import {
	Addons,
	Addon,
	AddonStatus,
	AddonAll,
	AddonRepository,
	Files,
	File,
	FileParent,
} from "../interfaces";
import { BadRequestError, NotFoundError } from "../tools/ApiError";
import { UserService } from "./user.service";
import { FileService } from "./file.service";
import {
	AddonCreationParam,
	AddonDataParam,
	AddonReview,
	AddonStatsAdmin,
	AddonStatusApproved,
} from "../interfaces/addons";
import AddonFirestormRepository from "../repository/firestorm/addon.repository";

// filter & keep only values that are in a-Z & 0-9 & _ or -
function to_slug(value: string) {
	return value
		.split("")
		.filter((c) => /[a-zA-Z0-9_-]/.test(c))
		.join("");
}

export default class AddonService {
	private readonly userService: UserService = new UserService();

	private readonly fileService: FileService = new FileService();

	private readonly addonRepo: AddonRepository = new AddonFirestormRepository();

	/**
	 * Util method to get id from
	 * @param id_or_slug ID or slug of the requested add-on
	 */
	public async getIdFromPath(id_or_slug: string): Promise<[number, Addon | undefined]> {
		const int_id: number = parseInt(id_or_slug, 10);

		// if slug
		if (Number.isNaN(int_id) || int_id.toString() !== id_or_slug) {
			const addon = await this.getAddonBySlug(id_or_slug);
			if (!addon) throw new NotFoundError("Addon not found");
			return [addon.id as number, addon];
		}

		// else if id
		return [int_id, undefined];
	}

	public async getAddonFromSlugOrId(id_or_slug: string): Promise<[number, Addon]> {
		const idAndAddon = await this.getIdFromPath(id_or_slug);
		const id = idAndAddon[0];
		let addon = idAndAddon[1];

		if (!addon) addon = await this.getAddon(id);
		if (!addon) throw new NotFoundError("Addon not found");

		return [id, addon];
	}

	public async getApprovedAddonFromSlugOrId(id_or_slug: string): Promise<[number, Addon]> {
		const [id, addon] = await this.getAddonFromSlugOrId(id_or_slug);
		if (addon.approval.status === "approved") return [id, addon];

		throw new NotFoundError("This add-on is not publicly available");
	}

	getRaw(): Promise<Record<string, Addon>> {
		return this.addonRepo.getRaw();
	}

	getAddon(id: number): Promise<Addon> {
		if (Number.isNaN(id) || id < 0)
			return Promise.reject(new Error("Addons IDs are integer greater than 0"));
		return this.addonRepo.getAddonById(id);
	}

	getAddonAuthors(id: number): Promise<Array<string>> {
		return this.getAddon(id).then((addon: Addon) => addon.authors);
	}

	getAddonAuthorsProfiles(id_or_slug: string): Promise<UserProfile[]> {
		return this.getAddonFromSlugOrId(id_or_slug).then(([, addon]) =>
			this.userService.getUserProfiles(addon.authors),
		);
	}

	getFiles(id: number): Promise<Files> {
		if (Number.isNaN(id) || id < 0)
			return Promise.reject(new Error("Addons IDs are integer greater than 0"));
		return this.addonRepo.getFilesById(id);
	}

	getAll(id: number): Promise<AddonAll> {
		if (Number.isNaN(id) || id < 0)
			return Promise.reject(new Error("Addons IDs are integer greater than 0"));

		return Promise.all([this.getAddon(id), this.getFiles(id)]).then((results) => ({
			...results[0],
			files: results[1],
		}));
	}

	getStats(asAdmin: boolean): Promise<AddonStatsAdmin> {
		return this.getRaw().then((entries) => {
			let values = Object.values(entries);

			if (!asAdmin) values = values.filter((a) => a.approval.status === AddonStatusApproved);

			return values.reduce(
				(acc, val) => {
					acc[val.approval.status]++;
					val.options.tags.forEach((t) => {
						acc.numbers[t] = (acc.numbers[t] || 0) + 1;
					});
					return acc;
				},
				{
					approved: 0,
					pending: 0,
					denied: 0,
					archived: 0,
					numbers: {},
				} as AddonStatsAdmin,
			);
		});
	}

	async getScreenshotsFiles(id): Promise<Files> {
		return this.getFiles(id).then(
			(files: Files) => files.filter((f: File) => f.use === "screenshot" || f.use === "carousel"), // TODO: only keep screenshots
		);
	}

	async getScreenshotsIds(id): Promise<Array<string>> {
		return this.getScreenshotsFiles(id).then((files: Files) =>
			Object.values(files).map((f: File) => f.id),
		);
	}

	async getScreenshots(id): Promise<Array<string>> {
		return this.getScreenshotsFiles(id).then((files: Files) =>
			Object.values(files).map((f: File) => f.source),
		);
	}

	async getScreenshotURL(id: number, index: number): Promise<string> {
		const files = await this.getFiles(id);

		// if no files, not found
		if (files === undefined) {
			throw new NotFoundError("Files not found");
		}

		const screenshotFile = files.filter((f) => f.use === "screenshot" || f.use === "carousel")[
			index
		]; // TODO: only keep screenshots

		// if no header file, not found
		if (screenshotFile === undefined) {
			throw new NotFoundError("File not found");
		}

		const src = screenshotFile.source;
		const final = src.startsWith("/") ? process.env.DB_IMAGE_ROOT + src : src;

		return final;
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

	getAddonBySlug(slug: string): Promise<Addon | undefined> {
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
		// authentication was already made
		// tag values have already been verified

		// remove double authors
		body.authors = body.authors.filter((v, i, a) => a.indexOf(v) === i);

		// verify existing authors
		// return value not interesting
		const authors = await Promise.all(
			body.authors.map((authorID) => this.userService.getUserById(authorID)),
		).catch(() => {
			throw new BadRequestError("One author ID or more don't exist");
		});

		authors.forEach((author) => {
			if (!author.username) {
				throw new BadRequestError("All authors must have a username");
			}
		});

		// get the slug
		const slugValue = to_slug(body.name);

		// throw if already existing
		const existingAddon = await this.getAddonBySlug(slugValue);
		if (existingAddon) {
			throw new BadRequestError("The slug corresponding to this addon name already exists");
		}

		const { downloads } = body;
		delete body.downloads;

		const addonDataParams = body as AddonDataParam;

		const addon: Addon = {
			...addonDataParams,
			last_updated: new Date().getTime(),
			slug: slugValue,
			approval: {
				status: "pending",
				author: null,
				reason: null,
			},
		};

		let addonCreated: Addon;
		let addonCreatedId: string | number;
		return this.addonRepo
			.create(addon)
			.then((savedAddon) => {
				addonCreated = savedAddon;
				addonCreatedId = savedAddon.id;

				const files: Files = [];
				downloads.forEach((d) => {
					d.links.forEach((link) => {
						files.push({
							name: d.key,
							use: "download",
							type: "url",
							parent: {
								type: "addons",
								id: String(addonCreatedId),
							},
							source: link,
						});
					});
				});

				return Promise.all(files.map((file) => this.fileService.addFile(file)));
			})
			.then(async () => {
				addonCreated.id = addonCreatedId;
				await this.notifyAddonChange(addonCreated, null).catch(console.error);
				return addonCreated;
			});
	}

	async update(id: number, body: AddonCreationParam, reason: string): Promise<Addon> {
		// authentication was already made
		// tag values have already been verified

		// remove double authors
		body.authors = body.authors.filter((v, i, a) => a.indexOf(v) === i);

		// verify existing authors
		// return value not interesting
		const authors = await Promise.all(
			body.authors.map((authorID) => this.userService.getUserById(authorID)),
		).catch(() => {
			throw new BadRequestError("One author ID or more don't exist");
		});

		authors.forEach((author) => {
			if (!author.username) {
				throw new BadRequestError("All authors must have a username");
			}
		});

		const { downloads } = body;
		delete body.downloads;

		const files: Files = [];
		downloads.forEach((d) => {
			d.links.forEach((link) => {
				files.push({
					name: d.key,
					use: "download",
					type: "url",
					parent: {
						type: "addons",
						id: String(id),
					},
					source: link,
				});
			});
		});

		await this.fileService
			.removeFilesByParentAndUse(
				{
					type: "addons",
					id: String(id),
				},
				"download",
			)
			.catch((err) => {
				throw new BadRequestError(err);
			});

		const addonDataParams: AddonDataParam = body;
		const savedAddon = await this.getAddon(id);
		const before = savedAddon.approval.status;
		const addon: Addon = {
			...savedAddon,
			...addonDataParams,
			last_updated: new Date().getTime(),
			approval: {
				status: "pending",
				author: null,
				reason,
			},
		};

		// update addon, reupload download links
		return Promise.all([this.saveUpdate(id, addon, before), this.fileService.addFiles(files)]).then(
			(results) => results[0],
		);
	}

	public async postHeader(
		id_or_slug: string,
		filename: string,
		buffer: Buffer,
	): Promise<void | File> {
		// get addonID
		const id_and_addon = await this.getAddonFromSlugOrId(id_or_slug);
		const addon_id = id_and_addon[0];
		const addon = id_and_addon[1];
		const { slug } = addon;

		const before = addon.approval?.status || null;
		// try to remove curent header
		await this.deleteHeader(String(addon_id), false).catch(() => {});

		const extension = filename.split(".").pop();
		const uploadLocation = `/images/addons/${slug}/header.${extension}`;

		// reput pending addon
		addon.approval = {
			status: "pending",
			author: null,
			reason: null,
		};
		await this.saveUpdate(addon_id, addon, before);

		// upload file
		await this.fileService.upload(uploadLocation, filename, buffer, true);

		const newFile: File = {
			name: "header",
			use: "header",
			parent: {
				id: String(addon_id),
				type: "addons",
			},
			type: "url",
			source: uploadLocation,
		};

		// add file to db
		// returns file id
		newFile.id = await this.fileService.addFile(newFile);

		return newFile;
	}

	public async postScreenshot(
		id_or_slug: string,
		filename: string,
		buffer: Buffer,
	): Promise<void | File> {
		// get addonID
		const id_and_addon = await this.getAddonFromSlugOrId(id_or_slug);
		const addon_id = id_and_addon[0];
		const addon = id_and_addon[1];
		const { slug } = addon;

		const before = addon.approval?.status || null;

		// new random name based on time and random part
		const newName = new Date().getTime().toString(36) + Math.random().toString(36).slice(2);

		const extension = filename.split(".").pop();
		const uploadLocation = `/images/addons/${slug}/${newName}.${extension}`;

		// reput pending addon
		addon.approval = {
			status: "pending",
			author: null,
			reason: null,
		};
		await this.saveUpdate(addon_id, addon, before);

		// upload file
		await this.fileService.upload(uploadLocation, filename, buffer, true);

		const newFile: File = {
			name: `screen${newName}`,
			use: "screenshot",
			parent: {
				id: String(addon_id),
				type: "addons",
			},
			type: "url",
			source: uploadLocation,
		};

		// add file to db
		newFile.id = await this.fileService.addFile(newFile);

		return newFile;
	}

	public async delete(id: number): Promise<void> {
		const parent: FileParent = {
			type: "addons",
			id: String(id),
		};

		const files = await this.getFiles(id);

		const realFiles = files
			.filter((f) => f.use === "carousel" || f.use === "header" || f.use === "screenshot")
			.map((f) => f.source.replace(/^http[s]?:\/\/.+?\//, ""))
			.map((s) => this.fileService.removeFileByPath(s));

		// remove addon
		// rmeove addon links
		// remove real files
		const deletePromises = [
			this.addonRepo.delete(id),
			this.fileService.removeFilesByParent(parent),
			...realFiles,
		];

		return Promise.allSettled(deletePromises).then(() => {});
	}

	async review(id: number, review: AddonReview): Promise<void> {
		const addon = await this.getAddon(id);

		const before = addon.approval?.status || null;

		addon.approval = review;

		this.saveUpdate(id, addon, before);
	}

	/**
	 * Deletes the given screenshot at given index
	 * @param id_or_slug ID or slug of the deleted add-on screenshot
	 * @param index_or_slug Deleted add-on screenshot index or slug
	 */
	public async deleteScreenshot(id_or_slug: string, index_or_slug: number | string): Promise<void> {
		// get addonID
		const [addon_id] = await this.getAddonFromSlugOrId(id_or_slug);

		// get existing screenshots
		const files = await this.getFiles(addon_id).catch((): Files => []);
		const screens = files.filter((f) => f.use === "screenshot" || f.use === "carousel");

		// find precise screen, by id else by index
		const idedscreen = screens.filter((s) => s.id && s.id === String(index_or_slug))[0];
		const screen = idedscreen || screens[index_or_slug];
		if (screen === undefined) return Promise.reject(new NotFoundError("Screenshot not found"));

		let { source } = screen;

		// delete eventual url beginning
		try {
			source = new URL(source).pathname;
		} catch (_error) {
			// don't worry it's not important, you tried
		}

		// remove file from file service
		await this.fileService.removeFileById(screen.id);

		// remove actual file
		await this.fileService.remove(source);

		return Promise.resolve();
	}

	/**
	 * Deletes the given screenshot at given index
	 * @param id_or_slug ID or slug of the deleted add-on screenshot
	 */
	public async deleteHeader(id_or_slug: string, notify: Boolean = true): Promise<void> {
		// get addonID
		const id_and_addon = await this.getAddonFromSlugOrId(id_or_slug);
		const addon_id = id_and_addon[0];
		const addon = id_and_addon[1];

		const before = addon.approval?.status || null;

		addon.approval = {
			reason: null,
			author: null,
			status: "pending",
		};

		// get existing screenshots
		const files = await this.getFiles(addon_id).catch((): Files => []);
		const header = files.filter((f) => f.use === "header")[0];

		if (header === undefined) return Promise.reject(new NotFoundError("Header not found"));

		let { source } = header;

		// delete eventual url beginning
		try {
			source = new URL(source).pathname;
		} catch (_error) {
			// don't worry it's not important, you tried
		}

		// reput pending addon
		addon.approval = {
			status: "denied",
			author: null,
			reason: "Add-on must have a header image",
		};
		await this.saveUpdate(addon_id, addon, before, notify);

		// remove file from file service
		await this.fileService.removeFileById(header.id);

		// remove actual file
		await this.fileService.remove(source);

		return Promise.resolve();
	}

	private saveUpdate(
		id: number,
		addon: Addon,
		before: AddonStatus,
		notify: Boolean = true,
	): Promise<Addon> {
		return this.addonRepo.update(id, addon).then(async (a) => {
			if (notify) await this.notifyAddonChange(a, before).catch(console.error);
			return a;
		});
	}

	private async notifyAddonChange(addon: Addon, before: AddonStatus): Promise<void> {
		const { status } = addon.approval;
		// webhook not set up or status hasn't changed
		if (!process.env.WEBHOOK_URL || before === status) return;

		let title: string;
		let name: string;
		if (status === "pending") {
			title = `${addon.name} is pending approval!`;
			name = "Add-on Update";
		} else {
			const usernameApproval = (addon.approval.author
				? await this.userService.getUserById(addon.approval.author).catch(() => undefined)
				: undefined) || { username: "an unknown user" };
			title = `${addon.name} was ${status} by ${usernameApproval.username}!`;
			name = "Add-on Review";
		}

		let reason: APIEmbedField[];
		if (status !== "approved")
			reason = [
				{
					name: "Reason",
					value: addon.approval.reason ?? "*No reason provided*",
				},
			];

		const payload: RESTPostAPIChannelMessageJSONBody = {
			embeds: [
				{
					title,
					url: `https://webapp.faithfulpack.net/#/review/addons?status=${status}&id=${String(
						addon.id,
					)}`,
					author: {
						name,
						icon_url:
							"https://raw.githubusercontent.com/Faithful-Resource-Pack/Branding/main/role%20icons/14%20-%20Add-On%20Maker.png",
					},
					fields: reason,
					color: 7784773,
				},
			],
		};

		await axios.post(process.env.WEBHOOK_URL, payload);
	}
}
