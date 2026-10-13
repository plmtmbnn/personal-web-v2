export type MovementCategory =
	| "lower-body"
	| "upper-body"
	| "mobility"
	| "walking"
	| "core";

export interface Movement {
	id: string;
	name: string;
	category: MovementCategory;
	instructions: string;
	targetReps?: number;
	targetSeconds?: number;
	tempo?: string;
	referenceUrl: string;
	primaryMuscles: string;
	estimatedDuration: string;
}

export interface ScheduledMovementSlot {
	id: string;
	slotNumber: number;
	scheduledTime: string; // e.g. "09:00", "10:30"
	movementId: string;
	enabled: boolean;
}

export type SessionStatus = "completed" | "skipped";

export interface MovementSession {
	id: string;
	slotId?: string; // Optional if tied to scheduled slot
	movementId: string;
	completedAt: string; // ISO 8601 string
	status: SessionStatus;
	reps?: number;
	durationSeconds?: number;
	isBonus?: boolean; // For sessions logged outside scheduled slots
	note?: string;
}

export interface DailyMovementLog {
	date: string; // "YYYY-MM-DD"
	sessions: MovementSession[];
}

export interface MovementRoutineConfig {
	dailyTarget: number; // default 6, min 5
	slots: ScheduledMovementSlot[];
	soundEnabled: boolean;
	notificationsEnabled: boolean;
}

export interface MovementAppState {
	config: MovementRoutineConfig;
	logs: Record<string, MovementSession[]>; // key: "YYYY-MM-DD"
	customMovements: Movement[];
}

export interface MovementSummaryStats {
	totalCompletedToday: number;
	targetToday: number;
	percentToday: number;
	totalAllTimeCompleted: number;
	currentStreakDays: number;
	totalWalkingMinutesThisWeek: number;
	weeklyDaysMetTarget: number;
	weeklyTotalSessions: number;
	weeklyAveragePerDay: number;
	mostFrequentMovement?: {
		movement: Movement;
		count: number;
	};
}

export interface HeatmapDayCell {
	dateKey: string;
	dayOfMonth: number;
	dayName: string;
	dayOfWeekIndex: number; // 0 for Mon, 6 for Sun
	count: number;
	metTarget: boolean;
	isToday: boolean;
	isFuture: boolean;
	isPadding: boolean;
}

export interface HeatmapWeekRow {
	weekIndex: number;
	days: HeatmapDayCell[];
	weekTotal: number;
}

export interface MonthlyHeatmapData {
	year: number;
	month: number; // 0-11
	monthLabel: string;
	isCurrentMonth: boolean;
	totalSessions: number;
	totalTargetMetDays: number;
	activeDays: number;
	totalDaysInMonth: number;
	targetHitRatePct: number;
	weeks: HeatmapWeekRow[];
}

export interface DayOfWeekAccumulation {
	dayOfWeekIndex: number; // 0 for Mon, 6 for Sun
	dayName: string; // "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
	dayFullName: string; // "Monday", "Tuesday", etc.
	totalSessions: number;
	occurrencesCount: number;
	averagePerDay: number;
	targetMetDays: number;
}

export interface MonthlyDayAccumulationData {
	year: number;
	month: number; // 0-11
	monthLabel: string;
	isCurrentMonth: boolean;
	totalSessions: number;
	totalTargetMetDays: number;
	activeDays: number;
	days: DayOfWeekAccumulation[]; // 7 elements, Mon to Sun
}
