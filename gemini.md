# Gemini CLI Project Context & Mandates

This document provides foundational context for the Gemini CLI agent to ensure architectural consistency, security, and efficiency.

## 🛠 Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (Auth, PostgreSQL)
- **Real-time Config**: Firebase Remote Config
- **Cache/Session:** Upstash Redis
- **CI/CD:** GitHub Actions + Vercel Cron
- **Styling:** Tailwind CSS + Framer Motion
- **Icons:** Lucide-React + React-Icons/Fa
- **Linter/Formatter:** Biome
- **Utilities Integration**: PapaParse (CSV), node-sql-parser, sql-formatter
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

### 2. `services/` (Infrastructure Layer)
Reserved for cross-cutting infrastructure logic and pluggable systems.
- `services/notifications/`: Modular dispatcher with `Telegram` and `Browser` channels.
- `services/config/`: Remote Config management with Firebase and local fallbacks.

### 3. `lib/` (Global Layer)
Reserved for feature-agnostic, shared logic.
- `lib/core/`: System clients (Supabase, Redis, Firebase) and environment validation (`env.ts`).
- `lib/shared/`: Global constants, metadata, and SEO utilities.
- `lib/hooks/`: Generic reusable React hooks.

### 4. `app/` (Routing Layer)
Strictly for routing and page definitions.
- `app/utils/`: High-fidelity developer utilities (JSON, SQL, CSV, Case Converters).
- `app/api/tasks/cron/`: Secure API endpoint for scheduled task reminders.

## 🔑 Security & Authorization
- **Environment Variables:** Always use `ENV_GLOBAL` from `@/lib/core/env`.
- **Authorization:** 
  - Centralized verification via `checkAdmin()` in `features/auth/actions.ts`.
  - **Cron Security**: API routes for crons must check for `CRON_SECRET` via headers or params.
- **PIN Protection:** 
  - `PinGuard.tsx` protects restricted sections.
  - **Session Duration**: 12 hours.
- **Auth Cookies**: Long-lived sessions (30 weeks).

## 🎨 UI/UX Patterns
- **Solid Productivity Pattern**: For admin, operational, and utility pages, use solid white containers, `slate-50` backgrounds, and defined borders.
- **Glassmorphism**: Reserved for public aesthetic pages (Home, Blog, Travel, Running) using `bg-white/5` and `backdrop-blur-xl`.
- **Contrast Mastery**: 
  - **Headlines**: Use dark-themed solid backing cards behind white headline text.
  - **Details**: Metadata and titles anchored in high-contrast white cards overlapping hero banners.
- **Custom Modal System**: Use `features/shared/components/CustomModal.tsx`.
- **Interactive Feedback**: All server transitions must provide high-fidelity feedback (e.g., **Synchronization Overlays**, loading spinners).
- **Mobile-First UX**:
  - **Strategic Grids**: Utilities transition from 1-column mobile to multi-column desktop/tablet.
  - **Touch Targets**: Enhanced padding and `active:scale-90` feedback for handheld training tools.

## 🗺 Navigation
- **Data-Driven:** Driven by the `NAV_ITEMS` constant in `CompactBottomBar.tsx`.
- **Sub-Menu Strategy**: "Insights" now contains Blog, Investment, and Utils.

## 📝 Content Systems
### Blog System
- **Optimization**: Public routes use **Static Site Generation (SSG)** with absolute OG/Twitter metadata.
- **Interactive Tools**: Built-in `ShareButton` leveraging native Web Share API.

### Task System
- **Tabbed Architecture**:
  - **Agenda**: Prominent `TaskProgress` (independent fetch) and collapsible `HealthCheck`.
  - **Analytics**: Multi-Metric Heatmap (Created vs Done) with diagonal visualization.
- **Notifier System**: Pluggable dispatcher delivering alerts via Telegram Bot and Browser API.

### Adventure Utilities
- **System Integrity**: Uses **Wake Lock API** and **Web Audio API** beeps.
- **Structure**: Individual utilities (Timer, Case, SQL, CSV) implemented as Server/View component pairs for SEO. `page.tsx` (Server) handles metadata/SEO, while `View.tsx` (Client) contains business logic.

## 📏 Engineering Standards
- **Component Design**: Prefer clean abstractions. Use `use client` only when necessary.
- **SEO & Metadata**: Every route must implement `generateMetadata` using `createMetadata` helper in `lib/shared/metadata.ts`.
- **Git Workflow**: Follow **Conventional Commits**.
- **Linter**: **Biome** for formatting and linting.
- **Commit/Push Policy**: **NEVER** stage, commit, or push changes unless explicitly requested by the user for each occurrence.
