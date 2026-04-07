'use server';

import { SupabaseConn } from '@/utils/supabase';
import { Task } from '@/lib/types/tasks';
import { 
  startOfToday, 
  subDays, 
  format, 
  parseISO, 
  isSameDay,
  differenceInDays
} from 'date-fns';

export interface AnalyticsStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  mostProductiveDay: string;
  categoryDistribution: { category: string; count: number }[];
  streak: number;
  comparison: number; // percentage change vs previous period
}

/**
 * Fetch and calculate task analytics for a given period.
 */
export async function getTaskStats(period: 'week' | 'month'): Promise<AnalyticsStats> {
  const days = period === 'week' ? 7 : 30;
  const today = startOfToday();
  const startDate = subDays(today, days - 1);
  const startDateStr = format(startDate, 'yyyy-MM-dd');
  
  // Previous period for comparison
  const prevStartDate = subDays(startDate, days);
  const prevStartDateStr = format(prevStartDate, 'yyyy-MM-dd');

  // Fetch current period tasks (based on due_date)
  const { data: currentTasks, error: currentError } = await SupabaseConn
    .from('tasks')
    .select('*')
    .gte('due_date', startDateStr)
    .lte('due_date', format(today, 'yyyy-MM-dd'));

  if (currentError) {
    console.error('Error fetching current tasks for analytics:', currentError);
    throw new Error('Failed to fetch analytics data');
  }

  // Fetch previous period completed tasks for comparison
  const { count: prevCompletedCount, error: prevError } = await SupabaseConn
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('is_completed', true)
    .gte('completed_at', prevStartDate.toISOString())
    .lt('completed_at', startDate.toISOString());

  if (prevError) {
    console.error('Error fetching previous tasks for comparison:', prevError);
  }

  const tasks = (currentTasks || []) as Task[];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Most Productive Day (based on completed_at)
  const completedInPeriod = tasks.filter(t => t.is_completed && t.completed_at);
  const dayCounts: Record<string, number> = {};
  completedInPeriod.forEach(t => {
    const day = format(parseISO(t.completed_at!), 'EEEE');
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });

  let mostProductiveDay = 'None';
  let maxCount = 0;
  Object.entries(dayCounts).forEach(([day, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostProductiveDay = day;
    }
  });

  // Category Distribution
  const categoryMap: Record<string, number> = {};
  tasks.forEach(t => {
    const cat = t.category || 'General';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const categoryDistribution = Object.entries(categoryMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  // Comparison logic
  const prevCount = prevCompletedCount || 0;
  let comparison = 0;
  if (prevCount === 0) {
    comparison = completedTasks > 0 ? 100 : 0;
  } else {
    comparison = Math.round(((completedTasks - prevCount) / prevCount) * 100);
  }

  // Weekly Streak (Check last 30 days of completed tasks to find current streak)
  const { data: allCompleted, error: streakError } = await SupabaseConn
    .from('tasks')
    .select('completed_at')
    .eq('is_completed', true)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(100);

  let streak = 0;
  if (!streakError && allCompleted && allCompleted.length > 0) {
    const completionDates = Array.from(new Set(
      allCompleted.map(t => format(parseISO(t.completed_at), 'yyyy-MM-dd'))
    )).map(d => parseISO(d));

    let checkDate = today;
    // If nothing completed today, check if streak ended yesterday
    if (!completionDates.some(d => isSameDay(d, today))) {
      checkDate = subDays(today, 1);
    }

    while (completionDates.some(d => isSameDay(d, checkDate))) {
      streak++;
      checkDate = subDays(checkDate, 1);
    }
  }

  return {
    totalTasks,
    completedTasks,
    completionRate,
    mostProductiveDay,
    categoryDistribution,
    streak,
    comparison
  };
}
