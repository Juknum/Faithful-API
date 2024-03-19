import firestorm from "firestorm-db";
import { Paths, FirestormUse } from "../../interfaces";
import "../config";
import { paths } from "./paths";

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
