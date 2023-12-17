import firestorm from "firestorm-db";
import { FirestormModpack } from "~/v2/interfaces";
import config from "../config";

config();

// no extra methods here so no need for a custom FirestormModpack type
export const modpacks = firestorm.collection<FirestormModpack>("modpacks");
