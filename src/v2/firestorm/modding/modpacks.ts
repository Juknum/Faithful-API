import firestorm from "firestorm-db";
import { FirestormModpack } from "~/v2/interfaces";
import "../config";

export const modpacks = firestorm.collection<FirestormModpack>("modpacks");
