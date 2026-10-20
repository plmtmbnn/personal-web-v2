"use client";

import {
	useOptimistic,
	useTransition,
	useMemo,
	useCallback,
	useState,
	useRef,
	useEffect,
} from "react";
import {
	DragDropContext,
	Droppable,
	Draggable,
	type DropResult,
} from "@hello-pangea/dnd";
import type { Task, TaskStatus } from "@/features/tasks/types";
import {
	updateTaskStatus,
	updateTask,
	deleteTask,
	reorderTasks,
	archiveTask,
} from "@/features/tasks/actions/tasks";
import TaskItem from "./TaskItem";
import {
	TASK_STATUS_CONFIG,
	UNDO_TOAST_DURATION_MS,
} from "@/features/tasks/constants";
import { useToast } from "@/features/tasks/components/shared/Toast";
import CustomModal from "@/features/shared/components/CustomModal";

interface TaskBoardProps {
	overdueTasks?: Task[];
	todayTasks: Task[];
	upcomingTasks: Task[];
	completedTasks: Task[];
}

export default function TaskBoard({
	overdueTasks = [],
	todayTasks,
	upcomingTasks,
	completedTasks,
}: TaskBoardProps) {
	const [_isPending, startTransition] = useTransition();
	const { showSuccess, showError } = useToast();

	// Modal State for Deletion
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

	// Combine all tasks into one deduplicated flat array
	const allTasks = useMemo(() => {
		const map = new Map<string, Task>();
		for (const t of [
			...overdueTasks,
			...todayTasks,
			...upcomingTasks,
			...completedTasks,
		]) {
			if (!map.has(t.id)) {
				map.set(t.id, t);
			}
		}
		return Array.from(map.values());
	}, [overdueTasks, todayTasks, upcomingTasks, completedTasks]);

	// Optimistic state handles toggle, delete, archive, restore, update, and drag-and-drop
	const [optimisticTasks, addOptimisticAction] = useOptimistic<
		Task[],
		{ action: string; payload: any }
	>(allTasks, (state, { action, payload }) => {
		switch (action) {
			case "move":
				return state.map((t) =>
					t.id === payload.id
						? {
								...t,
								status: payload.status,
							}
						: t,
				);
			case "reorder_column": {
				const otherTasks = state.filter(
					(t) => (t.status || "todo") !== payload.status,
				);
				return [...otherTasks, ...payload.reorderedTasks];
			}
			case "toggle":
				return state.map((t) =>
					t.id === payload.taskId
						? {
								...t,
								status: t.status === "done" ? "todo" : "done",
							}
						: t,
				);
			case "delete":
			case "archive":
				return state.filter((t) => t.id !== payload.taskId);
			case "restore":
				return [...state.filter((t) => t.id !== payload.task.id), payload.task];
			case "update":
				return state.map((t) =>
					t.id === payload.taskId ? { ...t, ...payload.updates } : t,
				);
			default:
				return state;
		}
	});

	// Group tasks into columns
	const columns = useMemo(() => {
		const cols: Record<TaskStatus, Task[]> = {
			todo: [],
			in_progress: [],
			done: [],
			blocked: [],
			cancelled: [],
		};

		for (const task of optimisticTasks) {
			const status = task.status || "todo";
			if (cols[status]) {
				cols[status].push(task);
			}
		}
		return cols;
	}, [optimisticTasks]);

	const handleDragEnd = async (result: DropResult) => {
		const { source, destination, draggableId } = result;

		if (!destination) return;
		if (
			source.droppableId === destination.droppableId &&
			source.index === destination.index
		) {
			return;
		}

		const destStatus = destination.droppableId as TaskStatus;

		// 1. Same-column reordering: persist card positions
		if (source.droppableId === destination.droppableId) {
			const columnTasks = Array.from(columns[destStatus] || []);
			const [moved] = columnTasks.splice(source.index, 1);
			columnTasks.splice(destination.index, 0, moved);

			startTransition(async () => {
				addOptimisticAction({
					action: "reorder_column",
					payload: {
						status: destStatus,
						reorderedTasks: columnTasks,
					},
				});
				try {
					await reorderTasks(columnTasks.map((t) => t.id));
				} catch (err) {
					console.error("Failed to reorder column", err);
					showError("Failed to save card positions.");
				}
			});
			return;
		}

		// 2. Inter-column move: update status and sync position
		startTransition(async () => {
			addOptimisticAction({
				action: "move",
				payload: {
					id: draggableId,
					status: destStatus,
				},
			});

			try {
				await updateTaskStatus(draggableId, destStatus);
			} catch (err) {
				console.error("Failed to update status", err);
				showError("Failed to move task. Please try again.");
			}
		});
	};

	const handleDeleteRequest = useCallback((taskId: string) => {
		setDeleteTaskId(taskId);
	}, []);

	const handleConfirmDelete = async () => {
		if (!deleteTaskId) return;
		const targetId = deleteTaskId;
		setDeleteTaskId(null);

		const taskToDelete = optimisticTasks.find((t) => t.id === targetId);
		if (!taskToDelete) return;

		// 1. Optimistically remove
		startTransition(() => {
			addOptimisticAction({ action: "delete", payload: { taskId: targetId } });
		});

		// 2. Multi-task undo timer
		const timerKey = `delete-${targetId}`;
		const timer = setTimeout(async () => {
			undoTimeoutsRef.current.delete(timerKey);
			try {
				await deleteTask(targetId);
			} catch (error) {
				console.error("Failed to delete task:", error);
				showError("Failed to delete task. Please try again.");
				startTransition(() => {
					addOptimisticAction({
						action: "restore",
						payload: { task: taskToDelete },
					});
				});
			}
		}, UNDO_TOAST_DURATION_MS);

		undoTimeoutsRef.current.set(timerKey, timer);

		// 3. Show undo toast
		showSuccess(
			`Task "${taskToDelete.title}" deleted`,
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
							payload: { task: taskToDelete },
						});
					});
				},
			},
		);
	};

	const handleArchive = useCallback(
		(taskId: string) => {
			const taskToArchive = optimisticTasks.find((t) => t.id === taskId);
			if (!taskToArchive) return;

			// 1. Optimistically remove
			startTransition(() => {
				addOptimisticAction({ action: "archive", payload: { taskId } });
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
		},
		[optimisticTasks, addOptimisticAction, showSuccess, showError],
	);

	const handleUpdate = useCallback(
		async (taskId: string, updates: Partial<Task>) => {
			startTransition(() => {
				addOptimisticAction({
					action: "update",
					payload: { taskId, updates },
				});
			});
			try {
				await updateTask(taskId, updates);
			} catch (error) {
				console.error("Failed to update task:", error);
				showError("Failed to update task.");
			}
		},
		[addOptimisticAction, showError],
	);

	const columnKeys: TaskStatus[] = ["todo", "in_progress", "done", "blocked"];

	return (
		<>
			<DragDropContext onDragEnd={handleDragEnd}>
				<div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
					{columnKeys.map((colKey) => {
						const statusConfig = TASK_STATUS_CONFIG[colKey];
						const colTasks = columns[colKey] || [];

						return (
							<div
								key={colKey}
								className="flex-shrink-0 w-[85vw] sm:w-[360px] flex flex-col gap-3 snap-center"
							>
								{/* Column Header */}
								<div
									className={`flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 shadow-sm ${statusConfig.borderColor} border-l-4`}
								>
									<div className="flex items-center gap-2">
										<span
											className={`w-2.5 h-2.5 rounded-full ${statusConfig.dotColor}`}
										/>
										<h3 className="font-black uppercase tracking-wider text-xs text-slate-700">
											{statusConfig.label}
										</h3>
									</div>
									<span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
										{colTasks.length}
									</span>
								</div>

								{/* Droppable Area */}
								<Droppable droppableId={colKey}>
									{(provided, snapshot) => (
										<div
											ref={provided.innerRef}
											{...provided.droppableProps}
											className={`flex-1 min-h-[300px] p-2 rounded-2xl transition-colors ${
												snapshot.isDraggingOver
													? "bg-slate-100/80"
													: "bg-slate-50/50"
											}`}
										>
											<div className="space-y-3">
												{colTasks.map((task, index) => (
													<Draggable
														key={task.id}
														draggableId={task.id}
														index={index}
													>
														{(dragProvided, dragSnapshot) => (
															<TaskItem
																task={task}
																index={index}
																provided={dragProvided}
																snapshot={dragSnapshot}
																layoutMode="board"
																onDelete={handleDeleteRequest}
																onUpdate={handleUpdate}
																onArchive={handleArchive}
															/>
														)}
													</Draggable>
												))}
												{provided.placeholder}
											</div>
										</div>
									)}
								</Droppable>
							</div>
						);
					})}
				</div>
			</DragDropContext>

			<CustomModal
				isOpen={!!deleteTaskId}
				onClose={() => setDeleteTaskId(null)}
				title="Delete Task"
				description="Are you sure you want to permanently delete this task? This action cannot be undone."
				onConfirm={handleConfirmDelete}
				confirmText="Delete Forever"
				cancelText="Cancel"
				variant="danger"
			/>
		</>
	);
}
