import { describe, test, expect } from 'vitest';
import { aggregateHeatmapData } from '../utils/heatmap';
import { parseISO } from 'date-fns';
import { Task } from '../types';

const createMockTask = (id: string, createdAt: string, completedAt: string | null, isCompleted: boolean): Task => ({
  id,
  title: `Task ${id}`,
  description: null,
  priority: 'MEDIUM',
  category: 'General',
  is_completed: isCompleted,
  due_date: '2026-04-01',
  position: 0,
  reschedule_count: 0,
  created_at: createdAt,
  completed_at: completedAt,
});

describe('aggregateHeatmapData', () => {
  test('aggregates created and completed tasks correctly for a given date range', () => {
    const tasks: Task[] = [
      createMockTask('1', '2026-04-01T10:00:00Z', '2026-04-01T15:00:00Z', true),
      createMockTask('2', '2026-04-01T11:00:00Z', '2026-04-02T10:00:00Z', true),
      createMockTask('3', '2026-04-02T09:00:00Z', null, false),
      createMockTask('4', '2026-03-30T10:00:00Z', null, false), // Created out of range
      createMockTask('5', '2026-04-05T10:00:00Z', '2026-05-02T10:00:00Z', true), // Completed out of range
    ];
    
    const start = parseISO('2026-04-01');
    const end = parseISO('2026-04-30');
    
    const data = aggregateHeatmapData(tasks, start, end);
    
    // Check specific dates
    expect(data['2026-04-01'].created).toBe(2);
    expect(data['2026-04-01'].completed).toBe(1);
    
    expect(data['2026-04-02'].created).toBe(1);
    expect(data['2026-04-02'].completed).toBe(1);
    
    expect(data['2026-04-05'].created).toBe(1);
    expect(data['2026-04-05'].completed).toBe(0);
    
    expect(data['2026-04-30'].created).toBe(0);
    expect(data['2026-04-30'].completed).toBe(0);
    
    // Check total days in range (April has 30 days)
    expect(Object.keys(data).length).toBe(30);
  });

  test('handles empty task list', () => {
    const start = parseISO('2026-04-01');
    const end = parseISO('2026-04-02');
    const data = aggregateHeatmapData([], start, end);
    
    expect(data['2026-04-01']).toEqual({ created: 0, completed: 0 });
    expect(data['2026-04-02']).toEqual({ created: 0, completed: 0 });
    expect(Object.keys(data).length).toBe(2);
  });
});
