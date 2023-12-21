import { BadRequestError } from "../tools/ApiError";
import UseService from "./use.service";
import { InputPath, Path, PathNewVersionParam, PathRepository, Paths } from "../interfaces";
import PathFirestormRepository from "../repository/firestorm/path.repository";
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

	private readonly repository: PathRepository = new PathFirestormRepository();

	getRaw(): Promise<Record<string, Path>> {
		return this.repository.getRaw();
	}

	getPathByUseId(use_id: string): Promise<Paths> {
		return this.repository.getPathUseById(use_id);
	}

	async createPath(path: InputPath): Promise<Path> {
		// verify use existence
		return this.useService
			.getUseByIdOrName(path.use) // verify use existence
			.then(() => this.repository.createPath(path));
	}

	async createMultiplePaths(paths: InputPath[]): Promise<Path[]> {
		return this.repository.createPathBulk(paths);
	}

	getPathById(id: string): Promise<Path> {
		return this.repository.getPathById(id);
	}

	updatePathById(id: string, path: Path) {
		if (id !== path.id) throw new BadRequestError("Updated ID is different from ID");

		return this.useService
			.getUseByIdOrName(path.use) // verify use existence
			.then(() => this.repository.updatePath(id, path));
	}

	modifyVersion(old_version: string, new_version: string): void | PromiseLike<void> {
		return this.repository.modifyVersion(old_version, new_version);
	}

	async addVersion(body: PathNewVersionParam): Promise<void> {
		const versions = await TextureService.getInstance().getVersionByEdition(body.edition);

		// check existing version to the paths provided
		if (!versions.includes(body.version))
			return Promise.reject(new BadRequestError("Incorrect input path version provided"));

		settings.editField({
			id: "versions",
			field: body.edition,
			operation: "array-push",
			value: body.newVersion,
		});

		return this.repository.addNewVersionToVersion(body.version, body.newVersion);
	}

	removePathById(path_id: string): Promise<void> {
		return this.repository.removePathById(path_id);
	}

	removePathByBulk(path_ids: string[]): Promise<void> {
		return this.repository.removePathsByBulk(path_ids);
	}
}
