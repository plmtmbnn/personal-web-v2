# Mobile Task Form Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `TaskForm.tsx` to a bottom-sheet drawer on mobile and add a FAB trigger in `TasksView.tsx`.

**Architecture:** Use `framer-motion` for the bottom-sheet animation and `AnimatePresence` for exit transitions. Add quick-date-selection chips for better mobile UX. Implement a responsive FAB that only shows on mobile.

**Tech Stack:** React, Tailwind CSS, Framer Motion, Lucide Icons, date-fns.

---

### Task 1: Refactor `TaskForm.tsx` to Bottom Sheet

**Files:**
- Modify: `features/tasks/components/TaskForm.tsx`

- [ ] **Step 1: Update props and add framer-motion imports**

- [ ] **Step 2: Add quick-date-selection logic**

- [ ] **Step 3: Update TSX structure for Drawer**

- [ ] **Step 4: Add Quick Date Chips and fix input text size**

- [ ] **Step 5: Ensure all inputs use `text-base` on mobile**

- [ ] **Step 6: Handle Close on Submit**

### Task 2: Update `TasksView.tsx` with FAB and State

**Files:**
- Modify: `features/tasks/components/TasksView.tsx`

- [ ] **Step 1: Add `isFormOpen` state**

- [ ] **Step 2: Update `TaskForm` rendering**

- [ ] **Step 3: Add FAB Trigger**

### Task 3: Commit Changes

- [ ] **Step 1: Stage and commit**
