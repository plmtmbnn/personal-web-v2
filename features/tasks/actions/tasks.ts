"use server";

import { revalidatePath } from "next/cache";
import { SupabaseConn } from "@/lib/core/supabase";
import { invalidateStatsCache } from "@/lib/core/redis";
import type { Task, TaskPriority, TaskRecurrence, TaskStatus } from "../types";
import { addDays, addMonths, parseISO, format } from "date-fns";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derive is_completed from status for backward-compatibility.
 */
function isCompletedFromStatus(status: TaskStatus): boolean {
	return status === "done";
}

/**
 * Handle recurrence task instance creation.
 */
async function handleRecurrenceSpawning(task: Task) {
	if (!task.recurrence || task.recurrence === "none") return;

	// Calculate next due date
	const currentDate = parseISO(task.due_date);
	let nextDate: Date;
	if (task.recurrence === "daily") {
		nextDate = addDays(currentDate, 1);
	} else if (task.recurrence === "weekly") {
		nextDate = addDays(currentDate, 7);
	} else if (task.recurrence === "monthly") {
		nextDate = addMonths(currentDate, 1);
	} else {
		return;
	}

	const nextDateStr = format(nextDate, "yyyy-MM-dd");

	// Check if a task with the same recurrence_origin_id and due_date already exists to prevent duplicate spans
	const originId = task.recurrence_origin_id || task.id;
	const { data: existing } = await SupabaseConn.from("tasks")
		.select("id")
		.eq("recurrence_origin_id", originId)
		.eq("due_date", nextDateStr)
		.limit(1);

	if (existing && existing.length > 0) {
		return; // Already spawned
	}

	// Calculate next start date if defined
	let nextStartDateStr: string | null = null;
	if (task.start_date) {
		const currentStartDate = parseISO(task.start_date);
		let nextStartDate: Date;
		if (task.recurrence === "daily") {
			nextStartDate = addDays(currentStartDate, 1);
		} else if (task.recurrence === "weekly") {
			nextStartDate = addDays(currentStartDate, 7);
		} else {
			nextStartDate = addMonths(currentStartDate, 1);
		}
		nextStartDateStr = format(nextStartDate, "yyyy-MM-dd");
	}

	// Insert next task
	const { error } = await SupabaseConn.from("tasks").insert([
		{
			title: task.title,
			description: task.description,
			priority: task.priority,
			category: task.category,
			status: "todo",
			is_completed: false,
			due_date: nextDateStr,
			recurrence: task.recurrence,
			tags: task.tags || [],
			estimated_minutes: task.estimated_minutes,
			parent_id: task.parent_id,
			start_date: nextStartDateStr,
			start_time: task.start_time,
			due_time: task.due_time,
			recurrence_origin_id: originId,
			position: task.position,
			reschedule_count: 0,
		},
	]);

	if (error) {
		console.error("Failed to spawn recurring task:", error);
	}
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

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
	if (includeCompleted) {
		// Show: (Due in range AND NOT completed) OR (Completed in range)
		query = query.or(
			`and(due_date.gte.${startDate},due_date.lte.${endDate},is_completed.eq.false),and(is_completed.eq.true,completed_at.gte.${startDate}T00:00:00,completed_at.lte.${endDate}T23:59:59)`,
		);
	} else if (showCompletedToday) {
		query = query.or(
			`and(due_date.gte.${startDate},due_date.lte.${endDate},is_completed.eq.false),and(is_completed.eq.true,completed_at.gte.${today}T00:00:00,completed_at.lte.${today}T23:59:59)`,
		);
	} else {
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

	// Only fetch top-level tasks (parent_id is null) for the main list.
	// Subtasks are fetched separately via getSubtasks.
	query = query.is("parent_id", null).is("archived_at", null);

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
 * Fetch all subtasks (children) for a given parent task.
 */
export async function getSubtasks(parentId: string): Promise<Task[]> {
	const { data, error } = await SupabaseConn.from("tasks")
		.select("*")
		.eq("parent_id", parentId)
		.order("position", { ascending: true })
		.order("created_at", { ascending: true });

	if (error) {
		console.error("Failed to fetch subtasks:", {
			parentId,
			error: error.message,
		});
		return [];
	}
	return data as Task[];
}

// ─── Create ───────────────────────────────────────────────────────────────────

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
	status?: TaskStatus;
	estimated_minutes?: number;
	tags?: string[];
	parent_id?: string;
}) {
	const status: TaskStatus = payload.status || "todo";
	const { data, error } = await SupabaseConn.from("tasks")
		.insert([
			{
				...payload,
				status,
				is_completed: isCompletedFromStatus(status),
				tags: payload.tags || [],
				position: 0,
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
 * Add a subtask under a parent task
 */
export async function addSubtask(payload: {
	parent_id: string;
	title: string;
	priority?: TaskPriority;
	due_date?: string;
	estimated_minutes?: number;
}) {
	// Inherit parent's due_date and priority if not specified
	const { data: parent, error: parentError } = await SupabaseConn.from("tasks")
		.select("due_date, priority, category")
		.eq("id", payload.parent_id)
		.single();

	if (parentError || !parent) {
		throw new Error("Parent task not found");
	}

	const { data, error } = await SupabaseConn.from("tasks")
		.insert([
			{
				title: payload.title,
				parent_id: payload.parent_id,
				priority: payload.priority || parent.priority,
				category: parent.category,
				due_date: payload.due_date || parent.due_date,
				status: "todo",
				is_completed: false,
				tags: [],
				recurrence: "none",
				reschedule_count: 0,
				position: 0,
				estimated_minutes: payload.estimated_minutes || null,
			},
		])
		.select()
		.single();

	if (error) {
		console.error("Failed to create subtask:", {
			payload,
			error: error.message,
		});
		throw new Error(
			`Failed to create subtask. ${error.message || "Please try again."}`,
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
		status?: TaskStatus;
		estimated_minutes?: number;
		tags?: string[];
	}[],
) {
	const status: TaskStatus = "todo";
	const { data, error } = await SupabaseConn.from("tasks")
		.insert(
			payloads.map((p) => ({
				...p,
				status: p.status || status,
				is_completed: false,
				tags: p.tags || [],
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

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * Update task status and keep is_completed in sync
 */
export async function updateTaskStatus(taskId: string, status: TaskStatus) {
	const newCompleted = isCompletedFromStatus(status);
	const completedAt = status === "done" ? new Date().toISOString() : null;

	const { data, error } = await SupabaseConn.from("tasks")
		.update({
			status,
			is_completed: newCompleted,
			completed_at: completedAt,
		})
		.eq("id", taskId)
		.select()
		.single();

	if (error) {
		console.error("Failed to update task status:", {
			taskId,
			status,
			error: error.message,
		});
		throw new Error(
			`Failed to update status for task ${taskId}. ${error.message || "Please try again."}`,
		);
	}

	if (status === "done" && data) {
		await handleRecurrenceSpawning(data as Task);
		await handleDependenciesUnblocking(taskId);
	}

	revalidatePath("/tasks");
	await invalidateStatsCache();
}

/**
 * Toggle task completion status (backward-compatible)
 * Now maps to status: done <-> todo
 */
export async function toggleTask(
	taskId: string,
	isCurrentlyCompleted: boolean,
) {
	const newStatus: TaskStatus = isCurrentlyCompleted ? "todo" : "done";
	const newCompleted = !isCurrentlyCompleted;
	const completedAt = newCompleted ? new Date().toISOString() : null;

	const { data, error } = await SupabaseConn.from("tasks")
		.update({
			is_completed: newCompleted,
			status: newStatus,
			completed_at: completedAt,
		})
		.eq("id", taskId)
		.select()
		.single();

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

	if (newStatus === "done" && data) {
		await handleRecurrenceSpawning(data as Task);
		await handleDependenciesUnblocking(taskId);
	}

	revalidatePath("/tasks");
	await invalidateStatsCache();
}

/**
 * Update task details (title, priority, etc.)
 */
export async function updateTask(taskId: string, updates: Partial<Task>) {
	// Keep is_completed in sync if status is being updated
	const payload: Partial<Task> = { ...updates };
	let newDone = false;

	if (updates.status) {
		payload.is_completed = isCompletedFromStatus(updates.status);
		if (updates.status === "done" && !updates.completed_at) {
			payload.completed_at = new Date().toISOString();
			newDone = true;
		} else if (updates.status !== "done") {
			payload.completed_at = null;
		}
	} else if (updates.is_completed !== undefined) {
		if (updates.is_completed) {
			newDone = true;
		}
	}

	const { data, error } = await SupabaseConn.from("tasks")
		.update(payload)
		.eq("id", taskId)
		.select()
		.single();

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

	if (newDone && data) {
		await handleRecurrenceSpawning(data as Task);
		await handleDependenciesUnblocking(taskId);
	}

	revalidatePath("/tasks");
	await invalidateStatsCache();
}

// ─── Reorder ──────────────────────────────────────────────────────────────────

/**
 * Bulk update task positions
 */
export async function reorderTasks(taskIds: string[]) {
	const promises = taskIds.map((id, index) =>
		SupabaseConn.from("tasks").update({ position: index }).eq("id", id),
	);

	const results = await Promise.all(promises);
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
	await invalidateStatsCache();
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete a task (also cascades to subtasks via ON DELETE CASCADE)
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

// ─── Stale / Overdue ──────────────────────────────────────────────────────────

/**
 * Fetch tasks that are not completed and past their due date.
 */
export async function getStaleTasks(): Promise<Task[]> {
	const today = new Date().toISOString().split("T")[0];

	const { data, error } = await SupabaseConn.from("tasks")
		.select("*")
		.eq("is_completed", false)
		.not("status", "in", '("cancelled")')
		.lt("due_date", today)
		.is("parent_id", null)
		.is("archived_at", null)
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
		.not("status", "in", '("cancelled")')
		.lt("due_date", today)
		.is("parent_id", null)
		.is("archived_at", null);

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

// ─── Phase 3 Actions ──────────────────────────────────────────────────────────

/**
 * Handle unblocking tasks that depend on the completed task.
 */
async function handleDependenciesUnblocking(completedTaskId: string) {
	const { data: dependents, error: depError } = await SupabaseConn.from(
		"task_dependencies",
	)
		.select("task_id")
		.eq("depends_on", completedTaskId);

	if (depError || !dependents || dependents.length === 0) return;

	for (const dep of dependents) {
		const dependentTaskId = dep.task_id;

		const { data: deps, error: blockerError } = await SupabaseConn.from(
			"task_dependencies",
		)
			.select("depends_on")
			.eq("task_id", dependentTaskId);

		if (blockerError || !deps) continue;

		const blockerIds = deps
			.map((d) => d.depends_on)
			.filter((id) => id !== completedTaskId);

		if (blockerIds.length > 0) {
			const { data: activeBlockers } = await SupabaseConn.from("tasks")
				.select("id")
				.in("id", blockerIds)
				.eq("is_completed", false);

			if (activeBlockers && activeBlockers.length > 0) {
				continue;
			}
		}

		await SupabaseConn.from("tasks")
			.update({ status: "todo" })
			.eq("id", dependentTaskId)
			.eq("status", "blocked");
	}
}

/**
 * Archive a task.
 */
export async function archiveTask(taskId: string) {
	const { error } = await SupabaseConn.from("tasks")
		.update({ archived_at: new Date().toISOString() })
		.eq("id", taskId);

	if (error) {
		console.error("Failed to archive task:", error);
		throw new Error("Failed to archive task");
	}

	revalidatePath("/tasks");
	await invalidateStatsCache();
}

/**
 * Unarchive a task.
 */
export async function unarchiveTask(taskId: string) {
	const { error } = await SupabaseConn.from("tasks")
		.update({ archived_at: null })
		.eq("id", taskId);

	if (error) {
		console.error("Failed to unarchive task:", error);
		throw new Error("Failed to unarchive task");
	}

	revalidatePath("/tasks");
	await invalidateStatsCache();
}

/**
 * Add a task dependency (TaskId depends on DependsOnId).
 * Automatically marks the dependent task as blocked if the blocker is incomplete.
 */
export async function addTaskDependency(taskId: string, dependsOnId: string) {
	const { error } = await SupabaseConn.from("task_dependencies").insert([
		{ task_id: taskId, depends_on: dependsOnId },
	]);

	if (error) {
		console.error("Failed to add dependency:", error);
		throw new Error("Failed to link task dependency");
	}

	const { data: blocker } = await SupabaseConn.from("tasks")
		.select("is_completed")
		.eq("id", dependsOnId)
		.single();

	if (blocker && !blocker.is_completed) {
		await SupabaseConn.from("tasks")
			.update({ status: "blocked" })
			.eq("id", taskId);
	}

	revalidatePath("/tasks");
	await invalidateStatsCache();
}

/**
 * Remove a task dependency.
 */
export async function removeTaskDependency(
	taskId: string,
	dependsOnId: string,
) {
	const { error } = await SupabaseConn.from("task_dependencies")
		.delete()
		.eq("task_id", taskId)
		.eq("depends_on", dependsOnId);

	if (error) {
		console.error("Failed to remove dependency:", error);
		throw new Error("Failed to remove task dependency");
	}

	revalidatePath("/tasks");
	await invalidateStatsCache();
}

/**
 * Get all tasks that this task depends on (blockers).
 */
export async function getTaskDependencies(taskId: string): Promise<Task[]> {
	const { data: deps, error } = await SupabaseConn.from("task_dependencies")
		.select("depends_on")
		.eq("task_id", taskId);

	if (error || !deps || deps.length === 0) return [];

	const ids = deps.map((d) => d.depends_on);
	const { data: tasks, error: tasksError } = await SupabaseConn.from("tasks")
		.select("*")
		.in("id", ids);

	if (tasksError) return [];
	return tasks as Task[];
}

/**
 * Get all tasks that depend on this task (tasks that are blocked by this task).
 */
export async function getTasksThatDependOn(taskId: string): Promise<Task[]> {
	const { data: deps, error } = await SupabaseConn.from("task_dependencies")
		.select("task_id")
		.eq("depends_on", taskId);

	if (error || !deps || deps.length === 0) return [];

	const ids = deps.map((d) => d.task_id);
	const { data: tasks, error: tasksError } = await SupabaseConn.from("tasks")
		.select("*")
		.in("id", ids);

	if (tasksError) return [];
	return tasks as Task[];
}

/**
 * Fetch all incomplete tasks that can be added as blockers.
 * Excludes the current task itself, its children, and any tasks that already depend on it (to prevent cycles).
 */
export async function getPotentialBlockers(taskId: string): Promise<Task[]> {
	const { data, error } = await SupabaseConn.from("tasks")
		.select("*")
		.eq("is_completed", false)
		.neq("id", taskId)
		.is("parent_id", null)
		.is("archived_at", null)
		.order("title", { ascending: true });

	if (error) return [];

	// Filter out tasks that depend on taskId (to prevent circular blocks)
	const { data: dependentLinks } = await SupabaseConn.from("task_dependencies")
		.select("task_id")
		.eq("depends_on", taskId);

	const dependentIds = (dependentLinks || []).map((link) => link.task_id);

	return (data as Task[]).filter((t) => !dependentIds.includes(t.id));
}
