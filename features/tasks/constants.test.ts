import { describe, it, expect } from "vitest";
import {
	formatEstimatedTime,
	TASK_STATUS_CONFIG,
	STATUS_CYCLE,
	TASK_CATEGORIES,
	EFFORT_CHIPS,
	QUICK_DATE_CHIPS,
	QUICK_RESCHEDULE_OPTIONS,
	RECURRENCE_OPTIONS,
	SEARCH_DEBOUNCE_MS,
	DRAFT_AUTOSAVE_DEBOUNCE_MS,
	DELETE_CONFIRM_TIMEOUT_MS,
	UNDO_TOAST_DURATION_MS,
} from "./constants";

describe("Task Constants & Utilities", () => {
	describe("formatEstimatedTime", () => {
		it("formats minutes under 1 hour", () => {
			expect(formatEstimatedTime(15)).toBe("15m");
			expect(formatEstimatedTime(45)).toBe("45m");
		});

		it("formats exactly 1 hour", () => {
			expect(formatEstimatedTime(60)).toBe("1h");
		});

		it("formats hours with remaining minutes", () => {
			expect(formatEstimatedTime(90)).toBe("1h 30m");
			expect(formatEstimatedTime(120)).toBe("2h");
			expect(formatEstimatedTime(150)).toBe("2h 30m");
			expect(formatEstimatedTime(245)).toBe("4h 5m");
		});

		it("handles zero minutes", () => {
			expect(formatEstimatedTime(0)).toBe("0m");
		});
	});

	describe("TASK_STATUS_CONFIG", () => {
		it("defines valid configuration for all expected statuses", () => {
			const statuses = [
				"todo",
				"in_progress",
				"done",
				"blocked",
				"cancelled",
			] as const;
			statuses.forEach((status) => {
				const config = TASK_STATUS_CONFIG[status];
				expect(config).toBeDefined();
				expect(config.label).toBeTruthy();
				expect(config.shortLabel).toBeTruthy();
				expect(config.color).toContain("bg-");
				expect(config.borderColor).toContain("border-");
				expect(config.dotColor).toContain("bg-");
				expect(config.emoji).toBeTruthy();
			});
		});
	});

	describe("STATUS_CYCLE", () => {
		it("cycles through todo -> in_progress -> done in correct order", () => {
			expect(STATUS_CYCLE).toEqual(["todo", "in_progress", "done"]);
		});
	});

	describe("TASK_CATEGORIES", () => {
		it("includes standard categories", () => {
			expect(TASK_CATEGORIES).toContain("Work");
			expect(TASK_CATEGORIES).toContain("Personal");
			expect(TASK_CATEGORIES).toContain("Finance");
			expect(TASK_CATEGORIES).toContain("Health");
		});
	});

	describe("CHIPS & OPTIONS", () => {
		it("provides standard effort chips", () => {
			expect(EFFORT_CHIPS.map((c) => c.minutes)).toEqual([
				15, 30, 60, 120, 240,
			]);
		});

		it("provides standard quick date chips", () => {
			expect(QUICK_DATE_CHIPS.map((c) => c.days)).toEqual([0, 1, 7]);
		});

		it("provides quick reschedule options", () => {
			expect(QUICK_RESCHEDULE_OPTIONS.map((c) => c.days)).toEqual([0, 1, 3, 7]);
		});

		it("provides recurrence options", () => {
			expect(RECURRENCE_OPTIONS.map((r) => r.value)).toEqual([
				"none",
				"daily",
				"weekly",
				"monthly",
			]);
		});
	});

	describe("Timing Constants", () => {
		it("has reasonable non-zero timing thresholds", () => {
			expect(SEARCH_DEBOUNCE_MS).toBeGreaterThan(0);
			expect(DRAFT_AUTOSAVE_DEBOUNCE_MS).toBeGreaterThan(0);
			expect(DELETE_CONFIRM_TIMEOUT_MS).toBeGreaterThan(0);
			expect(UNDO_TOAST_DURATION_MS).toBeGreaterThan(0);
		});
	});
});
