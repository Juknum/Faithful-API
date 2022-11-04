import firestorm from "firestorm-db";
import config from "../config";

config();

export const modpacks = firestorm.collection("modpacks");
