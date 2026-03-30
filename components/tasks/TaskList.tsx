'use client';

import React, { useOptimistic, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
	CheckCircle2, 
	Circle, 
	Trash2, 
	Inbox, 
	GripVertical,
	AlertTriangle
} from 'lucide-react';
import { 
	DragDropContext, 
	Droppable, 
	Draggable, 
	DropResult 
} from '@hello-pangea/dnd';
import { Task } from '@/lib/types/tasks';
import { toggleTask, deleteTask, reorderTasks } from '@/lib/actions/tasks';
import { calculateProgress } from '@/lib/utils/tasks';

interface TaskListProps {
	initialTasks: Task[];
}

export default function TaskList({ initialTasks }: TaskListProps) {
	const [isPending, startTransition] = useTransition();
	const searchParams = useSearchParams();
	const showCompleted = searchParams.get('completed') === 'true';

	// Optimistic state for the task list
	const [optimisticTasks, addOptimisticAction] = useOptimistic(
		initialTasks,
		(state, { action, payload }: { action: 'toggle' | 'delete' | 'reorder'; payload: any }) => {
			if (action === 'toggle') {
				return state.map((task) =>
					task.id === payload.taskId
						? { ...task, is_completed: !task.is_completed }
						: task
				);
			}
			if (action === 'delete') {
				return state.filter((task) => task.id !== payload.taskId);
			}
			if (action === 'reorder') {
				return payload.newOrder;
			}
			return state;
		}
	);

	// Filter tasks based on URL param
	const displayTasks = showCompleted 
		? optimisticTasks 
		: optimisticTasks.filter(t => !t.is_completed);

	// Group tasks by category
	const categories = Array.from(new Set(displayTasks.map(t => t.category || 'General')));

	const handleToggle = async (taskId: string, currentStatus: boolean) => {
		startTransition(async () => {
			addOptimisticAction({ action: 'toggle', payload: { taskId } });
			try {
				await toggleTask(taskId, currentStatus);
			} catch (error) {
				console.error(error);
			}
		});
	};

	const handleDelete = async (taskId: string) => {
		if (!confirm('Are you sure you want to delete this task?')) return;
		
		startTransition(async () => {
			addOptimisticAction({ action: 'delete', payload: { taskId } });
			try {
				await deleteTask(taskId);
			} catch (error) {
				console.error(error);
			}
		});
	};

	const onDragEnd = (result: DropResult) => {
		const { destination, source, draggableId } = result;

		if (!destination || destination.index === source.index) return;

		// Note: Since we are using filtered/grouped views, simple index reordering is tricky.
		// For a robust implementation, we reorder the entire optimisticTasks array.
		const newTasks = Array.from(optimisticTasks);
		const [movedTask] = newTasks.splice(source.index, 1);
		newTasks.splice(destination.index, 0, movedTask);

		startTransition(async () => {
			addOptimisticAction({ action: 'reorder', payload: { newOrder: newTasks } });
			try {
				await reorderTasks(newTasks.map(t => t.id));
			} catch (error) {
				console.error('Failed to save order:', error);
			}
		});
	};

	if (displayTasks.length === 0) {
		return (
			<div className="text-center py-20 glass shadow-sm rounded-3xl border-2 border-dashed border-border/50 animate-fade-in">
				<div className="w-16 h-16 bg-background-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 text-muted-foreground/30">
					<Inbox className="w-8 h-8" />
				</div>
				<h3 className="text-xl font-bold mb-2">Clean Slate!</h3>
				<p className="text-muted-foreground max-w-xs mx-auto">
					No tasks found matching your filters. Take a break or adjust your view.
				</p>
			</div>
		);
	}

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId="tasks-list">
				{(provided) => (
					<div 
						{...provided.droppableProps} 
						ref={provided.innerRef}
						className="space-y-10"
					>
						{/* If we have categories, we list them. 
						    Note: Cross-category reordering with grouped headers is visually complex 
						    in a single droppable list. We'll render all tasks in a single sequence 
						    to maintain simple reordering logic as requested. */}
						<div className="grid gap-4">
							{displayTasks.map((task, index) => (
								<Draggable key={task.id} draggableId={task.id} index={index}>
									{(provided, snapshot) => (
										<div
											ref={provided.innerRef}
											{...provided.draggableProps}
											className={`glass-card group flex items-center gap-3 p-5 transition-all duration-300 ${
												snapshot.isDragging ? 'shadow-2xl ring-2 ring-accent/20 bg-background/80 scale-[1.02] z-50' : ''
											} ${task.is_completed ? 'opacity-50 grayscale-[0.8]' : ''}`}
										>
											{/* Drag Handle */}
											<div 
												{...provided.dragHandleProps}
												className="p-1 text-muted-foreground/30 hover:text-accent transition-colors cursor-grab active:cursor-grabbing"
											>
												<GripVertical className="w-5 h-5" />
											</div>

											<div className="flex items-start gap-4 flex-1 min-w-0">
												<button
													onClick={() => handleToggle(task.id, task.is_completed)}
													className={`mt-1 flex-shrink-0 transition-all duration-300 transform hover:scale-110 active:scale-90 ${
														task.is_completed ? 'text-green-500' : 'text-muted-foreground hover:text-accent'
													}`}
												>
													{task.is_completed ? (
														<CheckCircle2 className="w-7 h-7" />
													) : (
														<Circle className="w-7 h-7" />
													)}
												</button>
												<div className="flex-1 min-w-0 break-words">
													<h4
														className={`font-semibold text-lg transition-all duration-300 ${
															task.is_completed ? 'line-through text-muted-foreground decoration-2' : ''
														}`}
													>
														{task.title}
													</h4>
													<div className="flex items-center gap-3 mt-1">
														<span className="text-[10px] font-bold px-2 py-0.5 bg-background-secondary rounded text-muted-foreground uppercase">
															{task.category || 'General'}
														</span>
														<span
															className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
																task.priority === 'HIGH'
																	? 'text-red-600 bg-red-100 border border-red-200'
																	: task.priority === 'MEDIUM'
																	? 'text-amber-600 bg-amber-100 border border-amber-200'
																	: 'text-blue-600 bg-blue-100 border border-blue-200'
															}`}
														>
															{task.priority}
														</span>
													</div>
												</div>
											</div>

											<button
												onClick={() => handleDelete(task.id)}
												className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl md:opacity-0 group-hover:opacity-100 transition-all"
												title="Delete task"
											>
												<Trash2 className="w-5 h-5" />
											</button>
										</div>
									)}
								</Draggable>
							))}
							{provided.placeholder}
						</div>
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
}
