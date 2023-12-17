import firestorm from "firestorm-db";
import { Paths, FirestormUse } from "~/v2/interfaces";
import config from "../config";
import { paths } from "./paths";

config();

export const uses = firestorm.collection<FirestormUse>("uses", (el) => {
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
