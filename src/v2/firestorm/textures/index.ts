import firestorm from "firestorm-db";
import config from "../config";
config();

import uses from "./uses";
import { contributions } from "..";
import {  Paths, Uses, Contributions, TextureAll, Path, Use } from "~/v2/interfaces";
import { mapContributions, mapPaths, mapTexture, mapUses } from "../../tools/mapping/textures";
import { KnownPacks } from "~/v2/interfaces/textures";
import settings from "../settings";

export default firestorm.collection("textures", (el) => {
	el.uses = async (): Promise<Uses> => {
		return uses
			.search([
				{
					field: "textureID", // todo: (DATA 2.0) to be replaced by texture
					criteria: "==",
					value: el[firestorm.ID_FIELD],
				},
			])
			.then(mapUses); // todo: (DATA 2.0) remove after database rewrite
	};

	el.paths = async (): Promise<Paths> => {
		return el.uses()
			.then(_uses => Promise.all(_uses.map((_use) => uses.get(_use.id).then(u => u.paths()))))
			.then(arr => arr.flat())
			.then(mapPaths); // todo: (DATA 2.0) remove after database rewrite
	};

	el.url = async (pack: KnownPacks, version: string): Promise<string> => {
		// https://raw.githubusercontent.com/Compliance-Resource-Pack/App/main/resources/transparency.png  // fallback image
		// https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Java-32x/Jappa-1.18.1/assets/minecraft/textures/block/acacia_door_bottom.png

		let urls: string;
		let path: Path;
		let use: Use;


		return settings.read_raw()
			.then((settings: { [key: string]: any }) => {
				urls = settings.repositories.raw[pack];
				return el.paths();
			})
			.then((_paths: Paths) => {
				path = _paths.filter((p: Path) => p.versions.includes(version))[0];

				//! to be removed once repository are named correctly (without Jappa- in each branch)
				switch (pack) {
					case "c32":
					case "c64":
						if (version !== "dungeons-latest") version = `Jappa-${version}`
						break;
				
					default:
						break;
				}

				return el.uses();
			})
			.then((_uses: Uses) => {
				use = _uses.filter((u: Use) => u.id === path.use)[0];
				return `${urls[use.edition]}${version}/${use.assets === null ? path.name : `assets/${use.assets}/${path.name}`}`;
			})
			.catch(err => {
				console.error(err);
				// fallback image
				return 'https://raw.githubusercontent.com/Compliance-Resource-Pack/App/main/resources/transparency.png';
			})
	}

	el.contributions = async (): Promise<Contributions> => {
		return contributions
			.search([
				{
					field: "textureID", // todo: to be replaced by texture
					criteria: "==",
					value: parseInt(el[firestorm.ID_FIELD], 10),
				},
			])
			.then(mapContributions); // todo: (DATA 2.0) remove after database rewrite
	};

	el.all = async (): Promise<TextureAll> => {
		let output = mapTexture(el) as any;
		return el
			.uses()
			.then((uses) => {
				output.uses = uses;
				return el.paths();
			})
			.then((paths) => {
				output.paths = paths;
				return el.contributions();
			})
			.then((contributions) => {
				output.contributions = contributions;
				return output;
			});
	};

	return el;
});
