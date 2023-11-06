import firestorm from "firestorm-db";
import { Users } from "~/v2/interfaces";
import { users } from "..";
import { textures } from ".";
import config from "../config";
import { OldTexture } from "~/v2/tools/mapping/textures";

config();

export const contributions = firestorm.collection("contributions", (el) => {
	el.getContributors = (): Promise<Users> => users.searchKeys(el.contributors || []);
	el.getTexture = (): Promise<OldTexture> => textures.get(el.textureID);

	return el;
});
