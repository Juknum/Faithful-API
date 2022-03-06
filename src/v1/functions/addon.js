const { addons } = require("../firestorm/all");
const parseArr = require("../tools/parseArr");

module.exports = {
	get: function (id) {
		if (Number.isNaN(id) || id < 0) return Promise.reject(new Error("Addons IDs are integer greater than 0"));
		return addons.get(id);
	},
	files: function (id) {
		if (Number.isNaN(id) || id < 0) return Promise.reject(new Error("Addons IDs are integer greater than 0"));
		return addons
			.get(id)
			.then((addon) => addon.files(id))
			.then((files) => parseArr(files));
	},
	all: function (id) {
		if (Number.isNaN(id) || id < 0) return Promise.reject(new Error("Addons IDs are integer greater than 0"));
		let output;

		return this.get(id)
			.then((addon) => {
				output = addon;
				return this.files(id);
			})
			.then((files) => {
				output.files = files;
				return output;
			});
	},
};
