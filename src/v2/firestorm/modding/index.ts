import firestorm from "firestorm-db";
import { FirestormMod } from "~/v2/interfaces";
import "../config";

export const mods = firestorm.collection<FirestormMod>("mods");
