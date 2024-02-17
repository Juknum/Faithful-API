import firestorm from "firestorm-db";
import "./config";
import { FirestormPost } from "../interfaces";

export const posts = firestorm.collection<FirestormPost>("posts");
