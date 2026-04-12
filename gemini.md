# Gemini CLI Project Context & Mandates

This document provides foundational context for the Gemini CLI agent to ensure architectural consistency, security, and efficiency.

## 🛠 Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (Auth, PostgreSQL)
- **Cache/Session:** Upstash Redis
- **CI/CD:** GitHub Actions
- **Styling:** Tailwind CSS + Framer Motion
- **Icons:** Lucide-React + React-Icons/Fa
- **Linter/Formatter:** Biome
- **Workflow:** Semantic Release + Commitlint + Husky

## 📂 Project Structure (Feature-Module Architecture)
The project follows a modular, domain-driven structure to ensure scalability and isolation.

### 1. `features/` (Domain Layer)
Contains all business logic, components, and types for specific features.
- `features/auth/`: Actions, `PinGuard.tsx`, and auth-specific components.
- `features/blog/`: Actions, data fetching, and all blog UI components.
- `features/tasks/`: Actions, analytics, types, utils, and all task UI components.
- `features/shared/`: Global UI components (e.g., `CompactBottomBar.tsx`, `StockTicker.tsx`).

### 2. `lib/` (Global Layer)
Reserved for feature-agnostic, shared logic.
- `lib/core/`: System clients (Supabase, Redis) and environment validation (`env.ts`).
- `lib/shared/`: Global constants, metadata, and feature flags.
- `lib/hooks/`: Generic reusable React hooks.

### 3. `app/` (Routing Layer)
Strictly for routing and page definitions. Pages compose components from `features/`.

## 🔑 Security & Authorization
- **Environment Variables:** Always use `ENV_GLOBAL` from `@/lib/core/env`.
- **Authorization:** 
  - Admin access is restricted by `profiles.is_admin = true`.
  - Server Actions must perform server-side admin verification using `checkAdmin()`.
- **PIN Protection:** `PinGuard.tsx` is used for specific restricted sections.

## 🎨 UI/UX Patterns
- **Solid Productivity Pattern**: For admin and operational pages (Admin, Tasks, Investment), use solid white containers, `slate-50` backgrounds, and defined borders.
- **Glassmorphism**: Reserved for public aesthetic pages (Home, Blog, Travel, Running) using `bg-white/5` and `backdrop-blur-xl`.

## 🗺 Navigation (`features/shared/components/CompactBottomBar.tsx`)
- **Data-Driven:** Navigation is driven by the `NAV_ITEMS` constant. **Do not hardcode JSX links.**
- **Mobile Optimized**: Labels are hidden on mobile to maintain a clean icon-only bar.

## 📝 Content Systems
### Blog System
- **Table:** `public.blogs`.
- **Location:** Logic and components live in `features/blog/`.
- **Editor:** Optional catch-all route at `app/admin/blog/editor/[[...id]]/page.tsx`.

### Task System
- **Table:** `public.tasks`.
- **Location:** Logic and components live in `features/tasks/`.
- **Interactions**: Double-click to edit in-line, auto-expanding textareas, and smart URL detection.

## 📏 Engineering Standards
- **Component Design:** Prefer clean abstractions. Use `use client` only when necessary.
- **Git Workflow**: 
  - Follow **Conventional Commits** (e.g., `feat:`, `fix:`, `chore:`, `refactor:`).
  - Commits are validated by `commitlint` via Husky.
  - Releases are automated via GitHub Actions (`.github/workflows/release.yml`) using `semantic-release`.
- **Package Manager**: Use `pnpm`.
