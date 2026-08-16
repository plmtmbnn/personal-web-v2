import { describe, it, expect } from "vitest";
import {
	parseCronExpression,
	humanizeCron,
	getNextExecutions,
	formatRelativeTime,
} from "../utils/cron-parser";
import { getPlatformExports, CRON_PRESETS } from "../utils/cron-presets";

describe("parseCronExpression", () => {
	it("parses valid standard 5-part cron expressions", () => {
		const res1 = parseCronExpression("* * * * *");
		expect(res1.validation.isValid).toBe(true);
		expect(res1.parts).toEqual({
			minute: "*",
			hour: "*",
			dayOfMonth: "*",
			month: "*",
			dayOfWeek: "*",
		});

		const res2 = parseCronExpression("*/15 9-17 1,15 1-12 1-5");
		expect(res2.validation.isValid).toBe(true);
		expect(res2.parts?.minute).toBe("*/15");
		expect(res2.parts?.hour).toBe("9-17");
	});

	it("supports text aliases for months (JAN-DEC) and days (MON-FRI)", () => {
		const res = parseCronExpression("0 12 1 JAN,JUN,DEC MON-FRI");
		expect(res.validation.isValid).toBe(true);
	});

	it("rejects expressions with incorrect token count", () => {
		expect(parseCronExpression("* * *").validation.isValid).toBe(false);
		expect(parseCronExpression("* * * * * *").validation.isValid).toBe(false);
		expect(parseCronExpression("").validation.isValid).toBe(false);
	});

	it("rejects out-of-bounds field values", () => {
		// Minute 60 is invalid (0-59)
		expect(parseCronExpression("60 * * * *").validation.isValid).toBe(false);
		// Hour 24 is invalid (0-23)
		expect(parseCronExpression("0 24 * * *").validation.isValid).toBe(false);
		// Month 13 is invalid (1-12)
		expect(parseCronExpression("0 0 1 13 *").validation.isValid).toBe(false);
		// Inverted range 10-5 is invalid
		expect(parseCronExpression("10-5 * * * *").validation.isValid).toBe(false);
	});
});

describe("humanizeCron", () => {
	it("humanizes wildcard cron expression", () => {
		expect(humanizeCron("* * * * *")).toBe("Every minute, every day");
	});

	it("humanizes interval minute cron expression", () => {
		const text = humanizeCron("*/5 * * * *");
		expect(text).toContain("Every 5 minutes");
	});

	it("humanizes fixed time and weekday schedules", () => {
		const text = humanizeCron("0 9 * * 1-5");
		expect(text).toContain("9:00 AM");
		expect(text).toContain("Monday through Friday");
	});

	it("humanizes monthly schedule with day of month", () => {
		const text = humanizeCron("30 8 1 * *");
		expect(text).toContain("8:30 AM");
		expect(text).toContain("day 1 of the month");
	});

	it("returns error description on invalid cron", () => {
		const text = humanizeCron("invalid cron string");
		expect(text).toContain("Expected 5 fields");
	});
});

describe("getNextExecutions", () => {
	it("calculates future execution dates matching the schedule", () => {
		const baseDate = new Date(2026, 0, 1, 10, 0, 0); // Jan 1, 2026 10:00:00
		const executions = getNextExecutions("0 12 * * *", 5, baseDate);

		expect(executions).toHaveLength(5);
		for (const item of executions) {
			expect(item.timestamp).toBeGreaterThan(baseDate.getTime());
			const date = new Date(item.timestamp);
			expect(date.getMinutes()).toBe(0);
			expect(date.getHours()).toBe(12);
		}
	});

	it("handles every 15 minutes step correctly", () => {
		const baseDate = new Date(2026, 5, 10, 8, 2, 0);
		const executions = getNextExecutions("*/15 * * * *", 4, baseDate);

		expect(executions).toHaveLength(4);
		const firstDate = new Date(executions[0]?.timestamp || 0);
		expect(firstDate.getMinutes()).toBe(15);
		expect(firstDate.getHours()).toBe(8);

		const secondDate = new Date(executions[1]?.timestamp || 0);
		expect(secondDate.getMinutes()).toBe(30);
	});
});

describe("formatRelativeTime", () => {
	it("formats relative durations properly", () => {
		const now = new Date(2026, 0, 1, 12, 0, 0);
		const in30s = new Date(2026, 0, 1, 12, 0, 30);
		const in5m = new Date(2026, 0, 1, 12, 5, 0);
		const in2h = new Date(2026, 0, 1, 14, 0, 0);

		expect(formatRelativeTime(in30s, now)).toBe("in 30s");
		expect(formatRelativeTime(in5m, now)).toBe("in 5m");
		expect(formatRelativeTime(in2h, now)).toBe("in 2h");
	});
});

describe("CRON_PRESETS and getPlatformExports", () => {
	it("has comprehensive curated presets", () => {
		expect(CRON_PRESETS.length).toBeGreaterThanOrEqual(10);
		const everyMin = CRON_PRESETS.find((p) => p.cron === "* * * * *");
		expect(everyMin).toBeDefined();
	});

	it("generates platform snippets with embedded cron expression", () => {
		const cron = "0 9 * * 1-5";
		const snippets = getPlatformExports(cron);

		expect(snippets).toHaveLength(5);
		const gh = snippets.find((s) => s.id === "github-actions");
		expect(gh?.snippet).toContain(cron);

		const vercel = snippets.find((s) => s.id === "vercel");
		expect(vercel?.snippet).toContain(cron);

		const k8s = snippets.find((s) => s.id === "kubernetes");
		expect(k8s?.snippet).toContain(cron);
	});
});
