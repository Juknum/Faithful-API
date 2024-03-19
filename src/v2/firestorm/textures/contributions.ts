import firestorm from "firestorm-db";
import { FirestormContribution } from "../../interfaces";
import "../config";

export const contributions = firestorm.collection<FirestormContribution>("contributions");
