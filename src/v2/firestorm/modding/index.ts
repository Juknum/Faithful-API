import firestorm from "firestorm-db";
import { FirestormMod } from "~/v2/interfaces";
import config from "../config";

config();

export const mods = firestorm.collection<FirestormMod>("mods");
