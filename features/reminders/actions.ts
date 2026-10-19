"use server";

import { redis } from "@/lib/core/redis";
import { checkAdmin } from "@/features/auth/actions";
import { revalidatePath } from "next/cache";
import type { Reminder, ReminderTTL } from "./types";

const KEY_PREFIX = "admin:reminder:";
const NINETY_DAYS_SECONDS = 90 * 86400;

/**
 * Calculates target ISO due date based on preset or explicit date string.
 */
function resolveDueDate(dueDateOrPreset?: string): string {
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

	// If explicit date string (e.g. "2026-10-25" or ISO string)
	const parsed = new Date(dueDateOrPreset);
	if (!Number.isNaN(parsed.getTime())) {
		return parsed.toISOString();
	}

	const fallback = new Date(now);
	fallback.setHours(23, 59, 59, 999);
	return fallback.toISOString();
}

export async function addReminder(
	text: string,
	dueDateOrPreset: string = "today",
) {
	const isAdmin = await checkAdmin();
	if (!isAdmin) throw new Error("Unauthorized");

	if (text.length > 150) {
		throw new Error("Reminder text exceeds 150 characters limit");
	}

	const id = crypto.randomUUID();
	const key = `${KEY_PREFIX}${id}`;
	const now = Date.now();
	const dueDate = resolveDueDate(dueDateOrPreset);

	const reminder: Reminder = {
		id,
		text: text.trim(),
		createdAt: new Date(now).toISOString(),
		dueDate,
		expiresAt: dueDate,
		ttl: dueDateOrPreset as ReminderTTL,
	};

	// 90-day retention so overdue tasks remain visible until checked off
	await redis.set(key, JSON.stringify(reminder), { ex: NINETY_DAYS_SECONDS });

	revalidatePath("/admin/reminders");
	return { success: true, reminder };
}

export async function getReminders(): Promise<Reminder[]> {
	const isAdmin = await checkAdmin();
	if (!isAdmin) return [];

	const keys = await redis.keys(`${KEY_PREFIX}*`);
	if (keys.length === 0) return [];

	const rawReminders = await redis.mget(...keys);

	const reminders: Reminder[] = rawReminders
		.filter((r): r is string | object => !!r)
		.map((r) => {
			const item = typeof r === "string" ? JSON.parse(r) : r;
			return {
				...item,
				dueDate: item.dueDate || item.expiresAt || new Date().toISOString(),
			};
		})
		.sort(
			(a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
		);

	return reminders;
}

export async function deleteReminder(id: string) {
	const isAdmin = await checkAdmin();
	if (!isAdmin) throw new Error("Unauthorized");

	await redis.del(`${KEY_PREFIX}${id}`);
	revalidatePath("/admin/reminders");
	return { success: true };
}

export async function getReminderCount(): Promise<number> {
	const isAdmin = await checkAdmin();
	if (!isAdmin) return 0;

	const keys = await redis.keys(`${KEY_PREFIX}*`);
	return keys.length;
}

export async function extendReminder(id: string, extendBy: ReminderTTL) {
	const isAdmin = await checkAdmin();
	if (!isAdmin) throw new Error("Unauthorized");

	const key = `${KEY_PREFIX}${id}`;
	const rawReminder = await redis.get(key);
	if (!rawReminder) throw new Error("Reminder not found");

	const reminder: Reminder =
		typeof rawReminder === "string" ? JSON.parse(rawReminder) : rawReminder;

	const currentDue = new Date(
		reminder.dueDate || reminder.expiresAt || Date.now(),
	).getTime();
	const baseTime = Math.max(Date.now(), currentDue);
	const addedDays = extendBy === "day" ? 1 : extendBy === "week" ? 7 : 30;
	const newDueDate = new Date(
		baseTime + addedDays * 86400 * 1000,
	).toISOString();

	const updatedReminder: Reminder = {
		...reminder,
		dueDate: newDueDate,
		expiresAt: newDueDate,
	};

	await redis.set(key, JSON.stringify(updatedReminder), {
		ex: NINETY_DAYS_SECONDS,
	});

	revalidatePath("/admin/reminders");
	return { success: true, reminder: updatedReminder };
}
