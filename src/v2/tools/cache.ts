import { readdir, readFile, unlink, writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { existsSync, mkdirSync } from "fs";

const NO_CACHE = process.env.NO_CACHE === "true";

const CACHE_DURATION = 86400000; // one day
const CACHE_FOLDER = "faithful_api";

const folder = () => {
	const path = join(tmpdir(), CACHE_FOLDER);
	if (!existsSync(path)) mkdirSync(path, { recursive: true });
	return path;
};

const keyToPath = (key: string): string => {
	const escapedKey = key.replace(/(\/|\\)/g, "-");
	return join(folder(), `cache-${escapedKey}.json`);
};

export interface CacheData<T> {
	/** Whether the data has expired */
	expired: boolean;
	/** Found data */
	data?: T;
}

/**
 * Asynchronously read a cache file
 * @param key cache key to read
 * @returns Found data and whether that data has expired
 */
export async function read<T>(key: string): Promise<CacheData<T>> {
	if (NO_CACHE) return Promise.reject();

	const content = await readFile(keyToPath(key), { encoding: "utf8" });
	const json: Record<number, T> = JSON.parse(content);
	const timestampStr = Object.keys(json)[0];
	const timestamp = Number(timestampStr);
	return {
		expired: new Date().getTime() - timestamp > CACHE_DURATION,
		data: json[timestampStr],
	};
}

/**
 * Purge API cache for a given pattern
 * @param pattern Purge a specific pattern/file (if not provided purge everything)
 */
export async function purge(pattern?: string | RegExp): Promise<void[]> {
	let regex = /cache-.+\.json$/;
	if (pattern !== undefined) {
		const p = typeof pattern === "string" ? pattern : pattern.toString().split("/")[1];
		regex = new RegExp(`cache-${p}.json$`);
	}
	const entries = await readdir(folder());

	// why is void[] a type
	return Promise.all(
		entries.filter((item) => regex.test(item)).map((item) => unlink(join(folder(), item))),
	);
}

/**
 * Asynchronously write a new cache file
 * @param key cache key to write
 * @param value data to write
 */
export function write(key: string, value: any): Promise<void> {
	const json = {};
	json[Date.now()] = value;
	return writeFile(keyToPath(key), JSON.stringify(json));
}

/**
 * Read cache and write if expired or doesn't exist using callback results
 * @param key key to write to/read from
 * @param callback fallback data to use
 * @returns found data
 */
export async function handle<T>(key: string, callback: () => T | Promise<T>): Promise<T> {
	const cacheData = await read<T>(key).catch<CacheData<T>>(() => ({
		// no cache file exists or cache is disabled, use callback to regenerate
		expired: true,
	}));

	// generate new data and write it if expired
	if (cacheData.expired || !cacheData.data) {
		cacheData.data = await callback();
		// write if cache enabled
		if (!NO_CACHE) write(key, cacheData.data).catch((...args) => console.error(...args));
	}

	return cacheData.data;
}
