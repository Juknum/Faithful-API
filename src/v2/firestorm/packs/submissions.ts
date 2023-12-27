import firestorm from "firestorm-db";
import config from "../config";
import { FirestormSubmission } from "~/v2/interfaces";

config();

export const submissions = firestorm.collection<FirestormSubmission>("submissions");
