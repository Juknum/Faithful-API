import firestorm from "firestorm-db";
import { Texture, Use } from "~/v2/interfaces";
import config from "../config";
config();

import uses from "./uses";

export default firestorm.collection("paths", (el) => {
	el.use = async (): Promise<Use> => {
		return uses.get(el.useID);
	};

	el.texture = (): Promise<Texture> => {
		return new Promise((resolve, reject) => {
			el.use()
				.then((use) => {
					return resolve(use.texture());
				})
				.catch((err) => {
					reject(err);
				});
		});
	};

	return el;
});
