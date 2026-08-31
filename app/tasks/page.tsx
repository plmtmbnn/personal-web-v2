import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
	startOfMonth,
	endOfMonth,
	subMonths,
	addMonths,
	format,
} from "date-fns";
import PinGuard from "@/features/auth/PinGuard";
import TasksView from "@/features/tasks/components/agenda/TasksView";
import { getTasks } from "@/features/tasks/actions/tasks";
import { ENV_GLOBAL } from "@/lib/core/env";
import { redis } from "@/lib/core/redis";
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
 * Handles data fetching and session protection.
 */
export default async function TasksPage({ searchParams }: PageProps) {
	// 1. Session Protection (Moving from middleware to resolve routing issues)
	if (
		ENV_GLOBAL?.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH &&
		ENV_GLOBAL?.NEXT_PUBLIC_ENABLE_PINGUARD
	) {
		const cookieStore = await cookies();
		const sessionId = cookieStore.get("app_session")?.value;

		if (!sessionId) {
			redirect("/login");
		}

		// Verify session in Redis
		const userId = await redis.get(`session:${sessionId}`);
		if (!userId) {
			// In a Server Component we can't delete the cookie directly via headers easily during render,
			// but redirecting to /login is the primary security requirement.
			redirect("/login");
		}
	}

	const params = await searchParams;
	const date = params.date;
	const priority = params.priority as TaskPriority | undefined;

	// 2. Data Fetching
	// Fetch from past month (for execution history) through future months (for upcoming awareness)
	const today = new Date();
	const rangeStart = startOfMonth(subMonths(today, 1));
	const rangeEnd = endOfMonth(addMonths(today, 6));

	const startDate = date || format(rangeStart, "yyyy-MM-dd");
	const endDate = date || format(rangeEnd, "yyyy-MM-dd");

	const tasks = await getTasks({
		startDate,
		endDate,
		priority,
		includeCompleted: true,
	});

	return (
		<PinGuard>
			<TasksView tasks={tasks} />
		</PinGuard>
	);
}
