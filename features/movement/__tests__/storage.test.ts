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
	calculateUndoneCount,
	saveMovementState,
	getCalendarHeatmapData,
	importMovementDataFromJson,
	exportMovementDataAsJson,
	mergeMovementStates,
	getThreeMonthCutoffDateKey,
	pruneExpiredLogs,
	getMonthlyWeeklyHeatmapData,
	getMonthlyDayAccumulation,
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

	it("merges server and client movement states without duplicating sessions", () => {
		const serverState = getDefaultMovementState();
		const clientState = getDefaultMovementState();

		clientState.config.dailyTarget = 8;
		clientState.logs["2026-10-12"] = [
			{
				id: "sess-1",
				movementId: "desk-pushup",
				slotId: "slot-1",
				completedAt: new Date().toISOString(),
				status: "completed" as const,
			},
		];

		// If server is clean, client config and logs are adopted
		const mergedClean = mergeMovementStates(serverState, clientState);
		expect(mergedClean.config.dailyTarget).toBe(8);
		expect(mergedClean.logs["2026-10-12"]).toHaveLength(1);

		// If server already has sessions, it does not duplicate sessions with same ID or slotId
		const serverWithSessions = {
			...serverState,
			logs: {
				"2026-10-12": [
					{
						id: "sess-1",
						movementId: "desk-pushup",
						slotId: "slot-1",
						completedAt: new Date().toISOString(),
						status: "completed" as const,
					},
					{
						id: "sess-2",
						movementId: "slow-squat",
						slotId: "slot-2",
						completedAt: new Date().toISOString(),
						status: "completed" as const,
					},
				],
			},
		};

		const mergedIdempotent = mergeMovementStates(
			serverWithSessions,
			clientState,
		);
		expect(mergedIdempotent.logs["2026-10-12"]).toHaveLength(2);
	});

	it("calculates 3-month cutoff date key correctly", () => {
		// Reference: Oct 13, 2026 -> Cutoff should be Aug 1, 2026
		const octDate = new Date(2026, 9, 13);
		expect(getThreeMonthCutoffDateKey(octDate)).toBe("2026-08-01");

		// Reference: Jan 15, 2026 -> Cutoff should cross into Nov 1, 2025
		const janDate = new Date(2026, 0, 15);
		expect(getThreeMonthCutoffDateKey(janDate)).toBe("2025-11-01");
	});

	it("prunes logs older than 3 calendar months", () => {
		const state = getDefaultMovementState();
		const refDate = new Date(2026, 9, 13); // Oct 13, 2026 (cutoff is 2026-08-01)

		state.logs["2026-07-31"] = [
			{
				id: "old-1",
				movementId: "desk-pushup",
				completedAt: "2026-07-31T10:00:00Z",
				status: "completed" as const,
			},
		];
		state.logs["2026-08-01"] = [
			{
				id: "aug-1",
				movementId: "desk-pushup",
				completedAt: "2026-08-01T10:00:00Z",
				status: "completed" as const,
			},
		];
		state.logs["2026-10-12"] = [
			{
				id: "oct-1",
				movementId: "slow-squat",
				completedAt: "2026-10-12T10:00:00Z",
				status: "completed" as const,
			},
		];

		const { state: pruned, prunedCount } = pruneExpiredLogs(state, refDate);
		expect(prunedCount).toBe(1);
		expect(pruned.logs["2026-07-31"]).toBeUndefined();
		expect(pruned.logs["2026-08-01"]).toHaveLength(1);
		expect(pruned.logs["2026-10-12"]).toHaveLength(1);
	});

	it("generates monthly and weekly heatmap data for last 2 months and current month (Mon-Sun)", () => {
		const state = getDefaultMovementState();
		const refDate = new Date(2026, 9, 13); // October 13, 2026

		state.logs["2026-10-12"] = [
			{
				id: "oct-1",
				movementId: "slow-squat",
				completedAt: "2026-10-12T10:00:00Z",
				status: "completed" as const,
			},
		];

		const heatmaps = getMonthlyWeeklyHeatmapData(state, refDate);
		expect(heatmaps).toHaveLength(3);

		// Order: 2 months ago (August), last month (September), current month (October)
		expect(heatmaps[0].monthLabel).toBe("August 2026");
		expect(heatmaps[0].isCurrentMonth).toBe(false);

		expect(heatmaps[1].monthLabel).toBe("September 2026");
		expect(heatmaps[1].isCurrentMonth).toBe(false);

		expect(heatmaps[2].monthLabel).toBe("October 2026");
		expect(heatmaps[2].isCurrentMonth).toBe(true);
		expect(heatmaps[2].totalSessions).toBe(1);

		// Verify every week has 7 days from Mon to Sun
		for (const month of heatmaps) {
			for (const week of month.weeks) {
				expect(week.days).toHaveLength(7);
				expect(week.days[0].dayName).toBe("Mon");
				expect(week.days[6].dayName).toBe("Sun");
			}
		}
	});

	it("accumulates volume by day of week (Mon to Sun) without specific date clutter", () => {
		const state = getDefaultMovementState();
		const refDate = new Date(2026, 9, 13); // Tuesday, October 13, 2026

		// Monday October 12, 2026
		state.logs["2026-10-12"] = [
			{
				id: "mon-1",
				movementId: "desk-pushup",
				completedAt: "2026-10-12T10:00:00Z",
				status: "completed" as const,
			},
			{
				id: "mon-2",
				movementId: "slow-squat",
				completedAt: "2026-10-12T14:00:00Z",
				status: "completed" as const,
			},
		];

		const dayData = getMonthlyDayAccumulation(state, refDate);
		expect(dayData).toHaveLength(3);

		const currentMonth = dayData[2]; // October 2026
		expect(currentMonth.monthLabel).toBe("October 2026");
		expect(currentMonth.isCurrentMonth).toBe(true);
		expect(currentMonth.days).toHaveLength(7);

		// Check Mon
		const monday = currentMonth.days[0];
		expect(monday.dayName).toBe("Mon");
		expect(monday.totalSessions).toBe(2);
		expect(monday.occurrencesCount).toBeGreaterThan(0);
		expect(monday.averagePerDay).toBeGreaterThan(0);

		// Check Tuesday through Sunday
		const sunday = currentMonth.days[6];
		expect(sunday.dayName).toBe("Sun");
		expect(sunday.totalSessions).toBe(0);
	});

	it("correctly calculates undone movement snacks count", () => {
		const state = getDefaultMovementState();
		state.config.dailyTarget = 6;
		const todayKey = getLocalDateKey();

		// Initially all 6 undone
		expect(calculateUndoneCount(state, todayKey)).toBe(6);

		// Record 2 completions
		state.logs[todayKey] = [
			{
				id: "s-1",
				movementId: "slow-squat",
				completedAt: new Date().toISOString(),
				status: "completed",
			},
			{
				id: "s-2",
				movementId: "calf-raise",
				completedAt: new Date().toISOString(),
				status: "completed",
			},
		];
		expect(calculateUndoneCount(state, todayKey)).toBe(4);

		// Skipped slots count as resolved and reduce undone count
		state.logs[todayKey].push({
			id: "s-3",
			movementId: "desk-pushup",
			completedAt: new Date().toISOString(),
			status: "skipped",
		});
		expect(calculateUndoneCount(state, todayKey)).toBe(3);

		// Undoing/removing skip restores undone count
		state.logs[todayKey] = state.logs[todayKey].filter((s) => s.id !== "s-3");
		expect(calculateUndoneCount(state, todayKey)).toBe(4);
	});

	it("dispatches movement:state:updated with undoneCount and state in event detail", () => {
		const state = getDefaultMovementState();
		state.config.dailyTarget = 6;
		const todayKey = getLocalDateKey();
		state.logs[todayKey] = [
			{
				id: "s-1",
				movementId: "slow-squat",
				completedAt: new Date().toISOString(),
				status: "completed",
			},
		];

		let receivedDetail: { undoneCount?: number; state?: unknown } | null = null;
		const listener = (event: Event) => {
			receivedDetail = (
				event as CustomEvent<{ undoneCount?: number; state?: unknown }>
			).detail;
		};

		window.addEventListener("movement:state:updated", listener);
		try {
			saveMovementState(state);
			const detail = receivedDetail as {
				undoneCount?: number;
				state?: unknown;
			} | null;
			expect(detail).not.toBeNull();
			expect(detail?.undoneCount).toBe(5);
			expect(detail?.state).toBeDefined();
		} finally {
			window.removeEventListener("movement:state:updated", listener);
		}
	});
});
