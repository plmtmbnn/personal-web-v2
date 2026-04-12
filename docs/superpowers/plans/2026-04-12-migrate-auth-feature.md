# Migrate Auth Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate Auth-related logic and components to a feature-module architecture under `features/auth`.

**Architecture:** Move `lib/actions/auth.ts` to `features/auth/actions.ts`, move `components/auth/*` to `features/auth/components/`, and move `PinGuard.tsx` up to the root of `features/auth/`. Update all project imports to reflect these changes.

**Tech Stack:** Next.js (App Router), TypeScript.

---

### Task 1: Move Auth Files

**Files:**
- Create: `features/auth/actions.ts` (from `lib/actions/auth.ts`)
- Create: `features/auth/components/LoginButton.tsx` (from `components/auth/LoginButton.tsx`)
- Create: `features/auth/PinGuard.tsx` (from `components/auth/PinGuard.tsx`)
- Delete: `lib/actions/auth.ts`
- Delete: `components/auth/LoginButton.tsx`
- Delete: `components/auth/PinGuard.tsx`

- [ ] **Step 1: Move `lib/actions/auth.ts` to `features/auth/actions.ts`**
- [ ] **Step 2: Move `components/auth/LoginButton.tsx` to `features/auth/components/LoginButton.tsx`**
- [ ] **Step 3: Move `components/auth/PinGuard.tsx` to `features/auth/PinGuard.tsx`**
- [ ] **Step 4: Verify files exist in new locations**
- [ ] **Step 5: Delete old files**

### Task 2: Update Internal Imports in Moved Files

**Files:**
- Modify: `features/auth/components/LoginButton.tsx`

- [ ] **Step 1: Update logout import in `features/auth/components/LoginButton.tsx`**
  Change `@/lib/actions/auth` to `@/features/auth/actions`

### Task 3: Update Global Project Imports

**Files:**
- Modify: `app/investment/page.tsx`
- Modify: `app/tasks/page.tsx`
- Modify: `components/CompactBottomBar.tsx`
- Modify: `app/login/page.tsx`
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Update `app/investment/page.tsx`**
  Change `@/components/auth/PinGuard` to `@/features/auth/PinGuard`
- [ ] **Step 2: Update `app/tasks/page.tsx`**
  Change `@/components/auth/PinGuard` to `@/features/auth/PinGuard`
- [ ] **Step 3: Update `components/CompactBottomBar.tsx`**
  Change `@/lib/actions/auth` to `@/features/auth/actions`
- [ ] **Step 4: Update `app/login/page.tsx`**
  Change `@/components/auth/LoginButton` to `@/features/auth/components/LoginButton`
- [ ] **Step 5: Update `app/admin/page.tsx`**
  Change `@/lib/actions/auth` to `@/features/auth/actions`

### Task 4: Verification and Commit

- [ ] **Step 1: Run project checks**
  Run: `pnpm run check`
  Expected: PASS
- [ ] **Step 2: Commit changes**
  Run: `git add .`
  Run: `git commit -m "refactor: move auth logic to features/auth"`
