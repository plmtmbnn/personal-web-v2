import { Task } from "@/lib/types/tasks";

/**
 * Calculates the completion percentage of tasks.
 */
export function calculateProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  
  const completedCount = tasks.filter(t => t.is_completed).length;
  return Math.round((completedCount / tasks.length) * 100);
}
