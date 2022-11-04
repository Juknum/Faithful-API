import firestorm from "firestorm-db";
import config from "../config";

config();

export const files = firestorm.collection("files", (el) => el);
