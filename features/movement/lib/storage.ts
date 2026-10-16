import { INITIAL_MOVEMENT_LIBRARY } from "../data/default-library";
import { DEFAULT_ROUTINE_CONFIG } from "../data/default-routine";
import type {
	DayOfWeekAccumulation,
	HeatmapDayCell,
	HeatmapWeekRow,
	MonthlyDayAccumulationData,
	MonthlyHeatmapData,
	Movement,
	MovementAppState,
	MovementSession,
	MovementSummaryStats,
} from "../types";

export const MOVEMENT_STORAGE_KEY = "movement:snacks:v1";

/**
 * Returns the current or provided Date formatted as YYYY-MM-DD in the Asia/Jakarta timezone.
 */
export function getLocalDateKey(date: Date = new Date()): string {
	return date.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

/**
 * Parses a YYYY-MM-DD string into a local Date object.
 */
export function parseLocalDateKey(dateStr: string): Date {
	const [year, month, day] = dateStr.split("-").map(Number);
	return new Date(year, month - 1, day);
}

/**
 * Returns the cutoff date key (YYYY-MM-DD) for 3 calendar months retention.
 * For example, if reference is in October 2026, cutoff is August 1, 2026.
 */
export function getThreeMonthCutoffDateKey(
	referenceDate: Date = new Date(),
): string {
	const cutoff = new Date(
		referenceDate.getFullYear(),
		referenceDate.getMonth() - 2,
		1,
	);
	return getLocalDateKey(cutoff);
}

/**
 * Prunes any daily logs older than 3 calendar months from state.logs.
 * Returns the sanitized state and count of removed dates.
 */
export function pruneExpiredLogs(
	state: MovementAppState,
	referenceDate: Date = new Date(),
): { state: MovementAppState; prunedCount: number } {
	const cutoffKey = getThreeMonthCutoffDateKey(referenceDate);
	const sanitizedLogs: Record<string, MovementSession[]> = {};
	let prunedCount = 0;

	for (const [dateKey, sessions] of Object.entries(state.logs || {})) {
		if (dateKey >= cutoffKey) {
			sanitizedLogs[dateKey] = sessions;
		} else {
			prunedCount += 1;
		}
	}

	return {
		state: {
			...state,
			logs: sanitizedLogs,
		},
		prunedCount,
	};
}

/**
 * Provides the default initial state for the application.
 */
export function getDefaultMovementState(): MovementAppState {
	return {
		config: { ...DEFAULT_ROUTINE_CONFIG },
		logs: {},
		customMovements: [],
	};
}

/**
 * Loads movement state from localStorage, falling back to defaults.
 */
export function loadMovementState(): MovementAppState {
	if (typeof window === "undefined") {
		return getDefaultMovementState();
	}

	try {
		const raw = localStorage.getItem(MOVEMENT_STORAGE_KEY);
		if (!raw) {
			return getDefaultMovementState();
		}

		const parsed = JSON.parse(raw) as Partial<MovementAppState>;

		return {
			config: {
				...DEFAULT_ROUTINE_CONFIG,
				...(parsed.config || {}),
				slots: parsed.config?.slots || DEFAULT_ROUTINE_CONFIG.slots,
			},
			logs: parsed.logs || {},
			customMovements: parsed.customMovements || [],
		};
	} catch {
		return getDefaultMovementState();
	}
}

/**
 * Calculates the number of undone movement snacks for a given date key.
 */
export function calculateUndoneCount(
	state: MovementAppState,
	dateKey: string = getLocalDateKey(),
): number {
	const todaySessions = (state.logs?.[dateKey] || []).filter(
		(s) => s.status === "completed",
	);
	const targetToday = state.config?.dailyTarget ?? 6;
	return Math.max(0, targetToday - todaySessions.length);
}

/**
 * Persists the current movement state to localStorage.
 */
export function saveMovementState(state: MovementAppState): void {
	if (typeof window === "undefined") return;

	try {
		const { state: pruned } = pruneExpiredLogs(state);
		localStorage.setItem(MOVEMENT_STORAGE_KEY, JSON.stringify(pruned));
		const undoneCount = calculateUndoneCount(pruned);
		window.dispatchEvent(
			new CustomEvent("movement:state:updated", {
				detail: { state: pruned, undoneCount },
			}),
		);
	} catch {
		// Ignore local storage quota errors
	}
}

/**
 * Adds a completed or skipped movement session to the given date's log.
 */
export function recordMovementSession(
	state: MovementAppState,
	sessionInput: {
		movementId: string;
		slotId?: string;
		status: "completed" | "skipped";
		reps?: number;
		durationSeconds?: number;
		isBonus?: boolean;
		note?: string;
		dateKey?: string;
	},
): { updatedState: MovementAppState; session: MovementSession } {
	const dateKey = sessionInput.dateKey || getLocalDateKey();
	const existingSessions = state.logs[dateKey] || [];

	const newSession: MovementSession = {
		id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
		movementId: sessionInput.movementId,
		slotId: sessionInput.slotId,
		completedAt: new Date().toISOString(),
		status: sessionInput.status,
		reps: sessionInput.reps,
		durationSeconds: sessionInput.durationSeconds,
		isBonus: sessionInput.isBonus,
		note: sessionInput.note,
	};

	// If it's linked to a slot, replace any previous attempt for that slot today
	const filtered = sessionInput.slotId
		? existingSessions.filter((s) => s.slotId !== sessionInput.slotId)
		: existingSessions;

	const updatedState: MovementAppState = {
		...state,
		logs: {
			...state.logs,
			[dateKey]: [...filtered, newSession],
		},
	};

	saveMovementState(updatedState);
	return { updatedState, session: newSession };
}

/**
 * Undoes or deletes a logged session by ID.
 */
export function undoMovementSession(
	state: MovementAppState,
	dateKey: string,
	sessionId: string,
): MovementAppState {
	const existingSessions = state.logs[dateKey] || [];
	const updatedSessions = existingSessions.filter((s) => s.id !== sessionId);

	const updatedState: MovementAppState = {
		...state,
		logs: {
			...state.logs,
			[dateKey]: updatedSessions,
		},
	};

	saveMovementState(updatedState);
	return updatedState;
}

/**
 * Toggles a scheduled slot as skipped.
 */
export function toggleSlotSkip(
	state: MovementAppState,
	dateKey: string,
	slotId: string,
	movementId: string,
): MovementAppState {
	const existingSessions = state.logs[dateKey] || [];
	const existingForSlot = existingSessions.find((s) => s.slotId === slotId);

	if (existingForSlot?.status === "skipped") {
		// Undo skip
		return undoMovementSession(state, dateKey, existingForSlot.id);
	}

	const { updatedState } = recordMovementSession(state, {
		slotId,
		movementId,
		status: "skipped",
		dateKey,
	});

	return updatedState;
}

/**
 * Calculates current streak allowing for rest days / weekend flexibility.
 */
export function calculateStreak(
	logs: Record<string, MovementSession[]>,
	_targetPerDay: number = 6,
	referenceDateKey: string = getLocalDateKey(),
): number {
	let streak = 0;
	const current = parseLocalDateKey(referenceDateKey);

	// Check today first
	const todaySessions = (logs[referenceDateKey] || []).filter(
		(s) => s.status === "completed",
	);

	// If today has sessions, we count today
	if (todaySessions.length > 0) {
		streak += 1;
	}

	// Step backward day by day
	let graceDaysUsed = 0;
	for (let i = 1; i <= 365; i++) {
		const prevDate = new Date(current);
		prevDate.setDate(prevDate.getDate() - i);
		const key = getLocalDateKey(prevDate);
		const dayOfWeek = prevDate.getDay(); // 0 is Sun, 6 is Sat
		const sessions = (logs[key] || []).filter((s) => s.status === "completed");

		if (sessions.length >= 1) {
			streak += 1;
			graceDaysUsed = 0; // reset grace
		} else if (dayOfWeek !== 0 && dayOfWeek !== 6) {
			// Weekday with no sessions
			if (graceDaysUsed === 0) {
				// Allow 1 flexible weekday rest/missed day
				graceDaysUsed += 1;
			} else {
				break;
			}
		}
	}

	return streak;
}

/**
 * Calculates aggregated summary statistics for today and the trailing 7 days.
 */
export function calculateSummaryStats(
	state: MovementAppState,
	todayKey: string = getLocalDateKey(),
	allMovements: Movement[] = INITIAL_MOVEMENT_LIBRARY,
): MovementSummaryStats {
	const todaySessions = (state.logs[todayKey] || []).filter(
		(s) => s.status === "completed",
	);
	const targetToday = state.config.dailyTarget;
	const totalCompletedToday = todaySessions.length;
	const percentToday = Math.min(
		100,
		Math.round((totalCompletedToday / targetToday) * 100),
	);

	// All-time completed
	let totalAllTimeCompleted = 0;
	const movementCounts: Record<string, number> = {};

	for (const daySessions of Object.values(state.logs)) {
		for (const session of daySessions) {
			if (session.status === "completed") {
				totalAllTimeCompleted += 1;
				movementCounts[session.movementId] =
					(movementCounts[session.movementId] || 0) + 1;
			}
		}
	}

	// Trailing 7 days stats
	const todayDate = parseLocalDateKey(todayKey);
	let weeklyDaysMetTarget = 0;
	let weeklyTotalSessions = 0;
	let totalWalkingMinutesThisWeek = 0;

	for (let i = 0; i < 7; i++) {
		const d = new Date(todayDate);
		d.setDate(d.getDate() - i);
		const k = getLocalDateKey(d);
		const daySessions = (state.logs[k] || []).filter(
			(s) => s.status === "completed",
		);

		weeklyTotalSessions += daySessions.length;
		if (daySessions.length >= targetToday) {
			weeklyDaysMetTarget += 1;
		}

		for (const s of daySessions) {
			if (s.movementId === "easy-walking") {
				const durationSec = s.durationSeconds || 600;
				totalWalkingMinutesThisWeek += Math.round(durationSec / 60);
			}
		}
	}

	const weeklyAveragePerDay = Math.round((weeklyTotalSessions / 7) * 10) / 10;

	// Most frequent movement
	let mostFrequent:
		| {
				movement: Movement;
				count: number;
		  }
		| undefined;

	let maxCount = 0;
	for (const [mId, count] of Object.entries(movementCounts)) {
		if (count > maxCount) {
			const found = allMovements.find((m) => m.id === mId);
			if (found) {
				maxCount = count;
				mostFrequent = { movement: found, count };
			}
		}
	}

	const currentStreakDays = calculateStreak(state.logs, targetToday, todayKey);

	return {
		totalCompletedToday,
		targetToday,
		percentToday,
		totalAllTimeCompleted,
		currentStreakDays,
		totalWalkingMinutesThisWeek,
		weeklyDaysMetTarget,
		weeklyTotalSessions,
		weeklyAveragePerDay,
		mostFrequentMovement: mostFrequent,
	};
}

/**
 * Returns trailing days history for the calendar heatmap (default 30 days).
 */
export function getCalendarHeatmapData(
	state: MovementAppState,
	days = 30,
	referenceDateKey: string = getLocalDateKey(),
): Array<{ date: string; count: number; metTarget: boolean; dayName: string }> {
	const result: Array<{
		date: string;
		count: number;
		metTarget: boolean;
		dayName: string;
	}> = [];
	const refDate = parseLocalDateKey(referenceDateKey);
	const target = state.config.dailyTarget;

	for (let i = days - 1; i >= 0; i--) {
		const d = new Date(refDate);
		d.setDate(d.getDate() - i);
		const key = getLocalDateKey(d);
		const sessions = (state.logs[key] || []).filter(
			(s) => s.status === "completed",
		);
		const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

		result.push({
			date: key,
			count: sessions.length,
			metTarget: sessions.length >= target,
			dayName: dayNames[d.getDay()],
		});
	}

	return result;
}

/**
 * Generates Weekly Heatmap data (Mon to Sun) grouped by Month for:
 * - 2 months ago
 * - Last month
 * - Current month
 * (Total 3 calendar months).
 */
export function getMonthlyWeeklyHeatmapData(
	state: MovementAppState,
	referenceDate: Date = new Date(),
): MonthlyHeatmapData[] {
	const result: MonthlyHeatmapData[] = [];
	const todayKey = getLocalDateKey(referenceDate);
	const target = state.config.dailyTarget;

	const MONTH_NAMES = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

	// Generate for 2 months ago (offset -2), last month (-1), current month (0)
	for (let offset = -2; offset <= 0; offset++) {
		const targetMonthDate = new Date(
			referenceDate.getFullYear(),
			referenceDate.getMonth() + offset,
			1,
		);
		const year = targetMonthDate.getFullYear();
		const month = targetMonthDate.getMonth();
		const monthLabel = `${MONTH_NAMES[month]} ${year}`;
		const isCurrentMonth = offset === 0;

		const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

		// Calculate start day of week (Monday = 0, Sunday = 6)
		const firstDayOfMonth = new Date(year, month, 1);
		const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

		const weeks: HeatmapWeekRow[] = [];
		let currentWeekDays: HeatmapDayCell[] = [];
		let currentWeekTotal = 0;

		// 1. Add leading padding days before 1st of month
		for (let pad = 0; pad < startDayOfWeek; pad++) {
			currentWeekDays.push({
				dateKey: "",
				dayOfMonth: 0,
				dayName: DAY_NAMES[pad],
				dayOfWeekIndex: pad,
				count: 0,
				metTarget: false,
				isToday: false,
				isFuture: false,
				isPadding: true,
			});
		}

		let monthlyTotalSessions = 0;
		let monthlyTargetMetDays = 0;
		let monthlyActiveDays = 0;

		// 2. Add each day of the month
		for (let day = 1; day <= totalDaysInMonth; day++) {
			const dayDate = new Date(year, month, day);
			const dateKey = getLocalDateKey(dayDate);
			const dayOfWeekIndex = (dayDate.getDay() + 6) % 7;
			const dayName = DAY_NAMES[dayOfWeekIndex];

			const sessions = (state.logs[dateKey] || []).filter(
				(s) => s.status === "completed",
			);
			const count = sessions.length;
			const metTarget = count >= target;
			const isToday = dateKey === todayKey;
			const isFuture = isCurrentMonth && dateKey > todayKey;

			if (count > 0) {
				monthlyTotalSessions += count;
				monthlyActiveDays += 1;
				currentWeekTotal += count;
			}
			if (metTarget) {
				monthlyTargetMetDays += 1;
			}

			currentWeekDays.push({
				dateKey,
				dayOfMonth: day,
				dayName,
				dayOfWeekIndex,
				count,
				metTarget,
				isToday,
				isFuture,
				isPadding: false,
			});

			// If Sunday or last day of month, close the week
			if (dayOfWeekIndex === 6 || day === totalDaysInMonth) {
				// If last day of month and not Sunday, add trailing padding days
				if (day === totalDaysInMonth && dayOfWeekIndex < 6) {
					for (let pad = dayOfWeekIndex + 1; pad <= 6; pad++) {
						currentWeekDays.push({
							dateKey: "",
							dayOfMonth: 0,
							dayName: DAY_NAMES[pad],
							dayOfWeekIndex: pad,
							count: 0,
							metTarget: false,
							isToday: false,
							isFuture: false,
							isPadding: true,
						});
					}
				}

				weeks.push({
					weekIndex: weeks.length + 1,
					days: currentWeekDays,
					weekTotal: currentWeekTotal,
				});

				currentWeekDays = [];
				currentWeekTotal = 0;
			}
		}

		// Days eligible for target hit rate (passed days for current month, all days for past)
		const eligibleDays = isCurrentMonth
			? referenceDate.getDate()
			: totalDaysInMonth;
		const targetHitRatePct =
			eligibleDays > 0
				? Math.round((monthlyTargetMetDays / eligibleDays) * 100)
				: 0;

		result.push({
			year,
			month,
			monthLabel,
			isCurrentMonth,
			totalSessions: monthlyTotalSessions,
			totalTargetMetDays: monthlyTargetMetDays,
			activeDays: monthlyActiveDays,
			totalDaysInMonth,
			targetHitRatePct,
			weeks,
		});
	}

	return result;
}

/**
 * Simplifies and accumulates movement activity into days of the week (Mon to Sun)
 * for each of the 3 active months (2 months ago, last month, current month).
 */
export function getMonthlyDayAccumulation(
	state: MovementAppState,
	referenceDate: Date = new Date(),
): MonthlyDayAccumulationData[] {
	const result: MonthlyDayAccumulationData[] = [];
	const todayKey = getLocalDateKey(referenceDate);
	const target = state.config.dailyTarget;

	const MONTH_NAMES = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
	const DAY_FULL_NAMES = [
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
		"Sunday",
	];

	// For 2 months ago (-2), last month (-1), current month (0)
	for (let offset = -2; offset <= 0; offset++) {
		const targetMonthDate = new Date(
			referenceDate.getFullYear(),
			referenceDate.getMonth() + offset,
			1,
		);
		const year = targetMonthDate.getFullYear();
		const month = targetMonthDate.getMonth();
		const monthLabel = `${MONTH_NAMES[month]} ${year}`;
		const isCurrentMonth = offset === 0;

		const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

		// Accumulator structures for 7 days (index 0 = Mon, 6 = Sun)
		const dayTotals = Array(7).fill(0);
		const dayOccurrences = Array(7).fill(0);
		const dayTargetMet = Array(7).fill(0);

		let monthlyTotalSessions = 0;
		let monthlyTargetMetDays = 0;
		let monthlyActiveDays = 0;

		for (let d = 1; d <= totalDaysInMonth; d++) {
			const dayDate = new Date(year, month, d);
			const dateKey = getLocalDateKey(dayDate);
			const dayOfWeekIndex = (dayDate.getDay() + 6) % 7; // Mon=0, Sun=6

			const isFuture = isCurrentMonth && dateKey > todayKey;
			if (!isFuture) {
				dayOccurrences[dayOfWeekIndex] += 1;
			}

			const sessions = (state.logs[dateKey] || []).filter(
				(s) => s.status === "completed",
			);
			const count = sessions.length;

			if (count > 0) {
				dayTotals[dayOfWeekIndex] += count;
				monthlyTotalSessions += count;
				monthlyActiveDays += 1;
			}

			if (count >= target) {
				dayTargetMet[dayOfWeekIndex] += 1;
				monthlyTargetMetDays += 1;
			}
		}

		const days: DayOfWeekAccumulation[] = DAY_NAMES.map((name, idx) => {
			const total = dayTotals[idx];
			const occ = dayOccurrences[idx];
			const avg = occ > 0 ? Math.round((total / occ) * 10) / 10 : 0;
			return {
				dayOfWeekIndex: idx,
				dayName: name,
				dayFullName: DAY_FULL_NAMES[idx],
				totalSessions: total,
				occurrencesCount: occ,
				averagePerDay: avg,
				targetMetDays: dayTargetMet[idx],
			};
		});

		result.push({
			year,
			month,
			monthLabel,
			isCurrentMonth,
			totalSessions: monthlyTotalSessions,
			totalTargetMetDays: monthlyTargetMetDays,
			activeDays: monthlyActiveDays,
			days,
		});
	}

	return result;
}

/**
 * Exports data to a clean JSON string for local backup.
 */
export function exportMovementDataAsJson(state: MovementAppState): string {
	return JSON.stringify(state, null, 2);
}

/**
 * Validates and restores imported movement JSON data.
 */
export function importMovementDataFromJson(
	jsonString: string,
): MovementAppState | null {
	try {
		const parsed = JSON.parse(jsonString);
		if (!parsed || typeof parsed !== "object") return null;

		const state: MovementAppState = {
			config: {
				...DEFAULT_ROUTINE_CONFIG,
				...(parsed.config || {}),
				slots: Array.isArray(parsed.config?.slots)
					? parsed.config.slots
					: DEFAULT_ROUTINE_CONFIG.slots,
			},
			logs: parsed.logs && typeof parsed.logs === "object" ? parsed.logs : {},
			customMovements: Array.isArray(parsed.customMovements)
				? parsed.customMovements
				: [],
		};

		saveMovementState(state);
		return state;
	} catch {
		return null;
	}
}

/**
 * Clears movement history from localStorage while preserving user preferences.
 */
export function clearMovementHistory(
	state: MovementAppState,
): MovementAppState {
	const resetState: MovementAppState = {
		...state,
		logs: {},
	};
	saveMovementState(resetState);
	return resetState;
}

/**
 * Merges server and client movement states without duplicating sessions.
 */
export function mergeMovementStates(
	serverState: MovementAppState,
	clientState: MovementAppState,
): MovementAppState {
	const mergedLogs: Record<string, MovementSession[]> = {
		...(serverState.logs || {}),
	};

	for (const [dateKey, clientSessions] of Object.entries(
		clientState.logs || {},
	)) {
		const serverSessions = mergedLogs[dateKey] || [];
		const serverSessionIds = new Set(serverSessions.map((s) => s.id));
		const serverSlotIds = new Set(
			serverSessions.map((s) => s.slotId).filter(Boolean),
		);

		const sessionsToAdd = clientSessions.filter(
			(cs) =>
				!serverSessionIds.has(cs.id) &&
				(!cs.slotId || !serverSlotIds.has(cs.slotId)),
		);

		mergedLogs[dateKey] = [...serverSessions, ...sessionsToAdd];
	}

	const serverCustom = serverState.customMovements || [];
	const clientCustom = clientState.customMovements || [];
	const customIds = new Set(serverCustom.map((m) => m.id));
	const mergedCustom = [
		...serverCustom,
		...clientCustom.filter((m) => !customIds.has(m.id)),
	];

	// Config resolution: if server has logged sessions, server config takes precedence; otherwise adopt client config
	const serverHasLogs = Object.keys(serverState.logs || {}).some(
		(k) => (serverState.logs[k] || []).length > 0,
	);
	const resolvedConfig = serverHasLogs
		? { ...DEFAULT_ROUTINE_CONFIG, ...(serverState.config || {}) }
		: {
				...DEFAULT_ROUTINE_CONFIG,
				...(clientState.config || serverState.config || {}),
			};

	return {
		config: resolvedConfig,
		logs: mergedLogs,
		customMovements: mergedCustom,
	};
}
