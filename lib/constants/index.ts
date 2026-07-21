/**
 * Centralized Constants
 * All application-wide constants for better maintainability.
 */

// ─── Timing & Performance ──────────────────────────────────────────────────────
export const SEARCH_DEBOUNCE_MS = 300;
export const DRAFT_AUTOSAVE_DEBOUNCE_MS = 300;
export const DELETE_CONFIRM_TIMEOUT_MS = 3000;
export const UNDO_TOAST_DURATION_MS = 5000;

// ─── UI / Design System ─────────────────────────────────────────────────────────
export const DEFAULT_BORDER_RADIUS = "rounded-[1.5rem] sm:rounded-2xl";
export const DEFAULT_SHADOW = "shadow-sm";
export const DEFAULT_TRANSITION = "transition-all duration-300";
export const DEFAULT_HOVER_BORDER = "hover:border-slate-300";

// ─── Task Feature (re-exported from features/tasks/constants for central access) ──
export {
	TASK_CATEGORIES,
	TASK_STATUS_CONFIG,
	STATUS_CYCLE,
	EFFORT_CHIPS,
	RECURRENCE_OPTIONS,
	QUICK_DATE_CHIPS,
	QUICK_RESCHEDULE_OPTIONS,
	DRAFT_STORAGE_KEY,
	formatEstimatedTime,
} from "@/features/tasks/constants";
