export type ReminderTTL = "day" | "week" | "month";

export interface Reminder {
	id: string;
	text: string;
	createdAt: string;
	expiresAt: string;
	ttl: ReminderTTL;
}
