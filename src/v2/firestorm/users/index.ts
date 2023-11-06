import firestorm from "firestorm-db";
import { Contributions, Addons } from "~/v2/interfaces";
import { contributions } from "..";
import { addons } from "../addons";
import config from "../config";

config();

export const users = firestorm.collection("users", (el) => {
	el.contributions = async (): Promise<Contributions> =>
		await contributions.search([
			{
				field: "authors",
				criteria: "array-contains",
				value: el[firestorm.ID_FIELD],
			},
		]);

	el.addons = async (): Promise<Addons> =>
		addons.search([
			{
				field: "authors",
				criteria: "array-contains",
				value: el[firestorm.ID_FIELD],
			},
		]);

	return el;
});
