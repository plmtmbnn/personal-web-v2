"use client";

import {
	useOptimistic,
	useTransition,
	useMemo,
	useState,
	useCallback,
	useRef,
} from "react";
import { useSearchParams } from "next/navigation";
import { Inbox, Flame, Calendar, CheckCircle2 } from "lucide-react";
import {
	DragDropContext,
	Droppable,
	Draggable,
	type DropResult,
} from "@hello-pangea/dnd";
import type { Task } from "@/features/tasks/types";
import {
	toggleTask,
	deleteTask,
	reorderTasks,
	updateTask,
} from "@/features/tasks/actions/tasks";
import { useToast } from "@/features/tasks/components/shared/Toast";
import TaskItem from "./TaskItem";
import TaskFilters from "./TaskFilters";
import { UNDO_TOAST_DURATION_MS } from "@/features/tasks/constants";
import {
	format,
	addDays,
	isBefore,
	startOfDay,
	parseISO,
	startOfWeek,
	endOfWeek,
	isWithinInterval,
} from "date-fns";
import CustomModal from "@/features/shared/components/CustomModal";

interface TaskListProps {
	todayTasks: Task[];
	upcomingTasks: Task[];
	completedTasks: Task[];
}

export default function TaskList({
	todayTasks,
	upcomingTasks,
	completedTasks,
}: TaskListProps) {
	const [_isPending, startTransition] = useTransition();
	const searchParams = useSearchParams();
	const { showSuccess, showError } = useToast();

	// Modal State
	const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

	// Undo state for delete operations
	const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Trigger load for Completed Tasks Section
	const [isCompletedLoaded, setIsCompletedLoaded] = useState(false);

	// Request deduplication to prevent race conditions
	const pendingRequests = useRef(new Set<string>());

	// Section-specific filter extraction
	const getFilters = (prefix: string) => ({
		priority: searchParams.get(`${prefix}_priority`) || "all",
		category: searchParams.get(`${prefix}_category`) || "all",
		range: searchParams.get(`${prefix}_range`) || "week",
		search: searchParams.get(`${prefix}_search`) || "",
		status: searchParams.get(`${prefix}_status`) || "all",
	});

	const todayFilters = getFilters("today");
	const upcomingFilters = getFilters("upcoming");
	const completedFilters = getFilters("completed");

	// Optimistic state for the task lists
	const [optimisticState, addOptimisticAction] = useOptimistic<
		{
			todayTasks: Task[];
			upcomingTasks: Task[];
			completedTasks: Task[];
		},
		{ action: string; payload: any }
	>(
		{ todayTasks, upcomingTasks, completedTasks },
		(state, { action, payload }) => {
			const updateInLists = (updater: (t: Task) => Task) => ({
				todayTasks: state.todayTasks.map(updater),
				upcomingTasks: state.upcomingTasks.map(updater),
				completedTasks: state.completedTasks.map(updater),
			});

			switch (action) {
				case "toggle":
					return updateInLists((t: Task) =>
						t.id === payload.taskId
							? { ...t, is_completed: !t.is_completed }
							: t,
					);
				case "update":
					return updateInLists((t: Task) =>
						t.id === payload.taskId ? { ...t, ...payload.updates } : t,
					);
				case "delete":
					return {
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
					// Restore a deleted task to its original list
					const { task, listType } = payload;
					return {
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
				result = result.filter((t) => t.is_completed);
			} else {
				result = result.filter((t) => !t.is_completed);
			}

			// 3b. Status filter
			if (filters.status && filters.status !== "all") {
				result = result.filter((t) => (t.status || "todo") === filters.status);
			}

			// 4. Date Range (For Upcoming & Completed)
			if (isUpcoming && filters.range === "week") {
				const nextWeek = addDays(todayRef, 8); // 7 days from today
				result = result.filter(
					(t) => t.due_date && isBefore(parseISO(t.due_date), nextWeek),
				);
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

	const handleToggle = async (taskId: string, currentStatus: boolean) => {
		// Prevent duplicate requests for the same task
		if (pendingRequests.current.has(`toggle-${taskId}`)) {
			return;
		}

		const actionKey = `toggle-${taskId}`;
		pendingRequests.current.add(actionKey);

		startTransition(async () => {
			addOptimisticAction({ action: "toggle", payload: { taskId } });
			try {
				await toggleTask(taskId, currentStatus);
			} catch (error) {
				console.error("Failed to toggle task:", error);
			} finally {
				pendingRequests.current.delete(actionKey);
			}
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
		let listType: "today" | "upcoming" | "completed" = "today";

		taskToDelete = optimisticState.todayTasks.find(
			(t: Task) => t.id === deleteTaskId,
		);
		if (taskToDelete) listType = "today";

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

		// Optimistically remove the task
		startTransition(() => {
			addOptimisticAction({
				action: "delete",
				payload: { taskId: deleteTaskId },
			});
		});

		// Show undo toast
		showSuccess(
			`Task "${taskToDelete.title}" deleted`,
			"Click undo to restore it",
			{
				label: "Undo",
				onClick: () => {
					if (undoTimeoutRef.current) {
						clearTimeout(undoTimeoutRef.current);
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
		undoTimeoutRef.current = setTimeout(async () => {
			try {
				pendingRequests.current.add(`delete-${deleteTaskId}`);
				await deleteTask(deleteTaskId);
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
				pendingRequests.current.delete(`delete-${deleteTaskId}`);
			}
		}, UNDO_TOAST_DURATION_MS);

		setDeleteTaskId(null);
	};

	const hasActiveFilters = (filters: any) => {
		return (
			filters.priority !== "all" ||
			filters.category !== "all" ||
			filters.status !== "all" ||
			!!filters.search
		);
	};
	const isDragDisabled =
		hasActiveFilters(todayFilters) || hasActiveFilters(upcomingFilters);

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

				{/* Today Section */}
				<section id="today-section">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm border border-orange-200/50">
								<Flame className="w-5 h-5 fill-orange-600" />
							</div>
							<div>
								<h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">
									Focus (Today)
								</h3>
								<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
									High-priority execution
								</p>
							</div>
						</div>
						{/* Today Filters */}
						<TaskFilters tasks={todayTasks} paramPrefix="today" />
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
								) : (
									<div className="text-center py-16 bg-emerald-50/50 border border-emerald-100 rounded-[2.5rem] border-dashed">
										<CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-3 opacity-40" />
										<p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
											{hasActiveFilters(todayFilters)
												? "No tasks match your filters"
												: "All caught up for today!"}
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
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-200/50">
								<Calendar className="w-5 h-5" />
							</div>
							<div>
								<h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">
									Upcoming Awareness
								</h3>
								<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
									Strategic foresight
								</p>
							</div>
						</div>
						{/* Upcoming Filters with Range Toggle */}
						<TaskFilters
							tasks={upcomingTasks}
							paramPrefix="upcoming"
							showRangeFilter={true}
						/>
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
								) : (
									<div className="text-center py-16 bg-slate-50 border border-slate-200 rounded-[2.5rem] border-dashed">
										<Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3 opacity-30" />
										<p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
											{hasActiveFilters(upcomingFilters)
												? "No tasks match your filters"
												: "No upcoming objectives detected."}
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
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200/50">
								<CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white stroke-[3]" />
							</div>
							<div>
								<h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">
									Completed Tasks
								</h3>
								<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
									Execution History
								</p>
							</div>
						</div>
						{/* Completed Filters with Range Toggle */}
						{isCompletedLoaded && (
							<TaskFilters
								tasks={completedTasks}
								paramPrefix="completed"
								showRangeFilter={true}
							/>
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
