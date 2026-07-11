export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskRecurrence = "none" | "daily" | "weekly" | "monthly";
export type TaskStatus =
	| "todo"
	| "in_progress"
	| "done"
	| "blocked"
	| "cancelled";

export interface Task {
	id: string;
	title: string;
	description: string | null;
	priority: TaskPriority;
	category: string | null;
	status: TaskStatus;
	due_date: string;
	recurrence: TaskRecurrence;
	position: number;
	reschedule_count: number;
	created_at: string;
	completed_at: string | null;
	// Phase 1 additions
	parent_id: string | null;
	estimated_minutes: number | null;
	tags: string[];
	// Phase 2 additions
	start_date: string | null;
	due_time: string | null;
	start_time: string | null;
	recurrence_origin_id: string | null;
	// Phase 3 additions
	archived_at: string | null;
}
