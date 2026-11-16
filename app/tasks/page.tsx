import {
	startOfMonth,
	startOfWeek,
	addDays,
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
import { completionWeekOffset, isTaskDate } from "@/features/tasks/dates";

export const metadata = {
	title: "Daily Tasks | Personal Hub",
	description: "Manage your daily objectives and tracking progress.",
};

interface PageProps {
	searchParams: Promise<{
		date?: string;
		priority?: string;
		completed?: string;
		completed_week_offset?: string;
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
	const date = isTaskDate(params.date) ? params.date : undefined;

	// 2. Data Fetching
	// Fetch from past month (for execution history) through future months (for upcoming awareness)
	const todayStr = getJakartaDateString();
	const todayDate = parseISO(todayStr);
	const rangeStart = startOfMonth(subMonths(todayDate, 1));
	const rangeEnd = endOfMonth(addMonths(todayDate, 6));

	const selectedWeek = addDays(
		startOfWeek(todayDate, { weekStartsOn: 1 }),
		completionWeekOffset(params.completed_week_offset) * 7,
	);
	const startDate =
		date ||
		format(
			Math.min(selectedWeek.getTime(), rangeStart.getTime()),
			"yyyy-MM-dd",
		);
	const endDate = format(rangeEnd, "yyyy-MM-dd");

	const tasks = await getTasks({
		startDate,
		endDate,
		includeCompleted: true,
		includeOverdue: true,
		allActive: true,
	});

	return <TasksView tasks={tasks} />;
}
