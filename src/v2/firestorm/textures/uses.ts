import firestorm from "firestorm-db";
import { Texture } from "~/v2/interfaces";
import config from "../config";

import { textures } from ".";
import { paths } from "./paths";
import { OldPaths } from "~/v2/tools/mapping/textures";

config();

export const uses = firestorm.collection("uses", (el) => {
	el.texture = (): Promise<Texture> => textures.get(el.textureID);

	el.paths = (): Promise<OldPaths> =>
		paths.search([
			{
				field: "useID",
				criteria: "==",
				value: el[firestorm.ID_FIELD],
			},
		]);

	return el;
});
