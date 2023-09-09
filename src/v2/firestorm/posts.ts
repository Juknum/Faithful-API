import firestorm from "firestorm-db";
import config from "./config";

config();

export const posts = firestorm.collection("posts");
