import { addons } from "../firestorm";
import { Addon, AddonAll, Files } from "../interfaces";

export default {
	get: function (id: number): Promise<Addon> {
		if (isNaN(id) || id < 0) return Promise.reject(new Error("Addons IDs are integer greater than 0"));
		return addons.get(id);
	},
	getFiles: function (id: number): Promise<Files> {
		if (isNaN(id) || id < 0) return Promise.reject(new Error("Addons IDs are integer greater than 0"));
		return addons.get(id).then((addon) => addon.files());
	},
	getAll: function (id: number): Promise<AddonAll> {
		if (isNaN(id) || id < 0) return Promise.reject(new Error("Addons IDs are integer greater than 0"));
		return addons.get(id).then((addon) => addon.all());
	},

	// todo: implements setter with authentification verification
};
