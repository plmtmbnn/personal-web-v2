"use client";

import {
	useOptimistic,
	useTransition,
	useMemo,
	useState,
	useCallback,
	useRef,
	useEffect,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Inbox,
	Flame,
	Calendar,
	CheckCircle2,
	RotateCcw,
	AlertTriangle,
} from "lucide-react";
import {
	DragDropContext,
	Droppable,
	Draggable,
	type DropResult,
} from "@hello-pangea/dnd";
import type { Task } from "@/features/tasks/types";
import {
	deleteTask,
	reorderTasks,
	updateTask,
	rescheduleOverdueTasks,
} from "@/features/tasks/actions/tasks";
import { useToast } from "@/features/tasks/components/shared/Toast";
import TaskItem from "./TaskItem";
import TaskFilters from "./TaskFilters";
import { UNDO_TOAST_DURATION_MS } from "@/features/tasks/constants";
import {
	format,
	addDays,
	addMonths,
	isBefore,
	isAfter,
	startOfDay,
	parseISO,
	startOfWeek,
	endOfWeek,
	isWithinInterval,
} from "date-fns";
import CustomModal from "@/features/shared/components/CustomModal";

interface TaskListProps {
	overdueTasks?: Task[];
	todayTasks: Task[];
	upcomingTasks: Task[];
	completedTasks: Task[];
}

export default function TaskList({
	overdueTasks = [],
	todayTasks,
	upcomingTasks,
	completedTasks,
}: TaskListProps) {
	const router = useRouter();
	const [_isPending, startTransition] = useTransition();
	const searchParams = useSearchParams();
	const { showSuccess, showError } = useToast();

	// Modal State
	const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

	// Multi-task undo timers keyed by task ID
	const undoTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

	// Flush any pending deletions immediately on unmount so they persist
	useEffect(() => {
		return () => {
			undoTimeoutsRef.current.forEach((timer, taskId) => {
				clearTimeout(timer);
				deleteTask(taskId).catch((err) =>
					console.error("Failed to delete task on unmount:", err),
				);
			});
			undoTimeoutsRef.current.clear();
		};
	}, []);

	// Completed Tasks Section loaded by default to avoid artificial gating
	const [isCompletedLoaded, setIsCompletedLoaded] = useState(true);

	// Request deduplication to prevent race conditions
	const pendingRequests = useRef(new Set<string>());

	// Section-specific filter extraction
	const getFilters = useCallback(
		(prefix: string) => ({
			priority: searchParams.get(`${prefix}_priority`) || "all",
			category: searchParams.get(`${prefix}_category`) || "all",
			range: searchParams.get(`${prefix}_range`) || "week",
			search: searchParams.get(`${prefix}_search`) || "",
			status: searchParams.get(`${prefix}_status`) || "all",
		}),
		[searchParams],
	);

	const todayFilters = getFilters("today");
	const upcomingFilters = getFilters("upcoming");
	const completedFilters = getFilters("completed");

	// Optimistic state for all task lists including overdue
	const [optimisticState, addOptimisticAction] = useOptimistic<
		{
			overdueTasks: Task[];
			todayTasks: Task[];
			upcomingTasks: Task[];
			completedTasks: Task[];
		},
		{ action: string; payload: any }
	>(
		{ overdueTasks, todayTasks, upcomingTasks, completedTasks },
		(state, { action, payload }) => {
			const updateInLists = (updater: (t: Task) => Task) => ({
				overdueTasks: state.overdueTasks.map(updater),
				todayTasks: state.todayTasks.map(updater),
				upcomingTasks: state.upcomingTasks.map(updater),
				completedTasks: state.completedTasks.map(updater),
			});

			switch (action) {
				case "toggle":
					return updateInLists((t: Task) =>
						t.id === payload.taskId
							? { ...t, status: t.status === "done" ? "todo" : "done" }
							: t,
					);
				case "update":
					return updateInLists((t: Task) =>
						t.id === payload.taskId ? { ...t, ...payload.updates } : t,
					);
				case "delete":
					return {
						overdueTasks: state.overdueTasks.filter(
							(t: Task) => t.id !== payload.taskId,
						),
						todayTasks: state.todayTasks.filter(
							(t: Task) => t.id !== payload.taskId,
						),
						upcomingTasks: state.upcomingTasks.filter(
							(t: Task) => t.id !== payload.taskId,
						),
						completedTasks: state.completedTasks.filter(
							(t: Task) => t.id !== payload.taskId,
						),
					};
				case "restore": {
					const { task, listType } = payload;
					return {
						overdueTasks:
							listType === "overdue"
								? [...state.overdueTasks, task]
								: state.overdueTasks.filter((t) => t.id !== task.id),
						todayTasks:
							listType === "today"
								? [...state.todayTasks, task]
								: state.todayTasks.filter((t) => t.id !== task.id),
						upcomingTasks:
							listType === "upcoming"
								? [...state.upcomingTasks, task]
								: state.upcomingTasks.filter((t) => t.id !== task.id),
						completedTasks:
							listType === "completed"
								? [...state.completedTasks, task]
								: state.completedTasks.filter((t) => t.id !== task.id),
					};
				}
				case "reorder": {
					const listKey =
						payload.droppableId === "today-list"
							? "todayTasks"
							: "upcomingTasks";
					return {
						overdueTasks: state.overdueTasks,
						todayTasks:
							listKey === "todayTasks" ? payload.newTasks : state.todayTasks,
						upcomingTasks:
							listKey === "upcomingTasks"
								? payload.newTasks
								: state.upcomingTasks,
						completedTasks: state.completedTasks,
					};
				}
				case "move":
					return {
						overdueTasks: state.overdueTasks,
						todayTasks: payload.newTodayTasks,
						upcomingTasks: payload.newUpcomingTasks,
						completedTasks: state.completedTasks,
					};
				default:
					return state;
			}
		},
	);

	/**
	 * Helper to apply local filters to a list
	 */
	const applyFilters = useCallback(
		(list: Task[], filters: any, isUpcoming = false, isCompleted = false) => {
			let result = list;
			const todayRef = startOfDay(new Date());

			// Memoize filter values to avoid recomputation
			const priorityFilter = filters.priority;
			const categoryFilter = filters.category;
			const searchFilter = filters.search?.toLowerCase();

			// 1. Priority
			if (priorityFilter !== "all") {
				result = result.filter((t) => t.priority === priorityFilter);
			}

			// 2. Category
			if (categoryFilter !== "all") {
				result = result.filter((t) => t.category === categoryFilter);
			}

			// 3. Completion check
			if (isCompleted) {
				result = result.filter((t) => t.status === "done");
			} else {
				result = result.filter((t) => t.status !== "done");
			}

			// 3b. Status filter
			if (filters.status && filters.status !== "all") {
				result = result.filter((t) => (t.status || "todo") === filters.status);
			}

			// 4. Date Range (For Upcoming & Completed)
			if (isUpcoming) {
				if (filters.range === "month") {
					// MONTH: today until next 1 month
					const maxMonth = addMonths(todayRef, 1);
					result = result.filter((t) => {
						if (!t.due_date) return false;
						const d = parseISO(t.due_date);
						return !isBefore(d, todayRef) && !isAfter(d, maxMonth);
					});
				} else if (filters.range === "all") {
					// ALL: all upcoming tasks from today onwards
					result = result.filter((t) => {
						if (!t.due_date) return true;
						const d = parseISO(t.due_date);
						return !isBefore(d, todayRef);
					});
				} else {
					// Default: WEEK (today until next 7 days)
					const maxWeek = addDays(todayRef, 7);
					result = result.filter((t) => {
						if (!t.due_date) return false;
						const d = parseISO(t.due_date);
						return !isBefore(d, todayRef) && !isAfter(d, maxWeek);
					});
				}
			}

			if (isCompleted) {
				const weekOffset = Number(
					searchParams.get("completed_week_offset") || "0",
				);
				const weekStart = addDays(
					startOfWeek(todayRef, { weekStartsOn: 1 }),
					weekOffset * 7,
				);
				const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

				result = result.filter((t) => {
					if (!t.completed_at && !t.due_date && !t.created_at) return false;
					const d = parseISO(t.completed_at || t.due_date || t.created_at);
					return isWithinInterval(d, { start: weekStart, end: weekEnd });
				});
			}

			// 5. Search text query
			if (searchFilter) {
				result = result.filter(
					(t) =>
						(t.title || "").toLowerCase().includes(searchFilter) ||
						(t.description || "").toLowerCase().includes(searchFilter),
				);
			}

			return result;
		},
		[searchParams],
	);

	// Derived display lists
	const displayOverdueTasks = useMemo(
		() => applyFilters(optimisticState.overdueTasks, todayFilters),
		[optimisticState.overdueTasks, todayFilters, applyFilters],
	);

	const displayTodayTasks = useMemo(
		() => applyFilters(optimisticState.todayTasks, todayFilters),
		[optimisticState.todayTasks, todayFilters, applyFilters],
	);

	const displayUpcomingTasks = useMemo(
		() => applyFilters(optimisticState.upcomingTasks, upcomingFilters, true),
		[optimisticState.upcomingTasks, upcomingFilters, applyFilters],
	);

	const displayCompletedTasks = useMemo(() => {
		if (!isCompletedLoaded) return [];
		return applyFilters(
			optimisticState.completedTasks,
			completedFilters,
			false,
			true,
		);
	}, [
		isCompletedLoaded,
		optimisticState.completedTasks,
		completedFilters,
		applyFilters,
	]);

	const handleBatchRollover = (daysToAdd: number) => {
		startTransition(async () => {
			try {
				const res = await rescheduleOverdueTasks(daysToAdd);
				if (res.success) {
					showSuccess(
						daysToAdd === 0 ? "Rolled over to Today" : "Pushed to Tomorrow",
						res.message,
					);
					router.refresh();
				} else {
					showError(res.message);
				}
			} catch (err) {
				console.error(err);
				showError("Failed to reschedule overdue tasks.");
			}
		});
	};

	const resetSectionFilters = (prefix: string) => {
		startTransition(() => {
			const params = new URLSearchParams(searchParams.toString());
			params.delete(`${prefix}_priority`);
			params.delete(`${prefix}_category`);
			params.delete(`${prefix}_status`);
			params.delete(`${prefix}_search`);
			params.delete(`${prefix}_completed`);
			if (prefix === "upcoming") {
				params.delete(`${prefix}_range`);
			}
			if (prefix === "completed") {
				params.delete(`${prefix}_range`);
				params.delete(`${prefix}_week_offset`);
			}
			router.replace(`?${params.toString()}`, { scroll: false });
		});
	};

	const handleUpdate = async (taskId: string, updates: Partial<Task>) => {
		// Prevent duplicate update requests for the same task
		if (pendingRequests.current.has(`update-${taskId}`)) {
			return;
		}

		const actionKey = `update-${taskId}`;
		pendingRequests.current.add(actionKey);

		startTransition(async () => {
			addOptimisticAction({ action: "update", payload: { taskId, updates } });
			try {
				await updateTask(taskId, updates);
			} catch (error) {
				console.error("Failed to update task:", error);
			} finally {
				pendingRequests.current.delete(actionKey);
			}
		});
	};

	const handleDeleteRequest = (taskId: string) => {
		setDeleteTaskId(taskId);
	};

	const confirmDelete = async () => {
		if (!deleteTaskId) return;

		// Prevent duplicate delete requests
		if (pendingRequests.current.has(`delete-${deleteTaskId}`)) {
			return;
		}

		// Find the task being deleted and its list type
		let taskToDelete: Task | undefined;
		let listType: "overdue" | "today" | "upcoming" | "completed" = "today";

		taskToDelete = optimisticState.overdueTasks.find(
			(t: Task) => t.id === deleteTaskId,
		);
		if (taskToDelete) listType = "overdue";

		if (!taskToDelete) {
			taskToDelete = optimisticState.todayTasks.find(
				(t: Task) => t.id === deleteTaskId,
			);
			if (taskToDelete) listType = "today";
		}

		if (!taskToDelete) {
			taskToDelete = optimisticState.upcomingTasks.find(
				(t: Task) => t.id === deleteTaskId,
			);
			if (taskToDelete) listType = "upcoming";
		}

		if (!taskToDelete) {
			taskToDelete = optimisticState.completedTasks.find(
				(t: Task) => t.id === deleteTaskId,
			);
			if (taskToDelete) listType = "completed";
		}

		if (!taskToDelete) {
			console.error("Task not found for deletion:", deleteTaskId);
			setDeleteTaskId(null);
			return;
		}

		const targetId = deleteTaskId;

		// Optimistically remove the task
		startTransition(() => {
			addOptimisticAction({
				action: "delete",
				payload: { taskId: targetId },
			});
		});

		// Show undo toast
		showSuccess(
			`Task "${taskToDelete.title}" deleted`,
			"Click undo to restore it",
			{
				label: "Undo",
				onClick: () => {
					const existingTimer = undoTimeoutsRef.current.get(targetId);
					if (existingTimer) {
						clearTimeout(existingTimer);
						undoTimeoutsRef.current.delete(targetId);
					}
					// Restore the task
					startTransition(() => {
						addOptimisticAction({
							action: "restore",
							payload: { task: taskToDelete, listType },
						});
					});
				},
			},
		);

		// Set timeout to actually delete the task
		const deleteTimer = setTimeout(async () => {
			undoTimeoutsRef.current.delete(targetId);
			try {
				pendingRequests.current.add(`delete-${targetId}`);
				await deleteTask(targetId);
			} catch (error) {
				console.error("Failed to delete task:", error);
				showError(
					`Failed to delete task. ${error instanceof Error ? error.message : "Please try again."}`,
				);
				// Revert optimistic update on error
				startTransition(() => {
					addOptimisticAction({
						action: "restore",
						payload: { task: taskToDelete, listType },
					});
				});
			} finally {
				pendingRequests.current.delete(`delete-${targetId}`);
			}
		}, UNDO_TOAST_DURATION_MS);

		undoTimeoutsRef.current.set(targetId, deleteTimer);
		setDeleteTaskId(null);
	};

	const hasActiveFilters = (filters: any) => {
		return (
			filters.priority !== "all" ||
			filters.category !== "all" ||
			filters.status !== "all" ||
			(filters.range && filters.range !== "week") ||
			!!filters.search
		);
	};
	const isDragDisabled =
		todayFilters.priority !== "all" ||
		todayFilters.category !== "all" ||
		todayFilters.status !== "all" ||
		Boolean(todayFilters.search) ||
		upcomingFilters.priority !== "all" ||
		upcomingFilters.category !== "all" ||
		upcomingFilters.status !== "all" ||
		Boolean(upcomingFilters.search);

	const onDragEnd = (result: DropResult) => {
		const { destination, source, draggableId } = result;
		if (!destination) return;
		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		)
			return;

		const sourceList: Task[] =
			source.droppableId === "today-list"
				? Array.from(displayTodayTasks)
				: Array.from(displayUpcomingTasks);
		const destList: Task[] =
			destination.droppableId === "today-list"
				? Array.from(displayTodayTasks)
				: Array.from(displayUpcomingTasks);

		if (source.droppableId === destination.droppableId) {
			const [movedTask] = sourceList.splice(source.index, 1);
			sourceList.splice(destination.index, 0, movedTask);

			startTransition(async () => {
				addOptimisticAction({
					action: "reorder",
					payload: { droppableId: source.droppableId, newTasks: sourceList },
				});
				try {
					await reorderTasks(sourceList.map((t: Task) => t.id));
				} catch (error) {
					console.error("Failed to reorder:", error);
				}
			});
		} else {
			const [movedTask] = sourceList.splice(source.index, 1);

			const todayStr = format(new Date(), "yyyy-MM-dd");
			let newDueDate = movedTask.due_date;
			let newStartDate = movedTask.start_date;

			if (destination.droppableId === "today-list") {
				newDueDate = todayStr;
				newStartDate = null; // Clear start date so it's actionable today
			} else if (destination.droppableId === "upcoming-list") {
				const taskDate = movedTask.due_date
					? parseISO(movedTask.due_date)
					: null;
				const tomorrowDate = addDays(startOfDay(new Date()), 1);
				if (!taskDate || isBefore(taskDate, tomorrowDate)) {
					newDueDate = format(tomorrowDate, "yyyy-MM-dd");
				}
			}

			const updatedTask = {
				...movedTask,
				due_date: newDueDate,
				start_date: newStartDate,
			};
			destList.splice(destination.index, 0, updatedTask);

			const finalToday =
				destination.droppableId === "today-list" ? destList : sourceList;
			const finalUpcoming =
				destination.droppableId === "upcoming-list" ? destList : sourceList;

			startTransition(async () => {
				addOptimisticAction({
					action: "move",
					payload: {
						newTodayTasks: finalToday,
						newUpcomingTasks: finalUpcoming,
					},
				});
				try {
					await updateTask(draggableId, {
						due_date: newDueDate,
						start_date: newStartDate,
					});
					await reorderTasks(destList.map((t: Task) => t.id));
				} catch (error) {
					console.error("Failed to move task:", error);
				}
			});
		}
	};

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<div className="space-y-12 sm:space-y-16">
				{/* Custom Delete Confirmation Modal */}
				<CustomModal
					isOpen={!!deleteTaskId}
					onClose={() => setDeleteTaskId(null)}
					onConfirm={confirmDelete}
					title="Delete Task"
					description="Are you sure you want to permanently delete this task? This action cannot be undone."
					confirmText="Delete"
					cancelText="Cancel"
					variant="danger"
					isLoading={false}
				/>

				{/* Overdue Section */}
				{displayOverdueTasks.length > 0 && (
					<section
						id="overdue-section"
						className="rounded-3xl border border-rose-200/80 bg-rose-50/30 p-4 sm:p-6 shadow-xs"
					>
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-rose-100/80 pb-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 shadow-sm border border-rose-200/50">
									<AlertTriangle className="w-5 h-5 text-rose-600" />
								</div>
								<div>
									<div className="flex items-center gap-2">
										<h3 className="text-xl font-black text-rose-950 uppercase tracking-tight leading-tight">
											Overdue Tasks
										</h3>
										<span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200">
											{displayOverdueTasks.length}{" "}
											{displayOverdueTasks.length === 1 ? "task" : "tasks"}
										</span>
									</div>
									<p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-0.5">
										Action required to resolve backlog
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={() => handleBatchRollover(0)}
									className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
								>
									<RotateCcw className="w-3.5 h-3.5" />
									Roll to Today
								</button>
								<button
									type="button"
									onClick={() => handleBatchRollover(1)}
									className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
								>
									<Calendar className="w-3.5 h-3.5" />
									Push to Tomorrow
								</button>
							</div>
						</div>

						<div className="space-y-3">
							{displayOverdueTasks.map((task: Task, index: number) => (
								<TaskItem
									key={task.id}
									task={task}
									index={index}
									onUpdate={handleUpdate}
									onDelete={handleDeleteRequest}
								/>
							))}
						</div>
					</section>
				)}

				{/* Today Section */}
				<section id="today-section">
					<div className="flex flex-col gap-3.5 mb-6 border-b border-slate-100 pb-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm border border-orange-200/50">
								<Flame className="w-5 h-5 fill-orange-600" />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">
										Focus (Today)
									</h3>
									<span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-200/60">
										{displayTodayTasks.length}{" "}
										{displayTodayTasks.length === 1 ? "task" : "tasks"}
									</span>
								</div>
								<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
									High-priority execution
								</p>
							</div>
						</div>
						{/* Today Filters */}
						<div className="w-full pt-1">
							<TaskFilters tasks={todayTasks} paramPrefix="today" />
						</div>
					</div>

					<Droppable droppableId="today-list">
						{(provided) => (
							<div
								{...provided.droppableProps}
								ref={provided.innerRef}
								className="space-y-3 min-h-[100px]"
							>
								{displayTodayTasks.length > 0 ? (
									displayTodayTasks.map((task: Task, index: number) => (
										<Draggable
											key={task.id}
											draggableId={task.id}
											index={index}
											isDragDisabled={isDragDisabled}
										>
											{(provided, snapshot) => (
												<TaskItem
													task={task}
													index={index}
													provided={provided}
													snapshot={snapshot}
													onUpdate={handleUpdate}
													onDelete={handleDeleteRequest}
												/>
											)}
										</Draggable>
									))
								) : hasActiveFilters(todayFilters) ? (
									<div className="text-center py-12 bg-white border border-slate-200/80 rounded-[2rem] shadow-xs flex flex-col items-center justify-center p-6">
										<CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2.5 opacity-40" />
										<p className="text-xs text-slate-700 font-bold uppercase tracking-wider mb-1">
											No tasks match your filters
										</p>
										<p className="text-[11px] text-slate-400 font-medium mb-3">
											Try adjusting or resetting your filter criteria
										</p>
										<button
											type="button"
											onClick={() => resetSectionFilters("today")}
											className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 active:scale-95 transition-all shadow-xs cursor-pointer"
										>
											<RotateCcw className="w-3.5 h-3.5" />
											Reset Filters
										</button>
									</div>
								) : (
									<div className="text-center py-14 bg-emerald-50/40 border border-emerald-100 rounded-[2rem] border-dashed p-6">
										<CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2.5 opacity-60" />
										<p className="text-xs text-emerald-800 font-extrabold uppercase tracking-[0.15em]">
											All caught up for today!
										</p>
										<p className="text-[11px] text-emerald-600/80 font-semibold mt-1">
											Great work! You have completed all scheduled tasks.
										</p>
									</div>
								)}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</section>

				{/* Upcoming Section */}
				<section id="upcoming-section">
					<div className="flex flex-col gap-3.5 mb-6 border-b border-slate-100 pb-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-200/50">
								<Calendar className="w-5 h-5" />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">
										Upcoming Awareness
									</h3>
									<span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-200/60">
										{displayUpcomingTasks.length}{" "}
										{displayUpcomingTasks.length === 1 ? "task" : "tasks"}
									</span>
								</div>
								<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
									Strategic foresight
								</p>
							</div>
						</div>
						{/* Upcoming Filters with Range Toggle */}
						<div className="w-full pt-1">
							<TaskFilters
								tasks={upcomingTasks}
								paramPrefix="upcoming"
								showRangeFilter={true}
							/>
						</div>
					</div>

					<Droppable droppableId="upcoming-list">
						{(provided) => (
							<div
								{...provided.droppableProps}
								ref={provided.innerRef}
								className="space-y-3 min-h-[100px]"
							>
								{displayUpcomingTasks.length > 0 ? (
									displayUpcomingTasks.map((task: Task, index: number) => (
										<Draggable
											key={task.id}
											draggableId={task.id}
											index={index}
											isDragDisabled={isDragDisabled}
										>
											{(provided, snapshot) => (
												<TaskItem
													task={task}
													index={index}
													provided={provided}
													snapshot={snapshot}
													onUpdate={handleUpdate}
													onDelete={handleDeleteRequest}
												/>
											)}
										</Draggable>
									))
								) : hasActiveFilters(upcomingFilters) ? (
									<div className="text-center py-12 bg-white border border-slate-200/80 rounded-[2rem] shadow-xs flex flex-col items-center justify-center p-6">
										<Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2.5 opacity-40" />
										<p className="text-xs text-slate-700 font-bold uppercase tracking-wider mb-1">
											No upcoming tasks match your filters
										</p>
										<p className="text-[11px] text-slate-400 font-medium mb-3">
											Try adjusting your range or search keywords
										</p>
										<button
											type="button"
											onClick={() => resetSectionFilters("upcoming")}
											className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 active:scale-95 transition-all shadow-xs cursor-pointer"
										>
											<RotateCcw className="w-3.5 h-3.5" />
											Reset Filters
										</button>
									</div>
								) : (
									<div className="text-center py-14 bg-slate-50/70 border border-slate-200 rounded-[2rem] border-dashed p-6">
										<Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2.5 opacity-40" />
										<p className="text-xs text-slate-500 font-bold uppercase tracking-[0.15em]">
											No upcoming objectives detected
										</p>
										<p className="text-[11px] text-slate-400 font-medium mt-1">
											Schedule future milestones to keep track of strategic
											goals.
										</p>
									</div>
								)}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</section>

				{/* Completed Section */}
				<section
					id="completed-section"
					className="pt-4 border-t border-slate-100"
				>
					<div className="flex flex-col gap-3.5 mb-6 border-b border-slate-100 pb-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200/50">
								<CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white stroke-[3]" />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">
										Completed Tasks
									</h3>
									{isCompletedLoaded && (
										<span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200/60">
											{displayCompletedTasks.length}{" "}
											{displayCompletedTasks.length === 1 ? "task" : "tasks"}
										</span>
									)}
								</div>
								<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
									Execution History
								</p>
							</div>
						</div>
						{/* Completed Filters with Range Toggle */}
						{isCompletedLoaded && (
							<div className="w-full pt-1">
								<TaskFilters
									tasks={completedTasks}
									paramPrefix="completed"
									showRangeFilter={true}
								/>
							</div>
						)}
					</div>

					{!isCompletedLoaded ? (
						<div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-[2.5rem] border-dashed">
							<CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3 opacity-35 animate-pulse" />
							<p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-4">
								Execution History is unloaded
							</p>
							<button
								type="button"
								onClick={() => setIsCompletedLoaded(true)}
								className="px-6 py-2.5 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer"
							>
								Load Completed Tasks
							</button>
						</div>
					) : (
						<div className="space-y-3 min-h-[100px]">
							{displayCompletedTasks.length > 0 ? (
								displayCompletedTasks.map((task: Task, index: number) => (
									<TaskItem
										key={task.id}
										task={task}
										index={index}
										onUpdate={handleUpdate}
										onDelete={handleDeleteRequest}
									/>
								))
							) : hasActiveFilters(completedFilters) ? (
								<div className="text-center py-12 bg-white border border-slate-200/80 rounded-[2rem] shadow-xs flex flex-col items-center justify-center p-6">
									<CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2.5 opacity-40" />
									<p className="text-xs text-slate-700 font-bold uppercase tracking-wider mb-1">
										No completed tasks found in this period
									</p>
									<p className="text-[11px] text-slate-400 font-medium mb-3">
										Navigate to different weeks or reset filters to see history
									</p>
									<button
										type="button"
										onClick={() => resetSectionFilters("completed")}
										className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 active:scale-95 transition-all shadow-xs cursor-pointer"
									>
										<RotateCcw className="w-3.5 h-3.5" />
										Reset Filters
									</button>
								</div>
							) : (
								<div className="text-center py-16 bg-slate-50 border border-slate-200 rounded-[2.5rem] border-dashed">
									<CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3 opacity-30" />
									<p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
										No completed tasks found in this range.
									</p>
								</div>
							)}
						</div>
					)}
				</section>
			</div>
		</DragDropContext>
	);
}
