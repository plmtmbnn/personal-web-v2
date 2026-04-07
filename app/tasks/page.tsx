import PinGuard from "@/components/auth/PinGuard";
import TasksView from "@/components/tasks/TasksView";
import { getTasks } from "@/lib/actions/tasks";
import type { TaskPriority } from "@/lib/types/tasks";

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
 * Handles data fetching and wraps the client-side view in PinGuard.
 */
export default async function TasksPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const date = params.date;
	const priority = params.priority as TaskPriority | undefined;

	// Server-side data fetch
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
