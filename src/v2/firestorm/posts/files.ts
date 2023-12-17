import firestorm from "firestorm-db";
import { FirestormFile } from "~/v2/interfaces";
import config from "../config";

config();

export const files = firestorm.collection<FirestormFile>("files");
