# AI Agent Project Context & Mandates

This document provides foundational context for any AI coding assistant (e.g., Claude, GPT, Gemini, Grok, Mima, Copilot) to ensure architectural consistency, security, and efficiency across the codebase.

> [!IMPORTANT]
> **Strict UI/UX Guideline Compliance Mandate**:
> Whenever creating a new page, revamping an existing page, or adjusting any UI component, agents **MUST** strictly follow the design principles, visual patterns, and architectural rules defined in [`ui-uix-guideline.md`](file:///c:/Work/Me/personal-web-v2/ui-uix-guideline.md).
> - **Design Standard**: Modern Floating Card dashboard aesthetic (`bg-white`, `border border-slate-200/80`, `rounded-2xl` / `rounded-3xl` / `rounded-[2rem]`, `shadow-xs` to `shadow-xl`).
> - **Canvas**: Light textured canvas (`bg-slate-50/80 bg-dot-pattern`) with airy hero layout (`pt-24 sm:pt-32`).
> - **Mobile-First & Responsiveness**: Scaled grids (`grid-cols-1 md:grid-cols-2 lg/xl:grid-cols-3`), mobile touch targets, and proper floating bottom bar clearance (`pb-32 sm:pb-36`).
> - **Form & Search Hygiene**: Explicit input icon layering (`pointer-events-none z-10` with `pl-10`/`pl-11`).
> - **Strict Anti-Gradient & Anti-Emoji Mandates**: Zero gradient headers, zero gradient modals, zero multi-color gradient typography, zero ambient blur orbs (`blur-3xl`), and zero raw unicode emojis.

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
- **Utilities Integration:** PapaParse (CSV), node-sql-parser, sql-formatter, otplib (TOTP), HTML5 Canvas API (Postcard/Run stickers & Code-to-Image), Clipboard API
- **Advanced APIs:** Web Share API (Rich Run Activity & Blog Sharing), Wake Lock API (Running Timer), Web Audio API (Timer beeps & Spinner clicks), MediaDevices & WebGL (Device Inspector)
- **External Integrations:** Strava API (`services/strava/`), Liverpool FC API (`backend.liverpoolfc.com`)
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
- `features/adventures/`: Running logs & Strava activity hub (`ActivityDetailModal` with Web Share API, `PersonalBestsSwipeCard` with solid accents, run canvas exports, split pacing breakdown).
- `features/auth/`: Actions, `PinGuard.tsx`, and auth-specific components.
- `features/blog/`: Actions, data fetching, dynamic category counts, sort controls, and all blog UI components.
- `features/contact/`: Compact single-page contact view with real-time Jakarta clock & active status chip.
- `features/home/`: Landing hero, dynamic greetings, quick link cards, and zero-scrollbar desktop entry layout.
- `features/insights/`: Insights hub module aggregator (Blog, Investment, Liverpool FC, Utils) with top telemetry summary strip.
- `features/investment/`: Actions, types, Fear & Greed market sentiment telemetry, and historical trends.
- `features/liverpool/`: Actions, types, and Matchday Hub components (`NextMatchHero.tsx`, `FixtureCard.tsx`, `PlayedCard.tsx`, `FixtureFilters.tsx`, `FixtureSkeleton.tsx`).
- `features/portfolio/` & `features/work-experience/`: Professional showcases, career timeline, interactive project cards, skills radar/metrics.
- `features/reminders/`: Quick Reminders actions, types, linkified text pills, keyboard shortcuts (<kbd>⌘/Ctrl+Enter</kbd>), one-click note copying, and duration extensions backed by Upstash Redis.
- `features/tasks/`: Actions, analytics, types, utils, 6-month date horizon, optimized `TaskProgress`, and task UI components structured under logical `components/` subdirectories (`agenda/`, `analytics/`, `health/`, `shared/`).
- `features/travel/`: Components, types, static destinations data, and `PostcardModal` vintage airmail canvas generator for the Travel Bucket List Tracker.
- `features/utils/`: High-fidelity developer utilities organized across 7 functional categories (`data-tools/`, `file-tools/`, `fun-tools/`, `security-tools/`, `stock-tools/`, `text-tools/`, `time-tools/`).
- `features/shared/`: Global reusable UI components (e.g., `CustomModal.tsx`, `StockTicker.tsx`, `Skeleton.tsx`, `JsonValue.tsx`, `CommandPalette.tsx`, `AdminToast.tsx`, `CompactBottomBar.tsx`).

### 2. `services/` (Infrastructure Layer)
Reserved for cross-cutting infrastructure logic and pluggable systems.
- `services/notifications/`: Modular dispatcher with `Telegram` and `Browser` channels.
- `services/config/`: Remote Config management with Firebase and local fallbacks.
- `services/strava/`: Strava API integration, OAuth token exchange, activity caching with Redis, split metrics calculation.

### 3. `lib/` (Global Layer)
Reserved for feature-agnostic, shared logic.
- `lib/core/`: System clients (Supabase, Redis, Firebase), environment validation (`env.ts`), and auth utilities (`auth-utils.ts`).
- `lib/shared/`: Global constants (`constants.ts`), metadata, and SEO utilities (`metadata.ts`, `seo.ts`).
- `lib/hooks/`: Generic reusable React hooks.

### 4. `app/` (Routing Layer)
Strictly for routing and page definitions.
- `app/admin/`: Centralized management dashboard and `/admin/reminders` Quick Reminders portal.
- `app/adventures/`: Aesthetic content pages for Running (`/adventures/running`) and Travel (`/adventures/travel`) logs.
- `app/auth/`: Callback route for Supabase authentication.
- `app/blog/`: SSG-optimized blog system with dynamic routes (`[slug]`).
- `app/contact/`: Compact single-screen contact inquiry page with live Jakarta timezone status.
- `app/insights/`: Analytical insights aggregator hub page.
- `app/investment/`: Market sentiment and Fear & Greed visualizations.
- `app/liverpool/`: Matchday Schedule & Fixtures Hub with live countdowns and matchday reports.
- `app/login/`: Admin PIN login interface.
- `app/portfolio/` & `app/work-experience/`: Professional showcase and career timeline.
- `app/tasks/`: Personal task management, 6-month horizon, and analytics agenda.
- `app/unauthorized/`: Fallback access-denied page.
- `app/utils/`: High-fidelity developer utilities index across 7 functional categories.
- `app/api/tasks/cron/`: Secure API endpoint for scheduled task reminders.
- `app/api/mock/`: Dynamic path-based mocking engine endpoints.
- `app/api/strava/`: Strava OAuth callback, sync, and split routes.
- `app/api/auth/refresh-session/`: Proactive Redis session & Supabase token synchronizer.

## 🔑 Security & Authorization
- **Environment Variables:** Always use `ENV_GLOBAL` from `@/lib/core/env`.
- **Authorization:** 
  - Centralized verification via `checkAdmin()` in `features/auth/actions.ts`.
  - **Cron Security**: API routes for crons must check for `CRON_SECRET` via headers or params.
- **TOTP / Authenticator Protection:** 
  - `PinGuard.tsx` protects restricted sections (Admin, Tasks) using a 6-digit Google Authenticator code verified via `otplib` (utilizing `TOTP_SECRET` in server environment).
  - Designed for native device numeric keyboards (virtual keypad obsolete).
  - **Session Duration**: 12 hours.
- **Auth Cookies**: Long-lived sessions (30 weeks).

## 🎨 UI/UX Patterns
- **Solid Productivity Pattern**: For admin, operational, and utility pages, use solid white containers, `slate-50` backgrounds, and defined borders.
- **Contrast Mastery**: 
  - **Headlines**: Use dark-themed solid backing cards behind white headline text.
  - **Details**: Metadata and titles anchored in high-contrast white cards overlapping hero banners.
- **Custom Modal System**: Use `features/shared/components/CustomModal.tsx` for high-fidelity alerts and confirmations.
- **Interactive Feedback**: 
  - All server transitions must provide high-fidelity feedback (e.g., **Synchronization Overlays**, loading spinners).
  - Global loading screens utilize a non-repeating progress crawl (e.g., 40% -> 70% -> 95%) presented within a **Modern Floating Card Dashboard Aesthetic** (`bg-white rounded-3xl border-slate-200/80 shadow-2xl`) to simulate realistic page readiness.
  - Page-level skeleton loading is preferred over redundant inline "Synchronizing Intel" indicators.
- **Module Focus Pattern**: For side-by-side utility modules (e.g., Input/Output), provide `Minimize2` / `Maximize2` buttons to collapse/expand modules, allowing users to focus on specific panes. Use `framer-motion` for smooth layout transitions. Ensure Framer Motion transforms do not conflict with Tailwind transform classes (use `style={{ x: ... }}` directly).
- **Mobile-First UX**:
  - **Strategic Grids**: Utilities transition from 1-column mobile to multi-column desktop/tablet (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
  - **Desktop Entry Screen Standard**: Single-page entry points (Home, Contact) utilize compact 100vh entry screens on desktop (`lg:h-screen lg:max-h-[100dvh] lg:overflow-hidden`) to eliminate scrollbars, while providing fluid vertical scrolling on handheld mobile devices.
  - **Touch Targets**: Enhanced padding and `active:scale-90` feedback for handheld training tools.

## 🗺 Navigation
- **Data-Driven:** Driven by the `NAV_ITEMS` constant in `CompactBottomBar.tsx`.
- **Sub-Menu Strategy**: 
  - "Insights" contains Blog, Investment, Liverpool FC, and Utils.
  - "Admin" contains Tasks, Blog Editor, Stock Manager, and Quick Reminders with dynamic count badges.
- **Click Pass-through**: Outer `<motion.nav>` uses `pointer-events-none` and the inner bar uses `pointer-events-auto` to prevent the floating workspace container from blocking clicks on underlying page content.
- **SSR & Hydration Strategy**: Avoids returning `null` before mounting. Default public navigation links render server-side (SSR) to preserve SEO internal links and prevent a visual pop-in layout shift, updating dynamically after client-side authentication checks.
- **Optimized Queries**: Pending task count queries only fetch on auth status changes, rather than firing on every page navigation.
- **Dynamic Hover Detection**: Attaches a media query listener to `window.matchMedia("(hover: hover)")` to dynamically adapt UI hover states in real-time.

## 📝 Content Systems

### Liverpool FC Matchday Hub
- **Architecture**: Domain-driven feature in `features/liverpool/` fetching from official REST API (`backend.liverpoolfc.com`) with 1-hour ISR revalidation and defensive data fallbacks.
- **Dual-Tab Architecture**: Focuses on "Upcoming Matches" (with a live countdown Next Match hero and monthly schedule grouping) and isolates "Played Results" (displaying outcome pills `WIN`/`DRAW`/`LOSS`, final scores, and official match reports).
- **Aesthetics & UI/UX**: Pure light model with Liverpool Red accents, dot pattern canvas (`bg-slate-50/80 bg-dot-pattern`), `rounded-[2rem]` floating cards, and pill badges matching `TravelPage()`.
- **Integrations**: Google Calendar URL export and direct LFC match center links.

### Blog System
- **Optimization**: Public routes use **Static Site Generation (SSG)** with absolute OG/Twitter metadata.
- **Dynamic Filtering & Sorting**: Real-time article counters on category pills (*All, Tech, Finance, Running, General*) and 4-mode article sort selector (*Newest First, Oldest First, Quickest Read, Deepest Read*).
- **Interactive Tools**: Built-in `ShareButton` leveraging native Web Share API.
- **Syntax Highlighting**: 
  - Use **One Dark** Prism style for high-contrast and vibrant technical snippets.
  - Implement in both `BlogContent` (public) and `BlogForm` (editor preview) for WYSIWYG consistency.
- **Code Block Responsiveness**:
  - **Scrolling**: Mandate `overflow-auto` for both horizontal and vertical scrolling.
  - **Formatting**: Use `white-space: pre` to prevent line wrapping, preserving original code structure.
  - **Height Constraints**: Set `max-h-[32rem]` to keep extremely long snippets manageable.
- **Post-Article UX**: Centered "Post Actions" footer replacing legacy sidebar with high-fidelity share actions.

### Task System
- **Modular Directory Organization**: Task system UI components are organized into logical sub-directories under `components/`: `agenda/` (forms, lists, filters, items), `analytics/` (charts, graphs, reports), `health/` (system checks), and `shared/` (task-specific loading skeletons, toasts, errors).
- **Tabbed Architecture**:
  - **Agenda**: Prominent `TaskProgress` (independent fetch, dynamic completion rates) and collapsible `HealthCheck`.
  - **Analytics**: Displays a permanently visible `GeneralReport` panel with period filters (Today, Week, Month, 6 Months, All Time), using `AnalyticsDashboardSkeleton` as its loading state. The stats grid is enriched with Velocity (average completion rate) and Trend metrics (percentage change vs previous period, color-coded dynamically). Displays a clean "Awaiting Data" fallback when there are zero completed tasks.
- **Task Layout & Actions**: `TaskItem` separates title and description with clear vertical breathing room. A status selector dropdown is positioned in the bottom-right actions bar; selecting "DONE" automatically completes the task (setting `status = "done"` with a timestamp), and selecting other options resets it.
- **Kanban Board Optimization**: Transitions the item card to a vertical layout with dedicated top header handles and stacks controls at the bottom to maintain touch target usability in narrow columns.
- **Dynamic Initialization**: `TaskForm` utilizes an auto-expanding `textarea` triggered by content changes to support multi-line batch entry without layout shifting.
- **Notifier System**: Pluggable dispatcher delivering alerts via Telegram Bot and Browser API.

### Quick Reminders System
- **Architecture**: Domain-driven feature in `features/reminders/` and management portal at `/admin/reminders`.
- **Keyboard Ergonomics**: Instant note submission via <kbd>⌘ + Enter</kbd> (Mac) or <kbd>Ctrl + Enter</kbd> (Windows).
- **One-Click Actions**: Dedicated `Copy Note` action on each card with visual checkmark feedback.
- **Search & TTL Filter Strip**: Live search bar paired with duration category filters (*All, Expiring Soon, 1 Day, 1 Week, 1 Month*).
- **Redis TTL Lifespan**: Backed by Upstash Redis with selectable expiration lifespans (1 Day, 1 Week, 1 Month) and automatic key expiration.
- **Interactive Links**: Automatic URL detection with clickable pill buttons and one-click copy-to-clipboard functionality.
- **Rapid Time Extensions**: Provides one-click TTL extension badges (`+1D`, `+1W`, `+1M`) without re-entering reminder text.
- **Navigation Badge**: Displays dynamic pending reminder counts in `CompactBottomBar.tsx` Admin submenu.

### Insights Hub
- **Architecture**: Centralized aggregator at `/insights` (`features/insights/`) consolidating Blog, Investment sentiment, Liverpool FC Matchday Hub, and Developer Utilities.
- **Global Intelligence Telemetry**: Top 4-stat telemetry strip previewing core platform domains (Engineering Blueprints, Market Sentiment, Matchday Center, Developer Toolkits).
- **Curated Modules**: Floating cards with category pills, topic tags, high-contrast linkout arrows (`ArrowUpRight`), and organic spring hover interactions (`whileHover={{ y: -4 }}`).

### Second Brain / Knowledge Graph
- **Architecture**: Local filesystem-backed (`content/brain/*.md`) knowledge management system.
- **Environment Behavior**: Read/Write in `development` mode (for local note-taking), Read-Only in `production` to accommodate serverless environments.
- **Graph Visualization**: Uses `react-force-graph-2d` loaded dynamically (`ssr: false`) for 2D network visualization of node connections.
- **Link Parsing**: Robust server-side regex engine parsing Obsidian-style wikilinks (`[[Note Title]]`) and frontmatter.
- **Access Control**: Write operations (create, update, delete) are strictly protected by `checkAdmin()` in `features/auth/actions.ts`.

### Adventures & Professional Showcase
- **Adventures**: High-fidelity logs for Running and Travel missions, utilizing solid floating card aesthetics and rich typography.
  - **Adventures Landing Hub (`/adventures`)**: Global telemetry stats strip (`65.9 km` Max Distance, `2,982 m` Peak Elevation, `10+` Destinations, `2` Canvas Engines) previewing Running and Travel ecosystems with milestone snapshots.
  - **Running Performance (`/adventures/running`)**: Tracks metrics like distance, time, pace, and **elevation gain** for trail-specific milestones. Features a high-fidelity **Activity Detail Modal** with real Strava splits, light/dark themes, transparent canvas background export, and native **Web Share API** integration (`navigator.share` with rich summary text: `🏃 Morning Run • 10.02 km in 52m 14s`). Includes a **PersonalBestsSwipeCard** built on pure solid surfaces (zero blur glow orbs, zero gradient backgrounds) and one-click record copy actions.
  - **Travel Bucket List Tracker (`/adventures/travel`)**: Domain-driven logic in `features/travel/` featuring dynamic filtering ("Completed" vs. "Future Adventures"), high-fidelity `StatsCard`, `DestinationCard`, and `PostcardModal` 3D flipping card (polaroid front & handwritten postcard back with postmark/stamp) with high-res PNG sticker export (`postcardCanvas.ts` with Next.js dynamic font-face extraction).
- **Professional Showcase**:
  - **Portfolio Core Engines (`/portfolio`)**: Interactive SVG Expertise Distribution visualizer with accordion modules, staggered floating cards, and `PortfolioDetailModal` showcasing deep-dive architectures, capabilities, tech stack matrices, and measurable impact metrics across LOS/LMS and specialized platforms.
  - **Work Experience Timeline (`/work-experience`)**: Chronological career milestones featuring clean brand/legal entity hierarchy, inline technology chips, bottom impact statistics, and `ExperienceDetailModal` delivering comprehensive organizational impact and role breakdowns.
  - **Solid Aesthetic Policy**: Strictly avoids multi-color gradient text, ambient blur glow orbs, and fuzzy glow drop shadows in favor of crisp solid productivity surfaces, semantic badge tints, and high-contrast typography.

### Developer Utilities Ecosystem (20+ Tools across 7 Categories)
- **Suite Categorization**:
  1. **Text Tools**: Text Compare (`/utils/text-compare` with custom comparator engine, character diffs, and synchronized scrolling), Diff Viewer (`/utils/diff-viewer`), Case Converter (`/utils/case-converter`), QR Code Generator (`/utils/qr-code-generator` with multi-format support and SVG/PNG export).
  2. **Data Tools**: Device Inspector (`/utils/device-inspector` with hardware diagnostics, audio/video studio, and network speed test), Mock API Engine (`/utils/mock-api` & `/api/mock/*` with Redis persistence), SQL Formatter (`/utils/sql-formatter`).
  3. **File Tools**: Code to Image (`/utils/code-to-image`), CSV to JSON (`/utils/csv-to-json`), File Renamer (`/utils/file-renamer`), Image Converter (`/utils/image-converter`), Schema Forge / Advanced JSON Converter (`/utils/json-converter-advanced`), JSON Formatter (`/utils/json-formatter`).
  4. **Fun Tools**: Spinner Wheel (`/utils/spinner-wheel` with Web Audio API clicks and confetti).
  5. **Security Tools**: JWT & API Token Inspector (`/utils/jwt-inspector` with 100% in-browser decoding, live countdown telemetry, RFC claims dictionary, and Web Crypto HMAC verification sandbox), Hash & Password Generator (`/utils/hash-password-generator`), URL Safety & Threat Inspector (`/utils/url-inspector`).
  6. **Stock Tools**: Stock Explorer (`/utils/stock-explorer` with composite scoring engine, whale/momentum/value presets, foreign flow tracking, sector heatmaps, and AI Analyst Drawer), Stock/Crypto Average Calculator (`/utils/stock-crypto-calculator`).
  7. **Time Tools**: Cron Expression Builder (`/utils/cron-builder` with natural language summaries), Running Interval Timer (`/utils/timer` with Web Audio synthesized beeps and Wake Lock API).
- **JSON Tree View**: Standardized `JsonValue` component for interactive exploration of parsed data, supporting nested expansion, item counts, and value-level copying.
- **Structure**: Individual utilities implemented as Server (`page.tsx`) / Client (`View.tsx`) pairs to balance SEO and interactivity.
- **Logic Decoupling**: Heavy business logic (e.g., schema generation, formatters, string transformations, comparator engine) is decoupled from the `View.tsx` component into dedicated `utils/` and `types.ts` files within each utility's feature directory.

### Administrative Ecosystem
- **Centralized Management**: Admin dashboard (`/admin`) manages Blog, Tasks, Stock Registry, and Quick Reminders (`/admin/reminders`).
- **Stock Manager**: Re-engineered portal (`/utils/stock-explorer/admin`) providing live cache status statistics (instruments count, trading date, 3-hour lifespan info), a programmatic "Purge Cache" action, direct JSON file upload (`<input type="file" accept=".json" />`), JSON formatting utility, sample template loader (`BBCA`, `BBRI`, `BMRI`), <kbd>⌘/Ctrl+Enter</kbd> shortcut, and strict TypeScript types.
- **Navigation**: "Manage Stocks" and "Quick Reminders" integrated into `CompactBottomBar.tsx` Admin sub-menu with pending counts.

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
- **UI/UX Consistency**: All new or modified pages/components MUST strictly conform to [`ui-uix-guideline.md`](file:///c:/Work/Me/personal-web-v2/ui-uix-guideline.md) (Floating Cards, `bg-slate-50/80 bg-dot-pattern`, `bg-white` containers, `rounded-2xl` to `rounded-[2rem]`, pill badges, mobile-first responsive grids, and `pb-32 sm:pb-36` navigation clearance).
- **Strict Anti-Gradient & Anti-Emoji Mandates**: NEVER use gradient headers, gradient modal dialogs, multi-color gradient text, or ambient blur glow orbs. NEVER use raw unicode emojis in UI components, headers, or cards (always use scalable SVG icons from `lucide-react` or `react-icons`).
- **Component Design**: Prefer clean abstractions. Use `use client` only when necessary.
- **Defensive Data Handling**: Always implement safety fallbacks and type-casting (e.g., `String(val || "")`) when processing external API data to prevent runtime `TypeError` on missing fields.
- **SEO & Metadata**: Every route must implement `generateMetadata` using `createMetadata` helper in `lib/shared/metadata.ts`.
- **Error Tracking & Monitoring**: Sentry is configured for client (`instrumentation-client.ts`), server (`sentry.server.config.ts`), and edge environment tracking (`sentry.edge.config.ts`), integrated via Next.js instrumentation (`instrumentation.ts`). Sentry builds use `silent: true` to suppress noisy missing source map warnings from Turbopack internal chunks.
- **Git Workflow**: Follow **Conventional Commits**.
- **Linter**: **Biome** for formatting and linting.
- **Performance Tools:** Bundle analyzer, profiling scripts, and optimized configurations.
- **Commit/Push Policy**: **NEVER** stage, commit, or push changes unless explicitly requested by the user for each occurrence.
