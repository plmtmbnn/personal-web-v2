# Design Spec: Multi-Metric Task Heatmap

Expansion of the existing task heatmap to visualize both task creation and completion metrics using a dual-scale diagonal visualization.

## 1. Objective
Enhance the synchronization heatmap in the `TasksView` (Analytics tab) to display two dimensions of productivity:
1. **Creation Volume:** Number of tasks created on a specific day (Blue scale).
2. **Completion Volume:** Number of tasks completed on a specific day (Emerald scale).

## 2. Architecture & Data Flow
- **Data Source:** Expand `getTasks` query logic in `features/tasks/actions/tasks.ts` to include tasks satisfy `created_at` within the range.
- **Aggregation:** Update `aggregateHeatmapData` utility to return counts for both `created` and `completed` events.
- **Component:** Update `TaskHeatmap.tsx` to render a split-diagonal cell for each day.

## 3. UI/UX Design
- **Visual Pattern:** Split Diagonal Cell.
- **Scales (Fixed Intensity):**
    - **Created (Top-Left Triangle):**
        - 0: Transparent (shows `bg-slate-100` base)
        - 1-2: `bg-blue-100`
        - 3-5: `bg-blue-300`
        - 6-9: `bg-blue-500`
        - 10+: `bg-blue-700`
    - **Done (Bottom-Right Triangle):**
        - 0: Transparent (shows `bg-slate-100` base)
        - 1-2: `bg-emerald-100`
        - 3-5: `bg-emerald-300`
        - 6-9: `bg-emerald-500`
        - 10+: `bg-emerald-700`
- **Tooltip:** Unified hover state showing `[Date]: [X] Created, [Y] Done`.
- **Legend:** Inline legend at the bottom of the component explaining Blue (Created) vs Emerald (Done).

## 4. Technical Details
- **CSS:** Use Tailwind arbitrary values or Clip-path for the diagonal split.
- **Data structure:**
  ```typescript
  type HeatmapData = {
    [date: string]: { created: number; completed: number }
  }
  ```

## 5. Verification Plan
- **Unit Test:** Update `heatmap.test.ts` to verify dual-metric aggregation.
- **Manual Check:** Verify that creating a new task immediately illuminates the "Created" half of today's square.
- **Manual Check:** Verify that completing a task illuminates the "Done" half.
- **Edge Cases:**
    - Tasks created and completed on the same day (both halves colored).
    - Month boundaries.
