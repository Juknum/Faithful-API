import firestorm from "firestorm-db";
import { FirestormPath } from "../../interfaces";
import "../config";

export const paths = firestorm.collection<FirestormPath>("paths");
