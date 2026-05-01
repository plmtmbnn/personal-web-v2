# Daily Task Heatmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a synchronization heatmap to the task analytics view showing completed tasks for the current month.

**Architecture:** 
1. Expand server-side data fetching in `TasksPage` to cover the full current month.
2. Create a new `TaskHeatmap` component to aggregate and visualize the data.
3. Integrate the heatmap into the `TasksView` component under the analytics tab.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, date-fns, Framer Motion.

---

### Task 1: Expand Data Fetching

**Files:**
- Modify: `app/tasks/page.tsx`

- [ ] **Step 1: Update date calculation for month-wide fetching**
Modify `app/tasks/page.tsx` to set `startDate` to the first day of the current month.

```typescript
// app/tasks/page.tsx
import { startOfMonth, endOfMonth, format } from "date-fns";
// ...
const today = new Date();
const monthStart = startOfMonth(today);
const monthEnd = endOfMonth(today);

const startDate = date || format(monthStart, "yyyy-MM-dd");
const endDate = date || format(monthEnd, "yyyy-MM-dd");
```

- [ ] **Step 2: Verify tasks fetch includes past completed tasks**
Check that the `getTasks` call now covers the range from the start of the month.

### Task 2: Create Heatmap Data Utility & Tests

**Files:**
- Create: `features/tasks/utils/heatmap.ts`
- Create: `features/tasks/__tests__/heatmap.test.ts`

- [ ] **Step 1: Write failing tests for heatmap aggregation**
Create `features/tasks/__tests__/heatmap.test.ts` with tests for aggregating completed tasks by date.

```typescript
import { aggregateHeatmapData } from '../utils/heatmap';
import { parseISO } from 'date-fns';

test('aggregates completed tasks correctly', () => {
  const tasks = [
    { id: '1', completed_at: '2026-04-01T10:00:00Z', is_completed: true },
    { id: '2', completed_at: '2026-04-01T14:00:00Z', is_completed: true },
    { id: '3', completed_at: '2026-04-02T09:00:00Z', is_completed: true },
    { id: '4', is_completed: false },
  ];
  const data = aggregateHeatmapData(tasks as any, parseISO('2026-04-01'), parseISO('2026-04-30'));
  expect(data['2026-04-01']).toBe(2);
  expect(data['2026-04-02']).toBe(1);
  expect(data['2026-04-03']).toBe(0);
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `pnpm test features/tasks/__tests__/heatmap.test.ts` (or equivalent test command)

- [ ] **Step 3: Implement `aggregateHeatmapData`**
Create `features/tasks/utils/heatmap.ts`.

```typescript
import { format, parseISO, eachDayOfInterval } from 'date-fns';
import { Task } from '../types';

export function aggregateHeatmapData(tasks: Task[], start: Date, end: Date) {
  const days = eachDayOfInterval({ start, end });
  const counts: Record<string, number> = {};
  
  days.forEach(day => {
    counts[format(day, 'yyyy-MM-dd')] = 0;
  });

  tasks.forEach(task => {
    if (task.is_completed && task.completed_at) {
      const dateKey = format(parseISO(task.completed_at), 'yyyy-MM-dd');
      if (counts[dateKey] !== undefined) {
        counts[dateKey]++;
      }
    }
  });

  return counts;
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `pnpm test features/tasks/__tests__/heatmap.test.ts`

- [ ] **Step 5: Commit**
```bash
git add features/tasks/utils/heatmap.ts features/tasks/__tests__/heatmap.test.ts
git commit -m "feat(tasks): add heatmap data aggregation utility and tests"
```

### Task 3: Create TaskHeatmap Component

**Files:**
- Create: `features/tasks/components/TaskHeatmap.tsx`

- [ ] **Step 1: Implement the TaskHeatmap UI**
Create the component with the fixed intensity scale and 7-column grid.

```tsx
'use client';

import React from 'react';
import { startOfMonth, endOfMonth, format, getDay } from 'date-fns';
import { Task } from '../types';
import { aggregateHeatmapData } from '../utils/heatmap';
import { motion } from 'framer-motion';

export default function TaskHeatmap({ tasks }: { tasks: Task[] }) {
  const today = new Date();
  const start = startOfMonth(today);
  const end = endOfMonth(today);
  const data = aggregateHeatmapData(tasks, start, end);
  const days = Object.entries(data);

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-slate-100';
    if (count <= 2) return 'bg-emerald-100';
    if (count <= 5) return 'bg-emerald-300';
    if (count <= 9) return 'bg-emerald-500';
    return 'bg-emerald-700';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
        Synchronization Heatmap
      </h3>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className="text-[9px] font-black text-slate-300 text-center uppercase mb-1">
            {day}
          </div>
        ))}
        {/* Placeholder for offset if month doesn't start on Sunday */}
        {Array.from({ length: getDay(start) }).map((_, i) => (
          <div key={`offset-${i}`} />
        ))}
        {days.map(([date, count], index) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.01 }}
            title={`${date}: ${count} Tasks`}
            className={`aspect-square rounded-sm sm:rounded ${getIntensity(count)} transition-colors cursor-help`}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add features/tasks/components/TaskHeatmap.tsx
git commit -m "feat(tasks): create TaskHeatmap component"
```

### Task 4: Integrate TaskHeatmap into TasksView

**Files:**
- Modify: `features/tasks/components/TasksView.tsx`

- [ ] **Step 1: Import and Lazy Load TaskHeatmap**
Add dynamic import for `TaskHeatmap`.

```tsx
const DynamicTaskHeatmap = dynamic(() => import("@/features/tasks/components/TaskHeatmap"), {
	loading: () => <ComponentLoader height="150px" />,
	ssr: false
});
```

- [ ] **Step 2: Add TaskHeatmap to Analytics Tab**
Place it below the Progress Section.

```tsx
{/* Progress Section */}
<div className="space-y-4">
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
    <Suspense fallback={<ComponentLoader height="80px" />}>
      <DynamicTaskProgress tasks={tasks} />
    </Suspense>
  </div>
  
  {/* Heatmap Section */}
  <Suspense fallback={<ComponentLoader height="150px" />}>
    <DynamicTaskHeatmap tasks={tasks} />
  </Suspense>
</div>
```

- [ ] **Step 3: Commit**
```bash
git add features/tasks/components/TasksView.tsx
git commit -m "feat(tasks): integrate TaskHeatmap into TasksView"
```

### Task 5: Final Verification

- [ ] **Step 1: Verify data fetching boundaries**
Manually check network requests or logs to ensure tasks for the entire month are being fetched.

- [ ] **Step 2: Verify UI appearance**
Switch to the "Analytics" tab and confirm the heatmap renders correctly with color intensity matching task counts.

- [ ] **Step 3: Final Commit and Cleanup**
Ensure all tests pass and documentation is updated if necessary.
