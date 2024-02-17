import { Collection } from "firestorm-db";

/**
 * Get all existing values for a given Firestorm field
 * @author Evorp
 * @param collection collection to search
 * @param field field to search
 * @param flatten flatten array fields before merging duplicates
 * @returns unique values
 */
export const selectDistinct = <T>(collection: Collection<T>, field: keyof T, flatten = false) =>
	collection
		.select({ fields: [field] })
		.then((res) => Object.values(res).map((el) => el[field]))
		.then((values) => (flatten ? values.flat() : values))
		.then((values: any[]) => [...new Set(values)]);
