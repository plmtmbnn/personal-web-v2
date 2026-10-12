import { describe, it, expect, beforeEach } from "vitest";
import {
	getLocalDateKey,
	parseLocalDateKey,
	getDefaultMovementState,
	recordMovementSession,
	undoMovementSession,
	toggleSlotSkip,
	calculateStreak,
	calculateSummaryStats,
	getCalendarHeatmapData,
	importMovementDataFromJson,
	exportMovementDataAsJson,
} from "../lib/storage";
import { INITIAL_MOVEMENT_LIBRARY } from "../data/default-library";

describe("Movement Storage & Logic", () => {
	beforeEach(() => {
		// Mock local storage if available or in memory
		if (typeof window !== "undefined") {
			window.localStorage.clear();
		}
	});

	it("formats local date keys correctly as YYYY-MM-DD", () => {
		const testDate = new Date(2026, 9, 12); // Oct 12 2026
		expect(getLocalDateKey(testDate)).toBe("2026-10-12");

		const parsed = parseLocalDateKey("2026-10-12");
		expect(parsed.getFullYear()).toBe(2026);
		expect(parsed.getMonth()).toBe(9);
		expect(parsed.getDate()).toBe(12);
	});

	it("initializes with default state containing 6 slots and target 6", () => {
		const state = getDefaultMovementState();
		expect(state.config.dailyTarget).toBe(6);
		expect(state.config.slots).toHaveLength(6);
		expect(state.logs).toEqual({});
	});

	it("records a movement session and updates date log", () => {
		let state = getDefaultMovementState();
		const dateKey = "2026-10-12";

		const { updatedState, session } = recordMovementSession(state, {
			movementId: "slow-squat",
			slotId: "slot-1",
			status: "completed",
			reps: 10,
			dateKey,
		});

		state = updatedState;
		expect(state.logs[dateKey]).toHaveLength(1);
		expect(state.logs[dateKey][0].movementId).toBe("slow-squat");
		expect(state.logs[dateKey][0].status).toBe("completed");
		expect(session.reps).toBe(10);
	});

	it("allows undoing a logged session", () => {
		let state = getDefaultMovementState();
		const dateKey = "2026-10-12";

		const { updatedState, session } = recordMovementSession(state, {
			movementId: "calf-raise",
			slotId: "slot-2",
			status: "completed",
			dateKey,
		});

		state = undoMovementSession(updatedState, dateKey, session.id);
		expect(state.logs[dateKey]).toHaveLength(0);
	});

	it("toggles skip state for a slot", () => {
		let state = getDefaultMovementState();
		const dateKey = "2026-10-12";

		state = toggleSlotSkip(state, dateKey, "slot-1", "slow-squat");
		expect(state.logs[dateKey]).toHaveLength(1);
		expect(state.logs[dateKey][0].status).toBe("skipped");

		// Toggling again should remove the skip
		state = toggleSlotSkip(state, dateKey, "slot-1", "slow-squat");
		expect(state.logs[dateKey]).toHaveLength(0);
	});

	it("calculates summary stats correctly for progress, streak, and targets", () => {
		let state = getDefaultMovementState();
		const todayKey = "2026-10-12";

		// Record 4 sessions
		for (let i = 1; i <= 4; i++) {
			const { updatedState } = recordMovementSession(state, {
				movementId: "slow-squat",
				slotId: `slot-${i}`,
				status: "completed",
				dateKey: todayKey,
			});
			state = updatedState;
		}

		const stats = calculateSummaryStats(
			state,
			todayKey,
			INITIAL_MOVEMENT_LIBRARY,
		);
		expect(stats.totalCompletedToday).toBe(4);
		expect(stats.targetToday).toBe(6);
		expect(stats.percentToday).toBe(67); // 4 / 6 = ~67%
		expect(stats.totalAllTimeCompleted).toBe(4);
		expect(stats.mostFrequentMovement?.movement.id).toBe("slow-squat");
	});

	it("calculates streaks with flexible rest days", () => {
		const logs: Record<string, any[]> = {
			"2026-10-12": [{ status: "completed" }],
			"2026-10-11": [{ status: "completed" }],
			"2026-10-10": [{ status: "completed" }],
		};

		const streak = calculateStreak(logs, 6, "2026-10-12");
		expect(streak).toBeGreaterThanOrEqual(3);
	});

	it("generates 30-day heatmap data correctly", () => {
		const state = getDefaultMovementState();
		const heatmap = getCalendarHeatmapData(state, 30, "2026-10-12");
		expect(heatmap).toHaveLength(30);
		expect(heatmap[29].date).toBe("2026-10-12");
	});

	it("exports and imports valid JSON state", () => {
		let state = getDefaultMovementState();
		const { updatedState } = recordMovementSession(state, {
			movementId: "desk-pushup",
			status: "completed",
			dateKey: "2026-10-12",
		});
		state = updatedState;

		const json = exportMovementDataAsJson(state);
		const restored = importMovementDataFromJson(json);
		expect(restored).not.toBeNull();
		expect(restored?.logs["2026-10-12"]).toHaveLength(1);
	});
});
