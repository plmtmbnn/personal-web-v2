import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/core/supabase-server";
import {
	taskFieldsSchema,
	taskCreateSchema,
	taskIdSchema,
	taskIdsSchema,
	rolloverSchema,
} from "../validation";
import { isTaskDate, jakartaMidnight, nextDate } from "../dates";
import { invalidateStatsCache } from "@/lib/core/redis";
import { checkAdmin } from "@/features/auth/actions";
import type { Task, TaskPriority, TaskRecurrence, TaskStatus } from "../types";
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
	allActive?: boolean;
}): Promise<Task[]> {
	if (!(await checkAdmin())) return [];

	const today = getJakartaDateString();
	if (
		(options?.startDate && !isTaskDate(options.startDate)) ||
		(options?.endDate && !isTaskDate(options.endDate))
	)
		throw new Error("Invalid task date range");
	const startDate = options?.startDate || today;
	const endDate = options?.endDate || today;
	const showCompletedToday = options?.showCompletedToday ?? false;
	const includeCompleted = options?.includeCompleted ?? false;
	const includeOverdue = options?.includeOverdue ?? true;

	let query = (await createAdminClient()).from("tasks").select("*");

	// Handle Completion and Date Filtering
	if (options?.allActive) {
		query = query.or(
			`status.neq.done,and(status.eq.done,completed_at.gte.${jakartaMidnight(startDate)},completed_at.lt.${jakartaMidnight(nextDate(endDate))})`,
		);
	} else if (includeCompleted) {
		// Show: (Due in range or overdue pending) OR (Completed in range)
		if (includeOverdue) {
			query = query.or(
				`and(due_date.lte.${endDate},status.neq.done),and(status.eq.done,completed_at.gte.${jakartaMidnight(startDate)},completed_at.lt.${jakartaMidnight(nextDate(endDate))})`,
			);
		} else {
			query = query.or(
				`and(due_date.gte.${startDate},due_date.lte.${endDate},status.neq.done),and(status.eq.done,completed_at.gte.${jakartaMidnight(startDate)},completed_at.lt.${jakartaMidnight(nextDate(endDate))})`,
			);
		}
	} else if (showCompletedToday) {
		if (includeOverdue) {
			query = query.or(
				`and(due_date.lte.${endDate},status.neq.done),and(status.eq.done,completed_at.gte.${jakartaMidnight(today)},completed_at.lt.${jakartaMidnight(nextDate(today))})`,
			);
		} else {
			query = query.or(
				`and(due_date.gte.${startDate},due_date.lte.${endDate},status.neq.done),and(status.eq.done,completed_at.gte.${jakartaMidnight(today)},completed_at.lt.${jakartaMidnight(nextDate(today))})`,
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

	const tasks: Task[] = [];
	for (let offset = 0; ; offset += 1000) {
		const { data, error } = await query
			.order("position", { ascending: true })
			.order("id", { ascending: true })
			.range(offset, offset + 999);
		if (error) throw new Error("Could not load tasks. Please retry.");
		tasks.push(...(data as Task[]));
		if (data.length < 1000) return tasks;
	}
}

/**
 * Fetch all subtasks (children) for a given parent task.
 */
export async function getSubtasks(parentId: string): Promise<Task[]> {
	if (!(await checkAdmin())) return [];

	const { data, error } = await (await createAdminClient())
		.from("tasks")
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
	payload = taskCreateSchema.parse(payload) as typeof payload;

	let dueDate = payload.due_date;
	if (
		payload.start_date &&
		payload.due_date &&
		payload.start_date > payload.due_date
	) {
		dueDate = payload.start_date;
	}

	const status: TaskStatus = payload.status || "todo";
	const { data, error } = await (await createAdminClient())
		.from("tasks")
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
	taskIdSchema.parse(payload.parent_id);
	taskFieldsSchema.parse({
		title: payload.title,
		priority: payload.priority,
		due_date: payload.due_date,
		estimated_minutes: payload.estimated_minutes,
	});

	// Inherit parent's due_date and priority if not specified
	const { data: parent, error: parentError } = await (await createAdminClient())
		.from("tasks")
		.select("due_date, priority, category")
		.eq("id", payload.parent_id)
		.single();

	if (parentError || !parent) {
		throw new Error("Parent task not found");
	}

	const { data, error } = await (await createAdminClient())
		.from("tasks")
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
	if (!Array.isArray(payloads) || payloads.length > 1000 || !payloads.length)
		throw new Error("Invalid task batch");
	payloads = payloads.map((p) => taskCreateSchema.parse(p) as typeof p);
	const status: TaskStatus = "todo";
	const { data, error } = await (await createAdminClient())
		.from("tasks")
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

/**
 * Update task status.
 */
export async function updateTaskStatus(taskId: string, status: TaskStatus) {
	await updateTask(taskId, { status });
}

export async function updateTask(taskId: string, updates: Partial<Task>) {
	await requireTasksAdmin();
	taskIdSchema.parse(taskId);
	const payload = taskFieldsSchema.parse(updates);
	const db = await createAdminClient();
	const { error } = await db.rpc("task_apply", {
		p_updates: [{ id: taskId, ...payload }],
	});
	if (error) throw new Error(`Failed to save task. ${error.message}`);
	revalidatePath("/tasks");
	await invalidateStatsCache();
}

export async function reorderTasks(
	taskIds: string[],
	move?: { id: string; updates: Partial<Task> },
) {
	await requireTasksAdmin();
	taskIdsSchema.parse(taskIds);
	const changes = move ? taskFieldsSchema.parse(move.updates) : {};
	if (move && !taskIds.includes(taskIdSchema.parse(move.id)))
		throw new Error("Moved task is missing from destination");
	const db = await createAdminClient();
	const { error } = await db.rpc("task_apply", {
		p_updates: taskIds.map((id, position) => ({
			id,
			position,
			...(move?.id === id ? changes : {}),
		})),
	});
	if (error) throw new Error(`Failed to move tasks. ${error.message}`);
	revalidatePath("/tasks");
	await invalidateStatsCache();
}

/**
 * Delete a task (also cascades to subtasks via ON DELETE CASCADE)
 */
export async function deleteTask(taskId: string) {
	await requireTasksAdmin();
	taskIdSchema.parse(taskId);
	const { error } = await (await createAdminClient())
		.from("tasks")
		.delete()
		.eq("id", taskId);

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

export async function rescheduleOverdueTasks(input: {
	ids: string[];
	previewDate: string;
	targetDate: string;
}) {
	await requireTasksAdmin();
	const { ids, previewDate, targetDate } = rolloverSchema.parse(input);
	const db = await createAdminClient();
	const { error } = await db.rpc("task_rollover", {
		p_ids: ids,
		p_preview_date: previewDate,
		p_target_date: targetDate,
	});
	if (error) throw new Error(`Could not reschedule tasks. ${error.message}`);
	revalidatePath("/tasks");
	await invalidateStatsCache();
	return {
		success: true,
		message: `Rescheduled ${ids.length} tasks to ${targetDate}`,
	};
}

/**
 * Archive a task.
 */
export async function archiveTask(taskId: string) {
	await requireTasksAdmin();
	taskIdSchema.parse(taskId);

	const { error } = await (await createAdminClient())
		.from("tasks")
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
	taskIdSchema.parse(taskId);

	const { error } = await (await createAdminClient())
		.from("tasks")
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

	const { data, error } = await (await createAdminClient())
		.from("tasks")
		.select("*")
		.not("archived_at", "is", null)
		.is("parent_id", null)
		.order("archived_at", { ascending: false });

	if (error) {
		console.error("Failed to fetch archived tasks:", error);
		throw new Error("Could not load tasks. Please retry.");
	}

	return data as Task[];
}

/**
 * Add a task dependency (TaskId depends on DependsOnId).
 * Automatically marks the dependent task as blocked if the blocker is incomplete.
 */
export async function addTaskDependency(taskId: string, dependsOnId: string) {
	await requireTasksAdmin();
	const db = await createAdminClient();
	const { error } = await db.rpc("task_dependency", {
		p_task_id: taskIdSchema.parse(taskId),
		p_depends_on: taskIdSchema.parse(dependsOnId),
		p_remove: false,
	});
	if (error) throw new Error(error.message);
	revalidatePath("/tasks");
	await invalidateStatsCache();
}

export async function removeTaskDependency(
	taskId: string,
	dependsOnId: string,
) {
	await requireTasksAdmin();
	const db = await createAdminClient();
	const { error } = await db.rpc("task_dependency", {
		p_task_id: taskIdSchema.parse(taskId),
		p_depends_on: taskIdSchema.parse(dependsOnId),
		p_remove: true,
	});
	if (error) throw new Error(error.message);
	revalidatePath("/tasks");
	await invalidateStatsCache();
}

/**
 * Get all tasks that this task depends on (blockers).
 */
export async function getTaskDependencies(taskId: string): Promise<Task[]> {
	if (!(await checkAdmin())) return [];

	const { data: deps, error } = await (await createAdminClient())
		.from("task_dependencies")
		.select("depends_on")
		.eq("task_id", taskId);

	if (error || !deps || deps.length === 0) return [];

	const ids = deps.map((d) => d.depends_on);
	const { data: tasks, error: tasksError } = await (await createAdminClient())
		.from("tasks")
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

	const { data, error } = await (await createAdminClient())
		.from("tasks")
		.select("*")
		.neq("status", "done")
		.neq("id", taskId)
		.is("parent_id", null)
		.is("archived_at", null)
		.order("title", { ascending: true });

	if (error || !data) return [];

	// Fetch all existing dependency links to compute full transitive descendant tree
	const { data: allLinks } = await (await createAdminClient())
		.from("task_dependencies")
		.select("task_id, depends_on");

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
		const { count, error } = await (await createAdminClient())
			.from("tasks")
			.select("*", { count: "exact", head: true })
			.is("parent_id", null)
			.is("archived_at", null)
			.neq("status", "done")
			.neq("status", "cancelled")
			.lte("due_date", todayStr)
			.or(`start_date.is.null,start_date.lte.${todayStr}`);

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
