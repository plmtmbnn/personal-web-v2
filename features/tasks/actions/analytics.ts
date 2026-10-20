"use server";

import { SupabaseConn } from "@/lib/core/supabase";
import { redis, CACHE_KEYS } from "@/lib/core/redis";
import { checkAdmin } from "@/features/auth/actions";
import { getJakartaDateString } from "../utils";
import type { Task, TaskPriority } from "../types";
import { subDays, format, parseISO, isSameDay, addDays } from "date-fns";

export interface AnalyticsStats {
	totalTasks: number;
	completedTasks: number;
	completionRate: number;
	mostProductiveDay: string;
	categoryDistribution: { category: string; count: number }[];
	priorityDistribution: { priority: TaskPriority; count: number }[];
	streak: number;
	comparison: number; // percentage change vs previous period
	taskVelocity: number; // avg tasks per day
	// New metrics
	totalReschedules: number;
	averageReschedule: number;
	mostRescheduledTask: { title: string; count: number } | null;
	distribution: {
		today: number;
		upcoming: number;
		overdue: number;
	};
}

/**
 * Fetch and calculate task analytics for a given period.
 * Optimization: Uses Redis Cache-Aside strategy.
 */
export async function getTaskStats(
	period: "today" | "week" | "month",
): Promise<AnalyticsStats> {
	if (!(await checkAdmin())) {
		throw new Error("Unauthorized: Admin privileges required");
	}

	const cacheKey = CACHE_KEYS.STATS(period);

	// 1. Try to fetch from Redis Cache
	try {
		const cachedData = await redis.get<AnalyticsStats>(cacheKey);
		if (cachedData) return cachedData;
	} catch (err) {
		console.error("Redis Fetch Error (Falling back to DB):", err);
	}

	// 2. Cache Miss: Fetch from Supabase
	const todayStr = getJakartaDateString();
	const today = parseISO(todayStr);
	let days: number;
	let startDate: Date;

	if (period === "today") {
		days = 1;
		startDate = today;
	} else if (period === "week") {
		days = 7;
		startDate = subDays(today, 6);
	} else {
		days = 30;
		startDate = subDays(today, 29);
	}

	const startDateStr = format(startDate, "yyyy-MM-dd");
	const endDateStr = format(today, "yyyy-MM-dd");

	// Previous period for comparison
	const prevStartDate = subDays(startDate, days);

	// Fetch current period tasks (root tasks only, non-archived)
	const { data: currentTasks, error: currentError } = await SupabaseConn.from(
		"tasks",
	)
		.select("*")
		.is("parent_id", null)
		.is("archived_at", null)
		.gte("due_date", startDateStr)
		.lte("due_date", endDateStr);

	if (currentError) {
		console.error("Error fetching current tasks for analytics:", currentError);
		throw new Error("Failed to fetch analytics data");
	}

	// Fetch all uncompleted tasks for global distribution and reschedules (root tasks only, non-archived)
	const { data: globalTasks, error: globalError } = await SupabaseConn.from(
		"tasks",
	)
		.select("title, due_date, reschedule_count, status")
		.is("parent_id", null)
		.is("archived_at", null)
		.neq("status", "done");

	if (globalError) {
		console.error("Error fetching global tasks for distribution:", globalError);
	}

	// Fetch previous period completed tasks for comparison
	const { count: prevCompletedCount } = await SupabaseConn.from("tasks")
		.select("*", { count: "exact", head: true })
		.is("parent_id", null)
		.is("archived_at", null)
		.eq("status", "done")
		.gte("completed_at", prevStartDate.toISOString())
		.lt("completed_at", startDate.toISOString());

	// Fetch current period completed tasks using completed_at for true velocity and comparison
	const { count: currentCompletedCount } = await SupabaseConn.from("tasks")
		.select("*", { count: "exact", head: true })
		.is("parent_id", null)
		.is("archived_at", null)
		.eq("status", "done")
		.gte("completed_at", startDate.toISOString())
		.lte("completed_at", new Date().toISOString());

	const tasks = ((currentTasks || []) as Task[]).filter(
		(t) => (t.status || "todo") !== "cancelled",
	);
	const totalTasks = tasks.length;
	const completedTasks = tasks.filter((t) => t.status === "done").length;
	const actualCompletedInPeriod = currentCompletedCount ?? completedTasks;
	const completionRate =
		totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
	const taskVelocity = parseFloat((actualCompletedInPeriod / days).toFixed(1));

	// Reschedule Analytics
	const { data: rescheduleData } = await SupabaseConn.from("tasks")
		.select("title, reschedule_count")
		.is("parent_id", null)
		.is("archived_at", null)
		.gt("reschedule_count", 0)
		.order("reschedule_count", { ascending: false });

	let totalReschedules = 0;
	let mostRescheduledTask = null;

	if (rescheduleData && rescheduleData.length > 0) {
		totalReschedules = rescheduleData.reduce(
			(acc, curr) => acc + (curr.reschedule_count || 0),
			0,
		);
		mostRescheduledTask = {
			title: rescheduleData[0].title,
			count: rescheduleData[0].reschedule_count,
		};
	}

	const { count: totalTaskCount } = await SupabaseConn.from("tasks")
		.select("*", { count: "exact", head: true })
		.is("parent_id", null)
		.is("archived_at", null);

	const averageReschedule =
		totalTaskCount && totalTaskCount > 0
			? parseFloat((totalReschedules / totalTaskCount).toFixed(2))
			: 0;

	// Distribution
	const todayDateStr = format(today, "yyyy-MM-dd");
	const gTasks = (globalTasks || []) as Task[];
	const distribution = {
		today: gTasks.filter(
			(t) =>
				t.due_date === todayDateStr && (t.status || "todo") !== "cancelled",
		).length,
		upcoming: gTasks.filter(
			(t) => t.due_date > todayDateStr && (t.status || "todo") !== "cancelled",
		).length,
		overdue: gTasks.filter(
			(t) => t.due_date < todayDateStr && (t.status || "todo") !== "cancelled",
		).length,
	};

	// Most Productive Day
	const dayCounts: Record<string, number> = {};
	tasks
		.filter((t) => t.status === "done" && t.completed_at)
		.forEach((t) => {
			const day = format(parseISO(t.completed_at!), "EEEE");
			dayCounts[day] = (dayCounts[day] || 0) + 1;
		});

	let mostProductiveDay = "None";
	let maxCount = 0;
	Object.entries(dayCounts).forEach(([day, count]) => {
		if (count > maxCount) {
			maxCount = count;
			mostProductiveDay = day;
		}
	});

	// Category & Priority Distribution
	const categoryMap: Record<string, number> = {};
	const priorityMap: Record<TaskPriority, number> = {
		LOW: 0,
		MEDIUM: 0,
		HIGH: 0,
	};

	tasks.forEach((t) => {
		const cat = t.category || "General";
		categoryMap[cat] = (categoryMap[cat] || 0) + 1;
		priorityMap[t.priority] = (priorityMap[t.priority] || 0) + 1;
	});

	const categoryDistribution = Object.entries(categoryMap)
		.map(([category, count]) => ({ category, count }))
		.sort((a, b) => b.count - a.count);

	const priorityDistribution = (
		Object.entries(priorityMap) as [TaskPriority, number][]
	).map(([priority, count]) => ({ priority, count }));

	// Comparison
	const prevCount = prevCompletedCount || 0;
	const comparison =
		prevCount === 0
			? actualCompletedInPeriod > 0
				? 100
				: 0
			: Math.round(((actualCompletedInPeriod - prevCount) / prevCount) * 100);

	// Streak
	const { data: allCompleted } = await SupabaseConn.from("tasks")
		.select("completed_at")
		.is("parent_id", null)
		.is("archived_at", null)
		.eq("status", "done")
		.not("completed_at", "is", null)
		.order("completed_at", { ascending: false })
		.limit(100);

	let streak = 0;
	if (allCompleted && allCompleted.length > 0) {
		const completionDates = Array.from(
			new Set(
				allCompleted.map((t) => format(parseISO(t.completed_at), "yyyy-MM-dd")),
			),
		).map((d) => parseISO(d));

		let checkDate = today;
		if (!completionDates.some((d) => isSameDay(d, today)))
			checkDate = subDays(today, 1);
		while (completionDates.some((d) => isSameDay(d, checkDate))) {
			streak++;
			checkDate = subDays(checkDate, 1);
		}
	}

	const stats = {
		totalTasks,
		completedTasks,
		completionRate,
		mostProductiveDay,
		categoryDistribution,
		priorityDistribution,
		streak,
		comparison,
		taskVelocity,
		totalReschedules,
		averageReschedule,
		mostRescheduledTask,
		distribution,
	};

	// 3. Store in Redis with 30 minute TTL (1800 seconds)
	try {
		await redis.set(cacheKey, stats, { ex: 1800 });
	} catch (err) {
		console.error("Redis Store Error:", err);
	}

	return stats;
}

interface VelocityDay {
	date: string;
	completedCount: number;
	effortMinutes: number;
}

interface BurndownDay {
	date: string;
	actualRemaining: number;
	idealRemaining: number;
}

export async function getVelocityAndBurndownData(period: "week" | "month") {
	if (!(await checkAdmin())) {
		return { velocity: [], burndown: [], totalScope: 0 };
	}

	const todayStr = getJakartaDateString();
	const today = parseISO(todayStr);
	const days = period === "week" ? 7 : 30;
	const startDate = subDays(today, days - 1);

	const startDateStr = format(startDate, "yyyy-MM-dd");
	const endDateStr = format(today, "yyyy-MM-dd");

	const { data: completedTasks, error: completedError } =
		await SupabaseConn.from("tasks")
			.select("id, completed_at, estimated_minutes, due_date, status")
			.is("parent_id", null)
			.is("archived_at", null)
			.eq("status", "done")
			.not("completed_at", "is", null)
			.gte("completed_at", `${startDateStr}T00:00:00`)
			.lte("completed_at", `${endDateStr}T23:59:59`);

	if (completedError) {
		console.error(
			"Error fetching completed tasks for velocity:",
			completedError,
		);
	}

	const { data: rangeTasks, error: rangeError } = await SupabaseConn.from(
		"tasks",
	)
		.select("id, due_date, completed_at, estimated_minutes, status")
		.is("parent_id", null)
		.is("archived_at", null)
		.not("due_date", "is", null)
		.gte("due_date", startDateStr)
		.lte("due_date", endDateStr);

	if (rangeError) {
		console.error("Error fetching range tasks for burndown:", rangeError);
	}

	const cTasks = (completedTasks || []) as Task[];
	const rTasks = ((rangeTasks || []) as Task[]).filter(
		(t) => t.status !== "cancelled",
	);

	const datesList: Date[] = [];
	for (let i = 0; i < days; i++) {
		datesList.push(addDays(startDate, i));
	}

	const velocityData: VelocityDay[] = datesList.map((d) => {
		const dateStr = format(d, "yyyy-MM-dd");
		const completedOnDay = cTasks.filter((t) => {
			const compDate = format(parseISO(t.completed_at!), "yyyy-MM-dd");
			return compDate === dateStr;
		});

		return {
			date: format(d, "dd MMM"),
			completedCount: completedOnDay.length,
			effortMinutes: completedOnDay.reduce(
				(acc, t) => acc + (t.estimated_minutes || 0),
				0,
			),
		};
	});

	const totalScope = rTasks.length;
	const burndownData: BurndownDay[] = datesList.map((d, index) => {
		const dateStr = format(d, "yyyy-MM-dd");
		const completedSoFar = rTasks.filter((t) => {
			if (t.status !== "done" || !t.completed_at) return false;
			const compDate = format(parseISO(t.completed_at), "yyyy-MM-dd");
			return compDate <= dateStr;
		}).length;

		const remaining = Math.max(0, totalScope - completedSoFar);
		const ideal =
			totalScope - (days > 1 ? (totalScope / (days - 1)) * index : 0);

		return {
			date: format(d, "dd MMM"),
			actualRemaining: remaining,
			idealRemaining: Math.max(0, parseFloat(ideal.toFixed(1))),
		};
	});

	return {
		velocity: velocityData,
		burndown: burndownData,
		totalScope,
	};
}

export interface WeeklyReviewStats {
	completedCount: number;
	createdCount: number;
	completionRate: number;
	effortNeutralized: number;
	totalDelays: number;
	carriedForwardCount: number;
	activeCategory: string;
	topWins: {
		id: string;
		title: string;
		priority: string;
		estimated_minutes: number;
	}[];
	performanceGrade: "A+" | "A" | "B" | "C" | "D";
	feedbackMessage: string;
}

export async function getWeeklyReviewStats(): Promise<WeeklyReviewStats> {
	if (!(await checkAdmin())) {
		throw new Error("Unauthorized: Admin privileges required");
	}

	const todayStr = getJakartaDateString();
	const today = parseISO(todayStr);
	const dayOfWeek = today.getDay();
	const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
	const weekStart = subDays(today, distanceToMonday);
	const weekEnd = addDays(weekStart, 6);

	const weekStartStr = format(weekStart, "yyyy-MM-dd");
	const weekEndStr = format(weekEnd, "yyyy-MM-dd");

	const [tasksByDue, tasksByCompleted] = await Promise.all([
		SupabaseConn.from("tasks")
			.select("*")
			.is("parent_id", null)
			.is("archived_at", null)
			.gte("due_date", weekStartStr)
			.lte("due_date", weekEndStr),
		SupabaseConn.from("tasks")
			.select("*")
			.is("parent_id", null)
			.is("archived_at", null)
			.gte("completed_at", `${weekStartStr}T00:00:00`)
			.lte("completed_at", `${weekEndStr}T23:59:59`),
	]);

	if (tasksByDue.error) {
		console.error("Error fetching tasks by due_date:", tasksByDue.error);
	}
	if (tasksByCompleted.error) {
		console.error(
			"Error fetching tasks by completed_at:",
			tasksByCompleted.error,
		);
	}

	const taskMap = new Map<string, Task>();
	((tasksByDue.data || []) as Task[]).forEach((t) => {
		taskMap.set(t.id, t);
	});
	((tasksByCompleted.data || []) as Task[]).forEach((t) => {
		taskMap.set(t.id, t);
	});
	const allWeekTasks = Array.from(taskMap.values());
	const activeWeekTasks = allWeekTasks.filter(
		(t) => (t.status || "todo") !== "cancelled",
	);

	const completedThisWeek = activeWeekTasks.filter((t) => {
		if (t.status !== "done" || !t.completed_at) return false;
		const compDateStr = format(parseISO(t.completed_at), "yyyy-MM-dd");
		return compDateStr >= weekStartStr && compDateStr <= weekEndStr;
	});

	const createdThisWeek = activeWeekTasks.filter((t) => {
		const createdDateStr = format(parseISO(t.created_at), "yyyy-MM-dd");
		return createdDateStr >= weekStartStr && createdDateStr <= weekEndStr;
	});

	const dueThisWeek = activeWeekTasks.filter(
		(t) => t.due_date >= weekStartStr && t.due_date <= weekEndStr,
	);
	const dueAndCompleted = dueThisWeek.filter((t) => t.status === "done");
	const completionRate =
		dueThisWeek.length > 0
			? Math.round((dueAndCompleted.length / dueThisWeek.length) * 100)
			: 100;

	const effortNeutralized = completedThisWeek.reduce(
		(acc, t) => acc + (t.estimated_minutes || 0),
		0,
	);
	const totalDelays = dueThisWeek.reduce(
		(acc, t) => acc + (t.reschedule_count || 0),
		0,
	);
	const carriedForward = activeWeekTasks.filter(
		(t) => t.status !== "done" && t.due_date <= weekEndStr,
	);

	const categoryCounts: Record<string, number> = {};
	completedThisWeek.forEach((t) => {
		const cat = t.category || "General";
		categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
	});
	let activeCategory = "None";
	let maxCatCount = 0;
	Object.entries(categoryCounts).forEach(([cat, count]) => {
		if (count > maxCatCount) {
			maxCatCount = count;
			activeCategory = cat;
		}
	});

	const topWins = completedThisWeek
		.map((t) => ({
			id: t.id,
			title: t.title,
			priority: t.priority,
			estimated_minutes: t.estimated_minutes || 0,
			score:
				(t.priority === "HIGH" ? 100 : t.priority === "MEDIUM" ? 50 : 10) +
				(t.estimated_minutes || 0),
		}))
		.sort((a, b) => b.score - a.score)
		.slice(0, 3)
		.map(({ id, title, priority, estimated_minutes }) => ({
			id,
			title,
			priority,
			estimated_minutes,
		}));

	let performanceGrade: "A+" | "A" | "B" | "C" | "D" = "C";
	let feedbackMessage = "Keep working on your objectives. Consistency is key!";

	if (completionRate >= 95) {
		performanceGrade = "A+";
		feedbackMessage =
			"Absolute masterclass! Zero friction execution. Every objective was neutralized punctually.";
	} else if (completionRate >= 80) {
		performanceGrade = "A";
		feedbackMessage =
			"Highly disciplined performance this week. Almost all targets were met successfully.";
	} else if (completionRate >= 65) {
		performanceGrade = "B";
		feedbackMessage =
			"Solid progress made. Try to minimize reschedules to build stronger execution habits.";
	} else if (completionRate >= 45) {
		performanceGrade = "C";
		feedbackMessage =
			"Moderate completion rate. Focus on estimation and scheduling realistic loads.";
	} else {
		performanceGrade = "D";
		feedbackMessage =
			"Low completion rate. Break larger objectives into smaller subtasks to regain momentum.";
	}

	return {
		completedCount: completedThisWeek.length,
		createdCount: createdThisWeek.length,
		completionRate,
		effortNeutralized,
		totalDelays,
		carriedForwardCount: carriedForward.length,
		activeCategory,
		topWins,
		performanceGrade,
		feedbackMessage,
	};
}
