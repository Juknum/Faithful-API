import firestorm from "firestorm-db";
import config from "./config";
import { WebsitePost } from "../interfaces";

config();

export const posts = firestorm.collection<WebsitePost>("posts");
