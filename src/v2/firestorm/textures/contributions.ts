import firestorm from "firestorm-db";
import { FirestormContribution } from "~/v2/interfaces";
import config from "../config";

config();

export const contributions = firestorm.collection<FirestormContribution>("contributions");
