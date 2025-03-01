import firestorm from "firestorm-db";
import { FirestormMod, ModVersion } from "../../interfaces";
import { modsVersions } from "./mods-version"; 

import "../config";

export const mods = firestorm.collection<FirestormMod>("mods", (el) => {
	el.getModVersions = async (): Promise<ModVersion[]> => 
		modsVersions.search([
			{
				field: "mod",
				criteria: "==",
				value: el[firestorm.ID_FIELD],
			}
		]);

	return el;
});
