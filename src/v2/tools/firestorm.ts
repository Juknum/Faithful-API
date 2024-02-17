import { Collection } from "firestorm-db";

export const selectDistinct = <T>(collection: Collection<T>, field: keyof T, flatten = false) =>
	collection
		.select({ fields: [field] })
		.then((res) => Object.values(res).map((el) => el[field]))
		.then((values) => (flatten ? values.flat() : values))
		.then((values: any[]) => [...new Set(values)]);
