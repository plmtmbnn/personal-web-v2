import { INITIAL_MOVEMENT_LIBRARY } from "../data/default-library";
import { DEFAULT_ROUTINE_CONFIG } from "../data/default-routine";
import type {
	Movement,
	MovementAppState,
	MovementSession,
	MovementSummaryStats,
} from "../types";

export const MOVEMENT_STORAGE_KEY = "movement:snacks:v1";

/**
 * Returns the current or provided Date formatted as YYYY-MM-DD using the user's local timezone.
 */
export function getLocalDateKey(date: Date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string into a local Date object.
 */
export function parseLocalDateKey(dateStr: string): Date {
	const [year, month, day] = dateStr.split("-").map(Number);
	return new Date(year, month - 1, day);
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
 * Persists the current movement state to localStorage.
 */
export function saveMovementState(state: MovementAppState): void {
	if (typeof window === "undefined") return;

	try {
		localStorage.setItem(MOVEMENT_STORAGE_KEY, JSON.stringify(state));
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
