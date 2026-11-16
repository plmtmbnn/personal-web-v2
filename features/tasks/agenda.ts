import { addDays, addMonths, format, parseISO, startOfWeek } from "date-fns";
import type { Task } from "./types";
import { completionWeekOffset, getJakartaDateString } from "./dates";

export function inUpcomingRange(task: Task, day: string, range: string) {
	if (range === "all") return true;
	const scheduled =
		task.start_date && task.start_date > task.due_date
			? task.start_date
			: task.due_date;
	const limit = format(
		range === "month" ? addMonths(parseISO(day), 1) : addDays(parseISO(day), 7),
		"yyyy-MM-dd",
	);
	return scheduled >= day && scheduled <= limit;
}

export function inCompletionWeek(task: Task, day: string, offset: unknown) {
	const start = addDays(
		startOfWeek(parseISO(day), { weekStartsOn: 1 }),
		completionWeekOffset(offset) * 7,
	);
	const completed = task.completed_at
		? getJakartaDateString(new Date(task.completed_at))
		: task.due_date;
	return (
		completed >= format(start, "yyyy-MM-dd") &&
		completed < format(addDays(start, 7), "yyyy-MM-dd")
	);
}
