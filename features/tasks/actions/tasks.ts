'use server';

import { revalidatePath } from 'next/cache';
import { SupabaseConn } from '@/lib/core/supabase';
import { invalidateStatsCache } from '@/lib/core/redis';
import { Task, TaskPriority } from '../types';

/**
 * Fetch tasks with optional filters.
 * Default: Today, is_completed: false
 */
export async function getTasks(options?: {
  startDate?: string;
  endDate?: string;
  priority?: TaskPriority;
  category?: string;
  showCompletedToday?: boolean;
}): Promise<Task[]> {
  const today = new Date().toISOString().split('T')[0];
  const startDate = options?.startDate || today;
  const endDate = options?.endDate || today;
  const showCompletedToday = options?.showCompletedToday ?? false;

  let query = SupabaseConn.from('tasks').select('*');

  // Handle Completion and Date Filtering
  if (showCompletedToday) {
    // Show: (Due in range AND NOT completed) OR (Completed today)
    query = query.or(`and(due_date.gte.${startDate},due_date.lte.${endDate},is_completed.eq.false),and(is_completed.eq.true,completed_at.gte.${today}T00:00:00,completed_at.lte.${today}T23:59:59)`);
  } else {
    // Standard filtered view: Due in range AND NOT completed
    query = query.eq('is_completed', false).gte('due_date', startDate).lte('due_date', endDate);
  }

  // Handle Priority Filter
  if (options?.priority) {
    query = query.eq('priority', options.priority);
  }

  // Handle Category Filter
  if (options?.category) {
    query = query.eq('category', options.category);
  }

  const { data, error } = await query
    .order('position', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return data as Task[];
}

/**
 * Add a new task to Supabase
 */
export async function addTask(payload: {
  title: string;
  priority: TaskPriority;
  category: string;
  due_date: string;
}) {
  const { data, error } = await SupabaseConn
    .from('tasks')
    .insert([{
      ...payload,
      is_completed: false,
      position: 0 // Simplification: new tasks at top
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding task:', payload, error);
    throw new Error('Failed to add task');
  }

  revalidatePath('/tasks');
  await invalidateStatsCache();
  return data as Task;
}

/**
 * Toggle task completion status and handle completed_at timestamp
 */
export async function toggleTask(taskId: string, isCurrentlyCompleted: boolean) {
  const newStatus = !isCurrentlyCompleted;
  const completedAt = newStatus ? new Date().toISOString() : null;

  const { error } = await SupabaseConn
    .from('tasks')
    .update({
      is_completed: newStatus,
      completed_at: completedAt
    })
    .eq('id', taskId);

  if (error) {
    console.error('Error toggling task:', error);
    throw new Error('Failed to toggle task');
  }

  revalidatePath('/tasks');
  await invalidateStatsCache();
}

/**
 * Bulk update task positions
 */
export async function reorderTasks(taskIds: string[]) {
  // We use individual updates because .upsert() requires all NOT NULL columns 
  // (like 'title') to be present in the payload, even if we only intend to update.
  const promises = taskIds.map((id, index) =>
    SupabaseConn
      .from('tasks')
      .update({ position: index })
      .eq('id', id)
  );

  const results = await Promise.all(promises);
  
  // Check if any of the updates failed
  const firstError = results.find(r => r.error)?.error;

  if (firstError) {
    console.error('Error reordering tasks:', firstError);
    throw new Error('Failed to reorder tasks');
  }

  revalidatePath('/tasks');
  // Reordering doesn't usually change counts, but we'll invalidate to be safe 
  // in case analytics ever use sequence data.
  await invalidateStatsCache();
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string) {
  const { error } = await SupabaseConn
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error('Error deleting task:', error);
    throw new Error('Failed to delete task');
  }

  revalidatePath('/tasks');
  await invalidateStatsCache();
}

/**
 * Fetch tasks that are not completed and past their due date.
 */
export async function getStaleTasks(): Promise<Task[]> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await SupabaseConn
    .from('tasks')
    .select('*')
    .eq('is_completed', false)
    .lt('due_date', today)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching stale tasks:', error);
    return [];
  }

  return data as Task[];
}

/**
 * Permanently delete completed tasks older than 6 months.
 */
export async function cleanupOldTasks() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const dateStr = sixMonthsAgo.toISOString();

  const { error } = await SupabaseConn
    .from('tasks')
    .delete()
    .eq('is_completed', true)
    .lt('completed_at', dateStr);

  if (error) {
    console.error('Error cleaning up old tasks:', error);
    throw new Error('Failed to cleanup old tasks');
  }

  revalidatePath('/tasks');
  await invalidateStatsCache();
}

/**
 * Bulk update due_date for a set of tasks.
 */
export async function rescheduleStaleTasks(taskIds: string[], newDate: string) {
  const { error } = await SupabaseConn
    .from('tasks')
    .update({ due_date: newDate })
    .in('id', taskIds);

  if (error) {
    console.error('Error rescheduling tasks:', error);
    throw new Error('Failed to reschedule tasks');
  }

  revalidatePath('/tasks');
  await invalidateStatsCache();
}

/**
 * Reschedule all overdue tasks by adding a specific number of days.
 * Increments the reschedule_count for each task.
 */
export async function rescheduleOverdueTasks(daysToAdd: number) {
  const today = new Date().toISOString().split('T')[0];
  const newDate = new Date();
  newDate.setDate(newDate.getDate() + daysToAdd);
  const newDateStr = newDate.toISOString().split('T')[0];

  // 1. Fetch overdue tasks
  const { data: overdueTasks, error: fetchError } = await SupabaseConn
    .from('tasks')
    .select('id, reschedule_count')
    .eq('is_completed', false)
    .lt('due_date', today);

  if (fetchError || !overdueTasks) {
    console.error('Error fetching overdue tasks for rescheduling:', fetchError);
    return { success: false, message: 'Failed to fetch overdue tasks' };
  }

  if (overdueTasks.length === 0) return { success: true, message: 'No overdue tasks to reschedule' };

  // 2. Perform updates (Due Date + Increment Counter)
  const promises = overdueTasks.map((t) => 
    SupabaseConn
      .from('tasks')
      .update({ 
        due_date: newDateStr,
        reschedule_count: (t.reschedule_count || 0) + 1 
      })
      .eq('id', t.id)
  );

  const results = await Promise.all(promises);
  const firstError = results.find(r => r.error)?.error;

  if (firstError) {
    console.error('Error during bulk reschedule:', firstError);
    return { success: false, message: firstError.message };
  }

  revalidatePath('/tasks');
  await invalidateStatsCache();
  return { success: true, message: `Successfully rescheduled ${overdueTasks.length} tasks` };
}

/**
 * Update task details (title, priority, etc.)
 */
export async function updateTask(taskId: string, updates: Partial<Task>) {
  const { error } = await SupabaseConn
    .from('tasks')
    .update(updates)
    .eq('id', taskId);

  if (error) {
    console.error('Error updating task:', error);
    throw new Error('Failed to update task');
  }

  revalidatePath('/tasks');
  await invalidateStatsCache();
}
