# Task Focus View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Task Dashboard into a high-focus dual-zone interface (Today vs. Upcoming) with integrated reordering and dynamic filtering.

**Architecture:** Sectioned Task Orchestration using a single `DragDropContext` with multiple `Droppable` zones.

**Tech Stack:** Next.js 16, TypeScript, Supabase, Tailwind CSS, `@hello-pangea/dnd`.

---

### Task 1: Server Action Enhancements

**Files:**
- Modify: `features/tasks/actions/tasks.ts`

- [ ] **Step 1: Update `getTasks` to support date ranges**
Modify the signature to accept `startDate` and `endDate`. Update the Supabase query to use `.gte('due_date', startDate)` and `.lte('due_date', endDate)`.

```typescript
export async function getTasks(options?: {
  startDate?: string;
  endDate?: string;
  priority?: TaskPriority;
  category?: string;
  showCompletedToday?: boolean;
}): Promise<Task[]> {
  // Implementation logic for range and today's completion...
}
```

- [ ] **Step 2: Commit**
```bash
git add features/tasks/actions/tasks.ts
git commit -m "feat(tasks): update getTasks action for range support"
```

### Task 2: View Layer Refactor (`TasksView.tsx`)

**Files:**
- Modify: `features/tasks/components/TasksView.tsx`

- [ ] **Step 1: Implement Sectioned Data Logic**
Split the incoming `tasks` prop into `todayTasks` and `upcomingTasks` based on the current ISO date.

- [ ] **Step 2: Add Global Filter State**
Integrate `showCompleted` and `selectedCategory` state management using URL search parameters.

- [ ] **Step 3: Commit**
```bash
git add features/tasks/components/TasksView.tsx
git commit -m "refactor(tasks): implement focus view data splitting in TasksView"
```

### Task 3: Dual-Zone Drag & Drop (`TaskList.tsx`)

**Files:**
- Modify: `features/tasks/components/TaskList.tsx`

- [ ] **Step 1: Refactor to Multi-Droppable**
Wrap the interface in a single `DragDropContext`. Create two named `Droppable` regions: `today-list` and `upcoming-list`.

- [ ] **Step 2: Handle Inter-section Dropping**
Update `onDragEnd` to detect when a task moves from `upcoming-list` to `today-list`. If detected, call `updateTask` to set `due_date` to today before reordering.

- [ ] **Step 3: Implement Empty States**
Add the "All caught up for today!" motivating placeholder for the `today-list`.

- [ ] **Step 4: Commit**
```bash
git add features/tasks/components/TaskList.tsx
git commit -m "feat(tasks): implement dual-zone drag and drop logic"
```

### Task 4: Dynamic Filtering System (`TaskFilters.tsx`)

**Files:**
- Modify: `features/tasks/components/TaskFilters.tsx`

- [ ] **Step 1: Add "Show Completed" Toggle**
Implement a high-contrast toggle button that updates the `completed=true` search parameter.

- [ ] **Step 2: Implement Dynamic Category Pills**
Extract a unique list of categories from the `tasks` data and render them as selectable filter pills.

- [ ] **Step 3: Commit**
```bash
git add features/tasks/components/TaskFilters.tsx
git commit -m "feat(tasks): add dynamic category and completion filters"
```

### Task 5: Verification and Polish

- [ ] **Step 1: Verify Reordering**
Test moving tasks within Today, within Upcoming, and between sections.

- [ ] **Step 2: Run Biome Check**
```bash
pnpm run check
```

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "chore(tasks): final verification and linting"
```
