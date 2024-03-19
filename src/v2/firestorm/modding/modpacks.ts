import firestorm from "firestorm-db";
import { FirestormModpack } from "../../interfaces";
import "../config";

export const modpacks = firestorm.collection<FirestormModpack>("modpacks");
