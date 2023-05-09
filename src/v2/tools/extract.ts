/* eslint-disable func-names */
/* eslint-disable no-restricted-syntax */
export function extract<T>(properties: Record<keyof T, true>) {
	return function <TActual extends T>(value: TActual) {
		const result = {} as T;
		for (const property of Object.keys(properties) as Array<keyof T>) {
			result[property] = value[property];
		}
		return result;
	};
}

export function filterRecord<T>(data: Record<string, T>, predicate: (val: T) => boolean): Record<string, T> {
	return Object.keys(data).reduce((acc, current) => {
		if (predicate(data[current])) {
			acc[current] = data[current];
		}
		return acc;
	}, {});
}
