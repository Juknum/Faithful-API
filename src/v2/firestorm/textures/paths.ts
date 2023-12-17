import firestorm from "firestorm-db";
import { FirestormPath } from "~/v2/interfaces";
import config from "../config";

config();

export const paths = firestorm.collection<FirestormPath>("paths");
