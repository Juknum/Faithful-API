import firestorm from "firestorm-db";
import config from "../config";
config();

import uses from "./uses";
import { contributions } from "..";
import { Texture, Paths, Uses, Contributions, TextureAll } from "~/v2/interfaces";
import { mapContributions, mapPaths, mapTexture, mapUses } from "../../tools/mapping/textures";

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
		return uses
			.search([
				{
					field: "textureID", // todo: to be replaced by texture
					criteria: "==",
					value: el[firestorm.ID_FIELD],
				},
			])
			.then((_uses) => {
				return Promise.all(_uses.map((use) => use.paths()));
			})
			.then((arr) => {
				return arr.flat();
			})
			.then(mapPaths); // todo: (DATA 2.0) remove after database rewrite
	};

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
