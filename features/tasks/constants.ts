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
