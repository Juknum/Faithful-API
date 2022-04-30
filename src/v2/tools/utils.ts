const WEEK_LENGTH = 604800000;
export function lastWeek() {
	return new Date(+(new Date()) - WEEK_LENGTH);
}

const MONTH_LENGTH = 2629800000;
export function lastMonth() {
	return new Date(+(new Date()) - MONTH_LENGTH);
}