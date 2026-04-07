'use client';

import React, { useOptimistic, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
	Inbox, 
} from 'lucide-react';
import { 
	DragDropContext, 
	Droppable, 
	Draggable, 
	DropResult 
} from '@hello-pangea/dnd';
import { Task } from '@/lib/types/tasks';
import { toggleTask, deleteTask, reorderTasks, updateTask } from '@/lib/actions/tasks';
import TaskItem from './TaskItem';

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
		(state, { action, payload }: { action: 'toggle' | 'delete' | 'reorder' | 'update'; payload: any }) => {
			if (action === 'toggle') {
				return state.map((task) =>
					task.id === payload.taskId
						? { ...task, is_completed: !task.is_completed }
						: task
				);
			}
			if (action === 'update') {
				return state.map((task) =>
					task.id === payload.taskId
						? { ...task, ...payload.updates }
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

	const handleUpdate = async (taskId: string, updates: Partial<Task>) => {
		startTransition(async () => {
			addOptimisticAction({ action: 'update', payload: { taskId, updates } });
			try {
				await updateTask(taskId, updates);
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
		const { destination, source } = result;

		if (!destination || destination.index === source.index) return;

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
						<div className="grid gap-4">
							{displayTasks.map((task, index) => (
								<Draggable key={task.id} draggableId={task.id} index={index}>
									{(provided, snapshot) => (
										<TaskItem 
											task={task}
											index={index}
											provided={provided}
											snapshot={snapshot}
											onToggle={handleToggle}
											onUpdate={handleUpdate}
											onDelete={handleDelete}
										/>
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
