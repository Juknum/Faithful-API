/* eslint-disable no-await-in-loop */
import { CentralDirectory, Open as readJar } from "unzipper";
import TOML from "@ltd/j-toml";

import { Mod, ModInfo, MCModInfoObj, ModsToml, ModFabricJson, MulterFile, ModFabricJsonPerson, FirestormMod } from "../interfaces";
import { mods } from "../firestorm";
import ModsVersionsService from "./mods-versions.service";

export default class ModsService {
	private readonly modsVersionsService = new ModsVersionsService();

	public async getRaw(): Promise<Record<string, Mod>> {
		return mods.readRaw();
	}

	private isValidJar(jar: MulterFile): boolean {
		if (jar.mimetype !== "application/java-archive") return false;
		return true;
	}

	/**
	 * Extracts the mod information from the given jar file
	 * @param jar the jar file to extract the mod information from
	 * @returns the extracted mod information
	 */
	private async extractModInfo(jar: MulterFile): Promise<ModInfo[]> {
		const archive = await readJar.buffer(jar.buffer);

		// FORGE -- mcmod.info
		const modsInfo = archive.files.find((f) => f.path === "mcmod.info");
		if (modsInfo) {
			return modsInfo
				.buffer()
				.then((buffer) => JSON.parse(buffer.toString("utf-8").replaceAll("\n", "")))
				.then((json) => this.sanitizeMCModInfo(json, archive));
		}

		// FORGE -- mods.toml
		const modsToml = archive.files.find((f) => f.path.startsWith("META-INF/mods.toml"));
		if (modsToml) {
			return modsToml
				.buffer()
				.then((buffer) => TOML.parse(buffer.toString("utf-8"), '\n', false) as unknown as ModsToml)
				.then((toml) => this.sanitizeModsToml(toml, archive));
		}

		// FABRIC -- fabric.mod.json
		const fabricModJson = archive.files.find((f) => f.path === "fabric.mod.json");
		if (fabricModJson) {
			return fabricModJson
				.buffer()
				.then((buffer) => JSON.parse(buffer.toString("utf-8")))
				.then((json) => this.sanitizeFabricModJson(json, archive));
		}
	}

	/**
	 * Extracts the mod information from the given mcmod.info file
	 * @param mcModInfos the parsed mcmod.info file
	 * @param archive the jar archive to extract the mod logo from
	 * @returns the sanitized mod informations
	 */
	private async sanitizeMCModInfo(mcModInfos: MCModInfoObj, archive: CentralDirectory): Promise<ModInfo[]> {
		const modsInfosToParse = Array.isArray(mcModInfos) ? mcModInfos : mcModInfos.modList;
		const output: ModInfo[] = [];

		for (const modInfo of modsInfosToParse) {
			let logoBuffer: Buffer | undefined;
			if (modInfo.logoFile) {
				const logo = archive.files.find((file) => file.path === modInfo.logoFile);
				if (logo) logoBuffer = await logo.buffer();
			}

			output.push({
				name: modInfo.name ?? modInfo.modid,
				description: modInfo.description,
				authors: modInfo.authorList ?? [],
				modId: modInfo.modid,
				mcVersion: modInfo.mcversion === 'extension \'minecraft\' property \'mcVersion\'' || !modInfo.mcversion ? [] : [modInfo.mcversion],
				version: modInfo.version ?? 'unknown',
				loaders: ['FORGE'],
				url: modInfo.url,
				picture: logoBuffer,
			});
		}

		return output;
	}

	/**
	 * Extracts the mod information from the given mods.toml file
	 * @param modsToml the parsed mods.toml file
	 * @param archive the jar archive to extract the mod logo from
	 * @returns the sanitized mod informations
	 */
	private async sanitizeModsToml(modsToml: ModsToml, archive: CentralDirectory): Promise<ModInfo[]> {
		if (modsToml.modLoader !== 'javafml') {
			throw new Error(`Unsupported loader version: ${modsToml.modLoader}`);
		}

		const manifest = archive.files.find((file) => file.path === 'META-INF/MANIFEST.MF');
		const output: ModInfo[] = [];

		for (const mod of modsToml.mods) {
			// yes, it's written as a string template within the toml file
			// eslint-disable-next-line no-template-curly-in-string
			if (mod.version === "${file.jarVersion}" && manifest) {
				const buff = await manifest.buffer();
				const manifestContent = buff.toString('utf-8');
				const jarVersion = manifestContent.match(/Implementation-Version: (.*)/)?.[1];
				if (jarVersion) mod.version = jarVersion;
			}

			let logoBuffer: Buffer | undefined;
			if (mod.logoFile || modsToml.logoFile) {
				const logo = archive.files.find((file) => file.path === mod.logoFile || file.path === modsToml.logoFile);
				if (logo) logoBuffer = await logo.buffer();
			}

			output.push({
				name: mod.displayName ?? mod.namespace ?? mod.modId,
				description: mod.description,
				authors: mod.authors?.split(',') ?? [],
				modId: mod.modId,
				mcVersion: modsToml.dependencies.minecraft?.versionRange.slice(1, -1).split(',') ?? [],
				version: mod.version ?? 'unknown',
				loaders: ['FORGE'],
				url: mod.displayURL,
				picture: logoBuffer,
			});
		}

		return output;
	}

	/**
	 * Extracts the mod information from the given fabric.mod.json file
	 * @param fabricJson the parsed fabric.mod.json file
	 * @param archive the jar archive to extract the mod logo from
	 * @returns the sanitized mod informations
	 */
	private async sanitizeFabricModJson(fabricJson: ModFabricJson, archive: CentralDirectory): Promise<ModInfo[]> {
		const output: ModInfo[] = [];

		let logoBuffer: Buffer | undefined;
		if (fabricJson.icon && typeof fabricJson.icon === 'string') {
			const logo = archive.files.find((file) => file.path === fabricJson.icon);
			if (logo) logoBuffer = await logo.buffer();
		}

		const keepName = (person: ModFabricJsonPerson) => typeof person === 'string' ? person : person.name;

		output.push({
			name: fabricJson.name ?? fabricJson.id,
			description: fabricJson.description,
			authors: [
				...(fabricJson.authors?.map(keepName) ?? []),
				...(fabricJson.contributors?.map(keepName) ?? []),
			],
			modId: fabricJson.id,
			mcVersion: fabricJson.depends?.minecraft
				? [fabricJson.depends?.minecraft].flat()
				: [],
			version: fabricJson.version,
			loaders: ['FABRIC'],
			url: fabricJson.contact?.homepage,
			picture: logoBuffer,
		});

		return output;
	}

	/**
	 * Extracts the mod & mod version and the mod version textures from the given jar files
	 * and writes them to the database
	 * @param inputFiles 
	 * @returns 
	 */
	public async addMods(inputFiles: MulterFile[]): Promise<Mod[]> {
		const jars = inputFiles.filter((jar) => this.isValidJar(jar));
		const output: Mod[] = [];

		for (const jar of jars) {
			const modInfos = await this.extractModInfo(jar);
			
			for (const modInfo of modInfos) {
				let mod: FirestormMod | undefined = await mods
					.search([{ field: "modId", value: modInfo.modId, criteria: "==" }])
					.then((res) => res[0]);

				if (!mod) {
					mod = await mods.add({
						name: modInfo.name,
						modId: modInfo.modId,
						description: modInfo.description,
						authors: modInfo.authors,
						url: modInfo.url,
						picture: '',
					})
						.then((id) => mods.get(id));
				}

				this.modsVersionsService.addModVersion(mod, modInfo);

				output.push(mod);
			}
		}

		return output;
	}
	
}
