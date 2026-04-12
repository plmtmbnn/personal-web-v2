# Feature-Module Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the project into a modular, feature-based architecture to improve maintainability and developer velocity.

**Architecture:** We are moving from a layered structure (`lib/actions`, `lib/data`, `components/`) to a feature-module structure (`features/blog`, `features/tasks`, etc.). Global code will be unified under `lib/core` and `lib/shared`.

**Tech Stack:** Next.js 16, TypeScript, Supabase, Tailwind CSS.

---

### Task 1: Global Logic Migration (`lib/core` & `lib/shared`)

**Files:**
- Create: `lib/core/supabase.ts`, `lib/core/supabase-server.ts`, `lib/core/redis.ts`, `lib/core/env.ts`
- Create: `lib/shared/constants.ts`, `lib/shared/metadata.ts`, `lib/shared/feature-flags.ts`
- Modify: `app/layout.tsx`, `lib/actions/auth.ts`, `lib/actions/blog.ts` (imports only)

- [ ] **Step 1: Move Root Utils to `lib/core`**
Move contents of root `utils/` to `lib/core/`.
```bash
mkdir -p lib/core
mv utils/supabase.ts lib/core/supabase.ts
mv utils/supabase-server.ts lib/core/supabase-server.ts
mv utils/redis.ts lib/core/redis.ts
```

- [ ] **Step 2: Move Env and Shared Config**
```bash
mkdir -p lib/shared
mv lib/env.ts lib/core/env.ts
mv lib/constants.ts lib/shared/constants.ts
mv lib/metadata.ts lib/shared/metadata.ts
mv lib/feature-flags.ts lib/shared/feature-flags.ts
```

- [ ] **Step 3: Update Global Imports**
Update imports in `app/layout.tsx` and all logic files to point to the new `@/lib/core` and `@/lib/shared`.

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "refactor: migrate global core and shared logic"
```

### Task 2: Auth Feature Module (`features/auth`)

**Files:**
- Create: `features/auth/actions.ts`, `features/auth/components/`, `features/auth/PinGuard.tsx`
- Modify: `app/login/page.tsx`, `app/auth/callback/route.ts`

- [ ] **Step 1: Scaffolding**
```bash
mkdir -p features/auth/components
```

- [ ] **Step 2: Move Logic and Components**
```bash
mv lib/actions/auth.ts features/auth/actions.ts
mv components/auth/* features/auth/components/
mv features/auth/components/PinGuard.tsx features/auth/PinGuard.tsx
```

- [ ] **Step 3: Update Imports**
Update references in `app/login/page.tsx` and `app/auth/callback/route.ts`.

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "refactor: move auth logic to features/auth"
```

### Task 3: Blog Feature Module (`features/blog`)

**Files:**
- Create: `features/blog/actions.ts`, `features/blog/data.ts`, `features/blog/components/`
- Modify: `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `app/admin/blog/page.tsx`

- [ ] **Step 1: Move Logic and Components**
```bash
mkdir -p features/blog
mv lib/actions/blog.ts features/blog/actions.ts
mv lib/data/blog.ts features/blog/data.ts
mv components/blog features/blog/components
```

- [ ] **Step 2: Update Imports**
Update imports in all blog-related pages.

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "refactor: move blog logic to features/blog"
```

### Task 4: Tasks Feature Module (`features/tasks`)

**Files:**
- Create: `features/tasks/actions.ts`, `features/tasks/types.ts`, `features/tasks/utils.ts`, `features/tasks/components/`
- Modify: `app/tasks/page.tsx`

- [ ] **Step 1: Move Logic and Components**
```bash
mkdir -p features/tasks
mv lib/actions/tasks.ts features/tasks/actions.ts
mv lib/types/tasks.ts features/tasks/types.ts
mv lib/utils/tasks.tsx features/tasks/utils.tsx
mv components/tasks features/tasks/components
```

- [ ] **Step 2: Update Imports**
Update imports in the tasks page and sub-components.

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "refactor: move tasks logic to features/tasks"
```

### Task 5: Final Cleanup and Verification

- [ ] **Step 1: Remove redundant folders**
```bash
rm -rf utils components hooks lib/actions lib/data lib/types lib/utils
```

- [ ] **Step 2: Run Biome Check**
Ensure no broken imports remain.
```bash
pnpm run check
```

- [ ] **Step 3: Verify Build**
```bash
pnpm run build
```

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "chore: remove redundant folders and final cleanup"
```
