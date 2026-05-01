# Multi-Metric Task Heatmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the task heatmap to show both creation and completion volume using a split diagonal visualization.

**Architecture:** 
1. Expand `getTasks` query to include tasks created within the range.
2. Refactor `aggregateHeatmapData` to return dual metrics (`created` and `completed`).
3. Update `TaskHeatmap` component to render the dual-metric diagonal UI.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, date-fns, Framer Motion.

---

### Task 1: Expand Query for Creation Metrics

**Files:**
- Modify: `features/tasks/actions/tasks.ts`

- [ ] **Step 1: Update `getTasks` query logic**
Update the `.or()` filter in `getTasks` to include a check for `created_at` within the range when `includeCompleted` is true.

```typescript
// features/tasks/actions/tasks.ts
if (options?.includeCompleted) {
  query = query.or(`and(due_date.gte.${startDate},due_date.lte.${endDate},is_completed.eq.false),and(is_completed.eq.true,completed_at.gte.${startDate}T00:00:00,completed_at.lte.${endDate}T23:59:59),and(created_at.gte.${startDate}T00:00:00,created_at.lte.${endDate}T23:59:59)`);
}
```

- [ ] **Step 2: Commit**
```bash
git add features/tasks/actions/tasks.ts
git commit -m "feat(tasks): include created_at in getTasks heatmap query"
```

### Task 2: Update Heatmap Utility & Tests

**Files:**
- Modify: `features/tasks/utils/heatmap.ts`
- Modify: `features/tasks/__tests__/heatmap.test.ts`

- [ ] **Step 1: Update tests for dual metrics**
Update `features/tasks/__tests__/heatmap.test.ts` to expect an object with `created` and `completed` counts.

```typescript
// features/tasks/__tests__/heatmap.test.ts
test('aggregates both created and completed tasks correctly', () => {
  const tasks = [
    createMockTask('1', '2026-04-01T10:00:00Z', true), // Created Apr 1 (mock), Completed Apr 1
    createMockTask('2', null, false), // Created Apr 1
  ];
  // Override created_at for test accuracy
  tasks[0].created_at = '2026-04-01T08:00:00Z';
  tasks[1].created_at = '2026-04-02T08:00:00Z';

  const start = parseISO('2026-04-01');
  const end = parseISO('2026-04-30');
  const data = aggregateHeatmapData(tasks, start, end);

  expect(data['2026-04-01']).toEqual({ created: 1, completed: 1 });
  expect(data['2026-04-02']).toEqual({ created: 1, completed: 0 });
});
```

- [ ] **Step 2: Run tests to verify they fail**
Run: `pnpm test features/tasks/__tests__/heatmap.test.ts`
Expected: FAIL (returns numbers instead of objects)

- [ ] **Step 3: Update `aggregateHeatmapData` implementation**
Modify `features/tasks/utils/heatmap.ts` to track both metrics.

```typescript
// features/tasks/utils/heatmap.ts
export function aggregateHeatmapData(tasks: Task[], start: Date, end: Date) {
  const days = eachDayOfInterval({ start, end });
  const counts: Record<string, { created: number; completed: number }> = {};
  
  for (const day of days) {
    counts[format(day, 'yyyy-MM-dd')] = { created: 0, completed: 0 };
  }

  for (const task of tasks) {
    // Track Created
    const createdKey = format(parseISO(task.created_at), 'yyyy-MM-dd');
    if (counts[createdKey]) {
      counts[createdKey].created++;
    }
    // Track Completed
    if (task.is_completed && task.completed_at) {
      const completedKey = format(parseISO(task.completed_at), 'yyyy-MM-dd');
      if (counts[completedKey]) {
        counts[completedKey].completed++;
      }
    }
  }
  return counts;
}
```

- [ ] **Step 4: Run tests to verify they pass**
Run: `pnpm test features/tasks/__tests__/heatmap.test.ts`

- [ ] **Step 5: Commit**
```bash
git add features/tasks/utils/heatmap.ts features/tasks/__tests__/heatmap.test.ts
git commit -m "feat(tasks): refactor heatmap utility for multi-metric support"
```

### Task 3: Update TaskHeatmap UI

**Files:**
- Modify: `features/tasks/components/TaskHeatmap.tsx`

- [ ] **Step 1: Update intensity logic and diagonal rendering**
Modify `TaskHeatmap.tsx` to render two triangles using `clip-path` or SVG. We'll use absolute positioned divs with `clip-path`.

```tsx
// features/tasks/components/TaskHeatmap.tsx
// ...
const getCreatedIntensity = (count: number) => {
  if (count === 0) return 'transparent';
  if (count <= 2) return 'bg-blue-100';
  if (count <= 5) return 'bg-blue-300';
  if (count <= 9) return 'bg-blue-500';
  return 'bg-blue-700';
};

const getDoneIntensity = (count: number) => {
  if (count === 0) return 'transparent';
  if (count <= 2) return 'bg-emerald-100';
  if (count <= 5) return 'bg-emerald-300';
  if (count <= 9) return 'bg-emerald-500';
  return 'bg-emerald-700';
};

// Inside map:
<motion.div
  key={date}
  title={`${date}: ${count.created} Created, ${count.completed} Done`}
  className="relative aspect-square rounded-sm sm:rounded bg-slate-100 overflow-hidden cursor-help"
>
  {/* Created (Top-Left) */}
  <div 
    className={`absolute inset-0 ${getCreatedIntensity(count.created)}`}
    style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
  />
  {/* Done (Bottom-Right) */}
  <div 
    className={`absolute inset-0 ${getDoneIntensity(count.completed)}`}
    style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
  />
</motion.div>
```

- [ ] **Step 2: Add Legend**
Add a legend below the grid.

```tsx
<div className="mt-6 flex items-center justify-center gap-6 border-t border-slate-50 pt-4">
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 bg-blue-500 rounded-sm" />
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Created</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Completed</span>
  </div>
</div>
```

- [ ] **Step 3: Commit**
```bash
git add features/tasks/components/TaskHeatmap.tsx
git commit -m "feat(tasks): update TaskHeatmap UI to split-diagonal dual metric"
```

### Task 4: Final Verification

- [ ] **Step 1: Manual verification of tooltip and colors**
Verify today's square shows blue if a task was created today.

- [ ] **Step 2: Final test run**
Run `pnpm test` and `pnpm build`.
