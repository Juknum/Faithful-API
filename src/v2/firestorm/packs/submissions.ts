import firestorm from "firestorm-db";
import { FirestormSubmission } from "~/v2/interfaces";
import config from "../config";

config();

export const submissions = firestorm.collection<FirestormSubmission>("submissions");
