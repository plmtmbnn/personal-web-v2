"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
	startOfDay,
	isSameDay,
	isAfter,
	isBefore,
	parseISO,
	addDays,
} from "date-fns";
import TaskErrorBoundary from "@/features/tasks/components/shared/TaskErrorBoundary";
import { ToastProvider } from "@/features/tasks/components/shared/Toast";
import {
	TaskListSkeleton,
	TaskFormSkeleton,
	AnalyticsDashboardSkeleton,
} from "@/features/tasks/components/shared/Skeleton";
import {
	LayoutList,
	Plus,
	Kanban,
	ChevronRight,
	Archive,
	BarChart3,
	CalendarDays,
} from "lucide-react";
import Link from "next/link";
import type { Task, TaskViewTab } from "@/features/tasks/types";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import TaskFilters from "@/features/tasks/components/agenda/TaskFilters";

const DynamicGeneralReport = dynamic(
	() => import("@/features/tasks/components/analytics/GeneralReport"),
	{
		loading: () => <AnalyticsDashboardSkeleton />,
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

const DynamicArchiveModal = dynamic(
	() => import("@/features/tasks/components/agenda/ArchiveModal"),
	{
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
	const statusParam = searchParams.get("status");
	const searchParam = searchParams.get("search");

	const selectedCategory = categoryParam || null;
	const selectedPriority = priorityParam || null;
	const selectedStatus = statusParam || null;
	const searchQuery = searchParam?.toLowerCase() || null;

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isArchiveOpen, setIsArchiveOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<TaskViewTab>("agenda");
	const [viewMode, setViewMode] = useState<"list" | "board">("list");
	const reduceMotion = useReducedMotion();

	const todayRef = useMemo(() => startOfDay(new Date()), []);

	// Executive Telemetry: Accurate sitewide metrics across all tasks
	const { todayStats, next7DaysCount, next30DaysCount, totalActiveCount } =
		useMemo(() => {
			const isActive = (t: Task) => (t.status || "todo") !== "cancelled";
			const isDone = (t: Task) => t.status === "done";
			const isFuture = (t: Task) =>
				Boolean(t.start_date && isAfter(parseISO(t.start_date), todayRef));

			const todayTasksAll = tasks.filter(
				(t) =>
					isSameDay(parseISO(t.due_date), todayRef) &&
					(isDone(t) || (isActive(t) && !isFuture(t))),
			);
			const todayCompleted = todayTasksAll.filter((t) => isDone(t)).length;

			const next7Days = tasks.filter(
				(t) =>
					!isDone(t) &&
					isActive(t) &&
					isAfter(parseISO(t.due_date), todayRef) &&
					!isAfter(parseISO(t.due_date), addDays(todayRef, 7)),
			).length;

			const next30Days = tasks.filter(
				(t) =>
					!isDone(t) &&
					isActive(t) &&
					isAfter(parseISO(t.due_date), todayRef) &&
					!isAfter(parseISO(t.due_date), addDays(todayRef, 30)),
			).length;

			const totalActive = tasks.filter((t) => !isDone(t) && isActive(t)).length;

			return {
				todayStats: {
					completed: todayCompleted,
					total: todayTasksAll.length,
				},
				next7DaysCount: next7Days,
				next30DaysCount: next30Days,
				totalActiveCount: totalActive,
			};
		}, [tasks, todayRef]);

	// Filtered & Bucketed Tasks for Active Agenda
	const { overdueTasks, todayTasks, upcomingTasks, completedTasks } =
		useMemo(() => {
			let filtered = tasks;
			if (selectedCategory && selectedCategory !== "all") {
				filtered = filtered.filter((t) => t.category === selectedCategory);
			}
			if (selectedPriority && selectedPriority !== "all") {
				filtered = filtered.filter((t) => t.priority === selectedPriority);
			}
			if (selectedStatus && selectedStatus !== "all") {
				filtered = filtered.filter(
					(t) => (t.status || "todo") === selectedStatus,
				);
			}
			if (searchQuery) {
				filtered = filtered.filter(
					(t) =>
						(t.title || "").toLowerCase().includes(searchQuery) ||
						(t.description || "").toLowerCase().includes(searchQuery),
				);
			}

			const isActive = (t: Task) => (t.status || "todo") !== "cancelled";
			const isDone = (t: Task) => t.status === "done";
			const isFuture = (t: Task) =>
				Boolean(t.start_date && isAfter(parseISO(t.start_date), todayRef));

			// Overdue: past due, not done, active, and not scheduled for future start
			const overdue = filtered.filter(
				(t) =>
					!isDone(t) &&
					isActive(t) &&
					!isFuture(t) &&
					isBefore(parseISO(t.due_date), todayRef),
			);

			// Today: due today, not done, active, and actionable today
			const today = filtered.filter(
				(t) =>
					!isDone(t) &&
					isActive(t) &&
					!isFuture(t) &&
					isSameDay(parseISO(t.due_date), todayRef),
			);

			// Upcoming: due in future OR start_date in future, not done, active
			// Air-tight fix: tasks with future start_date never disappear into a black hole
			const upcoming = filtered.filter(
				(t) =>
					!isDone(t) &&
					isActive(t) &&
					(isAfter(parseISO(t.due_date), todayRef) || isFuture(t)),
			);

			// Completed: all completed tasks matching filters
			const completed = filtered.filter((t) => isDone(t));

			return {
				overdueTasks: overdue,
				todayTasks: today,
				upcomingTasks: upcoming,
				completedTasks: completed,
			};
		}, [
			tasks,
			selectedCategory,
			selectedPriority,
			selectedStatus,
			searchQuery,
			todayRef,
		]);

	const tabs: { id: TaskViewTab; label: string; icon: typeof LayoutList }[] = [
		{ id: "agenda", label: "Agenda", icon: LayoutList },
		{ id: "analytics", label: "Analytics", icon: BarChart3 },
		{ id: "review", label: "Weekly Review", icon: CalendarDays },
	];

	return (
		<TaskErrorBoundary>
			<ToastProvider>
				<main className="min-h-screen bg-slate-50/80 relative overflow-x-hidden pb-32">
					{/* Mobile-Only Drawer */}
					<Suspense fallback={null}>
						<div className="lg:hidden">
							<DynamicTaskForm
								isOpen={isFormOpen}
								onClose={() => setIsFormOpen(false)}
							/>
						</div>
					</Suspense>

					{/* Top Consolidated Header Card */}
					<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 mb-6 sm:mb-8 relative z-10">
						<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
							{/* Header Breadcrumbs & Title */}
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
									<Link
										href="/admin"
										className="!text-slate-500 hover:!text-slate-900 transition-colors !no-underline"
									>
										Admin Dashboard
									</Link>
									<ChevronRight className="w-3 h-3 text-slate-400" />
									<span className="text-slate-900 font-bold">
										Tasks & Execution
									</span>
								</div>
								<h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
									Daily Objectives
								</h1>
								<p className="text-sm text-slate-500 max-w-xl leading-relaxed">
									Organize, track, and execute daily priorities and weekly
									review goals.
								</p>
							</div>

							{/* 4-Tile Telemetry Strip */}
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
								{/* Tile 1: Today's Progress */}
								<div className="px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/80 rounded-2xl text-center shadow-2xs">
									<p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-0.5">
										Today&apos;s Progress
									</p>
									<div className="flex items-baseline justify-center gap-1.5">
										<span className="text-lg font-black text-slate-900 tracking-tight">
											{todayStats.completed}
										</span>
										<span className="text-xs font-bold text-slate-400">
											/ {todayStats.total}
										</span>
										<span
											className={`text-[10px] font-bold ml-1 px-1.5 py-0.5 rounded-md ${
												todayStats.total > 0 &&
												todayStats.completed === todayStats.total
													? "text-emerald-700 bg-emerald-100/80"
													: "text-slate-600 bg-slate-200/70"
											}`}
										>
											{todayStats.total > 0
												? `${Math.round((todayStats.completed / todayStats.total) * 100)}%`
												: "0%"}
										</span>
									</div>
								</div>

								{/* Tile 2: Next 7 Days */}
								<div className="px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/80 rounded-2xl text-center shadow-2xs">
									<p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-0.5">
										Next 7 Days
									</p>
									<div className="flex items-baseline justify-center gap-1">
										<span className="text-lg font-black text-slate-900 tracking-tight">
											{next7DaysCount}
										</span>
										<span className="text-xs font-bold text-slate-400">
											tasks
										</span>
									</div>
								</div>

								{/* Tile 3: Next 30 Days */}
								<div className="px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/80 rounded-2xl text-center shadow-2xs">
									<p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-0.5">
										Next 30 Days
									</p>
									<div className="flex items-baseline justify-center gap-1">
										<span className="text-lg font-black text-slate-900 tracking-tight">
											{next30DaysCount}
										</span>
										<span className="text-xs font-bold text-slate-400">
											tasks
										</span>
									</div>
								</div>

								{/* Tile 4: Total Active */}
								<div className="px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/80 rounded-2xl text-center shadow-2xs">
									<p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-0.5">
										Total Active
									</p>
									<div className="flex items-baseline justify-center gap-1">
										<span className="text-lg font-black text-slate-900 tracking-tight">
											{totalActiveCount}
										</span>
										<span className="text-xs font-bold text-slate-400">
											tasks
										</span>
									</div>
								</div>
							</div>

							{/* In-Flow Tab Switcher */}
							<div className="flex items-center gap-2 border-t border-slate-100 pt-3 -mb-1">
								{tabs.map((tab) => {
									const isActive = activeTab === tab.id;
									const Icon = tab.icon;
									return (
										<button
											key={tab.id}
											type="button"
											onClick={() => setActiveTab(tab.id)}
											className={`relative px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
												isActive
													? "text-slate-900"
													: "text-slate-400 hover:text-slate-700"
											}`}
										>
											<Icon className="w-4 h-4" />
											<span>{tab.label}</span>
											{isActive && (
												<motion.div
													layoutId="tasks-tab-underline"
													className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"
													transition={{
														type: "spring",
														stiffness: 500,
														damping: 35,
													}}
												/>
											)}
										</button>
									);
								})}
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
									<Suspense fallback={<AnalyticsDashboardSkeleton />}>
										<DynamicGeneralReport tasks={tasks} />
									</Suspense>
								</motion.div>
							) : activeTab === "review" ? (
								<motion.div
									key="review"
									initial={reduceMotion ? false : { opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									className="space-y-6 sm:space-y-8"
								>
									<Suspense fallback={<TaskListSkeleton />}>
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
									{/* Execution Engine (Task Management) */}
									<section id="agenda-section">
										<div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200/80 shadow-xl shadow-slate-200/50 overflow-hidden">
											{/* Input Form Area - Hidden on Mobile (moved to Drawer) */}
											<div className="p-6 sm:p-8 bg-slate-50/50 border-b border-slate-100 hidden lg:block">
												<Suspense fallback={<TaskFormSkeleton />}>
													<DynamicTaskForm />
												</Suspense>
											</div>

											{/* Active Agenda Content */}
											<div className="p-6 sm:p-8 space-y-6">
												{/* Agenda Action Bar */}
												<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
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
														<button
															type="button"
															onClick={() => setIsArchiveOpen(true)}
															className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-slate-100"
															title="View Archived Tasks"
														>
															<Archive className="w-3.5 h-3.5" /> Archive
														</button>
													</div>
												</div>

												{/* Unified Agenda Filter Toolbar */}
												<TaskFilters
													tasks={tasks}
													paramPrefix=""
													showRangeFilter={false}
												/>

												<Suspense fallback={<TaskListSkeleton />}>
													{viewMode === "board" ? (
														<DynamicTaskBoard
															overdueTasks={overdueTasks}
															todayTasks={todayTasks}
															upcomingTasks={upcomingTasks}
															completedTasks={completedTasks}
														/>
													) : (
														<DynamicTaskList
															overdueTasks={overdueTasks}
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

					{/* Archived Tasks Modal */}
					<Suspense fallback={null}>
						<DynamicArchiveModal
							isOpen={isArchiveOpen}
							onClose={() => setIsArchiveOpen(false)}
						/>
					</Suspense>

					{/* Mobile-Only FAB */}
					<button
						type="button"
						onClick={() => setIsFormOpen(true)}
						aria-label="Add task"
						className="fixed bottom-24 right-6 sm:right-8 z-40 w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl lg:hidden active:scale-95 transition-transform cursor-pointer"
					>
						<Plus className="w-7 h-7" />
					</button>
				</main>
			</ToastProvider>
		</TaskErrorBoundary>
	);
}
