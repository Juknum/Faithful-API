import firestorm from "firestorm-db";
import config from "./config";
import { FirestormPost } from "../interfaces";

config();

export const posts = firestorm.collection<FirestormPost>("posts");
