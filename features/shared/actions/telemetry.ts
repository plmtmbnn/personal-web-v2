"use server";

import {
	getAuthStatusAction,
	type AuthStatusSnapshot,
} from "@/features/auth/actions";
import { getPendingTasksCount } from "@/features/tasks/actions/tasks";
import { getReminderCount } from "@/features/reminders/actions";
import { getUndoneMovementSnacksCount } from "@/features/movement/actions";

export interface NavTelemetrySummary {
	auth: AuthStatusSnapshot;
	counts: {
		tasks: number;
		reminders: number;
		movement: number;
	};
}

/**
 * Consolidated telemetry RPC for FloatingNavDock.
 * Evaluates auth and pending counts in a single network round-trip.
 */
export async function getNavTelemetrySummary(): Promise<NavTelemetrySummary> {
	try {
		const auth = await getAuthStatusAction();

		if (!auth.isAdmin) {
			return {
				auth,
				counts: {
					tasks: 0,
					reminders: 0,
					movement: 0,
				},
			};
		}

		const [taskCount, reminderCount, movementCount] = await Promise.all([
			getPendingTasksCount().catch((e) => {
				console.error("[Telemetry] Failed to get pending tasks count:", e);
				return 0;
			}),
			getReminderCount().catch((e) => {
				console.error("[Telemetry] Failed to get reminder count:", e);
				return 0;
			}),
			getUndoneMovementSnacksCount().catch((e) => {
				console.error("[Telemetry] Failed to get movement snacks count:", e);
				return 0;
			}),
		]);

		return {
			auth,
			counts: {
				tasks: taskCount,
				reminders: reminderCount,
				movement: movementCount,
			},
		};
	} catch (error) {
		console.error("[Telemetry] Error in getNavTelemetrySummary:", error);
		return {
			auth: { isAdmin: false, isLoggedIn: false },
			counts: { tasks: 0, reminders: 0, movement: 0 },
		};
	}
}
