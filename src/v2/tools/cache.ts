import { readdir, readFile, unlink, writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { existsSync, mkdirSync } from "fs";

const NO_CACHE = process.env.NO_CACHE === "true";

const CACHE_DURATION = 86400000; // one day

const REWRITE_INDEX = 0;
const WRITE_INDEX = 0;
const VALUE_INDEX = 1;

const folder = () => {
	const path = join(tmpdir(), "faithful_api");
	if (!existsSync(path)) mkdirSync(path, { recursive: true });
	return path;
};

const keyToPath = (key: string): string => {
	const escapedKey = key.replace(/(\/|\\)/g, "-");
	const p = join(folder(), `cache-${escapedKey}.json`);
	return p;
};

export default {
	read(key: string): Promise<[boolean, any]> {
		if (NO_CACHE) return Promise.reject();

		return readFile(keyToPath(key)).then((content) => {
			const json = JSON.parse(content.toString());
			const timestampStr = Object.keys(json)[0];
			const timestamp = Number(timestampStr);

			return [new Date().getTime() - timestamp > CACHE_DURATION, json[timestampStr]];
		});
	},
	write(key: string, value: any): Promise<void> {
		const json = {};
		json[new Date().getTime()] = value;
		return writeFile(keyToPath(key), JSON.stringify(json));
	},
	delete(key: string): Promise<void> {
		const path = keyToPath(key);
		return unlink(path);
	},
	handle<T>(key: string, callback: () => T): T {
		return this.read(key)
			.catch(() => Promise.all([true, callback()]))
			.then((results: [boolean, any]) => {
				// get new value if outdated
				if (results[REWRITE_INDEX]) return Promise.all([true, callback()]);
				return Promise.all(results);
			})
			.then((results: [boolean, any]) => {
				const value = results[VALUE_INDEX];
				// write if told
				if (results[WRITE_INDEX]) {
					return this.write(key, value)
						.then(() => Promise.resolve(value))
						.catch((...args) => {
							console.error(...args);
							return value;
						});
				}
				return Promise.resolve(value);
			});
	},
	purge(pattern?: RegExp): Promise<void[]> {
		let regex = /cache-.+\.json$/;
		if (pattern) {
			const p = pattern.toString().split("/")[1];
			regex = new RegExp(`cache-${p}\.json$`);
		}
		return readdir(folder()).then((entries) =>
			Promise.all(entries.filter((f) => regex.test(f)).map((f) => unlink(join(folder(), f)))),
		);
	},
};
