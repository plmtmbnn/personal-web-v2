"use server";

import { revalidatePath } from "next/cache";
import { SupabaseConn } from "@/lib/core/supabase";
import { invalidateStatsCache } from "@/lib/core/redis";
import { checkAdmin } from "@/features/auth/actions";
import type { Task, TaskPriority, TaskRecurrence, TaskStatus } from "../types";
import { addDays, addMonths, parseISO, format, isBefore } from "date-fns";
import { getJakartaDateString } from "../utils";

/**
 * Enforces admin authorization for task mutations.
 */
async function requireTasksAdmin() {
	const isAdmin = await checkAdmin();
	if (!isAdmin) {
		throw new Error("Unauthorized: Admin privileges required");
	}
}

/**
 * Handle recurrence task instance creation.
 */
async function handleRecurrenceSpawning(task: Task) {
	if (!task.recurrence || task.recurrence === "none") return;

	const todayStr = getJakartaDateString();
	const todayDate = parseISO(todayStr);
	const currentDate = parseISO(task.due_date);

	// If the completed task was overdue, calculate the next instance relative to today
	// rather than backdating it into the past.
	const baseDate = isBefore(currentDate, todayDate) ? todayDate : currentDate;

	let nextDate: Date;
	if (task.recurrence === "daily") {
		nextDate = addDays(baseDate, 1);
	} else if (task.recurrence === "weekly") {
		nextDate = addDays(baseDate, 7);
	} else if (task.recurrence === "monthly") {
		nextDate = addMonths(baseDate, 1);
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
		const baseStartDate = isBefore(currentStartDate, todayDate)
			? todayDate
			: currentStartDate;
		let nextStartDate: Date;
		if (task.recurrence === "daily") {
			nextStartDate = addDays(baseStartDate, 1);
		} else if (task.recurrence === "weekly") {
			nextStartDate = addDays(baseStartDate, 7);
		} else {
			nextStartDate = addMonths(baseStartDate, 1);
		}
		nextStartDateStr = format(nextStartDate, "yyyy-MM-dd");
	}

	// Insert next recurring task
	const { data: spawnedTask, error } = await SupabaseConn.from("tasks")
		.insert([
			{
				title: task.title,
				description: task.description,
				priority: task.priority,
				category: task.category,
				status: "todo",
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
		])
		.select()
		.single();

	if (error) {
		console.error("Failed to spawn recurring task:", error);
		return;
	}

	// Clone child subtasks for recurring rituals / checklists
	if (spawnedTask) {
		const { data: childSubtasks } = await SupabaseConn.from("tasks")
			.select("*")
			.eq("parent_id", task.id);

		if (childSubtasks && childSubtasks.length > 0) {
			const clonedSubtasks = childSubtasks.map((sub) => ({
				title: sub.title,
				parent_id: spawnedTask.id,
				priority: sub.priority,
				category: sub.category,
				due_date: nextDateStr,
				status: "todo" as TaskStatus,
				tags: sub.tags || [],
				recurrence: "none" as TaskRecurrence,
				reschedule_count: 0,
				position: sub.position,
				estimated_minutes: sub.estimated_minutes,
				completed_at: null,
			}));

			const { error: subtaskError } =
				await SupabaseConn.from("tasks").insert(clonedSubtasks);
			if (subtaskError) {
				console.error("Failed to clone recurring subtasks:", subtaskError);
			}
		}
	}
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

/**
 * Fetch tasks with optional filters.
 * Default: Today, pending (status != done)
 */
export async function getTasks(options?: {
	startDate?: string;
	endDate?: string;
	priority?: TaskPriority;
	category?: string;
	showCompletedToday?: boolean;
	includeCompleted?: boolean;
	includeOverdue?: boolean;
}): Promise<Task[]> {
	if (!(await checkAdmin())) return [];

	const today = getJakartaDateString();
	const startDate = options?.startDate || today;
	const endDate = options?.endDate || today;
	const showCompletedToday = options?.showCompletedToday ?? false;
	const includeCompleted = options?.includeCompleted ?? false;
	const includeOverdue = options?.includeOverdue ?? true;

	let query = SupabaseConn.from("tasks").select("*");

	// Handle Completion and Date Filtering
	if (includeCompleted) {
		// Show: (Due in range or overdue pending) OR (Completed in range)
		if (includeOverdue) {
			query = query.or(
				`and(due_date.lte.${endDate},status.neq.done),and(status.eq.done,completed_at.gte.${startDate}T00:00:00,completed_at.lte.${endDate}T23:59:59)`,
			);
		} else {
			query = query.or(
				`and(due_date.gte.${startDate},due_date.lte.${endDate},status.neq.done),and(status.eq.done,completed_at.gte.${startDate}T00:00:00,completed_at.lte.${endDate}T23:59:59)`,
			);
		}
	} else if (showCompletedToday) {
		if (includeOverdue) {
			query = query.or(
				`and(due_date.lte.${endDate},status.neq.done),and(status.eq.done,completed_at.gte.${today}T00:00:00,completed_at.lte.${today}T23:59:59)`,
			);
		} else {
			query = query.or(
				`and(due_date.gte.${startDate},due_date.lte.${endDate},status.neq.done),and(status.eq.done,completed_at.gte.${today}T00:00:00,completed_at.lte.${today}T23:59:59)`,
			);
		}
	} else {
		if (includeOverdue) {
			query = query.neq("status", "done").lte("due_date", endDate);
		} else {
			query = query
				.neq("status", "done")
				.gte("due_date", startDate)
				.lte("due_date", endDate);
		}
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
	if (!(await checkAdmin())) return [];

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
	start_date?: string | null;
	start_time?: string | null;
	due_time?: string | null;
}) {
	await requireTasksAdmin();

	let dueDate = payload.due_date;
	if (
		payload.start_date &&
		payload.due_date &&
		payload.start_date > payload.due_date
	) {
		dueDate = payload.start_date;
	}

	const status: TaskStatus = payload.status || "todo";
	const { data, error } = await SupabaseConn.from("tasks")
		.insert([
			{
				...payload,
				due_date: dueDate,
				status,
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
			dueDate,
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
	await requireTasksAdmin();

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
	await requireTasksAdmin();
	const status: TaskStatus = "todo";
	const { data, error } = await SupabaseConn.from("tasks")
		.insert(
			payloads.map((p) => ({
				...p,
				status: p.status || status,
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
 * Update task status.
 */
export async function updateTaskStatus(taskId: string, status: TaskStatus) {
	await requireTasksAdmin();

	const completedAt = status === "done" ? new Date().toISOString() : null;

	const { data: currentTask } = await SupabaseConn.from("tasks")
		.select("status")
		.eq("id", taskId)
		.single();

	const wasDone = currentTask?.status === "done";
	const isNowDone = status === "done";

	const { data, error } = await SupabaseConn.from("tasks")
		.update({
			status,
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

	if (isNowDone && !wasDone && data) {
		await handleRecurrenceSpawning(data as Task);
		await handleDependenciesUnblocking(taskId);
	} else if (wasDone && !isNowDone) {
		await handleDependenciesReblocking(taskId);
	}

	revalidatePath("/tasks");
	await invalidateStatsCache();
}

/**
 * Update task details (title, priority, etc.)
 */
export async function updateTask(taskId: string, updates: Partial<Task>) {
	await requireTasksAdmin();

	const payload: Partial<Task> = { ...updates };

	const { data: currentTask } = await SupabaseConn.from("tasks")
		.select("status, due_date, start_date")
		.eq("id", taskId)
		.single();

	// Clamp dates so due_date is never before start_date
	const effectiveStartDate =
		payload.start_date !== undefined
			? payload.start_date
			: currentTask?.start_date;
	const effectiveDueDate =
		payload.due_date !== undefined ? payload.due_date : currentTask?.due_date;
	if (
		effectiveStartDate &&
		effectiveDueDate &&
		effectiveStartDate > effectiveDueDate
	) {
		payload.due_date = effectiveStartDate;
	}

	const wasDone = currentTask?.status === "done";
	let becameDone = false;
	let becameUndone = false;

	if (updates.status) {
		if (updates.status === "done") {
			payload.completed_at = updates.completed_at || new Date().toISOString();
			if (!wasDone) {
				becameDone = true;
			}
		} else {
			payload.completed_at = null;
			if (wasDone) {
				becameUndone = true;
			}
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

	if (becameDone && data) {
		await handleRecurrenceSpawning(data as Task);
		await handleDependenciesUnblocking(taskId);
	} else if (becameUndone) {
		await handleDependenciesReblocking(taskId);
	}

	revalidatePath("/tasks");
	await invalidateStatsCache();
}

// ─── Reorder ──────────────────────────────────────────────────────────────────

/**
 * Bulk update task positions safely without upsert constraint violations
 */
export async function reorderTasks(taskIds: string[]) {
	await requireTasksAdmin();
	if (!taskIds.length) return;

	const updatePromises = taskIds.map((id, index) =>
		SupabaseConn.from("tasks").update({ position: index }).eq("id", id),
	);

	const results = await Promise.all(updatePromises);
	const failed = results.find((r) => r.error);

	if (failed?.error) {
		console.error("Failed to reorder tasks:", failed.error);
		throw new Error(
			`Failed to reorder ${taskIds.length} tasks. ${failed.error.message || "Please refresh the page."}`,
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
	await requireTasksAdmin();
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

// ─── Overdue Rescheduling ──────────────────────────────────────────────────────

/**
 * Reschedule all overdue tasks by adding a specific number of days.
 * Increments the reschedule_count for each task.
 */
export async function rescheduleOverdueTasks(daysToAdd: number) {
	await requireTasksAdmin();

	const today = getJakartaDateString();
	const newDate = addDays(parseISO(today), daysToAdd);
	const newDateStr = format(newDate, "yyyy-MM-dd");

	// 1. Fetch overdue tasks
	const { data: overdueTasks, error: fetchError } = await SupabaseConn.from(
		"tasks",
	)
		.select("id, reschedule_count")
		.neq("status", "done")
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

	// 2. Perform updates using parallel update queries to protect against NOT NULL upsert errors
	const updatePromises = overdueTasks.map((t) =>
		SupabaseConn.from("tasks")
			.update({
				due_date: newDateStr,
				reschedule_count: (t.reschedule_count || 0) + 1,
			})
			.eq("id", t.id),
	);

	const results = await Promise.all(updatePromises);
	const failed = results.find((r) => r.error);

	if (failed?.error) {
		console.error("Failed during bulk reschedule:", failed.error);
		return {
			success: false,
			message: `Failed to reschedule ${overdueTasks.length} tasks. ${failed.error.message || "Please try again."}`,
		};
	}

	revalidatePath("/tasks");
	await invalidateStatsCache();
	return {
		success: true,
		message: `Successfully rescheduled ${overdueTasks.length} tasks`,
	};
}

// ─── Dependencies & Lifecycle ─────────────────────────────────────────────────

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
				.neq("status", "done");

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
 * Handle re-blocking tasks when a blocker is reopened from done back to todo/in_progress.
 */
async function handleDependenciesReblocking(reopenedTaskId: string) {
	const { data: dependents, error: depError } = await SupabaseConn.from(
		"task_dependencies",
	)
		.select("task_id")
		.eq("depends_on", reopenedTaskId);

	if (depError || !dependents || dependents.length === 0) return;

	const dependentIds = dependents.map((d) => d.task_id);
	await SupabaseConn.from("tasks")
		.update({ status: "blocked" })
		.in("id", dependentIds)
		.neq("status", "done");
}

/**
 * Archive a task.
 */
export async function archiveTask(taskId: string) {
	await requireTasksAdmin();

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
	await requireTasksAdmin();

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
 * Fetch all archived tasks for review and restoration.
 */
export async function getArchivedTasks(): Promise<Task[]> {
	if (!(await checkAdmin())) return [];

	const { data, error } = await SupabaseConn.from("tasks")
		.select("*")
		.not("archived_at", "is", null)
		.is("parent_id", null)
		.order("archived_at", { ascending: false });

	if (error) {
		console.error("Failed to fetch archived tasks:", error);
		return [];
	}

	return data as Task[];
}

/**
 * Add a task dependency (TaskId depends on DependsOnId).
 * Automatically marks the dependent task as blocked if the blocker is incomplete.
 */
export async function addTaskDependency(taskId: string, dependsOnId: string) {
	await requireTasksAdmin();

	const { error } = await SupabaseConn.from("task_dependencies").insert([
		{ task_id: taskId, depends_on: dependsOnId },
	]);

	if (error) {
		console.error("Failed to add dependency:", error);
		throw new Error("Failed to link task dependency");
	}

	const { data: blocker } = await SupabaseConn.from("tasks")
		.select("status")
		.eq("id", dependsOnId)
		.single();

	if (blocker && blocker.status !== "done") {
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
	await requireTasksAdmin();

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
	if (!(await checkAdmin())) return [];

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
 * Fetch all incomplete tasks that can be added as blockers.
 * Traverses the transitive dependency tree to prevent multi-level cycles.
 */
export async function getPotentialBlockers(taskId: string): Promise<Task[]> {
	if (!(await checkAdmin())) return [];

	const { data, error } = await SupabaseConn.from("tasks")
		.select("*")
		.neq("status", "done")
		.neq("id", taskId)
		.is("parent_id", null)
		.is("archived_at", null)
		.order("title", { ascending: true });

	if (error || !data) return [];

	// Fetch all existing dependency links to compute full transitive descendant tree
	const { data: allLinks } = await SupabaseConn.from(
		"task_dependencies",
	).select("task_id, depends_on");

	const links = allLinks || [];
	const visited = new Set<string>();
	const queue = [taskId];

	// BFS traversal: find all tasks that transitively depend on taskId
	while (queue.length > 0) {
		const curr = queue.shift()!;
		for (const link of links) {
			if (link.depends_on === curr && !visited.has(link.task_id)) {
				visited.add(link.task_id);
				queue.push(link.task_id);
			}
		}
	}

	return (data as Task[]).filter((t) => !visited.has(t.id));
}

/**
 * Retrieves the count of pending actionable tasks (due today or overdue)
 * for the current authenticated admin user in Jakarta timezone.
 */
export async function getPendingTasksCount(): Promise<number> {
	const isAdmin = await checkAdmin();
	if (!isAdmin) return 0;

	try {
		const todayStr = getJakartaDateString();
		const { count, error } = await SupabaseConn.from("tasks")
			.select("*", { count: "exact", head: true })
			.is("parent_id", null)
			.is("archived_at", null)
			.neq("status", "done")
			.neq("status", "cancelled")
			.lte("due_date", todayStr);

		if (error) {
			console.error("Error fetching pending task count:", error);
			return 0;
		}
		return count || 0;
	} catch (err) {
		console.error("Error in getPendingTasksCount:", err);
		return 0;
	}
}
