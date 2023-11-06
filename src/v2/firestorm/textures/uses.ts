import firestorm from "firestorm-db";
import { Paths, Texture } from "~/v2/interfaces";
import config from "../config";

import { textures } from ".";
import { paths } from "./paths";

config();

export const uses = firestorm.collection("uses", (el) => {
	el.getTexture = (): Promise<Texture> => textures.get(el.textureID);

	el.getPaths = (): Promise<Paths> =>
		paths.search([
			{
				field: "use",
				criteria: "==",
				value: el[firestorm.ID_FIELD],
			},
		]);

	return el;
});
