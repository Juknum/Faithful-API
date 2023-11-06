import firestorm from "firestorm-db";
import { OldTexture, OldUse } from "~/v2/tools/mapping/textures";
import config from "../config";

import { uses } from "./uses";

config();

export const paths = firestorm.collection("paths", (el) => {
	el.use = async (): Promise<OldUse> => uses.get(el.useID);

	el.texture = (): Promise<OldTexture> =>
		new Promise((resolve, reject) => {
			el.use()
				.then((use) => resolve(use.texture()))
				.catch((err) => {
					reject(err);
				});
		});

	return el;
});
