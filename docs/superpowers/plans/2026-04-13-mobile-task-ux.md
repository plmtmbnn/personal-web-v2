# Mobile-First Task Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Task Dashboard for superior Mobile UX by implementing a bottom-sheet form, swipe actions, and fixing temporal filtering logic.

**Architecture:** Thumb-reach interaction model with `framer-motion` gestures and `date-fns` for robust date normalization.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, Framer Motion, `date-fns`.

---

### Task 1: Date Logic Normalization

**Files:**
- Modify: `features/tasks/components/TasksView.tsx`
- Modify: `features/tasks/components/TaskList.tsx`

- [ ] **Step 1: Implement `startOfDay` comparisons**
Update the filtering logic in `TasksView.tsx` to use `date-fns` `startOfDay` and `isSameDay` / `isAfter` to ensure tasks are correctly bucketed into Today and Upcoming regardless of hour/minute discrepancies.

- [ ] **Step 2: Commit**
```bash
git add features/tasks/components/TasksView.tsx
git commit -m "fix(tasks): normalize date comparisons using startOfDay"
```

### Task 2: TaskForm Bottom Sheet (Drawer)

**Files:**
- Modify: `features/tasks/components/TaskForm.tsx`
- Modify: `features/tasks/components/TasksView.tsx`

- [ ] **Step 1: Refactor TaskForm to Drawer**
Wrap the `TaskForm` content in a `framer-motion` animated container that slides up from the bottom.

- [ ] **Step 2: Add Quick Date Chips**
Implement "Today", "Tomorrow", and "+7 Days" buttons that instantly update the `dueDate` state.

- [ ] **Step 3: Implement FAB Trigger**
Add a Floating Action Button (FAB) in `TasksView.tsx` to trigger the TaskForm drawer visibility on mobile.

- [ ] **Step 4: Commit**
```bash
git add features/tasks/components/TaskForm.tsx features/tasks/components/TasksView.tsx
git commit -m "feat(tasks): implement mobile bottom-sheet form and FAB"
```

### Task 3: TaskList Swipe Actions & Sticky Headers

**Files:**
- Modify: `features/tasks/components/TaskList.tsx`
- Modify: `features/tasks/components/TaskItem.tsx`

- [ ] **Step 1: Implement Sticky Headers**
Apply `sticky top-0 z-20 bg-white/80 backdrop-blur-md` to the section headers in `TaskList.tsx`.

- [ ] **Step 2: Add Swipe-to-Action Gestures**
Wrap `TaskItem` content in a `motion.div` with `drag="x"`. Implement the Split Directions pattern: Swipe Left to Delete, Swipe Right to Edit.

- [ ] **Step 3: Refine Mobile Padding & Targets**
Reduce card padding to `px-4 py-3` and ensure the checkbox target is at least `44px`.

- [ ] **Step 4: Commit**
```bash
git add features/tasks/components/TaskList.tsx features/tasks/components/TaskItem.tsx
git commit -m "feat(tasks): add sticky headers and swipe-to-action gestures"
```

### Task 4: Responsive Filter Refinement

**Files:**
- Modify: `features/tasks/components/TaskFilters.tsx`

- [ ] **Step 1: Implement Horizontal Scroll for Pills**
Update the filter container to support `overflow-x-auto` and `whitespace-nowrap` on mobile viewports.

- [ ] **Step 2: Commit**
```bash
git add features/tasks/components/TaskFilters.tsx
git commit -m "feat(tasks): optimize category filters for mobile horizontal scroll"
```

### Task 5: Verification and UX Polish

- [ ] **Step 1: Test Gesture Resilience**
Verify that swiping doesn't interfere with vertical scrolling.

- [ ] **Step 2: Final Build Check**
```bash
pnpm run build
```

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "chore(tasks): final mobile UX verification"
```
