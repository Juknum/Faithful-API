import { readdir, readFile, unlink, writeFile } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"

const CACHE_DURATION = 86400000 // ONE_DAY

const REWRITE_INDEX = 0
const WRITE_INDEX = 0
const VALUE_INDEX = 1

const folder = (): string => tmpdir()

const key_to_path = (key: string): string => {
	const p = join(folder(), `cache-${key}.json`)
	return p
}

export default {
	read(key: string): Promise<[boolean, any]> {
		return readFile(key_to_path(key))
			.then(content => {
				const json = JSON.parse(content.toString())
				const timestamp_str = Object.keys(json)[0]
				const timestamp = Number.parseInt(timestamp_str, 10)

				return [(new Date().getTime() - timestamp) > CACHE_DURATION, json[timestamp_str]]
			})
	},
	write(key: string, value: any): Promise<void> {
		const json = {}
		json[new Date().getTime()] = value
		return writeFile(key_to_path(key), JSON.stringify(json))
	},

	handle<T>(key: string, callback: () => T): T {
		return this.read(key)
			.catch(() => Promise.all([true, callback()]))
			.then((results: [boolean, any]) => {
				// get new value if outdated
				if(results[REWRITE_INDEX]) {
					return Promise.all([true, callback()])
				}
				return Promise.all(results)
			})
			.then((results: [boolean, any]) => {
				const value = results[VALUE_INDEX]
				// write if told
				if(results[WRITE_INDEX]) {
					return this.write(key, value)
						.then(() => Promise.resolve(value))
				}
				return Promise.resolve(value)
			})
	},
	purge() {
		const REGEX = /cache-[.]\.json$/
		readdir(folder())
			.then(entries => Promise.all(
				entries
					.filter(f => REGEX.test(f))
					.map(f => unlink(f))
			))
	}
}