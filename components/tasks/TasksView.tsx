"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import ComponentLoader from "@/components/tasks/ComponentLoader";
import { LayoutList } from "lucide-react";
import type { Task } from "@/lib/types/tasks";

/**
 * Optimization: Lazy load heavy interactive/visual components.
 * Moving these to a Client Component allows 'ssr: false' which is
 * required for components using browser APIs or complex DnD logic.
 */
const DynamicHealthCheck = dynamic(() => import("@/components/tasks/HealthCheck"), {
	loading: () => <ComponentLoader height="120px" />,
	ssr: false
});

const DynamicGeneralReport = dynamic(() => import("@/components/tasks/GeneralReport"), {
	loading: () => <ComponentLoader height="300px" />,
	ssr: false
});

const DynamicTaskNotificationHandler = dynamic(() => import("@/components/tasks/TaskNotificationHandler"), {
	ssr: false
});

const DynamicTaskProgress = dynamic(() => import("@/components/tasks/TaskProgress"), {
	loading: () => <ComponentLoader height="100px" />,
	ssr: false
});

const DynamicTaskFilters = dynamic(() => import("@/components/tasks/TaskFilters"), {
	loading: () => <div className="h-12 bg-background-secondary rounded-2xl animate-pulse mb-8" />,
	ssr: false
});

const DynamicTaskForm = dynamic(() => import("@/components/tasks/TaskForm"), {
	loading: () => <ComponentLoader height="150px" />,
	ssr: false
});

const DynamicTaskList = dynamic(() => import("@/components/tasks/TaskList"), {
	loading: () => (
		<div className="space-y-4">
			<ComponentLoader height="80px" />
			<ComponentLoader height="80px" />
			<ComponentLoader height="80px" />
		</div>
	),
	ssr: false
});

interface TasksViewProps {
	tasks: Task[];
}

export default function TasksView({ tasks }: TasksViewProps) {
	return (
		<div className="min-h-screen bg-background p-6 md:p-12 lg:p-20 animate-fade-in">
			<div className="max-w-3xl mx-auto">
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

				<Suspense fallback={<ComponentLoader height="120px" />}>
					<DynamicHealthCheck />
				</Suspense>

				<section className="mb-12">
					<Suspense fallback={<ComponentLoader height="300px" />}>
						<DynamicGeneralReport />
					</Suspense>
				</section>

				<Suspense fallback={null}>
					<DynamicTaskNotificationHandler tasks={tasks} />
				</Suspense>
				
				<Suspense fallback={<ComponentLoader height="100px" />}>
					<DynamicTaskProgress tasks={tasks} />
				</Suspense>

				<Suspense fallback={<div className="h-12 bg-background-secondary rounded-2xl animate-pulse mb-8" />}>
					<DynamicTaskFilters />
				</Suspense>

				<main className="space-y-10">
					<section>
						<Suspense fallback={<ComponentLoader height="150px" />}>
							<DynamicTaskForm />
						</Suspense>
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
						<Suspense fallback={
							<div className="space-y-4">
								<ComponentLoader height="80px" />
								<ComponentLoader height="80px" />
							</div>
						}>
							<DynamicTaskList initialTasks={tasks} />
						</Suspense>
					</section>
				</main>
			</div>
		</div>
	);
}
