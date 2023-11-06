import firestorm from "firestorm-db";
import { Texture, Use } from "~/v2/interfaces";
import config from "../config";

import { uses } from "./uses";

config();

export const paths = firestorm.collection("paths", (el) => {
	el.getUse = async (): Promise<Use> => uses.get(el.useID);

	el.getTexture = (): Promise<Texture> =>
		new Promise((resolve, reject) => {
			el.getUse()
				.then((use) => resolve(use.getTexture()))
				.catch((err) => {
					reject(err);
				});
		});

	return el;
});
