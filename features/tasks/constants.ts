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
 * Draft restored notification display duration in milliseconds
 */
export const DRAFT_RESTORED_NOTIFICATION_MS = 3000;

/**
 * Success notification display duration in milliseconds
 */
export const SUCCESS_NOTIFICATION_MS = 600;

/**
 * Undo toast duration in milliseconds
 */
export const UNDO_TOAST_DURATION_MS = 5000;

// ─── Cache & Data Management ──────────────────────────────────────────────────

/**
 * Redis cache TTL for analytics stats in seconds (30 minutes)
 */
export const STATS_CACHE_TTL_SECONDS = 1800;

/**
 * Number of days to keep completed tasks before cleanup (3 years)
 */
export const TASK_RETENTION_MONTHS = 36;

/**
 * Maximum draft age in milliseconds before showing confirmation (24 hours)
 */
export const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Draft storage version for migration handling
 */
export const DRAFT_VERSION = 1;

// ─── UI & Display Constants ───────────────────────────────────────────────────

/**
 * Maximum length for task title
 */
export const MAX_TASK_TITLE_LENGTH = 500;

/**
 * Maximum length for task description
 */
export const MAX_TASK_DESCRIPTION_LENGTH = 5000;

/**
 * Maximum length for category name
 */
export const MAX_CATEGORY_LENGTH = 50;

/**
 * URL display truncation length
 */
export const URL_DISPLAY_MAX_LENGTH = 30;

/**
 * Number of recent completed tasks to fetch for streak calculation
 */
export const STREAK_FETCH_LIMIT = 100;

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

/**
 * Default category when none is specified
 */
export const DEFAULT_CATEGORY = "General";

// ─── Priority Levels ──────────────────────────────────────────────────────────

/**
 * Priority level visual configurations
 */
export const PRIORITY_CONFIG = {
	HIGH: {
		label: "High",
		color: "bg-rose-50 text-rose-700 border-rose-100",
		buttonColor: "bg-rose-500 text-white shadow-sm",
	},
	MEDIUM: {
		label: "Medium",
		color: "bg-amber-50 text-amber-700 border-amber-100",
		buttonColor: "bg-amber-500 text-white shadow-sm",
	},
	LOW: {
		label: "Low",
		color: "bg-emerald-50 text-emerald-700 border-emerald-100",
		buttonColor: "bg-emerald-500 text-white shadow-sm",
	},
} as const;

// ─── Recurrence Options ───────────────────────────────────────────────────────

/**
 * Recurrence type labels
 */
export const RECURRENCE_LABELS = {
	none: null,
	daily: "Daily",
	weekly: "Weekly",
	monthly: "Monthly",
} as const;

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

/**
 * LocalStorage key for user preferences
 */
export const USER_PREFERENCES_KEY = "tasks_user_preferences";

// ─── Quick Date Options ───────────────────────────────────────────────────────

/**
 * Quick date selection chips
 */
export const QUICK_DATE_OPTIONS = [
	{ label: "Today", days: 0 },
	{ label: "Tomorrow", days: 1 },
	{ label: "+3 Days", days: 3 },
	{ label: "+7 Days", days: 7 },
] as const;

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
export const QUICK_RESCHEDULE_OPTIONS = QUICK_DATE_OPTIONS;

// ─── Keyboard Shortcuts ───────────────────────────────────────────────────────

/**
 * Keyboard shortcuts configuration
 */
export const KEYBOARD_SHORTCUTS = {
	NEW_TASK: { key: "n", ctrl: true, description: "Create new task" },
	TOGGLE_FILTERS: { key: "f", ctrl: true, description: "Toggle filters" },
	FOCUS_SEARCH: { key: "/", description: "Focus search" },
	SAVE_FORM: { key: "Enter", ctrl: true, description: "Save task" },
	CANCEL_FORM: { key: "Escape", description: "Cancel editing" },
	TOGGLE_ANALYTICS: {
		key: "a",
		ctrl: true,
		description: "Toggle analytics view",
	},
} as const;

// ─── Animation & Transition ───────────────────────────────────────────────────

/**
 * Framer Motion animation variants
 */
export const ANIMATION_VARIANTS = {
	fadeIn: {
		initial: { opacity: 0, y: 10 },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: -10 },
	},
	slideUp: {
		initial: { y: "100%" },
		animate: { y: 0 },
		exit: { y: "100%" },
	},
	scale: {
		initial: { scale: 0.95, opacity: 0 },
		animate: { scale: 1, opacity: 1 },
		exit: { scale: 0.95, opacity: 0 },
	},
} as const;

// ─── Error Messages ───────────────────────────────────────────────────────────

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES = {
	TASK_ADD_FAILED: "Failed to create task. Please try again.",
	TASK_UPDATE_FAILED: "Failed to update task. Please try again.",
	TASK_DELETE_FAILED: "Failed to delete task. Please try again.",
	TASK_TOGGLE_FAILED: "Failed to toggle task status. Please try again.",
	TASK_REORDER_FAILED: "Failed to reorder tasks. Please refresh the page.",
	BATCH_ADD_FAILED: "Failed to create tasks. Please try again.",
	ANALYTICS_FETCH_FAILED: "Failed to load analytics. Please refresh the page.",
	NETWORK_ERROR: "Network error. Please check your connection.",
	UNKNOWN_ERROR: "Something went wrong. Please try again.",
} as const;

// ─── Date & Time Formats ──────────────────────────────────────────────────────

/**
 * Date format patterns
 */
export const DATE_FORMATS = {
	ISO_DATE: "yyyy-MM-dd",
	DISPLAY_SHORT: "dd MMM",
	DISPLAY_FULL: "dd MMM yyyy",
	DISPLAY_WEEKDAY: "EEEE",
	ISO_DATETIME: "yyyy-MM-dd'T'HH:mm:ss",
} as const;

// ─── Regex Patterns ───────────────────────────────────────────────────────────

/**
 * Regex pattern for detecting URLs in text
 */
export const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

/**
 * Regex pattern for detecting checklist items
 */
export const CHECKLIST_REGEX = /^(\s*[-*]\s+\[)([ xX])(]\s+)(.*)$/;
