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
- **Advanced APIs**: Wake Lock API (Utilities), Web Audio API (Timer beeps)
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
- `app/adventures/utils/`: Dedicated hub for operational performance tools.

## 🔑 Security & Authorization
- **Environment Variables:** Always use `ENV_GLOBAL` from `@/lib/core/env`.
- **Authorization:** 
  - Centralized verification via `checkAdmin()` in `features/auth/actions.ts`.
  - **Feature Toggle Bypass**: If `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH` or `NEXT_PUBLIC_ENABLE_PINGUARD` is `"false"`, `checkAdmin()` automatically returns `true`.
- **PIN Protection:** 
  - `PinGuard.tsx` protects restricted sections.
  - **Session Duration**: 12 hours.
- **Auth Cookies**: Long-lived sessions (30 weeks).

## 🎨 UI/UX Patterns
- **Solid Productivity Pattern**: For admin and operational pages (Admin, Tasks, Investment), use solid white containers, `slate-50` backgrounds, and defined borders.
- **Glassmorphism**: Reserved for public aesthetic pages (Home, Blog, Travel, Running, Utils) using `bg-white/5` and `backdrop-blur-xl`.
- **Contrast Mastery**: 
  - **Headlines**: Use dark-themed solid backing cards behind white headline text.
  - **Details**: Metadata and titles anchored in high-contrast white cards overlapping hero banners.
- **Custom Modal System**: Use `features/shared/components/CustomModal.tsx`.
- **Interactive Feedback**: All server transitions must provide high-fidelity feedback (e.g., **Synchronization Overlays**, loading spinners).
- **Mobile-First UX**:
  - **Bottom Sheets**: Used for task creation (`TaskForm`) on mobile.
  - **Floating Nav Switcher**: Used in `/tasks` to toggle between **Agenda** and **Analytics**.
  - **Touch Targets**: Enhanced padding and `active:scale-90` feedback for handheld training tools.

## 🗺 Navigation
- **Data-Driven:** Driven by the `NAV_ITEMS` constant in `CompactBottomBar.tsx`.
- **Quick Navigation**: `features/tasks/components/QuickNav.tsx` acts as a floating context switcher.

## 📝 Content Systems
### Blog System
- **Table:** `public.blogs`.
- **Optimization**: Blog public routes use **Static Site Generation (SSG)**.
- **Interactive Tools**: Built-in `ShareButton` leveraging native Web Share API.

### Task System
- **Table:** `public.tasks`.
- **Tabbed Architecture**:
  - **Agenda**: Main operational view. Includes `TaskProgress` (Independent Data Fetching) and collapsible `HealthCheck` at the top.
  - **Intelligence/Analytics**: Includes the **Multi-Metric Heatmap** (Created vs Done).
- **Temporal Logic**: Uses `date-fns` for normalization and multi-metric aggregation.

### Adventure Utilities
- **High-Precision Timer**: Custom interval logic with automated transitions.
- **System Integrity**: Uses **Wake Lock API** to keep screen active during physical training.
- **Feedback**: **Web Audio API** for transition countdowns.

### Investment System (Fear & Greed Hub)
- **API**: Integrated with live CNN Market Sentiment data.
- **Visuals**: Unified Gauge visualization and "Factor Analysis Matrix".

## 📏 Engineering Standards
- **Component Design:** Prefer clean abstractions. Use `use client` only when necessary.
- **Image Management**: Next.js `Image` with wildcard support for major CDNs.
- **Git Workflow**: Follow **Conventional Commits**.
- **Linter**: **Biome** for formatting and linting.
- **Package Manager**: Use `pnpm`.
- **Commit/Push Policy**: **NEVER** stage, commit, or push changes unless explicitly requested by the user for each occurrence.
