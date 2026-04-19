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
- `features/investment/`: Actions, types, and Fear & Greed visualization components.
- `features/shared/`: Global UI components (e.g., `CustomModal.tsx`, `StockTicker.tsx`).

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
  - Centralized verification via `checkAdmin()` in `features/auth/actions.ts`.
  - **Feature Toggle Bypass**: If `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH` or `NEXT_PUBLIC_ENABLE_PINGUARD` is `"false"`, `checkAdmin()` automatically returns `true` to facilitate restricted-environment access.
- **PIN Protection:** `PinGuard.tsx` protects restricted sections and respects environment bypass flags.

## 🎨 UI/UX Patterns
- **Solid Productivity Pattern**: For admin and operational pages (Admin, Tasks, Investment), use solid white containers, `slate-50` backgrounds, and defined borders.
- **Glassmorphism**: Reserved for public aesthetic pages (Home, Blog, Travel, Running) using `bg-white/5` and `backdrop-blur-xl`.
- **Contrast Mastery**: 
  - **Headlines**: Use dark-themed solid backing cards (`bg-slate-950/60 backdrop-blur-xl`) behind white headline text to ensure legibility over any image.
  - **Details**: Article metadata and titles must be anchored in a high-contrast white card that overlaps the hero banner.
- **Custom Modal System**: Use `features/shared/components/CustomModal.tsx` for alerts and action confirmations (Purge/Delete).
- **Interactive Feedback**: All server transitions must provide high-fidelity feedback (e.g., **Synchronization Overlays**, loading buttons).
- **Mobile-First UX**:
  - **Bottom Sheets**: Used for task creation (`TaskForm`) on mobile.
  - **Floating Nav Switcher**: Used in `/tasks` to toggle between **Agenda** and **Analytics** views.
  - **Swipe Actions**: `TaskItem` supports swipe gestures (Left: Delete, Right: Edit).

## 🗺 Navigation
- **Data-Driven:** Navigation is driven by the `NAV_ITEMS` constant in `CompactBottomBar.tsx`.
- **Quick Navigation**: `features/tasks/components/QuickNav.tsx` acts as a floating context switcher for complex operational pages.

## 📝 Content Systems
### Blog System
- **Table:** `public.blogs`.
- **Schema Constraints**: The `category` column is restricted by `blogs_category_check` to: `Tech`, `Running`, `Finance`, `Investment`, `General`.
- **Metadata Support**: Comprehensive support for **Categories**, **Cover Image URLs**, and **Headline Flags**.
- **Dynamic Visuals**: Deterministic **4-Image Placeholder System** ensures visual variety for posts without cover images.
- **Admin Orchestration**: Supports inline **Category Selection** and **Headline Toggling** with **Numeric Pagination** and **Loading Overlays**.
- **Interactive Tools**: Built-in `ShareButton` leveraging native Web Share API with clipboard fallbacks.
- **Optimization**: Blog public routes use **Static Site Generation (SSG)**.

### Task System
- **Table:** `public.tasks`.
- **Batch Initialization**: `TaskForm` supports multi-line pasting to initialize multiple tasks at once via "Batch Protocol" with auto-detection.
- **Tabbed Architecture**: Separates the **Active Agenda** from **Intelligence/Analytics** via a floating `QuickNav` tab-switcher.
- **Temporal Logic**: Uses `date-fns` `startOfDay` normalization for all date-gated filtering.

### Investment System (Fear & Greed Hub)
- **API**: Integrated with live CNN Market Sentiment data.
- **Visuals**: Unified Gauge visualization combined with a high-density "Factor Analysis Matrix" for multi-dimensional market intelligence.

## 📏 Engineering Standards
- **Component Design:** Prefer clean abstractions. Use `use client` only when necessary.
- **Image Management**: Use Next.js `Image` component with optimized `remotePatterns` (wildcard support for major CDNs: Unsplash, Cloudinary, Pexels, GitHub, Google).
- **Git Workflow**: Follow **Conventional Commits**.
- **Package Manager**: Use `pnpm`.
