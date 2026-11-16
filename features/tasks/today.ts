import type { Task } from "./types";

export function todayGroups(tasks: Task[], day: string) {
	const groups: Record<
		"Overdue" | "Due today" | "In progress" | "Blocked",
		Task[]
	> = {
		Overdue: [],
		"Due today": [],
		"In progress": [],
		Blocked: [],
	};
	for (const task of tasks) {
		if (
			task.archived_at ||
			task.parent_id ||
			task.status === "done" ||
			task.status === "cancelled" ||
			(task.start_date && task.start_date > day)
		)
			continue;
		if (task.due_date > day && task.status !== "in_progress") continue;
		const group =
			task.status === "blocked"
				? "Blocked"
				: task.due_date < day
					? "Overdue"
					: task.due_date === day
						? "Due today"
						: "In progress";
		groups[group].push(task);
	}
	return groups;
}
