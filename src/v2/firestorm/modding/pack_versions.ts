import firestorm from "firestorm-db";
import config from "../config";

config();

export const pack_versions = firestorm.collection("pack_versions");
