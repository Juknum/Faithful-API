import firestorm from "firestorm-db";
import config from "../config";

config();

export const mods = firestorm.collection("mods");