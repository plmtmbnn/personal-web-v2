"use client";
import { useSearchParams } from "next/navigation";
import { inUpcomingRange, inCompletionWeek } from "../../agenda";
import { useTaskDay } from "./useTaskDay";

import {
	useOptimistic,
	useTransition,
	useMemo,
	useCallback,
	useState,
} from "react";
import {
	DragDropContext,
	Droppable,
	Draggable,
	type DropResult,
} from "@hello-pangea/dnd";
import type { Task, TaskStatus } from "@/features/tasks/types";
import TaskItem from "./TaskItem";
import { TASK_STATUS_CONFIG } from "@/features/tasks/constants";
import { useToast } from "@/features/tasks/components/shared/Toast";
import { useTaskMutations } from "./TaskMutations";
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
	const day = useTaskDay();
	const params = useSearchParams();
	const range = params.get("upcoming_range") || "week";
	const week = params.get("completed_week_offset");
	const [_isPending, startTransition] = useTransition();
	const { showError } = useToast();

	// Modal State for Deletion
	const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

	// Combine all tasks into one deduplicated flat array
	const allTasks = useMemo(() => {
		const map = new Map<string, Task>();
		for (const t of [
			...overdueTasks,
			...todayTasks,
			...upcomingTasks.filter((task) => inUpcomingRange(task, day, range)),
			...completedTasks.filter((task) => inCompletionWeek(task, day, week)),
		]) {
			if (!map.has(t.id)) {
				map.set(t.id, t);
			}
		}
		return Array.from(map.values());
	}, [
		overdueTasks,
		todayTasks,
		upcomingTasks,
		completedTasks,
		day,
		range,
		week,
	]);

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
				return [
					...otherTasks,
					...payload.reorderedTasks.map((task: Task, position: number) => ({
						...task,
						position,
					})),
				];
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
		for (const col of Object.values(cols))
			col.sort((a, b) => a.position - b.position);
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
				const ids = columns[destStatus].map((t) => t.id);
				ids.splice(destination.index, 0, draggableId);
				await reorderTasks(ids, {
					id: draggableId,
					updates: { status: destStatus },
				});
			} catch (err) {
				console.error("Failed to update status", err);
				showError("Failed to move task. Please try again.");
			}
		});
	};

	const handleDeleteRequest = useCallback((taskId: string) => {
		setDeleteTaskId(taskId);
	}, []);

	const {
		update: handleUpdate,
		remove,
		pending,
		reorder: reorderTasks,
	} = useTaskMutations();
	const handleConfirmDelete = () => {
		const task = allTasks.find((t) => t.id === deleteTaskId);
		if (task) remove(task, "delete");
		setDeleteTaskId(null);
	};
	const handleArchive = (id: string) => {
		const task = allTasks.find((t) => t.id === id);
		if (task) remove(task, "archive");
	};

	const columnKeys: TaskStatus[] = [
		"todo",
		"in_progress",
		"done",
		"blocked",
		...(columns.cancelled.length ? ["cancelled" as const] : []),
	];

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
														isDragDisabled={pending || _isPending}
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
