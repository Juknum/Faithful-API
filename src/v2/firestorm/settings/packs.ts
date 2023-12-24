import firestorm from "firestorm-db";
import { FirestormPack } from "~/v2/interfaces";
import config from "../config";

config();

// no defined set of keys that can exist at any point in time
export const packs = firestorm.collection<FirestormPack>("packs");
