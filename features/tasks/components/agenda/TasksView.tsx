"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { startOfDay, isSameDay, isAfter, parseISO } from "date-fns";
import ComponentLoader from "@/features/tasks/components/shared/ComponentLoader";
import TaskErrorBoundary from "@/features/tasks/components/shared/TaskErrorBoundary";
import { ToastProvider } from "@/features/tasks/components/shared/Toast";
import {
	Skeleton,
	TaskListSkeleton,
	TaskFormSkeleton,
	AnalyticsDashboardSkeleton,
	TaskProgressSkeleton,
} from "@/features/tasks/components/shared/Skeleton";
import QuickNav, {
	type TaskViewTab,
} from "@/features/tasks/components/shared/QuickNav";
import { LayoutList, Target, Plus, Kanban } from "lucide-react";
import type { Task } from "@/features/tasks/types";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/**
 * Optimization: Lazy load heavy interactive/visual components.
 */
const DynamicHealthCheck = dynamic(
	() => import("@/features/tasks/components/health/HealthCheck"),
	{
		loading: () => (
			<div className="p-5">
				<Skeleton height="100px" />
			</div>
		),
		ssr: false,
	},
);

const DynamicGeneralReport = dynamic(
	() => import("@/features/tasks/components/analytics/GeneralReport"),
	{
		loading: () => <AnalyticsDashboardSkeleton />,
		ssr: false,
	},
);

const DynamicTaskNotificationHandler = dynamic(
	() => import("@/features/tasks/components/shared/TaskNotificationHandler"),
	{
		ssr: false,
	},
);

const DynamicTaskProgress = dynamic(
	() => import("@/features/tasks/components/analytics/TaskProgress"),
	{
		loading: () => <TaskProgressSkeleton />,
		ssr: false,
	},
);

const DynamicTaskForm = dynamic(
	() => import("@/features/tasks/components/agenda/TaskForm"),
	{
		loading: () => <TaskFormSkeleton />,
		ssr: false,
	},
);

const DynamicTaskList = dynamic(
	() => import("@/features/tasks/components/agenda/TaskList"),
	{
		loading: () => <TaskListSkeleton />,
		ssr: false,
	},
);

const DynamicTaskBoard = dynamic(
	() => import("@/features/tasks/components/agenda/TaskBoard"),
	{
		loading: () => <TaskListSkeleton />,
		ssr: false,
	},
);

const DynamicWeeklyReview = dynamic(
	() => import("@/features/tasks/components/analytics/WeeklyReview"),
	{
		loading: () => <TaskListSkeleton />,
		ssr: false,
	},
);

interface TasksViewProps {
	tasks: Task[];
}

export default function TasksView({ tasks }: TasksViewProps) {
	const searchParams = useSearchParams();
	const categoryParam = searchParams.get("category");
	const priorityParam = searchParams.get("priority");

	const selectedCategory = categoryParam || null;
	const selectedPriority = priorityParam || null;

	const [mounted, setMounted] = useState(false);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<TaskViewTab>("agenda");
	const [viewMode, setViewMode] = useState<"list" | "board">("list");
	const reduceMotion = useReducedMotion();

	useEffect(() => {
		setMounted(true);
	}, []);

	const { todayTasks, upcomingTasks, completedTasks, todayStats } =
		useMemo(() => {
			let filtered = tasks;
			if (selectedCategory) {
				filtered = filtered.filter((t) => t.category === selectedCategory);
			}
			if (selectedPriority) {
				filtered = filtered.filter((t) => t.priority === selectedPriority);
			}

			const todayRef = startOfDay(new Date());
			const todayList = filtered.filter((t) =>
				isSameDay(parseISO(t.due_date), todayRef),
			);
			const upcomingList = filtered.filter((t) =>
				isAfter(parseISO(t.due_date), todayRef),
			);

			// Exclude cancelled tasks from active lists
			const isActive = (t: Task) => (t.status || "todo") !== "cancelled";
			const isDone = (t: Task) => t.status === "done";
			const isActionable = (t: Task) => {
				if (!t.start_date) return true;
				return !isAfter(parseISO(t.start_date), todayRef);
			};

			return {
				todayTasks: todayList.filter(
					(t) => !isDone(t) && isActive(t) && isActionable(t),
				),
				upcomingTasks: upcomingList.filter((t) => !isDone(t) && isActive(t)),
				completedTasks: filtered.filter((t) => isDone(t)),
				todayStats: {
					completed: todayList.filter((t) => isDone(t)).length,
					total: todayList.filter((t) => isActive(t) && isActionable(t)).length,
				},
			};
		}, [tasks, selectedCategory, selectedPriority]);

	if (!mounted) return null;

	return (
		<TaskErrorBoundary>
			<ToastProvider>
				<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32">
					{/* Mobile-Only Drawer */}
					<Suspense fallback={null}>
						<div className="lg:hidden">
							<DynamicTaskForm
								isOpen={isFormOpen}
								onClose={() => setIsFormOpen(false)}
							/>
						</div>
					</Suspense>

					{/* Floating Navigation Switcher */}
					<QuickNav activeTab={activeTab} onTabChange={setActiveTab} />

					{/* Structural Dark Hero Header */}
					<div className="bg-slate-900 border-b border-slate-800 mb-10 pt-8 sm:pt-10 pb-10 sm:pb-12 text-white shadow-md">
						<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
								<div className="space-y-2 text-center sm:text-left">
									<div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
										<Target className="w-4 h-4 text-emerald-400" />
										Operations Hub
									</div>
									<h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
										Daily Objectives
									</h1>
									<p className="text-slate-400 text-xs font-semibold">
										Strategic task orchestration and execution tracking.
									</p>
								</div>

								<div className="flex items-center justify-center gap-3">
									<div className="px-5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-center shadow-xs">
										<p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-0.5">
											Completion
										</p>
										<p className="text-base font-extrabold text-white">
											{todayStats.completed}/{todayStats.total}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 relative z-10">
						<AnimatePresence mode="wait">
							{activeTab === "analytics" ? (
								<motion.div
									key="analytics"
									initial={reduceMotion ? false : { opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									className="space-y-6 sm:space-y-8"
								>
									{/* Analytics & Status Grid */}
									<section className="space-y-6">
										<Suspense fallback={<ComponentLoader height="120px" />}>
											<DynamicGeneralReport tasks={tasks} />
										</Suspense>
									</section>
								</motion.div>
							) : activeTab === "review" ? (
								<motion.div
									key="review"
									initial={reduceMotion ? false : { opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									className="space-y-6 sm:space-y-8"
								>
									<Suspense fallback={<ComponentLoader height="120px" />}>
										<DynamicWeeklyReview />
									</Suspense>
								</motion.div>
							) : (
								<motion.div
									key="agenda"
									initial={reduceMotion ? false : { opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									className="space-y-6 sm:space-y-8"
								>
									<Suspense fallback={<ComponentLoader height="80px" />}>
										<DynamicTaskProgress tasks={tasks} />
									</Suspense>

									<Suspense fallback={<ComponentLoader height="100px" />}>
										<DynamicHealthCheck />
									</Suspense>

									<Suspense fallback={null}>
										<DynamicTaskNotificationHandler tasks={tasks} />
									</Suspense>

									{/* Execution Engine (Task Management) */}
									<section id="agenda-section">
										<div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200/80 shadow-xl shadow-slate-200/50 overflow-hidden">
											{/* Input Form Area - Hidden on Mobile (moved to Drawer) */}
											<div className="p-6 sm:p-8 bg-slate-50/50 border-b border-slate-100 hidden lg:block">
												<Suspense fallback={<ComponentLoader height="120px" />}>
													<DynamicTaskForm />
												</Suspense>
											</div>

											{/* List Area */}
											<div className="p-6 sm:p-8">
												<div className="flex items-center justify-between mb-6 sm:mb-8 border-b border-slate-100 pb-4">
													<div className="flex items-center gap-3">
														<div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
															<LayoutList className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
														</div>
														<h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
															Active Agenda
														</h2>
													</div>
													<div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
														<button
															type="button"
															onClick={() => setViewMode("list")}
															className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
																viewMode === "list"
																	? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
																	: "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
															}`}
														>
															<LayoutList className="w-3.5 h-3.5" /> List
														</button>
														<button
															type="button"
															onClick={() => setViewMode("board")}
															className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
																viewMode === "board"
																	? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
																	: "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
															}`}
														>
															<Kanban className="w-3.5 h-3.5" /> Board
														</button>
													</div>
												</div>

												<Suspense
													fallback={
														<div className="space-y-3">
															<ComponentLoader height="60px" />
															<ComponentLoader height="60px" />
														</div>
													}
												>
													{viewMode === "board" ? (
														<DynamicTaskBoard
															todayTasks={todayTasks}
															upcomingTasks={upcomingTasks}
															completedTasks={completedTasks}
														/>
													) : (
														<DynamicTaskList
															todayTasks={todayTasks}
															upcomingTasks={upcomingTasks}
															completedTasks={completedTasks}
														/>
													)}
												</Suspense>
											</div>
										</div>
									</section>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* Mobile-Only FAB */}
					<button
						onClick={() => setIsFormOpen(true)}
						className="fixed bottom-24 right-6 sm:right-8 z-40 w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl lg:hidden active:scale-95 transition-transform cursor-pointer"
					>
						<Plus className="w-7 h-7" />
					</button>
				</main>
			</ToastProvider>
		</TaskErrorBoundary>
	);
}
