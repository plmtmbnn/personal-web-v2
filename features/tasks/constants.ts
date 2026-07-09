/**
 * Task Feature Constants
 * Central configuration for the tasks feature to improve maintainability
 */

// ─── Timing Constants ─────────────────────────────────────────────────────────

/**
 * Debounce delay for search input in milliseconds
 */
export const SEARCH_DEBOUNCE_MS = 300;

/**
 * Debounce delay for draft auto-save in milliseconds
 */
export const DRAFT_AUTOSAVE_DEBOUNCE_MS = 300;

/**
 * Delete confirmation timeout in milliseconds (auto-disarm)
 */
export const DELETE_CONFIRM_TIMEOUT_MS = 3000;

/**
 * Undo toast duration in milliseconds
 */
export const UNDO_TOAST_DURATION_MS = 5000;

// ─── Task Categories ──────────────────────────────────────────────────────────

/**
 * Default task categories available in the system
 */
export const TASK_CATEGORIES = [
	"Work",
	"Personal",
	"Fintech",
	"Health",
	"Urgent",
	"Study",
	"Finance",
] as const;

// ─── Task Status ──────────────────────────────────────────────────────────────

export const TASK_STATUS_CONFIG = {
	todo: {
		label: "To Do",
		shortLabel: "Todo",
		color: "text-slate-600 bg-slate-100 border-slate-200",
		borderColor: "border-l-slate-300",
		dotColor: "bg-slate-400",
		emoji: "○",
	},
	in_progress: {
		label: "In Progress",
		shortLabel: "Active",
		color: "text-blue-700 bg-blue-50 border-blue-200",
		borderColor: "border-l-blue-500",
		dotColor: "bg-blue-500",
		emoji: "◔",
	},
	done: {
		label: "Done",
		shortLabel: "Done",
		color: "text-emerald-700 bg-emerald-50 border-emerald-200",
		borderColor: "border-l-emerald-500",
		dotColor: "bg-emerald-500",
		emoji: "●",
	},
	blocked: {
		label: "Blocked",
		shortLabel: "Blocked",
		color: "text-amber-700 bg-amber-50 border-amber-200",
		borderColor: "border-l-amber-500",
		dotColor: "bg-amber-500",
		emoji: "⊘",
	},
	cancelled: {
		label: "Cancelled",
		shortLabel: "Cancelled",
		color: "text-slate-400 bg-slate-50 border-slate-200",
		borderColor: "border-l-slate-200",
		dotColor: "bg-slate-300",
		emoji: "✕",
	},
} as const;

/**
 * Status cycle order when clicking the status badge
 * (does not include cancelled — that requires an explicit action)
 */
export const STATUS_CYCLE: (keyof typeof TASK_STATUS_CONFIG)[] = [
	"todo",
	"in_progress",
	"done",
];

// ─── Effort / Estimation Chips ────────────────────────────────────────────────

export const EFFORT_CHIPS = [
	{ label: "15m", minutes: 15 },
	{ label: "30m", minutes: 30 },
	{ label: "1h", minutes: 60 },
	{ label: "2h", minutes: 120 },
	{ label: "4h", minutes: 240 },
] as const;

/**
 * Formats estimated minutes into a human-readable string.
 * e.g. 90 → "1h 30m", 60 → "1h", 45 → "45m"
 */
export function formatEstimatedTime(minutes: number): string {
	if (minutes < 60) return `${minutes}m`;
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// ─── Recurrence Options ───────────────────────────────────────────────────────

/**
 * Recurrence options for task form selector
 */
export const RECURRENCE_OPTIONS = [
	{ label: "None", value: "none" },
	{ label: "Daily", value: "daily" },
	{ label: "Weekly", value: "weekly" },
	{ label: "Monthly", value: "monthly" },
] as const;

// ─── Local Storage Keys ───────────────────────────────────────────────────────

/**
 * LocalStorage key for task form draft
 */
export const DRAFT_STORAGE_KEY = "taskform_draft";

// ─── Quick Date Options ───────────────────────────────────────────────────────

/**
 * Quick date chips for task form (shortened version)
 */
export const QUICK_DATE_CHIPS = [
	{ label: "Today", days: 0 },
	{ label: "Tomorrow", days: 1 },
	{ label: "+7 Days", days: 7 },
] as const;

/**
 * Quick reschedule options for tasks
 */
export const QUICK_RESCHEDULE_OPTIONS = [
	{ label: "Today", days: 0 },
	{ label: "Tomorrow", days: 1 },
	{ label: "+3 Days", days: 3 },
	{ label: "+7 Days", days: 7 },
] as const;
