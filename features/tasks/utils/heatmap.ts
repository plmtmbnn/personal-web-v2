import { format, parseISO, eachDayOfInterval } from 'date-fns';
import { Task } from '../types';

/**
 * Aggregates task creation and completion counts by date for a given range.
 */
export function aggregateHeatmapData(tasks: Task[], start: Date, end: Date) {
  const days = eachDayOfInterval({ start, end });
  const counts: Record<string, { created: number; completed: number }> = {};
  
  // Initialize range with 0s
  for (const day of days) {
    counts[format(day, 'yyyy-MM-dd')] = { created: 0, completed: 0 };
  }

  // Aggregate task counts
  for (const task of tasks) {
    // Count Created
    const createdDateKey = format(parseISO(task.created_at), 'yyyy-MM-dd');
    if (counts[createdDateKey] !== undefined) {
      counts[createdDateKey].created++;
    }

    // Count Completed
    if (task.is_completed && task.completed_at) {
      const completedDateKey = format(parseISO(task.completed_at), 'yyyy-MM-dd');
      if (counts[completedDateKey] !== undefined) {
        counts[completedDateKey].completed++;
      }
    }
  }

  return counts;
}
