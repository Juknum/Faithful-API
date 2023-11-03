import firestorm from "firestorm-db";
import { Texture } from "~/v2/interfaces";
import { OldUse } from "~/v2/tools/mapping/textures";
import config from "../config";

import { uses } from "./uses";

config();

export const paths = firestorm.collection("paths", (el) => {
	el.use = async (): Promise<OldUse> => uses.get(el.useID);

	el.texture = (): Promise<Texture> =>
		new Promise((resolve, reject) => {
			el.use()
				.then((use) => resolve(use.texture()))
				.catch((err) => {
					reject(err);
				});
		});

	return el;
});
