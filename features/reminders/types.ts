export type DueDatePreset = "today" | "tomorrow" | "week" | "custom";
export type ReminderTTL = "day" | "week" | "month";

export interface Reminder {
	id: string;
	text: string;
	createdAt: string;
	dueDate: string;
	expiresAt?: string;
	ttl?: ReminderTTL | string;
}
