# Feature-Module Reorganization Design

**Goal:** Transition the project from a fragmented, layer-based architecture to a scalable, domain-driven "Feature-Module" structure. This eliminates utility confusion and reduces cognitive load by colocating related code.

## Architecture

### 1. `features/` (The Domain Layer)
All business logic and UI components related to a specific feature will live here.

- `features/blog/`
  - `actions.ts` (from `lib/actions/blog.ts`)
  - `data.ts` (from `lib/data/blog.ts`)
  - `components/` (from `components/blog/`)
  - `types.ts` (new, extracted from shared files if applicable)
- `features/tasks/`
  - `actions.ts` (from `lib/actions/tasks.ts`)
  - `components/` (from `components/tasks/`)
  - `types.ts` (from `lib/types/tasks.ts`)
  - `utils.ts` (from `lib/utils/tasks.tsx`)
- `features/auth/`
  - `actions.ts` (from `lib/actions/auth.ts`)
  - `components/` (from `components/auth/`)
  - `PinGuard.tsx` (from `components/auth/PinGuard.tsx`)

### 2. `lib/` (The Global Layer)
Reserved for logic that is strictly feature-agnostic and shared across the entire application.

- `lib/core/` (System-level clients)
  - `supabase.ts` (from `utils/supabase.ts`)
  - `supabase-server.ts` (from `utils/supabase-server.ts`)
  - `redis.ts` (from `utils/redis.ts`)
  - `env.ts` (from `lib/env.ts`)
- `lib/shared/` (Configuration and Constants)
  - `constants.ts` (from `lib/constants.ts`)
  - `metadata.ts` (from `lib/metadata.ts`)
  - `feature-flags.ts` (from `lib/feature-flags.ts`)
- `lib/hooks/` (Generic React Hooks)
  - `useNotification.ts` (from `hooks/useNotification.ts`)

### 3. `app/` (The Routing Layer)
Strictly for Next.js App Router conventions. Pages will import components directly from their respective feature modules.

## Migration Steps

1. **Scaffold Structure**: Create `features/` and `lib/` subdirectories.
2. **Move Core Logic**: Migrate database clients and env validation to `lib/core`.
3. **Move Features**: Batch move files for Blog, Tasks, and Auth into their new modules.
4. **Update Imports**: Perform a surgical update of all import paths (using `@/features/...` and `@/lib/...`).
5. **Clean Up**: Remove empty directories and the redundant root `utils/` and `hooks/` folders.

## Risk Management
- **Import Paths**: Use absolute imports (`@/`) to ensure paths remain stable during the move.
- **Side Effects**: Ensure server actions (`'use server'`) and client components (`'use client'`) maintain their directives after the move.
