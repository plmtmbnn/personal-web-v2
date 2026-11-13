import { z } from "zod";

export const reminderTextSchema = z.string().trim().min(1).max(150);
export const reminderIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
export const reminderDueSchema = z
	.string()
	.trim()
	.refine((value) => {
		if (["today", "tomorrow", "day", "week", "month"].includes(value)) {
			return true;
		}
		return !Number.isNaN(new Date(value).getTime());
	}, "Invalid reminder due date");
export const reminderTtlSchema = z.enum(["day", "week", "month"]);

/**
 * Calculates target ISO due date based on preset or explicit date string.
 */
export function resolveDueDate(dueDateOrPreset?: string): string {
	const now = new Date();
	if (
		!dueDateOrPreset ||
		dueDateOrPreset === "today" ||
		dueDateOrPreset === "day"
	) {
		const endOfToday = new Date(now);
		endOfToday.setHours(23, 59, 59, 999);
		return endOfToday.toISOString();
	}
	if (dueDateOrPreset === "tomorrow") {
		const tomorrow = new Date(now);
		tomorrow.setDate(tomorrow.getDate() + 1);
		tomorrow.setHours(23, 59, 59, 999);
		return tomorrow.toISOString();
	}
	if (dueDateOrPreset === "week") {
		const nextWeek = new Date(now);
		nextWeek.setDate(nextWeek.getDate() + 7);
		nextWeek.setHours(23, 59, 59, 999);
		return nextWeek.toISOString();
	}
	if (dueDateOrPreset === "month") {
		const nextMonth = new Date(now);
		nextMonth.setDate(nextMonth.getDate() + 30);
		nextMonth.setHours(23, 59, 59, 999);
		return nextMonth.toISOString();
	}

	const parsed = new Date(dueDateOrPreset);
	if (!Number.isNaN(parsed.getTime())) {
		return parsed.toISOString();
	}

	throw new Error("Invalid reminder due date");
}
