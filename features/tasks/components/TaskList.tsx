'use client';

import React, { useOptimistic, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
	Inbox, 
	Flame,
	Calendar,
	CheckCircle2
} from 'lucide-react';
import { 
	DragDropContext, 
	Droppable, 
	Draggable, 
	DropResult 
} from '@hello-pangea/dnd';
import { format, startOfDay, addDays } from 'date-fns';
import { Task } from '@/features/tasks/types';
import { toggleTask, deleteTask, reorderTasks, updateTask } from '@/features/tasks/actions/tasks';
import TaskItem from './TaskItem';

interface TaskListProps {
	todayTasks: Task[];
	upcomingTasks: Task[];
}

export default function TaskList({ todayTasks, upcomingTasks }: TaskListProps) {
	const [isPending, startTransition] = useTransition();
	const searchParams = useSearchParams();
	const showCompleted = searchParams.get('completed') === 'true';

	// Optimistic state for the task lists
	const [optimisticState, addOptimisticAction] = useOptimistic(
		{ todayTasks, upcomingTasks },
		(state, { action, payload }: { action: string; payload: any }) => {
			switch (action) {
				case 'toggle':
					return {
						todayTasks: state.todayTasks.map((t: Task) =>
							t.id === payload.taskId ? { ...t, is_completed: !t.is_completed } : t
						),
						upcomingTasks: state.upcomingTasks.map((t: Task) =>
							t.id === payload.taskId ? { ...t, is_completed: !t.is_completed } : t
						),
					};
				case 'update':
					return {
						todayTasks: state.todayTasks.map((t: Task) =>
							t.id === payload.taskId ? { ...t, ...payload.updates } : t
						),
						upcomingTasks: state.upcomingTasks.map((t: Task) =>
							t.id === payload.taskId ? { ...t, ...payload.updates } : t
						),
					};
				case 'delete':
					return {
						todayTasks: state.todayTasks.filter((t: Task) => t.id !== payload.taskId),
						upcomingTasks: state.upcomingTasks.filter((t: Task) => t.id !== payload.taskId),
					};
				case 'reorder': {
					const listKey = payload.droppableId === 'today-list' ? 'todayTasks' : 'upcomingTasks';
					return {
						...state,
						[listKey]: payload.newTasks,
					};
				}
				case 'move':
					return {
						todayTasks: payload.newTodayTasks,
						upcomingTasks: payload.newUpcomingTasks,
					};
				default:
					return state;
			}
		}
	);

	// Display lists are derived from optimistic state. 
	// Note: In TaskFocusView, the TasksView already filters by completion if showCompleted is false,
	// but we re-filter here to handle the immediate optimistic toggle disappearing if needed.
	const displayTodayTasks = showCompleted
		? optimisticState.todayTasks
		: optimisticState.todayTasks.filter((t: Task) => !t.is_completed);

	const displayUpcomingTasks = showCompleted
		? optimisticState.upcomingTasks
		: optimisticState.upcomingTasks.filter((t: Task) => !t.is_completed);
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
		if (!confirm('Purge this task from the system?')) return;
		
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
		if (!destination) return;
		if (destination.droppableId === source.droppableId && destination.index === source.index) return;

		// We work with the display lists because the index corresponds to them
		const sourceList: Task[] = source.droppableId === 'today-list' ? Array.from(displayTodayTasks) : Array.from(displayUpcomingTasks);
		const destList: Task[] = destination.droppableId === 'today-list' ? Array.from(displayTodayTasks) : Array.from(displayUpcomingTasks);

		if (source.droppableId === destination.droppableId) {
			// Reorder within same list
			const [movedTask] = sourceList.splice(source.index, 1);
			sourceList.splice(destination.index, 0, movedTask);
			
			startTransition(async () => {
				addOptimisticAction({ 
					action: 'reorder', 
					payload: { droppableId: source.droppableId, newTasks: sourceList } 
				});
				try {
					await reorderTasks(sourceList.map((t: Task) => t.id));
				} catch (error) {
					console.error('Failed to reorder:', error);
				}
			});
		} else {
			// Inter-section move
			const [movedTask] = sourceList.splice(source.index, 1);
			
			const todayRef = startOfDay(new Date());
			const todayStr = format(todayRef, 'yyyy-MM-dd');
			const tomorrowStr = format(addDays(todayRef, 1), 'yyyy-MM-dd');
			const newDueDate = destination.droppableId === 'today-list' ? todayStr : tomorrowStr;
			
			const updatedTask = { ...movedTask, due_date: newDueDate };
			destList.splice(destination.index, 0, updatedTask);

			const finalToday = destination.droppableId === 'today-list' ? destList : sourceList;
			const finalUpcoming = destination.droppableId === 'upcoming-list' ? destList : sourceList;

			startTransition(async () => {
				addOptimisticAction({ 
					action: 'move', 
					payload: { newTodayTasks: finalToday, newUpcomingTasks: finalUpcoming } 
				});
				try {
					await updateTask(draggableId, { due_date: newDueDate });
					await reorderTasks(destList.map((t: Task) => t.id));
				} catch (error) {
					console.error('Failed to move task:', error);
				}
			});
		}
	};

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<div className="space-y-12">
				{/* Today Section */}
				<section>
					<div className="flex items-center gap-2 mb-4">
						<div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
							<Flame className="w-4 h-4 fill-orange-600" />
						</div>
						<h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">🔥 Focus (Today)</h3>
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
									))
								) : (
									<div className="text-center py-12 bg-emerald-50/50 border border-emerald-100 rounded-2xl border-dashed">
										<CheckCircle2 className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
										<p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">
											All caught up for today!
										</p>
									</div>
								)}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</section>

				{/* Upcoming Section */}
				<section>
					<div className="flex items-center gap-2 mb-4">
						<div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
							<Calendar className="w-4 h-4" />
						</div>
						<h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">📅 Upcoming Awareness</h3>
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
									))
								) : (
									<div className="text-center py-10 bg-slate-50 border border-slate-200 rounded-2xl border-dashed">
										<Inbox className="w-6 h-6 text-slate-300 mx-auto mb-2" />
										<p className="text-xs text-slate-400 font-medium italic">
											No upcoming objectives detected.
										</p>
									</div>
								)}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</section>
			</div>
		</DragDropContext>
	);
}
