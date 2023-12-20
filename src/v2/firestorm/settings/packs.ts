import firestorm from "firestorm-db";
import config from "../config";
import { FirestormPack } from "~/v2/interfaces";

config();

// no defined set of keys that can exist at any point in time
export const packs = firestorm.collection<FirestormPack>("packs");
