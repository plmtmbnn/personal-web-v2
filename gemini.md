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
- `app/admin/`: Centralized management dashboard.
- `app/adventures/`: Aesthetic content pages for Running and Travel logs.
- `app/blog/`: SSG-optimized blog system with dynamic routes.
- `app/investment/`: Market sentiment and Fear & Greed visualizations.
- `app/portfolio/` & `app/work-experience/`: Professional showcase and career timeline.
- `app/tasks/`: Personal task management and analytics agenda.
- `app/utils/`: High-fidelity developer utilities index.
- `app/api/tasks/cron/`: Secure API endpoint for scheduled task reminders.
- `app/api/mock/`: Dynamic path-based mocking engine endpoints.

## 🔑 Security & Authorization
- **Environment Variables:** Always use `ENV_GLOBAL` from `@/lib/core/env`.
- **Authorization:** 
  - Centralized verification via `checkAdmin()` in `features/auth/actions.ts`.
  - **Cron Security**: API routes for crons must check for `CRON_SECRET` via headers or params.
- **PIN Protection:** 
  - `PinGuard.tsx` protects restricted sections (Admin, Tasks, Investment).
  - **Session Duration**: 12 hours.
- **Auth Cookies**: Long-lived sessions (30 weeks).

## 🎨 UI/UX Patterns
- **Solid Productivity Pattern**: For admin, operational, and utility pages, use solid white containers, `slate-50` backgrounds, and defined borders.
- **Glassmorphism**: Reserved for public aesthetic pages (Home, Blog, Travel, Running) using `bg-white/5` and `backdrop-blur-xl`.
- **Contrast Mastery**: 
  - **Headlines**: Use dark-themed solid backing cards behind white headline text.
  - **Details**: Metadata and titles anchored in high-contrast white cards overlapping hero banners.
- **Custom Modal System**: Use `features/shared/components/CustomModal.tsx` for high-fidelity alerts and confirmations.
- **Interactive Feedback**: All server transitions must provide high-fidelity feedback (e.g., **Synchronization Overlays**, loading spinners).
- **Module Focus Pattern**: For side-by-side utility modules (e.g., Input/Output), provide `Minimize2` / `Maximize2` buttons to collapse/expand modules, allowing users to focus on specific panes. Use `framer-motion` for smooth layout transitions.
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
- **Syntax Highlighting**: 
  - Use **One Dark** Prism style for high-contrast and vibrant technical snippets.
  - Implement in both `BlogContent` (public) and `BlogForm` (editor preview) for WYSIWYG consistency.
- **Code Block Responsiveness**:
  - **Scrolling**: Mandate `overflow-auto` for both horizontal and vertical scrolling.
  - **Formatting**: Use `white-space: pre` to prevent line wrapping, preserving original code structure.
  - **Height Constraints**: Set `max-h-[32rem]` to keep extremely long snippets manageable.
- **Post-Article UX**: 
  - Centered "Post Actions" footer replacing the legacy sidebar.
  - High-fidelity layout combining Share actions and interactive motion feedback.

### Task System
- **Tabbed Architecture**:
  - **Agenda**: Prominent `TaskProgress` (independent fetch) and collapsible `HealthCheck`.
  - **Analytics**: Multi-Metric Heatmap (Created vs Done) with diagonal visualization.
- **Dynamic Initialization**: `TaskForm` utilizes an auto-expanding `textarea` triggered by content changes to support multi-line batch entry without layout shifting.
- **Notifier System**: Pluggable dispatcher delivering alerts via Telegram Bot and Browser API.

### Adventures & Professional Showcase
- **Adventures**: High-fidelity logs for Running and Travel missions, utilizing Glassmorphism and rich typography.
- **Travel Bucket List Tracker**: 
  - **Architecture**: Domain-driven logic in `features/travel/`.
  - **Logic**: Dynamic `useMemo` filtering for "Completed Journeys" (sorted by date) vs. "Future Adventures".
  - **Components**: High-fidelity `StatsCard` for progress visualization and `DestinationCard` with status badges.
  - **Aesthetics**: Solid Productivity Pattern (`bg-slate-50`) with Emerald accents.
- **Professional Showcase**: Career milestones and project portfolio featuring interactive timelines and impact statistics.

### Adventure Utilities
- **System Integrity**: Uses **Wake Lock API** and **Web Audio API** beeps.
- **Advanced Tools**: 
  - **Stock Explorer**: Interactive IDX stock table with foreign net flow tracking and multi-metric filtering.
  - **Mock API Engine**: Path-based dynamic mocking (`/api/mock/*`) with Redis persistence and 1-month TTL. Supports JSON validation with `CustomModal` feedback.
  - **Schema Forge**: Advanced JSON to Multi-Target converter (TS, Go, Zod, Mongoose, Joi).
  - **Asset Averaging**: Weighted average cost analysis for stock and crypto investments.
  - **Formatters**: Developer-centric SQL and JSON beautifiers with syntax validation.
  - **Converters**: Universal Case and CSV-to-JSON recursive parsers.
  - **File Renamer**: SEO-friendly kebab-case normalization for batch file operations.
  - **Running Timer**: High-precision interval timer with automated transitions and wake-lock.
- **JSON Tree View**: Standardized `JsonValue` component for interactive exploration of parsed data, supporting nested expansion, item counts, and value-level copying.
- **Architecture**: Redis-backed with an **Admin Import Portal** (`/utils/stock-explorer/admin`) for manual synchronization.
- **Structure**: Individual utilities implemented as Server (`page.tsx`) / Client (`View.tsx`) pairs to balance SEO and interactivity.

### Administrative Ecosystem
- **Centralized Management**: Admin dashboard (`/admin`) manages Blog, Tasks, and Stock Registry.
- **Stock Manager**: Manual JSON import protocol with validation to persist IDX market statistics to Redis.
- **Navigation**: "Manage Stocks" integrated into `CompactBottomBar.tsx` Admin sub-menu.

## 📏 Engineering Standards
- **Component Design**: Prefer clean abstractions. Use `use client` only when necessary.
- **Defensive Data Handling**: Always implement safety fallbacks and type-casting (e.g., `String(val || "")`) when processing external API data to prevent runtime `TypeError` on missing fields.
- **SEO & Metadata**: Every route must implement `generateMetadata` using `createMetadata` helper in `lib/shared/metadata.ts`.
- **Git Workflow**: Follow **Conventional Commits**.
- **Linter**: **Biome** for formatting and linting.
- **Commit/Push Policy**: **NEVER** stage, commit, or push changes unless explicitly requested by the user for each occurrence.
