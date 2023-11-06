import firestorm from "firestorm-db";
import { OldPaths, OldTexture } from "~/v2/tools/mapping/textures";
import config from "../config";

import { textures } from ".";
import { paths } from "./paths";

config();

export const uses = firestorm.collection("uses", (el) => {
	el.texture = (): Promise<OldTexture> => textures.get(el.textureID);

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
