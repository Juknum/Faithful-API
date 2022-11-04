import firestorm from "firestorm-db";
import { Texture, User } from "~/v2/interfaces";
import { users } from "..";
import { textures } from ".";
import config from "../config";

config();

export const contributions = firestorm.collection("contributions", (el) => {
	el.getContributors = (): Promise<User> =>
		users.searchKeys(el.contributors || []);
	el.getTexture = (): Promise<Texture> => textures.get(el.textureID);

	return el;
});
