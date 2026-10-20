"use client";

import {
	useOptimistic,
	useTransition,
	useMemo,
	useState,
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
	ChevronLeft,
	ChevronRight,
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
	archiveTask,
} from "@/features/tasks/actions/tasks";
import { useToast } from "@/features/tasks/components/shared/Toast";
import TaskItem from "./TaskItem";
import { UNDO_TOAST_DURATION_MS } from "@/features/tasks/constants";
import {
	format,
	addDays,
	addMonths,
	isBefore,
	isAfter,
	isSameDay,
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

interface TaskBuckets {
	overdueTasks: Task[];
	todayTasks: Task[];
	upcomingTasks: Task[];
	completedTasks: Task[];
}

function getBucket(
	task: Task,
	todayRef: Date,
): "overdue" | "today" | "upcoming" | "completed" {
	if (task.status === "done") return "completed";
	const isFuture = Boolean(
		task.start_date && isAfter(parseISO(task.start_date), todayRef),
	);
	if (isFuture) return "upcoming";
	if (!task.due_date) return "today";
	const due = parseISO(task.due_date);
	if (isBefore(due, todayRef)) return "overdue";
	if (isSameDay(due, todayRef)) return "today";
	return "upcoming";
}

function reBucketTasks(tasks: Task[], todayRef: Date): TaskBuckets {
	const buckets: TaskBuckets = {
		overdueTasks: [],
		todayTasks: [],
		upcomingTasks: [],
		completedTasks: [],
	};
	for (const t of tasks) {
		const b = getBucket(t, todayRef);
		if (b === "overdue") buckets.overdueTasks.push(t);
		else if (b === "today") buckets.todayTasks.push(t);
		else if (b === "upcoming") buckets.upcomingTasks.push(t);
		else if (b === "completed") buckets.completedTasks.push(t);
	}
	return buckets;
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

	// Multi-task undo timers keyed by "delete-{id}" or "archive-{id}"
	const undoTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

	// Flush any pending deletions/archives immediately on unmount so they persist
	useEffect(() => {
		return () => {
			undoTimeoutsRef.current.forEach((timer, key) => {
				clearTimeout(timer);
				if (key.startsWith("archive-")) {
					const taskId = key.replace("archive-", "");
					archiveTask(taskId).catch((err) =>
						console.error("Failed to archive task on unmount:", err),
					);
				} else if (key.startsWith("delete-")) {
					const taskId = key.replace("delete-", "");
					deleteTask(taskId).catch((err) =>
						console.error("Failed to delete task on unmount:", err),
					);
				}
			});
			undoTimeoutsRef.current.clear();
		};
	}, []);

	// Request deduplication to prevent race conditions
	const pendingRequests = useRef(new Set<string>());

	// Optimistic state with automatic cross-section re-bucketing
	const [optimisticState, addOptimisticAction] = useOptimistic<
		TaskBuckets,
		{ action: string; payload: any }
	>(
		{ overdueTasks, todayTasks, upcomingTasks, completedTasks },
		(state, { action, payload }) => {
			const todayRef = startOfDay(new Date());

			switch (action) {
				case "toggle": {
					const { taskId } = payload;
					const all = [
						...state.overdueTasks,
						...state.todayTasks,
						...state.upcomingTasks,
						...state.completedTasks,
					];
					const target = all.find((t) => t.id === taskId);
					if (!target) return state;

					const newStatus = target.status === "done" ? "todo" : "done";
					const updatedTask: Task = {
						...target,
						status: newStatus,
						completed_at:
							newStatus === "done" ? new Date().toISOString() : null,
					};

					const nextAll = [updatedTask, ...all.filter((t) => t.id !== taskId)];
					return reBucketTasks(nextAll, todayRef);
				}

				case "update": {
					const { taskId, updates } = payload;
					const all = [
						...state.overdueTasks,
						...state.todayTasks,
						...state.upcomingTasks,
						...state.completedTasks,
					];
					const target = all.find((t) => t.id === taskId);
					if (!target) return state;

					const updatedTask: Task = { ...target, ...updates };
					const nextAll = [updatedTask, ...all.filter((t) => t.id !== taskId)];
					return reBucketTasks(nextAll, todayRef);
				}

				case "delete":
				case "archive": {
					const { taskId } = payload;
					return {
						overdueTasks: state.overdueTasks.filter((t) => t.id !== taskId),
						todayTasks: state.todayTasks.filter((t) => t.id !== taskId),
						upcomingTasks: state.upcomingTasks.filter((t) => t.id !== taskId),
						completedTasks: state.completedTasks.filter((t) => t.id !== taskId),
					};
				}

				case "restore": {
					const { task } = payload;
					const all = [
						...state.overdueTasks,
						...state.todayTasks,
						...state.upcomingTasks,
						...state.completedTasks,
						task,
					];
					return reBucketTasks(all, todayRef);
				}

				case "reorder": {
					const listKey =
						payload.droppableId === "today-list"
							? "todayTasks"
							: "upcomingTasks";
					return {
						...state,
						[listKey]: payload.newTasks,
					};
				}

				case "move": {
					return {
						...state,
						todayTasks: payload.newTodayTasks,
						upcomingTasks: payload.newUpcomingTasks,
					};
				}

				default:
					return state;
			}
		},
	);

	// Upcoming Range: "week" | "month" | "all"
	const upcomingRange = searchParams.get("upcoming_range") || "week";

	// Completed Week Offset: 0, -1, -2...
	const completedWeekOffset = Number(
		searchParams.get("completed_week_offset") || "0",
	);

	const todayRef = useMemo(() => startOfDay(new Date()), []);

	const selectedWeekStart = useMemo(
		() =>
			addDays(
				startOfWeek(todayRef, { weekStartsOn: 1 }),
				completedWeekOffset * 7,
			),
		[todayRef, completedWeekOffset],
	);

	const selectedWeekEnd = useMemo(
		() => endOfWeek(selectedWeekStart, { weekStartsOn: 1 }),
		[selectedWeekStart],
	);

	// Display Lists
	const displayOverdueTasks = optimisticState.overdueTasks;
	const displayTodayTasks = optimisticState.todayTasks;

	const displayUpcomingTasks = useMemo(() => {
		if (upcomingRange === "month") {
			const maxMonth = addMonths(todayRef, 1);
			return optimisticState.upcomingTasks.filter((t) => {
				if (!t.due_date) return false;
				const d = parseISO(t.due_date);
				return !isBefore(d, todayRef) && !isAfter(d, maxMonth);
			});
		}
		if (upcomingRange === "all") {
			return optimisticState.upcomingTasks;
		}
		// Default: 7 days
		const maxWeek = addDays(todayRef, 7);
		return optimisticState.upcomingTasks.filter((t) => {
			if (!t.due_date) return false;
			const d = parseISO(t.due_date);
			return !isBefore(d, todayRef) && !isAfter(d, maxWeek);
		});
	}, [optimisticState.upcomingTasks, upcomingRange, todayRef]);

	const displayCompletedTasks = useMemo(() => {
		return optimisticState.completedTasks.filter((t) => {
			if (!t.completed_at && !t.due_date && !t.created_at) return false;
			const d = parseISO(t.completed_at || t.due_date || t.created_at);
			return isWithinInterval(d, {
				start: selectedWeekStart,
				end: selectedWeekEnd,
			});
		});
	}, [optimisticState.completedTasks, selectedWeekStart, selectedWeekEnd]);

	const setUpcomingRange = (range: "week" | "month" | "all") => {
		startTransition(() => {
			const params = new URLSearchParams(searchParams.toString());
			if (range === "week") {
				params.delete("upcoming_range");
			} else {
				params.set("upcoming_range", range);
			}
			router.replace(`?${params.toString()}`, { scroll: false });
		});
	};

	const setCompletedWeekOffset = (offset: number) => {
		startTransition(() => {
			const params = new URLSearchParams(searchParams.toString());
			if (offset === 0) {
				params.delete("completed_week_offset");
			} else {
				params.set("completed_week_offset", offset.toString());
			}
			router.replace(`?${params.toString()}`, { scroll: false });
		});
	};

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

	const handleUpdate = async (taskId: string, updates: Partial<Task>) => {
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

		const targetId = deleteTaskId;
		setDeleteTaskId(null);

		const all = [
			...optimisticState.overdueTasks,
			...optimisticState.todayTasks,
			...optimisticState.upcomingTasks,
			...optimisticState.completedTasks,
		];
		const taskToDelete = all.find((t) => t.id === targetId);
		if (!taskToDelete) return;

		// 1. Optimistically remove
		startTransition(() => {
			addOptimisticAction({
				action: "delete",
				payload: { taskId: targetId },
			});
		});

		// 2. Set timeout for actual deletion
		const timerKey = `delete-${targetId}`;
		const deleteTimer = setTimeout(async () => {
			undoTimeoutsRef.current.delete(timerKey);
			try {
				pendingRequests.current.add(timerKey);
				await deleteTask(targetId);
			} catch (error) {
				console.error("Failed to delete task:", error);
				showError(
					`Failed to delete task. ${error instanceof Error ? error.message : "Please try again."}`,
				);
				startTransition(() => {
					addOptimisticAction({
						action: "restore",
						payload: { task: taskToDelete },
					});
				});
			} finally {
				pendingRequests.current.delete(timerKey);
			}
		}, UNDO_TOAST_DURATION_MS);

		undoTimeoutsRef.current.set(timerKey, deleteTimer);

		// 3. Show undo toast
		showSuccess(
			`Task "${taskToDelete.title}" deleted`,
			"Click undo to restore it",
			{
				label: "Undo",
				onClick: () => {
					const existingTimer = undoTimeoutsRef.current.get(timerKey);
					if (existingTimer) {
						clearTimeout(existingTimer);
						undoTimeoutsRef.current.delete(timerKey);
					}
					startTransition(() => {
						addOptimisticAction({
							action: "restore",
							payload: { task: taskToDelete },
						});
					});
				},
			},
		);
	};

	const handleArchive = (taskId: string) => {
		const all = [
			...optimisticState.overdueTasks,
			...optimisticState.todayTasks,
			...optimisticState.upcomingTasks,
			...optimisticState.completedTasks,
		];
		const taskToArchive = all.find((t) => t.id === taskId);
		if (!taskToArchive) return;

		// 1. Optimistically remove
		startTransition(() => {
			addOptimisticAction({
				action: "archive",
				payload: { taskId },
			});
		});

		// 2. Multi-task undo timer
		const timerKey = `archive-${taskId}`;
		const timer = setTimeout(async () => {
			undoTimeoutsRef.current.delete(timerKey);
			try {
				await archiveTask(taskId);
			} catch (error) {
				console.error("Failed to archive task:", error);
				showError("Failed to archive task.");
				startTransition(() => {
					addOptimisticAction({
						action: "restore",
						payload: { task: taskToArchive },
					});
				});
			}
		}, UNDO_TOAST_DURATION_MS);

		undoTimeoutsRef.current.set(timerKey, timer);

		// 3. Show Toast with Undo
		showSuccess(
			`Task "${taskToArchive.title}" archived`,
			"Click undo to restore it",
			{
				label: "Undo",
				onClick: () => {
					const t = undoTimeoutsRef.current.get(timerKey);
					if (t) {
						clearTimeout(t);
						undoTimeoutsRef.current.delete(timerKey);
					}
					startTransition(() => {
						addOptimisticAction({
							action: "restore",
							payload: { task: taskToArchive },
						});
					});
				},
			},
		);
	};

	const isDragDisabled = Boolean(
		(searchParams.get("priority") && searchParams.get("priority") !== "all") ||
			(searchParams.get("category") &&
				searchParams.get("category") !== "all") ||
			(searchParams.get("status") && searchParams.get("status") !== "all") ||
			searchParams.get("search"),
	);

	const onDragEnd = (result: DropResult) => {
		const { destination, source, draggableId } = result;
		if (!destination) return;
		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		) {
			return;
		}

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
									onArchive={handleArchive}
								/>
							))}
						</div>
					</section>
				)}

				{/* Today Section */}
				<section id="today-section">
					<div className="flex items-center justify-between gap-3.5 mb-6 border-b border-slate-100 pb-4">
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
													onArchive={handleArchive}
												/>
											)}
										</Draggable>
									))
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
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-6 border-b border-slate-100 pb-4">
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

						{/* Inline Date Horizon Selector */}
						<div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
							<button
								type="button"
								onClick={() => setUpcomingRange("week")}
								className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
									upcomingRange === "week"
										? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
										: "text-slate-500 hover:text-slate-900"
								}`}
							>
								7 Days
							</button>
							<button
								type="button"
								onClick={() => setUpcomingRange("month")}
								className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
									upcomingRange === "month"
										? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
										: "text-slate-500 hover:text-slate-900"
								}`}
							>
								1 Month
							</button>
							<button
								type="button"
								onClick={() => setUpcomingRange("all")}
								className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
									upcomingRange === "all"
										? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
										: "text-slate-500 hover:text-slate-900"
								}`}
							>
								All
							</button>
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
													onArchive={handleArchive}
												/>
											)}
										</Draggable>
									))
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
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-6 border-b border-slate-100 pb-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200/50">
								<CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white stroke-[3]" />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">
										Completed Tasks
									</h3>
									<span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200/60">
										{displayCompletedTasks.length}{" "}
										{displayCompletedTasks.length === 1 ? "task" : "tasks"}
									</span>
								</div>
								<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
									Execution History
								</p>
							</div>
						</div>

						{/* Inline Completed Week Navigator */}
						<div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/80 select-none">
							<button
								type="button"
								onClick={() => setCompletedWeekOffset(completedWeekOffset - 1)}
								className="p-1 hover:bg-white rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer active:scale-90"
								aria-label="Previous week"
							>
								<ChevronLeft className="w-4 h-4 stroke-[2.5]" />
							</button>
							<span className="text-[10px] font-black uppercase tracking-wider text-slate-700 px-1 min-w-[90px] text-center">
								{format(selectedWeekStart, "dd MMM")} -{" "}
								{format(selectedWeekEnd, "dd MMM")}
							</span>
							<button
								type="button"
								onClick={() => setCompletedWeekOffset(completedWeekOffset + 1)}
								disabled={completedWeekOffset >= 0}
								className="p-1 hover:bg-white rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent active:scale-90"
								aria-label="Next week"
							>
								<ChevronRight className="w-4 h-4 stroke-[2.5]" />
							</button>
						</div>
					</div>

					<div className="space-y-3 min-h-[100px]">
						{displayCompletedTasks.length > 0 ? (
							displayCompletedTasks.map((task: Task, index: number) => (
								<TaskItem
									key={task.id}
									task={task}
									index={index}
									onUpdate={handleUpdate}
									onDelete={handleDeleteRequest}
									onArchive={handleArchive}
								/>
							))
						) : (
							<div className="text-center py-16 bg-slate-50 border border-slate-200 rounded-[2.5rem] border-dashed">
								<CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3 opacity-30" />
								<p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
									No completed tasks found in this range.
								</p>
							</div>
						)}
					</div>
				</section>
			</div>
		</DragDropContext>
	);
}
