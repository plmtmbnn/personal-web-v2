import { describe, test, expect } from 'vitest';
import { aggregateHeatmapData } from '../utils/heatmap';
import { parseISO } from 'date-fns';
import { Task } from '../types';

const createMockTask = (id: string, completedAt: string | null, isCompleted: boolean): Task => ({
  id,
  title: `Task ${id}`,
  description: null,
  priority: 'MEDIUM',
  category: 'General',
  is_completed: isCompleted,
  due_date: '2026-04-01',
  position: 0,
  reschedule_count: 0,
  created_at: '2026-04-01T00:00:00Z',
  completed_at: completedAt,
});

describe('aggregateHeatmapData', () => {
  test('aggregates completed tasks correctly for a given date range', () => {
    const tasks: Task[] = [
      createMockTask('1', '2026-04-01T10:00:00Z', true),
      createMockTask('2', '2026-04-01T14:00:00Z', true),
      createMockTask('3', '2026-04-02T09:00:00Z', true),
      createMockTask('4', null, false), // Should be ignored (not completed)
      createMockTask('5', '2026-05-01T10:00:00Z', true), // Out of range
    ];
    
    const start = parseISO('2026-04-01');
    const end = parseISO('2026-04-30');
    
    const data = aggregateHeatmapData(tasks, start, end);
    
    // Check specific dates
    expect(data['2026-04-01']).toBe(2);
    expect(data['2026-04-02']).toBe(1);
    expect(data['2026-04-03']).toBe(0);
    
    // Check total days in range (April has 30 days)
    expect(Object.keys(data).length).toBe(30);
    
    // Check boundaries
    expect(data['2026-04-30']).toBe(0);
    // @ts-ignore
    expect(data['2026-05-01']).toBeUndefined();
  });

  test('handles empty task list', () => {
    const start = parseISO('2026-04-01');
    const end = parseISO('2026-04-02');
    const data = aggregateHeatmapData([], start, end);
    
    expect(data['2026-04-01']).toBe(0);
    expect(data['2026-04-02']).toBe(0);
    expect(Object.keys(data).length).toBe(2);
  });
});
