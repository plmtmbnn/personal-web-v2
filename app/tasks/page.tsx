import PinGuard from "@/components/auth/PinGuard";
import TaskForm from "@/components/tasks/TaskForm";
import TaskList from "@/components/tasks/TaskList";
import TaskFilters from "@/components/tasks/TaskFilters";
import TaskProgress from "@/components/tasks/TaskProgress";
import TaskNotificationHandler from "@/components/tasks/TaskNotificationHandler";
import { getTasks } from "@/lib/actions/tasks";
import { LayoutList } from "lucide-react";
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
 * Daily Tasks Page
 * Fetches filtered tasks on the server and protects content with PinGuard.
 */
export default async function TasksPage({ searchParams }: PageProps) {
	const params = await searchParams;

	// Parse filters from URL
	const date = params.date;
	const priority = params.priority as TaskPriority | undefined;
	// const showCompleted: boolean = params.completed === "true";

	// Fetch filtered tasks
	const tasks = await getTasks({
		date,
		priority,
		showCompleted: true, // We fetch all to calculate progress accurately, then filter in UI if needed
	});

	// Client-side filtering logic for 'Hide Completed' is handled by searchParams influence on getTasks
	// Actually, getTasks already filters based on showCompleted.
	// To maintain accurate progress while filtering, we fetch what's needed.

	return (
		<PinGuard>
			<div className="min-h-screen bg-background p-6 md:p-12 lg:p-20 animate-fade-in">
				<div className="max-w-3xl mx-auto">
					{/* Header Section */}
					<header className="mb-12">
						<div className="flex items-center gap-3 mb-2">
							<div className="p-2 bg-accent/10 rounded-xl text-accent">
								<LayoutList className="w-6 h-6" />
							</div>
							<h1 className="gradient-text !text-4xl">Daily Tasks</h1>
						</div>
						<p className="text-muted-foreground text-lg">
							Focus on what matters today.
						</p>
					</header>
					{/* Visualization & Filters */}
					<TaskNotificationHandler tasks={tasks} />
					<TaskProgress tasks={tasks} />
					<TaskFilters />
					{/* Task Management Section */}
					<main className="space-y-10">
						<section>
							<TaskForm />
						</section>

						<section>
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-bold flex items-center gap-2">
									Agenda
									<span className="text-sm font-normal text-muted-foreground bg-background-secondary px-2 py-0.5 rounded-full">
										{tasks.length}
									</span>
								</h2>
							</div>
							<TaskList initialTasks={tasks} />
						</section>
					</main>
					...
					{/* Footer Info */}
					<footer className="mt-20 pt-10 border-t border-border text-center">
						<p className="text-sm text-muted-foreground">
							Tasks are automatically archived at the end of each day.
						</p>
					</footer>
				</div>
			</div>
		</PinGuard>
	);
}
