import { Mod, ModInfo, ModVersion } from "../interfaces";
import { modsVersions } from "../firestorm";

export default class ModsVersionsService {
	public async getRaw(): Promise<Record<string, ModVersion>> {
		return modsVersions.readRaw();
	}

	public async addModVersion(mod: Mod, modInfo: ModInfo): Promise<void> {
		const modVersions = await modsVersions.search([
			{ field: "mod", criteria: "==", value: mod.id },
			{ field: "version", criteria: "!=", value: modInfo.version },
		]);

		// a mod version with the same version already exists
		if (modVersions.length > 0) return;

		await modsVersions
			.add({
				mod: mod.id,
				version: modInfo.version,
				modLoaders: modInfo.loaders,
			})
			.then((id) => modsVersions.get(id));
	}
}