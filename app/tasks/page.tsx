import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import PinGuard from "@/features/auth/PinGuard";
import TasksView from "@/features/tasks/components/TasksView";
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
	if (ENV_GLOBAL?.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH !== "false") {
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
	const tasks = await getTasks({
		date,
		priority,
		showCompleted: true,
	});

	return (
		<PinGuard>
			<TasksView tasks={tasks} />
		</PinGuard>
	);
}
