import firestorm from "firestorm-db";
import { FirestormSubmission } from "../../interfaces";
import "../config";

export const submissions = firestorm.collection<FirestormSubmission>("submissions");
