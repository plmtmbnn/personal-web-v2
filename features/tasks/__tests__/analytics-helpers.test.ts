import { describe, it, expect } from "vitest";
import type { Task, TaskPriority } from "../types";

/**
 * Pure calculation helpers extracted from task analytics domain
 */
export function calculateTaskMetrics(tasks: Partial<Task>[], days = 7) {
	const activeTasks = tasks.filter((t) => (t.status || "todo") !== "cancelled");
	const totalTasks = activeTasks.length;
	const completedTasks = activeTasks.filter((t) => t.status === "done").length;
	const completionRate =
		totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
	const taskVelocity = parseFloat((completedTasks / days).toFixed(1));

	return { totalTasks, completedTasks, completionRate, taskVelocity };
}

export function calculateDateDistribution(
	tasks: Partial<Task>[],
	todayStr: string,
) {
	const active = tasks.filter(
		(t) => (t.status || "todo") !== "cancelled" && t.status !== "done",
	);
	return {
		today: active.filter((t) => t.due_date === todayStr).length,
		upcoming: active.filter((t) => t.due_date && t.due_date > todayStr).length,
		overdue: active.filter((t) => t.due_date && t.due_date < todayStr).length,
	};
}

export function calculatePriorityDistribution(tasks: Partial<Task>[]) {
	const counts: Record<TaskPriority, number> = { LOW: 0, MEDIUM: 0, HIGH: 0 };
	tasks.forEach((t) => {
		if (t.priority && t.priority in counts) {
			counts[t.priority]++;
		}
	});
	return counts;
}

export function calculateCategoryDistribution(tasks: Partial<Task>[]) {
	const categoryMap: Record<string, number> = {};
	tasks.forEach((t) => {
		const cat = t.category || "General";
		categoryMap[cat] = (categoryMap[cat] || 0) + 1;
	});
	return Object.entries(categoryMap)
		.map(([category, count]) => ({ category, count }))
		.sort((a, b) => b.count - a.count);
}

describe("Task Analytics Helper Logic", () => {
	const mockTasks: Partial<Task>[] = [
		{
			id: "1",
			title: "Task 1",
			status: "done",
			priority: "HIGH",
			category: "Work",
			due_date: "2026-08-10",
		},
		{
			id: "2",
			title: "Task 2",
			status: "todo",
			priority: "MEDIUM",
			category: "Work",
			due_date: "2026-08-10",
		},
		{
			id: "3",
			title: "Task 3",
			status: "in_progress",
			priority: "HIGH",
			category: "Personal",
			due_date: "2026-08-15",
		},
		{
			id: "4",
			title: "Task 4",
			status: "todo",
			priority: "LOW",
			category: "Fintech",
			due_date: "2026-08-01",
		},
		{
			id: "5",
			title: "Task 5",
			status: "cancelled",
			priority: "LOW",
			category: "Work",
			due_date: "2026-08-10",
		},
	];

	describe("calculateTaskMetrics", () => {
		it("calculates correct total, completed, completion rate, and velocity ignoring cancelled tasks", () => {
			const metrics = calculateTaskMetrics(mockTasks, 7);

			// Total active: 4 (excluding cancelled Task 5)
			expect(metrics.totalTasks).toBe(4);
			expect(metrics.completedTasks).toBe(1);
			// 1 / 4 = 25%
			expect(metrics.completionRate).toBe(25);
			// 1 / 7 = 0.1428... -> 0.1
			expect(metrics.taskVelocity).toBe(0.1);
		});

		it("returns 0 completion rate for empty tasks list", () => {
			const metrics = calculateTaskMetrics([], 7);
			expect(metrics.totalTasks).toBe(0);
			expect(metrics.completedTasks).toBe(0);
			expect(metrics.completionRate).toBe(0);
			expect(metrics.taskVelocity).toBe(0);
		});
	});

	describe("calculateDateDistribution", () => {
		it("correctly categorizes uncompleted tasks into today, upcoming, and overdue", () => {
			const todayStr = "2026-08-10";
			const dist = calculateDateDistribution(mockTasks, todayStr);

			// Uncompleted tasks: Task 2 (due today), Task 3 (due Aug 15 -> upcoming), Task 4 (due Aug 1 -> overdue)
			expect(dist.today).toBe(1);
			expect(dist.upcoming).toBe(1);
			expect(dist.overdue).toBe(1);
		});
	});

	describe("calculatePriorityDistribution", () => {
		it("counts occurrences of each priority level", () => {
			const priorityCounts = calculatePriorityDistribution(mockTasks);
			expect(priorityCounts.HIGH).toBe(2);
			expect(priorityCounts.MEDIUM).toBe(1);
			expect(priorityCounts.LOW).toBe(2);
		});
	});

	describe("calculateCategoryDistribution", () => {
		it("groups by category and sorts by count descending", () => {
			const catDist = calculateCategoryDistribution(mockTasks);

			// Work: 3, Personal: 1, Fintech: 1
			expect(catDist[0].category).toBe("Work");
			expect(catDist[0].count).toBe(3);
			expect(catDist).toHaveLength(3);
		});
	});
});
