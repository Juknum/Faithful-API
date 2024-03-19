import firestorm from "firestorm-db";
import { FirestormFile } from "../../interfaces";
import "../config";

export const files = firestorm.collection<FirestormFile>("files");
