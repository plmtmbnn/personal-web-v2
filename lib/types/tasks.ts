export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  category: string | null;
  is_completed: boolean;
  due_date: string;
  position: number;
  created_at: string;
  completed_at: string | null;
}
