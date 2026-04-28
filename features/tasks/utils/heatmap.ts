import { format, parseISO, eachDayOfInterval } from 'date-fns';
import { Task } from '../types';

/**
 * Aggregates task completion counts by date for a given range.
 */
export function aggregateHeatmapData(tasks: Task[], start: Date, end: Date) {
  const days = eachDayOfInterval({ start, end });
  const counts: Record<string, number> = {};
  
  // Initialize range with 0s
  for (const day of days) {
    counts[format(day, 'yyyy-MM-dd')] = 0;
  }

  // Aggregate task counts
  for (const task of tasks) {
    if (task.is_completed && task.completed_at) {
      const dateKey = format(parseISO(task.completed_at), 'yyyy-MM-dd');
      if (counts[dateKey] !== undefined) {
        counts[dateKey]++;
      }
    }
  }

  return counts;
}
