'use client';

import React, { useOptimistic, useTransition, useMemo, useState } from 'react';
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
import { Task } from '@/features/tasks/types';
import { toggleTask, deleteTask, reorderTasks, updateTask } from '@/features/tasks/actions/tasks';
import TaskItem from './TaskItem';
import TaskFilters from './TaskFilters';
import { format, addDays, isBefore, startOfDay, parseISO } from 'date-fns';
import CustomModal from '@/features/shared/components/CustomModal';

interface TaskListProps {
	todayTasks: Task[];
	upcomingTasks: Task[];
}

export default function TaskList({ todayTasks, upcomingTasks }: TaskListProps) {
	const [isPending, startTransition] = useTransition();
	const searchParams = useSearchParams();

	// Modal State
	const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	// Section-specific filter extraction
  const getFilters = (prefix: string) => ({
    priority: searchParams.get(`${prefix}_priority`) || "all",
    category: searchParams.get(`${prefix}_category`) || "all",
    showCompleted: searchParams.get(`${prefix}_completed`) === "true",
    range: searchParams.get(`${prefix}_range`) || "week"
  });

  const todayFilters = getFilters("today");
  const upcomingFilters = getFilters("upcoming");

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

  /**
   * Helper to apply local filters to a list
   */
  const applyFilters = (list: Task[], filters: any, isUpcoming = false) => {
    let result = list;
    
    // 1. Priority
    if (filters.priority !== "all") {
      result = result.filter(t => t.priority === filters.priority);
    }
    
    // 2. Category
    if (filters.category !== "all") {
      result = result.filter(t => t.category === filters.category);
    }
    
    // 3. Completion
    if (!filters.showCompleted) {
      result = result.filter(t => !t.is_completed);
    }

    // 4. Date Range (Only for Upcoming)
    if (isUpcoming && filters.range === "week") {
      const nextWeek = addDays(startOfDay(new Date()), 8); // 7 days from today
      result = result.filter(t => isBefore(parseISO(t.due_date), nextWeek));
    }

    return result;
  };

	// Derived display lists
	const displayTodayTasks = useMemo(() => 
    applyFilters(optimisticState.todayTasks, todayFilters), 
    [optimisticState.todayTasks, todayFilters]
  );

	const displayUpcomingTasks = useMemo(() => 
    applyFilters(optimisticState.upcomingTasks, upcomingFilters, true), 
    [optimisticState.upcomingTasks, upcomingFilters]
  );

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

	const handleDeleteRequest = (taskId: string) => {
		setDeleteTaskId(taskId);
	};

	const confirmDelete = async () => {
		if (!deleteTaskId) return;
		
		setIsDeleting(true);
		startTransition(async () => {
			addOptimisticAction({ action: 'delete', payload: { taskId: deleteTaskId } });
			try {
				await deleteTask(deleteTaskId);
			} catch (error) {
				console.error(error);
			} finally {
				setIsDeleting(false);
				setDeleteTaskId(null);
			}
		});
	};

	const onDragEnd = (result: DropResult) => {
		const { destination, source, draggableId } = result;
		if (!destination) return;
		if (destination.droppableId === source.droppableId && destination.index === source.index) return;

		const sourceList: Task[] = source.droppableId === 'today-list' ? Array.from(displayTodayTasks) : Array.from(displayUpcomingTasks);
		const destList: Task[] = destination.droppableId === 'today-list' ? Array.from(displayTodayTasks) : Array.from(displayUpcomingTasks);

		if (source.droppableId === destination.droppableId) {
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
			const [movedTask] = sourceList.splice(source.index, 1);
			
			const todayStr = format(new Date(), 'yyyy-MM-dd');
			const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');
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
			<div className="space-y-16">
				{/* Delete Confirmation Modal */}
				<CustomModal
					isOpen={!!deleteTaskId}
					onClose={() => setDeleteTaskId(null)}
					onConfirm={confirmDelete}
					title="Purge Task Objective"
					description="Are you sure you want to permanently remove this objective from your agenda? This action cannot be undone."
					variant="danger"
					confirmText="Confirm Purge"
					isLoading={isDeleting}
				/>

				{/* Today Section */}
				<section>
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm border border-orange-200/50">
                <Flame className="w-5 h-5 fill-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">Focus (Today)</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">High-priority execution</p>
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
										<Draggable key={task.id} draggableId={task.id} index={index}>
											{(provided, snapshot) => (
												<TaskItem 
													task={task}
													index={index}
													provided={provided}
													snapshot={snapshot}
													onToggle={handleToggle}
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
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-200/50">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">Upcoming Awareness</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Strategic foresight</p>
              </div>
            </div>
            {/* Upcoming Filters with Range Toggle */}
            <TaskFilters tasks={upcomingTasks} paramPrefix="upcoming" showRangeFilter={true} />
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
													onDelete={handleDeleteRequest}
												/>
											)}
										</Draggable>
									))
								) : (
									<div className="text-center py-16 bg-slate-50 border border-slate-200 rounded-[2.5rem] border-dashed">
										<Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3 opacity-30" />
										<p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
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
