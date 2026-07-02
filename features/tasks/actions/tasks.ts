"use server";

import { revalidatePath } from "next/cache";
import { SupabaseConn } from "@/lib/core/supabase";
import { invalidateStatsCache } from "@/lib/core/redis";
import type { Task, TaskPriority, TaskRecurrence } from "../types";

/**
 * Fetch tasks with optional filters.
 * Default: Today, is_completed: false
 */
export async function getTasks(options?: {
	startDate?: string;
	endDate?: string;
	priority?: TaskPriority;
	category?: string;
	showCompletedToday?: boolean;
	includeCompleted?: boolean;
}): Promise<Task[]> {
	const today = new Date().toISOString().split("T")[0];
	const startDate = options?.startDate || today;
	const endDate = options?.endDate || today;
	const showCompletedToday = options?.showCompletedToday ?? false;
	const includeCompleted = options?.includeCompleted ?? false;

	let query = SupabaseConn.from("tasks").select("*");

	// Handle Completion and Date Filtering
	// Fixed: Simplified logic to avoid including tasks by created_at which could be outside due_date range
	if (includeCompleted) {
		// Show: (Due in range AND NOT completed) OR (Completed in range)
		query = query.or(
			`and(due_date.gte.${startDate},due_date.lte.${endDate},is_completed.eq.false),and(is_completed.eq.true,completed_at.gte.${startDate}T00:00:00,completed_at.lte.${endDate}T23:59:59)`,
		);
	} else if (showCompletedToday) {
		// Show: (Due in range AND NOT completed) OR (Completed today)
		query = query.or(
			`and(due_date.gte.${startDate},due_date.lte.${endDate},is_completed.eq.false),and(is_completed.eq.true,completed_at.gte.${today}T00:00:00,completed_at.lte.${today}T23:59:59)`,
		);
	} else {
		// Standard filtered view: Due in range AND NOT completed
		query = query
			.eq("is_completed", false)
			.gte("due_date", startDate)
			.lte("due_date", endDate);
	}

	// Handle Priority Filter
	if (options?.priority) {
		query = query.eq("priority", options.priority);
	}

	// Handle Category Filter
	if (options?.category) {
		query = query.eq("category", options.category);
	}

	const { data, error } = await query
		.order("position", { ascending: true })
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Failed to fetch tasks:", {
			dateRange: { startDate, endDate },
			filters: { priority: options?.priority, category: options?.category },
			error: error.message,
			details: error,
		});
		return [];
	}

	return data as Task[];
}

/**
 * Add a new task to Supabase
 */
export async function addTask(payload: {
	title: string;
	priority: TaskPriority;
	category: string;
	due_date: string;
	description?: string;
	recurrence?: TaskRecurrence;
}) {
	const { data, error } = await SupabaseConn.from("tasks")
		.insert([
			{
				...payload,
				is_completed: false,
				position: 0, // Simplification: new tasks at top
			},
		])
		.select()
		.single();

	if (error) {
		console.error("Failed to create task:", {
			taskTitle: payload.title,
			category: payload.category,
			dueDate: payload.due_date,
			error: error.message,
			code: error.code,
		});
		throw new Error(
			`Failed to create task "${payload.title}". ${error.message || "Please try again."}`,
		);
	}

	revalidatePath("/tasks");
	await invalidateStatsCache();
	return data as Task;
}

/**
 * Add multiple tasks to Supabase at once
 */
export async function addBatchTasks(
	payloads: {
		title: string;
		priority: TaskPriority;
		category: string;
		due_date: string;
		description?: string;
		recurrence?: TaskRecurrence;
	}[],
) {
	const { data, error } = await SupabaseConn.from("tasks")
		.insert(
			payloads.map((p) => ({
				...p,
				is_completed: false,
				position: 0,
			})),
		)
		.select();

	if (error) {
		console.error("Failed to create batch tasks:", {
			taskCount: payloads.length,
			titles: payloads.map((p) => p.title),
			error: error.message,
			code: error.code,
		});
		throw new Error(
			`Failed to create ${payloads.length} tasks. ${error.message || "Please try again."}`,
		);
	}

	revalidatePath("/tasks");
	await invalidateStatsCache();
	return data as Task[];
}

/**
 * Toggle task completion status and handle completed_at timestamp
 */
export async function toggleTask(
	taskId: string,
	isCurrentlyCompleted: boolean,
) {
	const newStatus = !isCurrentlyCompleted;
	const completedAt = newStatus ? new Date().toISOString() : null;

	const { error } = await SupabaseConn.from("tasks")
		.update({
			is_completed: newStatus,
			completed_at: completedAt,
		})
		.eq("id", taskId);

	if (error) {
		console.error("Failed to toggle task:", {
			taskId,
			currentStatus: isCurrentlyCompleted,
			newStatus,
			error: error.message,
			code: error.code,
		});
		throw new Error(
			`Failed to toggle task ${taskId}. ${error.message || "Please try again."}`,
		);
	}

	revalidatePath("/tasks");
	await invalidateStatsCache();
}

/**
 * Bulk update task positions
 */
export async function reorderTasks(taskIds: string[]) {
	// We use individual updates because .upsert() requires all NOT NULL columns
	// (like 'title') to be present in the payload, even if we only intend to update.
	const promises = taskIds.map((id, index) =>
		SupabaseConn.from("tasks").update({ position: index }).eq("id", id),
	);

	const results = await Promise.all(promises);

	// Check if any of the updates failed
	const firstError = results.find((r) => r.error)?.error;

	if (firstError) {
		console.error("Failed to reorder tasks:", {
			taskIds,
			error: firstError.message,
			code: firstError.code,
			failedCount: results.filter((r) => r.error).length,
		});
		throw new Error(
			`Failed to reorder ${taskIds.length} tasks. ${firstError.message || "Please refresh the page."}`,
		);
	}

	revalidatePath("/tasks");
	// Reordering doesn't usually change counts, but we'll invalidate to be safe
	// in case analytics ever use sequence data.
	await invalidateStatsCache();
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string) {
	const { error } = await SupabaseConn.from("tasks").delete().eq("id", taskId);

	if (error) {
		console.error("Failed to delete task:", {
			taskId,
			error: error.message,
			code: error.code,
		});
		throw new Error(
			`Failed to delete task ${taskId}. ${error.message || "Please try again."}`,
		);
	}

	revalidatePath("/tasks");
	await invalidateStatsCache();
}

/**
 * Fetch tasks that are not completed and past their due date.
 */
export async function getStaleTasks(): Promise<Task[]> {
	const today = new Date().toISOString().split("T")[0];

	const { data, error } = await SupabaseConn.from("tasks")
		.select("*")
		.eq("is_completed", false)
		.lt("due_date", today)
		.order("due_date", { ascending: true });

	if (error) {
		console.error("Error fetching stale tasks:", error);
		return [];
	}

	return data as Task[];
}

/**
 * Permanently delete completed tasks older than 36 months (3 years).
 */
export async function cleanupOldTasks() {
	const threeYearsAgo = new Date();
	threeYearsAgo.setMonth(threeYearsAgo.getMonth() - 36);
	const dateStr = threeYearsAgo.toISOString();

	const { error } = await SupabaseConn.from("tasks")
		.delete()
		.eq("is_completed", true)
		.lt("completed_at", dateStr);

	if (error) {
		console.error("Error cleaning up old tasks:", error);
		throw new Error("Failed to cleanup old tasks");
	}

	revalidatePath("/tasks");
	await invalidateStatsCache();
}

/**
 * Bulk update due_date for a set of tasks.
 */
export async function rescheduleStaleTasks(taskIds: string[], newDate: string) {
	const { error } = await SupabaseConn.from("tasks")
		.update({ due_date: newDate })
		.in("id", taskIds);

	if (error) {
		console.error("Failed to reschedule tasks:", {
			taskIds,
			newDate,
			error: error.message,
			code: error.code,
		});
		throw new Error(
			`Failed to reschedule ${taskIds.length} tasks. ${error.message || "Please try again."}`,
		);
	}

	revalidatePath("/tasks");
	await invalidateStatsCache();
}

/**
 * Reschedule all overdue tasks by adding a specific number of days.
 * Increments the reschedule_count for each task.
 */
export async function rescheduleOverdueTasks(daysToAdd: number) {
	const today = new Date().toISOString().split("T")[0];
	const newDate = new Date();
	newDate.setDate(newDate.getDate() + daysToAdd);
	const newDateStr = newDate.toISOString().split("T")[0];

	// 1. Fetch overdue tasks
	const { data: overdueTasks, error: fetchError } = await SupabaseConn.from(
		"tasks",
	)
		.select("id, reschedule_count")
		.eq("is_completed", false)
		.lt("due_date", today);

	if (fetchError || !overdueTasks) {
		console.error("Failed to fetch overdue tasks for rescheduling:", {
			daysToAdd,
			error: fetchError?.message,
			code: fetchError?.code,
		});
		return {
			success: false,
			message: `Failed to fetch overdue tasks. ${fetchError?.message || "Please try again."}`,
		};
	}

	if (overdueTasks.length === 0)
		return { success: true, message: "No overdue tasks to reschedule" };

	// 2. Perform updates (Due Date + Increment Counter)
	const promises = overdueTasks.map((t) =>
		SupabaseConn.from("tasks")
			.update({
				due_date: newDateStr,
				reschedule_count: (t.reschedule_count || 0) + 1,
			})
			.eq("id", t.id),
	);

	const results = await Promise.all(promises);
	const firstError = results.find((r) => r.error)?.error;

	if (firstError) {
		console.error("Failed during bulk reschedule:", {
			daysToAdd,
			overdueCount: overdueTasks.length,
			error: firstError.message,
			code: firstError.code,
			failedCount: results.filter((r) => r.error).length,
		});
		return {
			success: false,
			message: `Failed to reschedule ${overdueTasks.length} tasks. ${firstError.message || "Please try again."}`,
		};
	}

	revalidatePath("/tasks");
	await invalidateStatsCache();
	return {
		success: true,
		message: `Successfully rescheduled ${overdueTasks.length} tasks`,
	};
}

/**
 * Update task details (title, priority, etc.)
 */
export async function updateTask(taskId: string, updates: Partial<Task>) {
	const { error } = await SupabaseConn.from("tasks")
		.update(updates)
		.eq("id", taskId);

	if (error) {
		console.error("Failed to update task:", {
			taskId,
			updates,
			error: error.message,
			code: error.code,
		});
		throw new Error(
			`Failed to update task ${taskId}. ${error.message || "Please try again."}`,
		);
	}

	revalidatePath("/tasks");
	await invalidateStatsCache();
}
