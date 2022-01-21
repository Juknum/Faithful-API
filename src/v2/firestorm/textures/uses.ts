import firestorm from "firestorm-db";
import config from "../config";
config();

import textures from ".";
import paths from "./paths";
import { Paths, Texture } from "~/v2/interfaces";

export default firestorm.collection("uses", (el) => {
	el.texture = (): Promise<Texture> => {
		return textures.get(el.textureID);
	};

	el.paths = (): Promise<Paths> => {
		return paths.search([
			{
				field: "useID",
				criteria: "==",
				value: el[firestorm.ID_FIELD],
			},
		]);
	};

	return el;
});
