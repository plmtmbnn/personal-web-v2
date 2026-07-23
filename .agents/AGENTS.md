# AI Agent Project Context & Mandates

This document provides foundational context for any AI coding assistant (e.g., Claude, GPT, Gemini, Grok, Mima, Copilot) to ensure architectural consistency, security, and efficiency across the codebase.

## 🛠 Tech Stack
- **Framework:** Next.js 16.2.10 (App Router) & React 19.2.7
- **Language:** TypeScript 5.9.3
- **Package Manager:** pnpm 11.11.0
- **Database:** Supabase (Auth, PostgreSQL)
- **Real-time Config:** Firebase Remote Config
- **Cache/Session:** Upstash Redis
- **Error Tracking:** Sentry (Next.js SDK)
- **CI/CD:** GitHub Actions + Vercel Cron
- **Styling:** Tailwind CSS v4.3.2 + Framer Motion
- **Icons:** Lucide-React + React-Icons/Fa
- **Linter/Formatter:** Biome
- **Utilities Integration:** PapaParse (CSV), node-sql-parser, sql-formatter, otplib (TOTP)
- **Advanced APIs:** Wake Lock API (Utilities), Web Audio API (Timer beeps)
- **Workflow:** Semantic Release + Commitlint + Husky
- **Optimizations:** Cross-platform environment variables, filesystem caching, bundle analysis
- **Build Tools:** cross-env, autoprefixer, @next/bundle-analyzer

## 🚀 Performance Optimizations
- **Dev Server:** `pnpm run dev` uses Turbo compiler with telemetry disabled (~60% faster startup)
- **Build Process:** `pnpm run build` compiled in ~31s (~75% faster, down from ~3 mins) via SWC import optimizations and Vercel serverless alignment
- **Server External Packages:** Node libraries (`jsdom`, `@mozilla/readability`, `turndown`, `papaparse`, `sql-formatter`, `dompurify`, `got-scraping`, `node-sql-parser`) externalized in `next.config.ts` to shrink Vercel Lambda bundle sizes and prevent re-bundling
- **Tree-Shaking Optimizations:** `experimental.optimizePackageImports` configured for `react-icons`, `framer-motion`, `@supabase/supabase-js`, `recharts`, `lucide-react`, and `date-fns`
- **Sentry Build Optimization:** `withSentryConfig` conditionally enabled only for production releases (`VERCEL_ENV === "production"` or `ENABLE_SENTRY_BUILD=true`) with `deleteSourcemapsAfterUpload: true`
- **Vercel Serverless Harmony:** Removed custom Webpack `splitChunks` and manual cache directory overrides to let Next.js & Vercel manage route-level chunking and remote caching natively
- **Bundle Analysis:** `pnpm run build:analyze` for bundle size optimization
- **pnpm Upgrade:** v11.11.0 with improved dependency resolution
- **Image Optimization:** Enhanced device sizes, formats (AVIF/WebP), and caching
- **TypeScript:** Incremental compilation with performance optimizations

## 📂 Project Structure (Feature-Module Architecture)
The project follows a modular, domain-driven structure to ensure scalability and isolation.

### 1. `features/` (Domain Layer)
Contains all business logic, components, and types for specific features.
- `features/auth/`: Actions, `PinGuard.tsx`, and auth-specific components.
- `features/blog/`: Actions, data fetching, and all blog UI components.
- `features/tasks/`: Actions, analytics, types, utils, and task UI components structured under logical `components/` subdirectories (`agenda/`, `analytics/`, `health/`, `shared/`).
- `features/investment/`: Actions, types, and Fear & Greed visualization components.
- `features/travel/`: Components, types, and static data for the Travel Bucket List Tracker.
- `features/shared/`: Global reusable UI components (e.g., `CustomModal.tsx`, `StockTicker.tsx`, `Skeleton.tsx`).

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
- `app/auth/`: Callback route for Supabase authentication.
- `app/blog/`: SSG-optimized blog system with dynamic routes.
- `app/contact/`: User inquiry page and contact submission form.
- `app/investment/`: Market sentiment and Fear & Greed visualizations.
- `app/login/`: Admin PIN login interface.
- `app/portfolio/` & `app/work-experience/`: Professional showcase and career timeline.
- `app/tasks/`: Personal task management and analytics agenda.
- `app/unauthorized/`: Fallback access-denied page.
- `app/utils/`: High-fidelity developer utilities index.
- `app/api/tasks/cron/`: Secure API endpoint for scheduled task reminders.
- `app/api/mock/`: Dynamic path-based mocking engine endpoints.

## 🔑 Security & Authorization
- **Environment Variables:** Always use `ENV_GLOBAL` from `@/lib/core/env`.
- **Authorization:** 
  - Centralized verification via `checkAdmin()` in `features/auth/actions.ts`.
  - **Cron Security**: API routes for crons must check for `CRON_SECRET` via headers or params.
- **TOTP / Authenticator Protection:** 
  - `PinGuard.tsx` protects restricted sections (Admin, Tasks, Investment) using a 6-digit Google Authenticator code verified via `otplib` (utilizing `TOTP_SECRET` in server environment).
  - Designed for native device numeric keyboards (virtual keypad obsolete).
  - **Session Duration**: 12 hours.
- **Auth Cookies**: Long-lived sessions (30 weeks).

## 🎨 UI/UX Patterns
- **Solid Productivity Pattern**: For admin, operational, and utility pages, use solid white containers, `slate-50` backgrounds, and defined borders.
- **Glassmorphism**: Reserved for public aesthetic pages (Home, Blog, Travel, Running) using `bg-white/5` and `backdrop-blur-xl`.
- **Contrast Mastery**: 
  - **Headlines**: Use dark-themed solid backing cards behind white headline text.
  - **Details**: Metadata and titles anchored in high-contrast white cards overlapping hero banners.
- **Custom Modal System**: Use `features/shared/components/CustomModal.tsx` for high-fidelity alerts and confirmations.
- **Interactive Feedback**: 
  - All server transitions must provide high-fidelity feedback (e.g., **Synchronization Overlays**, loading spinners).
  - Global loading screens utilize a non-repeating progress crawl (e.g., 40% -> 70% -> 95%) with a translucent blurred backdrop (`bg-white/80 backdrop-blur-md`) to simulate realistic page readiness.
  - Page-level skeleton loading is preferred over redundant inline "Synchronizing Intel" indicators.
- **Module Focus Pattern**: For side-by-side utility modules (e.g., Input/Output), provide `Minimize2` / `Maximize2` buttons to collapse/expand modules, allowing users to focus on specific panes. Use `framer-motion` for smooth layout transitions. Ensure Framer Motion transforms do not conflict with Tailwind transform classes (use `style={{ x: ... }}` directly).
- **Mobile-First UX**:
  - **Strategic Grids**: Utilities transition from 1-column mobile to multi-column desktop/tablet.
  - **Touch Targets**: Enhanced padding and `active:scale-90` feedback for handheld training tools.

## 🗺 Navigation
- **Data-Driven:** Driven by the `NAV_ITEMS` constant in `CompactBottomBar.tsx`.
- **Sub-Menu Strategy**: "Insights" now contains Blog, Investment, and Utils.
- **Click Pass-through**: Outer `<motion.nav>` uses `pointer-events-none` and the inner bar uses `pointer-events-auto` to prevent the floating workspace container from blocking clicks on underlying page content.
- **SSR & Hydration Strategy**: Avoids returning `null` before mounting. Default public navigation links render server-side (SSR) to preserve SEO internal links and prevent a visual pop-in layout shift, updating dynamically after client-side authentication checks.
- **Optimized Queries**: Pending task count queries only fetch on auth status changes, rather than firing on every page navigation.
- **Dynamic Hover Detection**: Attaches a media query listener to `window.matchMedia("(hover: hover)")` to dynamically adapt UI hover states in real-time.

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
- **Modular Directory Organization**: Task system UI components are organized into logical sub-directories under `components/`: `agenda/` (forms, lists, filters, items), `analytics/` (charts, graphs, reports), `health/` (system checks), and `shared/` (task-specific loading skeletons, toasts, errors).
- **Tabbed Architecture**:
  - **Agenda**: Prominent `TaskProgress` (independent fetch) and collapsible `HealthCheck`.
  - **Analytics**: Displays a permanently visible `GeneralReport` panel with period filters (Today, Week, Month), using `AnalyticsDashboardSkeleton` as its loading state. The stats grid is enriched with Velocity (average completion rate) and Trend metrics (percentage change vs previous period, color-coded dynamically). Displays a clean "Awaiting Data" fallback and placeholder formatting for reliability metrics when there are zero completed tasks in the selected period.
- **Task Layout & Actions**: `TaskItem` separates title and description with clear vertical breathing room. A status selector dropdown is positioned in the bottom-right actions bar; selecting "DONE" automatically completes the task (setting `status = "done"` with a timestamp), and selecting other options resets it.
- **Kanban Board Optimization**: Transitions the item card to a vertical layout with dedicated top header handles and stacks controls at the bottom to maintain touch target usability in narrow columns.
- **Dynamic Initialization**: `TaskForm` utilizes an auto-expanding `textarea` triggered by content changes to support multi-line batch entry without layout shifting.
- **Notifier System**: Pluggable dispatcher delivering alerts via Telegram Bot and Browser API.

### Second Brain / Knowledge Graph
- **Architecture**: Local filesystem-backed (`content/brain/*.md`) knowledge management system.
- **Environment Behavior**: Read/Write in `development` mode (for local note-taking), Read-Only in `production` to accommodate serverless environments.
- **Graph Visualization**: Uses `react-force-graph-2d` loaded dynamically (`ssr: false`) for 2D network visualization of node connections.
- **Link Parsing**: Robust server-side regex engine parsing Obsidian-style wikilinks (`[[Note Title]]`) and frontmatter.
- **Access Control**: Write operations (create, update, delete) are strictly protected by `checkAdmin()` in `features/auth/actions.ts`.

### Adventures & Professional Showcase
- **Adventures**: High-fidelity logs for Running and Travel missions, utilizing Glassmorphism and rich typography.
  - **Running Performance**: Tracks metrics like distance, time, pace, and **elevation gain** for trail-specific milestones. Supports dynamic grid scaling (up to 5 columns) for high-density performance visualization.
- **Travel Bucket List Tracker**: 
  - **Architecture**: Domain-driven logic in `features/travel/`.
  - **Logic**: Dynamic `useMemo` filtering for "Completed Journeys" (sorted by date) vs. "Future Adventures".
  - **Components**: High-fidelity `StatsCard` for progress visualization and `DestinationCard` with status badges.
  - **Aesthetics**: Solid Productivity Pattern (`bg-slate-50`) with Emerald accents.
- **Professional Showcase**: Career milestones and project portfolio featuring interactive timelines and impact statistics.

### Adventure Utilities
- **System Integrity**: Uses **Wake Lock API** and **Web Audio API** beeps.
- **Advanced Tools**: 
  - **Market Intelligence (Stock Explorer)**: Premium-grade IDX dashboard (`/utils/stock-explorer`) featuring a dynamic composite scoring engine with custom weights (price, volume, foreign net flow, frequency, stability), range sliders, strategy presets (Whale, Momentum, Value), interactive star-watchlist, sector rotation visualizations, opportunity scanner, volume heatmap, and a high-fidelity AI Analyst Drawer.
  - **Mock API Engine**: Path-based dynamic mocking (`/api/mock/*`) with Redis persistence and 1-month TTL. Supports JSON validation with `CustomModal` feedback.
  - **Schema Forge**: Advanced JSON to Multi-Target converter (TS, Go, Zod, Mongoose, Joi).
  - **Asset Averaging**: Weighted average cost analysis for stock and crypto investments.
  - **Formatters**: Developer-centric SQL and JSON beautifiers with syntax validation.
  - **Converters**: Universal Case and CSV-to-JSON recursive parsers.
  - **File Renamer**: SEO-friendly kebab-case normalization for batch file operations.
  - **Running Timer**: High-precision interval timer with automated transitions and wake-lock.
  - **Web Archiver**: Read-It-Later utility (`/utils/web-archiver`) that scrapes articles from URLs using `got-scraping`, extracts clean core content with `@mozilla/readability`, converts it to Markdown using `turndown`, and archives it directly into the local Second Brain.
- **JSON Tree View**: Standardized `JsonValue` component for interactive exploration of parsed data, supporting nested expansion, item counts, and value-level copying.
- **Architecture**: Redis-backed with automatic IDX synchronization via `got-scraping` (configured as an external server package to resolve static TLS files) and an **Admin Portal** (`/utils/stock-explorer/admin`) for cache management and status monitoring.
- **Structure**: Individual utilities implemented as Server (`page.tsx`) / Client (`View.tsx`) pairs to balance SEO and interactivity. 
  - **Logic Decoupling**: Heavy business logic (e.g., schema generation, formatters, string transformations) is decoupled from the `View.tsx` component into dedicated `utils/` (e.g., `generators.ts`, `transform.ts`) and `types.ts` files within each specific utility's feature directory.

### Administrative Ecosystem
- **Centralized Management**: Admin dashboard (`/admin`) manages Blog, Tasks, and Stock Registry.
- **Stock Manager**: Re-engineered portal (`/utils/stock-explorer/admin`) providing live cache status statistics (instruments count, trading date, 3-hour lifespan info), a programmatic "Purge Cache" action, and manual override form validation as a fallback synchronization protocol.
- **Navigation**: "Manage Stocks" integrated into `CompactBottomBar.tsx` Admin sub-menu.

## 🚀 Development & Build Optimization

### Performance Enhancements Implemented
- **pnpm Upgrade:** v8.12.1 → v11.11.0 for faster dependency management
- **Next.js Turbo:** `--turbo` flag enabled for faster compilation
- **Telemetry Disabled:** `NEXT_TELEMETRY_DISABLED=1` reduces startup overhead
- **Filesystem Caching:** Webpack caching with build dependencies tracking
- **Bundle Analysis:** `@next/bundle-analyzer` integration for size optimization
- **Image Optimization:** Enhanced formats (AVIF/WebP) and device sizes
- **TypeScript:** Incremental compilation with performance settings

### Available Scripts
```bash
# Development
pnpm run dev              # Start with Turbo + optimizations
pnpm run dev:debug       # Start with Node.js debugger

# Build
pnpm run build           # Production build
pnpm run build:fast      # Fast build skipping non-critical checks (FAST_BUILD=true)
pnpm run build:analyze   # Build with bundle analysis
pnpm run build:profile   # Build with profiling

# Analysis
pnpm run analyze         # Alias for build:analyze
```

### Configuration Files
- `next.config.ts`: Optimized with bundle analyzer, Sentry (configured with `silent: true` to suppress Turbopack warning noise in CI), and caching
- `tsconfig.json`: Performance-optimized TypeScript settings
- `.env.development`: Development-specific environment variables
- `tailwind.config.js`: Optimized Tailwind CSS v4 configuration
- `postcss.config.mjs`: Enhanced with autoprefixer

## 📏 Engineering Standards
- **Component Design**: Prefer clean abstractions. Use `use client` only when necessary.
- **Defensive Data Handling**: Always implement safety fallbacks and type-casting (e.g., `String(val || "")`) when processing external API data to prevent runtime `TypeError` on missing fields.
- **SEO & Metadata**: Every route must implement `generateMetadata` using `createMetadata` helper in `lib/shared/metadata.ts`.
- **Error Tracking & Monitoring**: Sentry is configured for client (`instrumentation-client.ts`), server (`sentry.server.config.ts`), and edge environment tracking (`sentry.edge.config.ts`), integrated via Next.js instrumentation (`instrumentation.ts`). Sentry builds use `silent: true` to suppress noisy missing source map warnings from Turbopack internal chunks.
- **Git Workflow**: Follow **Conventional Commits**.
- **Linter**: **Biome** for formatting and linting.
- **Performance Tools:** Bundle analyzer, profiling scripts, and optimized configurations.
- **Commit/Push Policy**: **NEVER** stage, commit, or push changes unless explicitly requested by the user for each occurrence.
