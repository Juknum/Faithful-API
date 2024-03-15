import { WriteConfirmation } from "firestorm-db";
import { BadRequestError } from "../tools/ApiError";
import UseService from "./use.service";
import { InputPath, Path, PathNewVersionParam, Paths } from "../interfaces";
import PathFirestormRepository from "../repository/path.repository";
import TextureService from "./texture.service";
import { settings } from "../firestorm";

export default class PathService {
	private readonly useService: UseService;

	constructor();

	constructor(useService: UseService);

	constructor(...args: any[]) {
		// eslint-disable-next-line prefer-destructuring
		if (args.length > 0) this.useService = args[0];
		else this.useService = new UseService(this);
	}

	private readonly repo = new PathFirestormRepository();

	getRaw(): Promise<Record<string, Path>> {
		return this.repo.getRaw();
	}

	getPathByUseId(useID: string): Promise<Paths> {
		return this.repo.getPathUseById(useID);
	}

	getPathsByUseIdsAndVersion(useIDs: string[], version: string): Promise<Paths> {
		return this.repo.getPathsByUseIdsAndVersion(useIDs, version);
	}

	createPath(path: InputPath): Promise<Path> {
		// verify use existence
		return this.useService
			.getUseByIdOrName(path.use) // verify use existence
			.then(() => this.repo.createPath(path));
	}

	createMultiplePaths(paths: InputPath[]): Promise<Paths> {
		return this.repo.createPathBulk(paths);
	}

	getPathById(id: string): Promise<Path> {
		return this.repo.getPathById(id);
	}

	updatePathById(id: string, path: Path): Promise<Path> {
		if (id !== path.id) throw new BadRequestError("Updated ID is different from ID");

		return this.useService
			.getUseByIdOrName(path.use) // verify use existence
			.then(() => this.repo.updatePath(id, path));
	}

	async modifyVersion(oldVersion: string, newVersion: string): Promise<{ success: boolean[] }> {
		const allVersions = await settings.get("versions");
		const edition = Object.entries(allVersions).find((v) => v[1].includes(oldVersion))?.[0];

		settings.editField({
			id: "versions",
			field: edition,
			operation: "set",
			// map old version to new version, keep the rest the same
			value: allVersions[edition].map((v: string) => (v === oldVersion ? newVersion : v)),
		});

		return this.repo.modifyVersion(oldVersion, newVersion);
	}

	async addVersion(body: PathNewVersionParam): Promise<{ success: boolean[] }> {
		const versions = await TextureService.getInstance().getVersionByEdition(body.edition);

		// check existing version to the paths provided
		if (!versions.includes(body.version))
			return Promise.reject(new BadRequestError("Incorrect input path version provided"));

		const versionArray: string[] = (await settings.get("versions"))[body.edition];

		// add to start of array, array-push would add to end and mess up ordering otherwise
		versionArray.unshift(body.newVersion);

		settings.editField({
			id: "versions",
			field: body.edition,
			operation: "set",
			value: versionArray,
		});

		return this.repo.addNewVersionToVersion(body.version, body.newVersion);
	}

	removePathById(pathID: string): Promise<WriteConfirmation> {
		return this.repo.removePathById(pathID);
	}

	removePathByBulk(pathIDs: string[]): Promise<WriteConfirmation> {
		return this.repo.removePathsByBulk(pathIDs);
	}
}
