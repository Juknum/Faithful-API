import firestorm from "firestorm-db";
import { FirestormMod } from "~/v2/interfaces";
import config from "../config";

config();

// no extra methods here so no need for a custom FirestormMod type
export const mods = firestorm.collection<FirestormMod>("mods");
