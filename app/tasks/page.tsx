import {
	startOfMonth,
	endOfMonth,
	subMonths,
	addMonths,
	format,
	parseISO,
} from "date-fns";
import { requireAuth } from "@/features/auth/server";
import TasksView from "@/features/tasks/components/agenda/TasksView";
import { getTasks } from "@/features/tasks/actions/tasks";
import { getJakartaDateString } from "@/features/tasks/utils";
import type { TaskPriority } from "@/features/tasks/types";

export const metadata = {
	title: "Daily Tasks | Personal Hub",
	description: "Manage your daily objectives and tracking progress.",
};

interface PageProps {
	searchParams: Promise<{
		date?: string;
		priority?: string;
		completed?: string;
	}>;
}

/**
 * TasksPage (Server Component)
 * Handles data fetching and centralized session authorization.
 */
export default async function TasksPage({ searchParams }: PageProps) {
	// 1. Centralized Session & Role Protection
	await requireAuth({ requireAdmin: true, redirectTo: "/tasks" });

	const params = await searchParams;
	const date = params.date;
	const priority = params.priority as TaskPriority | undefined;

	// 2. Data Fetching
	// Fetch from past month (for execution history) through future months (for upcoming awareness)
	const todayStr = getJakartaDateString();
	const todayDate = parseISO(todayStr);
	const rangeStart = startOfMonth(subMonths(todayDate, 1));
	const rangeEnd = endOfMonth(addMonths(todayDate, 6));

	const startDate = date || format(rangeStart, "yyyy-MM-dd");
	const endDate = format(rangeEnd, "yyyy-MM-dd");

	const tasks = await getTasks({
		startDate,
		endDate,
		priority,
		includeCompleted: true,
		includeOverdue: true,
	});

	return <TasksView tasks={tasks} />;
}
