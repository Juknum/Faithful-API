import firestorm from "firestorm-db";
import { FirestormAddon, AddonAll, Files } from "~/v2/interfaces";
import config from "../config";
import { files } from "../posts/files";

config();

export const addons = firestorm.collection<FirestormAddon>("addons", (el) => {
	el.files = (): Promise<Files> =>
		files.search([
			{
				field: "parent.id",
				criteria: "==",
				value: el[firestorm.ID_FIELD],
			},
			{
				field: "parent.type",
				criteria: "==",
				value: "addons",
			},
		]);

	el.all = (): Promise<AddonAll> => {
		// files isn't defined yet so ts throws an error before it gets set
		const output = el as any;
		return el.files().then((res) => {
			output.files = res;
			return output;
		});
	};

	return el;
});
