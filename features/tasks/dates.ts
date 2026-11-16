import { addDays, format, parseISO } from "date-fns";

export function getJakartaDateString(date: Date = new Date()): string {
	return date.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

// Calendar arithmetic uses local midnight of the Jakarta calendar date, not the current instant.
export function jakartaToday() {
	return parseISO(getJakartaDateString());
}

export function jakartaMidnight(date: string) {
	return new Date(`${date}T00:00:00+07:00`).toISOString();
}

export function nextDate(date: string, days = 1) {
	return format(addDays(parseISO(date), days), "yyyy-MM-dd");
}

export function isTaskDate(value: unknown): value is string {
	return (
		typeof value === "string" &&
		/^\d{4}-\d{2}-\d{2}$/.test(value) &&
		!Number.isNaN(parseISO(value).getTime()) &&
		format(parseISO(value), "yyyy-MM-dd") === value
	);
}

export function completionWeekOffset(value: unknown) {
	const offset = Number(value || 0);
	return Number.isInteger(offset) && offset <= 0 && offset >= -520 ? offset : 0;
}
