import firestorm from "firestorm-db";
import "./config";

// no defined set of keys that can exist at any point in time
export const settings = firestorm.collection<Record<string, any>>("settings");
