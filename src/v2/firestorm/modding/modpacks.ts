import firestorm from "firestorm-db";
import { FirestormModpack } from "~/v2/interfaces";
import config from "../config";

config();

export const modpacks = firestorm.collection<FirestormModpack>("modpacks");
