'use server';

import { SupabaseConn } from '@/lib/core/supabase';
import { redis, CACHE_KEYS } from '@/lib/core/redis';
import { Task, TaskPriority } from '../types';
import { 
  startOfToday, 
  subDays, 
  format, 
  parseISO, 
  isSameDay
} from 'date-fns';

export interface AnalyticsStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  mostProductiveDay: string;
  categoryDistribution: { category: string; count: number }[];
  priorityDistribution: { priority: TaskPriority; count: number }[];
  streak: number;
  comparison: number; // percentage change vs previous period
  taskVelocity: number; // avg tasks per day
}

/**
 * Fetch and calculate task analytics for a given period.
 * Optimization: Uses Redis Cache-Aside strategy.
 */
export async function getTaskStats(period: 'today' | 'week' | 'month'): Promise<AnalyticsStats> {
  const cacheKey = CACHE_KEYS.STATS(period);

  // 1. Try to fetch from Redis Cache
  try {
    const cachedData = await redis.get<AnalyticsStats>(cacheKey);
    if (cachedData) return cachedData;
  } catch (err) {
    console.error('Redis Fetch Error (Falling back to DB):', err);
  }

  // 2. Cache Miss: Fetch from Supabase
  const today = startOfToday();
  let days: number;
  let startDate: Date;

  if (period === 'today') {
    days = 1;
    startDate = today;
  } else if (period === 'week') {
    days = 7;
    startDate = subDays(today, 6);
  } else {
    days = 30;
    startDate = subDays(today, 29);
  }

  const startDateStr = format(startDate, 'yyyy-MM-dd');
  const endDateStr = format(today, 'yyyy-MM-dd');
  
  // Previous period for comparison
  const prevStartDate = subDays(startDate, days);

  // Fetch current period tasks
  const { data: currentTasks, error: currentError } = await SupabaseConn
    .from('tasks')
    .select('*')
    .gte('due_date', startDateStr)
    .lte('due_date', endDateStr);

  if (currentError) {
    console.error('Error fetching current tasks for analytics:', currentError);
    throw new Error('Failed to fetch analytics data');
  }

  // Fetch previous period completed tasks for comparison
  const { count: prevCompletedCount } = await SupabaseConn
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('is_completed', true)
    .gte('completed_at', prevStartDate.toISOString())
    .lt('completed_at', startDate.toISOString());

  const tasks = (currentTasks || []) as Task[];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const taskVelocity = parseFloat((completedTasks / days).toFixed(1));

  // Most Productive Day
  const dayCounts: Record<string, number> = {};
  tasks.filter(t => t.is_completed && t.completed_at).forEach(t => {
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

  // Category & Priority Distribution
  const categoryMap: Record<string, number> = {};
  const priorityMap: Record<TaskPriority, number> = { LOW: 0, MEDIUM: 0, HIGH: 0 };

  tasks.forEach(t => {
    const cat = t.category || 'General';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    priorityMap[t.priority] = (priorityMap[t.priority] || 0) + 1;
  });

  const categoryDistribution = Object.entries(categoryMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const priorityDistribution = (Object.entries(priorityMap) as [TaskPriority, number][])
    .map(([priority, count]) => ({ priority, count }));

  // Comparison
  const prevCount = prevCompletedCount || 0;
  const comparison = prevCount === 0 ? (completedTasks > 0 ? 100 : 0) : Math.round(((completedTasks - prevCount) / prevCount) * 100);

  // Streak
  const { data: allCompleted } = await SupabaseConn
    .from('tasks')
    .select('completed_at')
    .eq('is_completed', true)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(100);

  let streak = 0;
  if (allCompleted && allCompleted.length > 0) {
    const completionDates = Array.from(new Set(
      allCompleted.map(t => format(parseISO(t.completed_at), 'yyyy-MM-dd'))
    )).map(d => parseISO(d));

    let checkDate = today;
    if (!completionDates.some(d => isSameDay(d, today))) checkDate = subDays(today, 1);
    while (completionDates.some(d => isSameDay(d, checkDate))) {
      streak++;
      checkDate = subDays(checkDate, 1);
    }
  }

  const stats = {
    totalTasks,
    completedTasks,
    completionRate,
    mostProductiveDay,
    categoryDistribution,
    priorityDistribution,
    streak,
    comparison,
    taskVelocity
  };

  // 3. Store in Redis with 30 minute TTL (1800 seconds)
  try {
    await redis.set(cacheKey, stats, { ex: 1800 });
  } catch (err) {
    console.error('Redis Store Error:', err);
  }

  return stats;
}
