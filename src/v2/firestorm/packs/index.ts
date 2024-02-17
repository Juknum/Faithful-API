import firestorm from "firestorm-db";
import { FirestormPack } from "~/v2/interfaces";
import "../config";
import { submissions } from "./submissions";

export const packs = firestorm.collection<FirestormPack>("packs", (el) => {
	el.submission = () => submissions.get(el[firestorm.ID_FIELD]);
	return el;
});
