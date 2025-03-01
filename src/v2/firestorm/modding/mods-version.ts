import firestorm from "firestorm-db";
import { FirestormModVersion } from "../../interfaces";
import { mods } from ".";
import "../config";

export const modsVersions = firestorm.collection<FirestormModVersion>("mods-versions", (el) => {
	el.getMod = async () => mods.get(el.mod);

	return el;
});