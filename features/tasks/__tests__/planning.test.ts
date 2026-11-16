import { describe, expect, it } from "vitest";
import {
	completionWeekOffset,
	getJakartaDateString,
	isTaskDate,
	jakartaMidnight,
	nextDate,
} from "../dates";
import { todayGroups } from "../today";
import { taskFieldsSchema, taskIdsSchema } from "../validation";
import type { Task } from "../types";
import { inCompletionWeek, inUpcomingRange } from "../agenda";

describe("Jakarta task calendar", () => {
	it("changes dates at Jakarta midnight, including the Monday boundary", () => {
		expect(getJakartaDateString(new Date("2026-11-15T16:59:59Z"))).toBe(
			"2026-11-15",
		);
		expect(getJakartaDateString(new Date("2026-11-15T17:00:00Z"))).toBe(
			"2026-11-16",
		);
		expect(jakartaMidnight("2026-11-16")).toBe("2026-11-15T17:00:00.000Z");
		expect(jakartaMidnight(nextDate("2026-11-16"))).toBe(
			"2026-11-16T17:00:00.000Z",
		);
	});
	it("rejects malformed dates and bounds history navigation", () => {
		expect(isTaskDate("2026-02-30")).toBe(false);
		expect(isTaskDate("2026-11-16,status.eq.done")).toBe(false);
		expect(isTaskDate("2028-02-29")).toBe(true);
		expect(completionWeekOffset("-104")).toBe(-104);
		for (const value of ["NaN", "Infinity", "1", "-1.2", "-521"])
			expect(completionWeekOffset(value)).toBe(0);
	});
});

describe("Today planning", () => {
	it("uses the same completion week and future-start range in List and Board", () => {
		const completed = { completed_at: "2026-10-04T17:00:00Z" } as Task;
		expect(inCompletionWeek(completed, "2026-11-16", -6)).toBe(true);
		expect(inCompletionWeek(completed, "2026-11-16", -7)).toBe(false);
		const future = { due_date: "2026-11-01", start_date: "2026-11-18" } as Task;
		expect(inUpcomingRange(future, "2026-11-16", "week")).toBe(true);
		expect(
			inUpcomingRange(
				{ ...future, start_date: "2026-12-05" },
				"2026-11-16",
				"week",
			),
		).toBe(false);
	});
	it("groups eligible work once and leaves future starts out", () => {
		const task = (id: string, values: Partial<Task>) =>
			({ id, due_date: "2026-11-16", status: "todo", ...values }) as Task;
		const groups = todayGroups(
			[
				task("overdue", { due_date: "2026-11-15", status: "in_progress" }),
				task("today", {}),
				task("started", { status: "in_progress", due_date: "2026-12-01" }),
				task("blocked", { status: "blocked", due_date: "2026-11-14" }),
				task("future", { status: "in_progress", start_date: "2026-11-17" }),
				task("done", { status: "done" }),
				task("cancelled", { status: "cancelled" }),
				task("later", { due_date: "2026-11-17" }),
				task("archived", { archived_at: "2026-11-15" }),
			],
			"2026-11-16",
		);
		expect(
			Object.values(groups).map((group) => group.map((t) => t.id)),
		).toEqual([["overdue"], ["today"], ["started"], ["blocked"]]);
	});
});

describe("Task write validation", () => {
	it("rejects server-owned fields, bad states and malformed IDs", () => {
		for (const patch of [
			{ completed_at: "2026-11-16" },
			{ archived_at: null },
			{ position: 1 },
			{ reschedule_count: 0 },
			{ status: "unknown" },
			{ title: " " },
			{ due_date: "2026-02-30" },
		]) {
			expect(taskFieldsSchema.safeParse(patch).success).toBe(false);
		}
		expect(taskIdsSchema.safeParse(["not-an-id"]).success).toBe(false);
		const id = "00000000-0000-4000-8000-000000000001";
		expect(taskIdsSchema.safeParse([id, id]).success).toBe(false);
		expect(
			taskFieldsSchema.parse({ status: "done", start_date: null }),
		).toEqual({ status: "done", start_date: null });
	});
});
