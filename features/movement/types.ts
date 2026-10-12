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
