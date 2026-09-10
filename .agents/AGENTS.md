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
- `features/liverpool/`: Actions, types, and Matchday Hub components (`NextMatchHero.tsx`, `FixtureSkeleton.tsx`, `View.tsx`).
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
  - Standard panels rely on pure white containers (`bg-white`). Full-bleed dark slate banners (`bg-slate-900 border-b border-slate-800`) are strictly obsoleted across the entire application in favor of the unified **Modern Floating Card Header Standard** (`bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs`). Dark slate panels (`bg-slate-900`) are reserved exclusively for isolated high-priority metric widgets (such as the Total Pending backlog counter in Tasks) or technical code blocks.
- **Modern Floating Card Header Standard**:
  - Encapsulates hero headers within elevated floating cards (`bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs`) resting on the signature textured canvas (`bg-slate-50/80 bg-dot-pattern`).
  - Standardized across all management, intelligence, and operational views: Admin Hub (`/admin`), Blog Management (`/admin/blog`), Blog Editor (`/admin/blog/editor`), Quick Reminders (`/admin/reminders`), Stock Registry (`/utils/stock-explorer/admin`), Tasks Agenda (`/tasks`), and Market Intelligence (`/investment`).
  - Features thematic domain badge pills (e.g. `OPERATIONS HUB • daily task orchestration`, `FINANCIAL REGISTRY • idx market synchronization`), bold title typography `h1`, contextual breadcrumbs (`Admin Dashboard › ...` or `Home › ...`), and aligned action/telemetry controls.
  - Declares calibrated top clearance (`pt-20 sm:pt-24` or `pt-24 sm:pt-28`) ensuring fixed floating navigation switchers (such as `QuickNav` in Tasks) never overlap or clip header titles.
- **Floating Widget & Anti-Collision Hygiene**:
  - The bottom-right viewport area is strictly reserved for the global command palette trigger (`SEARCH ⌘K`).
  - Redundant floating widgets (such as floating `BackToTop` pills and floating scroll progress HUDs) are eliminated in favor of in-flow document return navigation (e.g. at the bottom of blog articles) and browser-native scroll dynamics, guaranteeing zero gesture or click collisions.
- **Custom Modal System**: Use `features/shared/components/CustomModal.tsx` for high-fidelity alerts and confirmations.
- **Interactive Feedback**: 
  - All server transitions must provide high-fidelity feedback (e.g., **Synchronization Overlays**, loading spinners).
  - Global loading screens utilize a lightweight, single-indicator **Modern Floating Card Dashboard Aesthetic** (`bg-white rounded-3xl border-slate-200/80 shadow-xl` with a crisp GPU-accelerated spinner and zero main-thread JS re-render overhead) to eliminate visual clutter and maximize performance during page transitions.
  - Page-level skeleton loading is preferred over redundant inline "Synchronizing Intel" indicators.
- **Module Focus Pattern**: For side-by-side utility modules (e.g., Input/Output), provide `Minimize2` / `Maximize2` buttons to collapse/expand modules, allowing users to focus on specific panes. Use `framer-motion` for smooth layout transitions. Ensure Framer Motion transforms do not conflict with Tailwind transform classes (use `style={{ x: ... }}` directly).
- **Mobile-First UX**:
  - **Strategic Grids**: Utilities transition from 1-column mobile to multi-column desktop/tablet (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
  - **Desktop Entry Screen Standard**: Single-page entry points (Home, Contact) utilize compact 100vh entry screens on desktop (`lg:h-screen lg:max-h-[100dvh] lg:overflow-hidden`) to eliminate scrollbars, while providing fluid vertical scrolling on handheld mobile devices.
  - **Touch Targets**: Enhanced padding and `active:scale-90` feedback for handheld training tools.
- **Mobile & Touch-Friendly Tooltip Architecture**: All info popovers and metric tooltips (`InfoTooltip`, `FactorTooltip`) MUST use a hybrid tap + hover architecture:
  - **Accessible Triggers**: Semantic `<button type="button">` triggers with `aria-label`, `aria-expanded`, and `touch-manipulation` (eliminating mobile 300ms double-tap delays).
  - **Touch Target Padding**: Expanded hit-targets via `p-1 -m-1` for comfortable touch on Android & iOS without distorting visual alignment.
  - **Stateful Tap & Click-Outside Dismissal**: Managed via local `isOpen` state in React: tap toggles the tooltip open/closed on mobile, while `onMouseEnter`/`onMouseLeave` retains instant desktop hover functionality. A global `pointerdown` listener dismisses active tooltips when tapping anywhere outside.
  - **Event Isolation**: Explicit `e.stopPropagation()` on buttons and wrappers prevents nested touch events from triggering parent card scale or navigation gestures.

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
- **Architecture**: Domain-driven feature in `features/liverpool/` fetching from TheSportsDB free API (`thesportsdb.com/api/v1/json/123/eventsnext.php?id=133602`) with 1-hour Next.js ISR revalidation, Upstash Redis caching (`CACHE_KEYS.LFC_FIXTURES`), and defensive data fallbacks.
- **Dynamic Redis Caching**: Caches raw API response to Upstash Redis with a dynamic TTL set to `strTimestamp + 1 day` of the imminent fixture, ensuring zero stale queries after matchday completion while providing <10ms response times. Includes manual `forceRefresh` cache invalidation via UI refresh button.
- **Next Matchday Focus**: Exclusively focuses on the imminent upcoming matchday with a prominent hero card (`NextMatchHero.tsx`), featuring a live countdown clock, official high-resolution team badges, stadium venue, and local timezone kickoff times.
- **Aesthetics & UI/UX**: Pure light model with Liverpool Red accents, signature textured canvas (`bg-slate-50/80 bg-dot-pattern`), `rounded-3xl` elevated floating hero card, calibrated bottom clearance (`pb-36 sm:pb-44`), and zero clutter (filters and redundant lists removed).
- **Integrations**: Google Calendar URL export (`createGoogleCalendarUrl`) for 1-click scheduling in user's local timezone.

### Blog System
- **Optimization**: Public routes use **Static Site Generation (SSG)** with absolute OG/Twitter metadata.
- **Editorial Cleanliness & Layout**: Confident centered editorial headline (`Insights for modern engineering`) paired with a minimalist control toolbar (category pills, compact search input, and clean sort selector).
- **Pristine 3-Column Grid**: Aspect ratio `4:3` rounded cards (`rounded-2xl sm:rounded-[1.5rem]`), 3-line clamped excerpts, and clean diagonal action links (`Learn More ↗` with `ArrowUpRight`).
- **Pagination & Skeletons**: Batch size standardized to **9 articles** (`PAGE_SIZE = 9`) supported by matching 3-column shimmering card skeletons during pagination.
- **Dynamic Filtering & Sorting**: Real-time article counters on category pills (*All, Tech, Finance, Running, General*) and 4-mode article sort selector (*Newest First, Oldest First, Quickest Read, Deepest Read*).
- **Interactive Tools**: Built-in `ShareButton` leveraging native Web Share API.
- **Syntax Highlighting**: 
  - Use **One Dark** Prism style for high-contrast and vibrant technical snippets.
  - Implement in both `BlogContent` (public) and `BlogForm` (editor preview) for WYSIWYG consistency.
- **Code Block Responsiveness**:
  - **Scrolling**: Mandate `overflow-auto` for both horizontal and vertical scrolling.
  - **Formatting**: Use `white-space: pre` to prevent line wrapping, preserving original code structure.
  - **Post-Article UX**: Centered "Post Actions" footer replacing legacy sidebar with high-fidelity share actions.
- **Blog Reading Page Architecture (`app/blog/[slug]/page.tsx`)**:
  - **Canvas & Atmosphere**: Signature light textured canvas (`bg-slate-50/80 bg-dot-pattern`) with floating card architecture.
  - **Proportional Hero Image**: Calibrated banner (`h-[36vh] sm:h-[44vh]`) with bottom gradient fade to prevent excessive vertical displacement and bottom navigation collisions.
  - **Overlapping Header Card**: `rounded-3xl sm:rounded-[2.5rem] bg-white border border-slate-200/80 shadow-xl` featuring breadcrumb navigation, category pill, `QuickSharePill` (Web Share + copy link), confident title, lede subtitle, and horizontal metadata strip (Author squircle, formatted calendar date, reading time with emerald clock, and word count).
  - **Modern Floating Reading Stage**: Article body encased inside an elevated floating container (`bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 lg:p-14 shadow-xs`) eliminating stark white voids.
  - **Interactive Table of Contents (`TableOfContents.tsx`)**: Automatic extraction of `h2`/`h3` headings with section counts, collapsible accordion, active scroll-spy, and smooth anchor navigation. Disambiguates duplicate headings via `HeadingSlugger` (`workout`, `workout-1`, `workout-2`) to guarantee unique DOM IDs.
  - **AST-Level Heading ID & Hydration Parity (`rehypeHeadingIds`)**: Compiles heading IDs directly onto the unified AST before React rendering passes, guaranteeing 100% pure and idempotent rendering without React hydration attribute mismatch errors.
  - **GFM Table Support & Responsive Containers**: Integrates `remark-gfm` with custom `table`, `thead`, `tbody`, `tr`, `th`, and `td` components wrapped in a responsive card (`not-prose overflow-x-auto my-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs bg-white`). Correctly honors column text alignments (`:---`, `:---:`, `---:`), renders bold/rich text in cells, and normalizes single-line collapsed tables (`| |` / `||`) via `normalizeMarkdown`.
  - **URL Autolinking & Interactive Code Pills**: Automatically autolinks plain text URLs with trailing punctuation isolation, and converts inline code URL highlights (`` `https://...` ``) into clickable pill badges with `ExternalLink` indicators opening in a new tab (`target="_blank" rel="noopener noreferrer"`). Automatically upgrades `http://www.` links to secure HTTPS.
  - **Typography & Callouts (`BlogContent.tsx`)**: Heading deep-link anchors (`#`), GitHub-style alert callouts (`[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`), responsive table containers, and styled blockquotes with emerald borders.
  - **Post-Article Engagement**: Author signature block with bio and links, interactive share block (`ShareButton.tsx`), 3-column related articles, and in-flow document return navigation ("Back to Top" alongside "Back to Insights") avoiding any floating button collisions with the global Search trigger (`SEARCH ⌘K`).
- **Markdown Editing Toolbar (`BlogForm.tsx`)**:
  - Organizes editing actions into clear visual clusters separated by subtle dividers:
    - *Headings & Typography*: `Heading2` (`## Section Heading` auto-syncing with TOC), `Bold`, `Italic`.
    - *Code & Links*: `Inline Code`, `Code Block`, `Hyperlink`.
    - *Structures & Scaffolding*: `Bullet List`, `Numbered List`, `Callout Note` (`> [!NOTE]`), `Table` (pre-scaffolded GFM table with alignment delimiters), and `Divider` (`---`).
  - Supports responsive `flex-wrap` and provides live preview parity with `BlogContent`.

### Task System
- **Modular Directory Organization**: Task system UI components are organized into logical sub-directories under `components/`: `agenda/` (forms, lists, filters, items), `analytics/` (charts, graphs, reports), `health/` (system checks), and `shared/` (task-specific loading skeletons, toasts, errors).
- **Tabbed Architecture**:
  - **Agenda**: Prominent `TaskProgress` (independent fetch, dynamic completion rates) and collapsible `HealthCheck`.
  - **Analytics (`GeneralReport`)**: Displays a permanently visible report panel with period filters (Today, Week, Month, 6 Months, All Time), using `AnalyticsDashboardSkeleton` as its loading state. The stats grid is enriched with Velocity (average completion rate) and Trend metrics (percentage change vs previous period, color-coded dynamically). Displays a clean "Awaiting Data" fallback when there are zero completed tasks.
  - **Supporting Intel Analytics Grid**: Balanced **3-column desktop / 2-column mobile matrix** (`grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-5`) replacing legacy 6-column squeezing. Metric typography structures primary values and secondary units with `items-baseline gap-1.5 whitespace-nowrap` to prevent awkward line-wrapping (e.g., `tasks`, `days`, `/ 100`, `tasks / day`). Cards feature semantic contextual status badges (`WEEK`, `ACTIVE`, `OPTIMAL`, `CYCLE`, `STEADY`, `RISING`/`FALLING`/`FLAT`) beside icon squircles.
  - **Weekly Review (`WeeklyReview`)**: Comprehensive retrospective assessing weekly completion velocity, focus time, and schedule discipline into an academic grade (A+ to D). Equipped with interactive `InfoTooltip` explainers across the Hero Banner (Completion Rate, Most Active Domain, Grade, Tasks Completed, Effort Neutralized), the 4 Metrics Cards (Objectives Met, Focus Time, Reschedules, Carried Forward), Sprint Audit telemetry, and Commander's Assessment.
  - **Analytics Telemetry Tooltips**: Both `GeneralReport` and `WeeklyReview` utilize the centralized mobile-friendly `InfoTooltip` component with touch-to-toggle and pointerdown dismissal.
- **Upcoming Range Scopes**: `Upcoming Filters with Range Toggle` in `TaskList.tsx` & `TaskFilters.tsx` supports 3 distinct horizons:
  - **7 Days** (`week` — default): Focused sprint awareness from today through the next 7 days.
  - **1 Month** (`month`): Mid-term milestone awareness from today through the next 30 days.
  - **All** (`all`): Comprehensive foresight displaying all scheduled upcoming tasks without upper date limits.
  - Persists selection seamlessly in query parameters (`?upcoming_range=all`) with 0ms optimistic UI toggle feedback and drag-and-drop reordering parity.
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
- **Global Intelligence Telemetry**: Clean 4-stat telemetry strip previewing core platform domains (`Engineering Blueprints`, `Market Sentiment`, `Matchday Center`, `Developer Toolkits`) with high-contrast typography, eliminating duplicate highlight pills.
- **Curated 2x2 Module Cards**: Floating cards with category pills, topic tags, high-contrast linkout arrows (`ArrowUpRight`), and organic spring hover interactions (`whileHover={{ y: -4 }}`).

### Investment Intelligence & Market Sentiment Hub
- **Architecture**: Domain-driven feature in `features/investment/` and `/investment` route tracking Fear & Greed sentiment, historical momentum, and composite market intelligence.
- **Global Telemetry Summary Strip**: 4-stat telemetry strip (`Market Sentiment`, `7-Day Velocity`, `Factor Alignment`, `Historical Anchor`) equipped with straight-to-the-point mobile-friendly tooltips.
- **Strategic Signal Banner**: Automated regime classification (`Composite Score`) based on sentiment thresholds with downward-opening info tooltip (`position="bottom"`) and accent boundary styling.
- **Componentized Factor Matrix Breakdown**: 8 individual quantitative indicator cards (`SentimentCard.tsx`) with dynamic Chart.js sparklines, semantic rating badges, and mobile-friendly `FactorTooltip` popovers:
  - *Market Momentum (S&P 500)*: S&P 500 vs. its 125-day moving average (bullish momentum when above).
  - *Market Momentum (S&P 125)*: 125-day rate of change in the S&P 500 gauging multi-month trend strength.
  - *Stock Price Strength*: Net ratio of NYSE stocks hitting new 52-week highs vs. 52-week lows.
  - *Stock Price Breadth*: McClellan Oscillator tracking advancing vs. declining NYSE trading volume.
  - *Put and Call Options*: CBOE 5-day put/call ratio measuring market fear vs. bullish call volume.
  - *Market Volatility (VIX)*: 50-day moving average of the VIX measuring expected 30-day volatility.
  - *Junk Bond Demand*: Yield spread between junk and investment-grade bonds (tighter spreads signal risk tolerance).
  - *Safe Haven Demand*: Difference between 20-day stock returns and treasury bond returns (stocks outperforming signals risk-on).

### Second Brain / Knowledge Graph
- **Architecture**: Local filesystem-backed (`content/brain/*.md`) knowledge management system.
- **Environment Behavior**: Read/Write in `development` mode (for local note-taking), Read-Only in `production` to accommodate serverless environments.
- **Graph Visualization**: Uses `react-force-graph-2d` loaded dynamically (`ssr: false`) for 2D network visualization of node connections.
- **Link Parsing**: Robust server-side regex engine parsing Obsidian-style wikilinks (`[[Note Title]]`) and frontmatter.
- **Access Control**: Write operations (create, update, delete) are strictly protected by `checkAdmin()` in `features/auth/actions.ts`.

### Adventures & Professional Showcase
- **Adventures**: High-fidelity logs for Running and Travel missions, utilizing solid floating card aesthetics and rich typography.
  - **Adventures Landing Hub (`/adventures`)**: Clean headline typography without gradient text, paired with a global telemetry stats strip (`65.9 km` Max Distance, `2,982 m` Peak Elevation, `10+` Destinations, `2` Canvas Engines) and solid benchmark telemetry cards.
  - **Running Performance (`/adventures/running`)**: Tracks metrics like distance, time, pace, and **elevation gain** for trail-specific milestones. Features a high-fidelity **Activity Detail Modal** with real Strava splits, light/dark themes, transparent canvas background export, and native **Web Share API** integration (`navigator.share` with rich summary text: `🏃 Morning Run • 10.02 km in 52m 14s`). Includes a **PersonalBestsSwipeCard** built on pure solid surfaces (zero blur glow orbs, zero gradient backgrounds) and one-click record copy actions.
  - **Travel Bucket List Tracker (`/adventures/travel`)**: Domain-driven logic in `features/travel/` featuring a consolidated 4-stat telemetry strip (`Countries`, `Completed`, `Wishlist`, `Postcards`), segmented filter toolbar (responsive pills + live search), 4:3 cards (`rounded-2xl sm:rounded-[1.5rem]`), and `PostcardModal` vintage airmail canvas generator.
  - **Postcard Modal Fixed 8:5 Landscape Ratio**: Postcards (`PostcardModal.tsx`) strictly enforce an **8:5 fixed landscape ratio** across both mobile and desktop viewports (`aspectRatio: "8/5"`, `maxHeight: "min(52vh, 480px)"`, `maxWidth: "min(100%, calc(min(52vh, 480px) * 1.6))"`), eliminating portrait collapse on mobile. The back face features responsive cursive handwriting sizing, stamp, postmarks, and ergonomic action buttons.
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
- **Stock Manager**: Re-engineered portal (`/utils/stock-explorer/admin`) featuring the **Modern Floating Card Header** and the **Operational Cache Telemetry & Control Card**:
  - *Header Controls*: Indigo `<Server />` squircle badge, title, pulsing active cache badge, and dedicated action triggers (`[↻ Refresh]`, `[🌐 Sync Live]`, `[🗑 Purge Cache]`).
  - *Full-Width Metric Grid*: Balanced 3-stat grid displaying Total Instruments (e.g. `963 equities`), Trading Settlement Date, and 12-Hour Redis TTL Lifespan.
  - *Defensive States*: Shimmering 3-card skeleton loader for zero CLS, and an amber alert banner with a direct *"Prime Cache Now"* CTA when cache is expired or empty.
  - *Manual Override*: Direct JSON file upload reader (`<input type="file" accept=".json" />`), JSON formatting utility, sample template loader (`BBCA`, `BBRI`, `BMRI`), <kbd>⌘/Ctrl+Enter</kbd> shortcut, and strict TypeScript types.
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
- `biome.json`: Strict linter and formatter covering all 311 files across `app/`, `features/`, `lib/`, `services/`, `types/`, and root configs
- `.env.development`: Development-specific environment variables
- `tailwind.config.js`: Optimized Tailwind CSS v4 configuration
- `postcss.config.mjs`: Enhanced with autoprefixer

## 📏 Engineering Standards
- **UI/UX Consistency**: All new or modified pages/components MUST strictly conform to [`ui-uix-guideline.md`](file:///c:/Work/Me/personal-web-v2/ui-uix-guideline.md) (Floating Cards, `bg-slate-50/80 bg-dot-pattern`, `bg-white` containers, `rounded-2xl` to `rounded-[2rem]`, pill badges, mobile-first responsive grids, and `pb-32 sm:pb-36` navigation clearance).
- **Strict Anti-Gradient & Anti-Emoji Mandates**: NEVER use gradient headers, gradient modal dialogs, multi-color gradient text, or ambient blur glow orbs. NEVER use raw unicode emojis in UI components, headers, or cards (always use scalable SVG icons from `lucide-react` or `react-icons`).
- **Feature-Module Cleanliness**: Domain logic and UI components strictly reside in `features/<domain>/`. Shared global UI components reside exclusively in `features/shared/components/`. Zero orphaned root `components/` folders.
- **Component Design**: Prefer clean abstractions. Use `use client` only when necessary.
- **Defensive Data Handling**: Always implement safety fallbacks and type-casting (e.g., `String(val || "")`) when processing external API data to prevent runtime `TypeError` on missing fields.
- **SEO & Metadata**: Every route must implement `generateMetadata` using `createMetadata` helper in `lib/shared/metadata.ts`.
- **Error Tracking & Monitoring**: Sentry is configured for client (`instrumentation-client.ts`), server (`sentry.server.config.ts`), and edge environment tracking (`sentry.edge.config.ts`), integrated via Next.js instrumentation (`instrumentation.ts`). Sentry builds use `silent: true` to suppress noisy missing source map warnings from Turbopack internal chunks.
- **Git Workflow**: Follow **Conventional Commits**.
- **Linter & Formatter**: **Biome** for strict full-repository formatting and linting (`311 files, 0 warnings, 0 errors`).
- **Performance Tools:** Bundle analyzer, profiling scripts, and optimized configurations.
- **Commit/Push Policy**: **NEVER** stage, commit, or push changes unless explicitly requested by the user for each occurrence.
