"use client";

import {
	useOptimistic,
	useTransition,
	useMemo,
	useRef,
	useCallback,
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
	toggleTask,
	deleteTask,
} from "@/features/tasks/actions/tasks";
import TaskItem from "./TaskItem";
import { TASK_STATUS_CONFIG } from "@/features/tasks/constants";
import { useToast } from "@/features/tasks/components/shared/Toast";
import CustomModal from "@/features/shared/components/CustomModal";
import { useState } from "react";

interface TaskBoardProps {
	todayTasks: Task[];
	upcomingTasks: Task[];
	completedTasks: Task[];
}

export default function TaskBoard({
	todayTasks,
	upcomingTasks,
	completedTasks,
}: TaskBoardProps) {
	const [_isPending, startTransition] = useTransition();
	const { showSuccess, showError } = useToast();
	const pendingRequests = useRef(new Set<string>());

	// Modal State for Deletion
	const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

	// Combine all active and completed tasks into one flat array
	const allTasks = useMemo(() => {
		const map = new Map<string, Task>();
		for (const t of [...todayTasks, ...upcomingTasks, ...completedTasks]) {
			if (!map.has(t.id)) {
				map.set(t.id, t);
			}
		}
		return Array.from(map.values());
	}, [todayTasks, upcomingTasks, completedTasks]);

	// Optimistic state handles toggle, delete, update, and drag-and-drop
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
				return state.filter((t) => t.id !== payload.taskId);
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

		const newStatus = destination.droppableId as TaskStatus;

		startTransition(() => {
			addOptimisticAction({
				action: "move",
				payload: {
					id: draggableId,
					status: newStatus,
				},
			});
		});

		try {
			await updateTaskStatus(draggableId, newStatus);
		} catch (err) {
			console.error("Failed to update status", err);
			showError("Failed to move task. Please try again.");
		}
	};

	const handleToggle = useCallback(
		async (taskId: string, currentStatus: boolean) => {
			if (pendingRequests.current.has(`toggle-${taskId}`)) return;
			const actionKey = `toggle-${taskId}`;
			pendingRequests.current.add(actionKey);

			startTransition(() => {
				addOptimisticAction({ action: "toggle", payload: { taskId } });
			});

			try {
				await toggleTask(taskId, currentStatus);
			} catch (error) {
				console.error("Failed to toggle task:", error);
				showError("Failed to update task. Please try again.");
			} finally {
				pendingRequests.current.delete(actionKey);
			}
		},
		[addOptimisticAction, showError],
	);

	const handleDeleteRequest = useCallback((taskId: string) => {
		setDeleteTaskId(taskId);
	}, []);

	const handleConfirmDelete = async () => {
		if (!deleteTaskId) return;
		const taskId = deleteTaskId;
		setDeleteTaskId(null);

		startTransition(() => {
			addOptimisticAction({ action: "delete", payload: { taskId } });
		});

		try {
			await deleteTask(taskId);
			showSuccess("Task deleted forever.");
		} catch (error) {
			console.error("Failed to delete task:", error);
			showError("Failed to delete task. Please try again.");
		}
	};

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

	const columnKeys: TaskStatus[] = ["todo", "in_progress", "blocked", "done"];

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
