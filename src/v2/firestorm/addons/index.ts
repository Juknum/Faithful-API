import firestorm from "firestorm-db";
import { FirestormAddon, AddonAll, Files } from "~/v2/interfaces";
import config from "../config";
import { files } from "../posts/files";

config();

export const addons = firestorm.collection<FirestormAddon>("addons", (el) => {
	el.getFiles = (): Promise<Files> =>
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

	el.all = (): Promise<AddonAll> =>
		el.getFiles().then((f) => ({
			...el,
			files: f,
		}));

	return el;
});
