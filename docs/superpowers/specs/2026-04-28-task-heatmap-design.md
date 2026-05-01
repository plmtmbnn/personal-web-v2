# Design Spec: Daily Task Heatmap Chart

Implementation of a GitHub-style activity heatmap for the task management system to visualize productivity trends within the current month.

## 1. Objective
Add a "Synchronization Heatmap" to the `TasksView` (Analytics tab) that displays the number of completed tasks for each day of the current month using an emerald-colored intensity scale.

## 2. Architecture & Data Flow
- **Data Source:** Adjust `app/tasks/page.tsx` to fetch tasks starting from the first day of the current month.
- **Processing:** `TasksView` will aggregate completed tasks by date from the `tasks` prop.
- **Component:** New `TaskHeatmap.tsx` component in `features/tasks/components/`.

## 3. UI/UX Design
- **Visual Pattern:** Solid Productivity Pattern (white card, slate border).
- **Intensity Scale (Fixed):**
    - 0 completions: `bg-slate-100`
    - 1-2 completions: `bg-emerald-100`
    - 3-5 completions: `bg-emerald-300`
    - 6-9 completions: `bg-emerald-500`
    - 10+ completions: `bg-emerald-700`
- **Layout:** 
    - Title: "Synchronization Heatmap" (uppercase, tracking-widest).
    - Grid: 7-column grid (Sun-Sat).
    - Tooltips: Date and count on hover.
- **Placement:** Below "Progress Section" in `TasksView.tsx`.

## 4. Technical Details
- **Library:** `date-fns` for month boundaries and day-of-week indexing.
- **Animation:** `framer-motion` for staggered entry of the heatmap grid.
- **Responsive:** Scrollable or wrapped on small screens.

## 5. Verification Plan
- **Unit Test:** `calculateHeatmapData` utility to ensure correct aggregation of `completed_at` timestamps.
- **Manual Check:** Verify that tasks completed on specific dates correctly illuminate the corresponding square in the heatmap.
- **Edge Cases:** 
    - Empty month (all slate squares).
    - Tasks completed across different months (only current month shown).
    - Leap years/varying month lengths.
