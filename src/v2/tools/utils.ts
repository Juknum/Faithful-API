export const WEEK_LENGTH = 604800000;
export function lastWeek() {
	return new Date(new Date().getTime() - WEEK_LENGTH);
}

export const MONTH_LENGTH = 2629800000;
export function lastMonth() {
	return new Date(new Date().getTime() - MONTH_LENGTH);
}

export const DAY_LENGTH = 86400000;
export function lastDay() {
	return new Date(new Date().getTime() - DAY_LENGTH);
}

export function startOfDay(date: Date | number) {
	const result = new Date(date);
	result.setHours(0, 0, 0, 0);
	return result;
}
