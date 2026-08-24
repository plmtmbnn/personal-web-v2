"use server";

import { redis } from "@/lib/core/redis";
import { checkAdmin } from "@/features/auth/actions";
import { revalidatePath } from "next/cache";
import type { Reminder, ReminderTTL } from "./types";

const TTL_SECONDS = {
	day: 86400,
	week: 604800,
	month: 2592000,
};

const KEY_PREFIX = "admin:reminder:";

export async function addReminder(text: string, ttl: ReminderTTL = "day") {
	const isAdmin = await checkAdmin();
	if (!isAdmin) throw new Error("Unauthorized");

	if (text.length > 150) {
		throw new Error("Reminder text exceeds 150 characters limit");
	}

	const id = crypto.randomUUID();
	const key = `${KEY_PREFIX}${id}`;
	const now = Date.now();
	const expiresAt = now + TTL_SECONDS[ttl] * 1000;

	const reminder: Reminder = {
		id,
		text,
		createdAt: new Date(now).toISOString(),
		expiresAt: new Date(expiresAt).toISOString(),
		ttl,
	};

	await redis.set(key, JSON.stringify(reminder), { ex: TTL_SECONDS[ttl] });

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
		.map((r) => (typeof r === "string" ? JSON.parse(r) : r))
		.sort(
			(a, b) =>
				new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
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
