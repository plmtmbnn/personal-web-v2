"use server";

import { redis } from "@/lib/core/redis";
import { checkAdmin } from "@/features/auth/actions";
import { revalidatePath } from "next/cache";
import type { Reminder, ReminderTTL } from "./types";
import { resolveDueDate } from "./utils";

const KEY_PREFIX = "admin:reminder:";
const REMINDER_SET_KEY = "admin:reminder:ids";
const NINETY_DAYS_SECONDS = 90 * 86400;

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
	await Promise.all([
		redis.set(key, JSON.stringify(reminder), { ex: NINETY_DAYS_SECONDS }),
		redis.sadd(REMINDER_SET_KEY, id),
	]);

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

	await Promise.all([
		redis.del(`${KEY_PREFIX}${id}`),
		redis.srem(REMINDER_SET_KEY, id),
	]);
	revalidatePath("/admin/reminders");
	return { success: true };
}

export async function getReminderCount(): Promise<number> {
	const isAdmin = await checkAdmin();
	if (!isAdmin) return 0;

	try {
		let count = (await redis.scard(REMINDER_SET_KEY)) || 0;
		if (count === 0) {
			// Self-seed from existing keys if set is not initialized yet
			const keys = await redis.keys(`${KEY_PREFIX}*`);
			if (keys.length > 0) {
				const ids = keys.map((k) => k.replace(KEY_PREFIX, ""));
				if (ids.length > 0) {
					await redis.sadd(REMINDER_SET_KEY, ids[0], ...ids.slice(1));
					count = ids.length;
				}
			}
		}
		return count;
	} catch (err) {
		console.error("Error in getReminderCount:", err);
		return 0;
	}
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
