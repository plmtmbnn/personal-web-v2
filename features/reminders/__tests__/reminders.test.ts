import { describe, it, expect, vi, beforeEach } from "vitest";
import {
	addReminder,
	getReminders,
	deleteReminder,
	getReminderCount,
} from "../actions";
import { redis } from "@/lib/core/redis";
import { checkAdmin } from "@/features/auth/actions";
import { revalidatePath } from "next/cache";

vi.mock("@/lib/core/redis", () => ({
	redis: {
		set: vi.fn(),
		keys: vi.fn(),
		mget: vi.fn(),
		del: vi.fn(),
		sadd: vi.fn(),
		scard: vi.fn(),
		srem: vi.fn(),
	},
}));

vi.mock("@/features/auth/actions", () => ({
	checkAdmin: vi.fn(),
}));

vi.mock("next/cache", () => ({
	revalidatePath: vi.fn(),
}));

describe("Reminders Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("addReminder()", () => {
		it("throws error if caller is not an admin", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(false);
			await expect(addReminder("test note")).rejects.toThrow("Unauthorized");
			expect(redis.set).not.toHaveBeenCalled();
		});

		it("throws error if reminder exceeds 150 characters", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(true);
			const longText = "a".repeat(151);
			await expect(addReminder(longText)).rejects.toThrow(
				"Reminder text exceeds 150 characters limit",
			);
			expect(redis.set).not.toHaveBeenCalled();
		});

		it("saves reminder to Redis with default today due date and 90-day retention", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(true);
			vi.mocked(redis.set).mockResolvedValue("OK" as any);

			const result = await addReminder("Buy milk");

			expect(result.success).toBe(true);
			expect(result.reminder.text).toBe("Buy milk");
			expect(result.reminder.dueDate).toBeDefined();
			expect(redis.set).toHaveBeenCalledWith(
				expect.stringMatching(/^admin:reminder:/),
				expect.any(String),
				{ ex: 90 * 86400 },
			);
			expect(revalidatePath).toHaveBeenCalledWith("/admin/reminders");
		});

		it("saves reminder with tomorrow, week, and custom due date correctly", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(true);
			vi.mocked(redis.set).mockResolvedValue("OK" as any);

			const resTomorrow = await addReminder("Review sprint", "tomorrow");
			expect(resTomorrow.reminder.dueDate).toBeDefined();

			const resWeek = await addReminder("Renew domain", "week");
			expect(resWeek.reminder.dueDate).toBeDefined();

			const resCustom = await addReminder("Quarterly taxes", "2026-11-15");
			expect(resCustom.reminder.dueDate).toContain("2026-11-15");
		});
	});

	describe("getReminders()", () => {
		it("returns empty array if not admin", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(false);
			const reminders = await getReminders();
			expect(reminders).toEqual([]);
		});

		it("returns empty array if no keys in Redis", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(true);
			vi.mocked(redis.keys).mockResolvedValue([]);

			const reminders = await getReminders();
			expect(reminders).toEqual([]);
			expect(redis.mget).not.toHaveBeenCalled();
		});

		it("returns sorted reminders by dueDate ascending", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(true);
			vi.mocked(redis.keys).mockResolvedValue([
				"admin:reminder:1",
				"admin:reminder:2",
			]);

			const reminder1 = {
				id: "1",
				text: "Later",
				createdAt: "2026-08-24T10:00:00.000Z",
				dueDate: "2026-08-30T23:59:59.000Z",
			};
			const reminder2 = {
				id: "2",
				text: "Urgent",
				createdAt: "2026-08-24T10:00:00.000Z",
				dueDate: "2026-08-25T23:59:59.000Z",
			};

			vi.mocked(redis.mget).mockResolvedValue([
				JSON.stringify(reminder1),
				reminder2,
			]);

			const reminders = await getReminders();
			expect(reminders).toHaveLength(2);
			expect(reminders[0]?.id).toBe("2"); // Due sooner
			expect(reminders[1]?.id).toBe("1");
		});
	});

	describe("deleteReminder()", () => {
		it("throws unauthorized if not admin", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(false);
			await expect(deleteReminder("123")).rejects.toThrow("Unauthorized");
			expect(redis.del).not.toHaveBeenCalled();
		});

		it("deletes key and revalidates path for admin", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(true);
			vi.mocked(redis.del).mockResolvedValue(1 as any);

			const result = await deleteReminder("rem-123");
			expect(result).toEqual({ success: true });
			expect(redis.del).toHaveBeenCalledWith("admin:reminder:rem-123");
			expect(revalidatePath).toHaveBeenCalledWith("/admin/reminders");
		});
	});

	describe("getReminderCount()", () => {
		it("returns 0 if not admin", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(false);
			const count = await getReminderCount();
			expect(count).toBe(0);
		});

		it("returns count from scard if admin and set has items", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(true);
			vi.mocked(redis.scard).mockResolvedValue(5 as any);

			const count = await getReminderCount();
			expect(count).toBe(5);
			expect(redis.scard).toHaveBeenCalledWith("admin:reminder:ids");
		});

		it("falls back to self-seeding keys if scard is 0", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(true);
			vi.mocked(redis.scard).mockResolvedValue(0 as any);
			vi.mocked(redis.keys).mockResolvedValue([
				"admin:reminder:k1",
				"admin:reminder:k2",
			]);
			vi.mocked(redis.sadd).mockResolvedValue(2 as any);

			const count = await getReminderCount();
			expect(count).toBe(2);
			expect(redis.keys).toHaveBeenCalledWith("admin:reminder:*");
			expect(redis.sadd).toHaveBeenCalledWith("admin:reminder:ids", "k1", "k2");
		});
	});
});
