# AI Agent Project Context & Mandates

This document provides foundational context for any AI coding assistant (e.g., Claude, GPT, Gemini, Grok, Mima, Copilot) to ensure architectural consistency, security, and efficiency across the codebase.

> [!IMPORTANT]
> **Strict UI/UX Guideline Compliance Mandate**:
> Whenever creating a new page, revamping an existing page, or adjusting any UI component, agents **MUST** strictly follow the design principles, visual patterns, and architectural rules defined in [`ui-uix-guideline.md`](file:///c:/Work/Me/personal-web-v2/ui-uix-guideline.md).
> - **Design Standard**: Modern Floating Card dashboard aesthetic (`bg-white`, `border border-slate-200/80`, `rounded-2xl` / `rounded-3xl` / `rounded-[2rem]`, `shadow-xs` to `shadow-xl`).
> - **Canvas**: Light textured canvas (`bg-slate-50/80 bg-dot-pattern`) with airy hero layout (`pt-24 sm:pt-32`).
> - **Mobile-First & Responsiveness**: Scaled grids (`grid-cols-1 md:grid-cols-2 lg/xl:grid-cols-3`), mobile touch targets, and proper floating bottom bar clearance (`pb-32 sm:pb-36`).
> - **Form & Search Hygiene**: Explicit input icon layering (`pointer-events-none z-10` with `pl-10`/`pl-11`).
> - **Strict Anti-Gradient, Anti-Emoji, Anti-Sparkles, Anti-AI-Slop, Clean Header, Card Action Hygiene, Metric Anti-Redundancy & Pure White Container Mandates**: Zero gradient headers, zero gradient modals, zero multi-color gradient typography, zero ambient blur orbs (`blur-3xl`), zero raw unicode emojis, and zero `Sparkles` / AI-slop icons (`Sparkles` is strictly blacklisted forever sitewide without exception; always use domain-specific icons). Furthermore, strictly forbid `'•'` or `'·'` (middots) as separators, ban compound slogan badges (`CATEGORY • marketing sublabel`), eliminate redundant marketing subtitles, and prohibit repetitive decorative category sections/pills above titles (`Market Guideline`, `Engineering Journal`, `Performance Hub`). Headers follow the **Clean Header Standard**: breadcrumbs at top, bold title `h1`, straight-to-the-point description (`p`), and right-aligned buttons or telemetry stats strip. Cards follow the **Card Action Hygiene Standard**: zero duplicate navigation triggers (never pair a top-right arrow button with a bottom `Launch` action), zero generic `rounded-full` category tags, and top-right slots reserved strictly for real-time metric pills (`rounded-lg`/`rounded-md`). Functional data cards follow the **Metric Anti-Redundancy & Zero Fluff Standard**: zero redundant metrics (never pair Pace and Speed in the same card), zero decorative benchmark slogans/taglines (e.g. no "Tempo Benchmark"), pure white containers for standard dashboard cards (`bg-white rounded-3xl`, strictly prohibiting monolithic dark-mode cards), restrained typography (`text-5xl/6xl`, avoiding `7xl/8xl` giant text), and the **Minimalist Frameless Milestone Selector** pattern (subtle track line with thin Framer Motion `layoutId` sliding underline over bulky enclosed pill boxes).

## 🛠 Tech Stack
- **Framework:** Next.js 16.3.5 (App Router) & React 19.3.0
- **Language:** TypeScript 5.9.3
- **Package Manager:** pnpm 12.4.2
- **Database:** Supabase (Auth, PostgreSQL)
- **Real-time Config:** Firebase Remote Config
- **Cache/Session:** Upstash Redis
- **Error Tracking:** Sentry (Next.js SDK - production-only telemetry isolation)
- **CI/CD & Auditing:** GitHub Actions + Vercel Cron + Lighthouse CI (`.lighthouserc.js`)
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
- **Sentry Build & Runtime Isolation:**
  - **Build Plugin:** `withSentryConfig` conditionally enabled only for production releases (`VERCEL_ENV === "production"` or `ENABLE_SENTRY_BUILD=true`) with `deleteSourcemapsAfterUpload: true`.
  - **Strict Production Runtime Guard:** Sentry error reporting and logging are strictly isolated to production (`enabled: process.env.NODE_ENV === "production"`) across server (`sentry.server.config.ts`), edge (`sentry.edge.config.ts`), and client (`instrumentation-client.ts`).
  - **Request & Exception Interception:** Next.js request error hook (`onRequestError` in `instrumentation.ts`) and global error handler (`GlobalError` in `app/global-error.tsx`) are guarded to only capture exceptions when `NODE_ENV === "production"`, preventing local dev errors and testing crashes from triggering Sentry events or polluting telemetry.
- **Vercel Serverless Harmony:** Removed custom Webpack `splitChunks` and manual cache directory overrides to let Next.js & Vercel manage route-level chunking and remote caching natively
- **Bundle Analysis:** `pnpm run build:analyze` for bundle size optimization
- **pnpm Upgrade:** v12.4.2 with improved dependency resolution and native binary performance
- **Image Optimization:** Enhanced device sizes, formats (AVIF/WebP), and caching
- **TypeScript:** Incremental compilation with performance optimizations

## 📂 Project Structure (Feature-Module Architecture)
The project follows a modular, domain-driven structure to ensure scalability and isolation.

### 1. `features/` (Domain Layer)
Contains all business logic, components, and types for specific features.
- `features/adventures/`: Running logs & Strava activity hub (`ActivityDetailModal` with Web Share API, `PersonalBestsSwipeCard` with pure white floating card architecture, minimalist sliding-underline milestone track, clean 3-metric strip, swipe/keyboard navigation, verified data telemetry, run canvas exports, split pacing breakdown).
- `features/auth/`: Actions, `PinGuard.tsx`, and auth-specific components.
- `features/blog/`: Actions, data fetching, dynamic category counts, sort controls, and all blog UI components.
- `features/contact/`: Compact single-page contact & direct inquiry hub (`ContactView.tsx`) adhering to the Desktop Entry Screen Standard (`lg:h-screen lg:max-h-[100dvh] lg:overflow-hidden`). Left column (5 cols): Active status chip with organic `animate-ping` liveness indicator, bold typography headline (`"Let's build something worth shipping."`), sub-copy, unified 2-column floating card widget for Location (`Toba, ID`) and live Jakarta clock (`Asia/Jakarta`), system version pill, and relative timezone calculator (`{diffHours}h ahead/behind you` or `Same timezone`). Right column (7 cols): Floating inquiry topic card (`rounded-[2rem]`) with 4 pre-composed presets (`Handshake`, `Briefcase`, `Cpu`, `Coffee`) compiling dynamic `mailto:` parameters, and a 2x2 grid of direct contact channels (Email, Telegram, LinkedIn, GitHub) featuring domain icon squircles, one-click clipboard copying with toast feedback, and diagonal external linkout actions (`ArrowUpRight`).
- `features/home/`: Compact Profile Layout / Widget Dashboard — symmetric `lg:grid-cols-12` split (6/6: content left, metrics right) inspired by ContactView. Left column: scalable 64px to 80px rounded avatar with grayscale-to-color hover transition, active status chip with pulsing dot, bold typographic headline (`"Engineering systems by day. Miles everywhere."`), short bio, and a 2-column floating card widget for Location and live Jakarta time. Right column: "Professional Impact" metrics panel (strict symmetric 3-column dense grid) and Direct Channels grid (Explore Work, Contact, GitHub, LinkedIn) with touch-optimized hover actions. No massive full-bleed photo, no `TiltCard`, no giant bento tiles. Pure, dense, high-contrast dashboard aesthetic. Desktop: `lg:h-screen lg:max-h-[100dvh]` zero-scroll entry. Identity: **Polma Tambunan**. Tagline: `"Engineering Systems. Miles Everywhere."` Each data point appears exactly once.
- `features/insights/`: Insights hub module aggregator (Blog, Investment, Liverpool FC, Utils) with top telemetry summary strip.
- `features/investment/`: Risk-first market intelligence and capital preservation hub. Powered by Decision Engine v2 (modular composite scoring for IHSG, Crypto, and Global Macro in `features/investment/lib/engine/`), Tactical Permissions Matrix, Execution Playbooks (IHSG & Crypto scripts with Safe Bucket 40% anchor), Disciplined Rebuild Rulebook (Buckets, 6 Golden Rules, Circuit Breakers, Hard Bans, 5 Gates, Recovery Math), auto-expiring Event Calendar & Seasonality, and a 5-tab Market Data Terminal (Indonesia IDX, Crypto Majors, Global Macro, Global Quotes, Sentiment Dials). Strictly reader-only.
- `features/liverpool/`: Actions, types, and Matchday Hub components (`NextMatchHero.tsx`, `FixtureSkeleton.tsx`, `View.tsx`).
- `features/portfolio/` & `features/work-experience/`: Professional showcases, career timeline, interactive project cards, skills radar/metrics.
- `features/reminders/`: Quick Reminders actions, types, linkified text pills, keyboard shortcuts (<kbd>⌘/Ctrl+Enter</kbd>), one-click note copying, and duration extensions backed by Upstash Redis.
- `features/tasks/`: Actions, analytics, types, utils, 6-month date horizon, optimized `TaskProgress`, and task UI components structured under logical `components/` subdirectories (`agenda/`, `analytics/`, `health/`, `shared/`).
- `features/travel/`: Components, types, static destinations data, and `PostcardModal` vintage airmail canvas generator for the Travel Bucket List Tracker. Wishlist and expedition cards follow a clean layout without any "spoiler" masking or gated reveals.
- `features/utils/`: High-fidelity developer utilities organized across 7 functional categories (`data-tools/`, `file-tools/`, `fun-tools/` including `social-canvas` faceless social media card studio with 17 templates across 4 categorized groups, breaking news lower-thirds, classy offset typography, dynamic light/dark text themes, and client-side canvas generation, `security-tools/`, `stock-tools/`, `text-tools/`, `time-tools/`), all unified under the canonical `UtilHeader.tsx` 3-tier floating card header standard.
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
- `app/contact/`: Compact single-screen contact & direct inquiry page (`ContactView.tsx`) with real-time Jakarta clock, relative timezone offset, 4 inquiry presets, and direct contact channels.
- `app/insights/`: Analytical insights aggregator hub page.
- `app/investment/`: Market sentiment and Fear & Greed visualizations.
- `app/liverpool/`: Matchday Schedule & Fixtures Hub with live countdowns and matchday reports.
- `app/login/`: Admin PIN login interface.
- `app/portfolio/` & `app/work-experience/`: Professional showcase and career timeline.
- `app/tasks/`: Personal task management, 6-month horizon, and analytics agenda.
- `app/unauthorized/`: Fallback access-denied page.
- `app/utils/`: High-fidelity developer utilities index across 7 functional categories and 22 dedicated utility tools (including Faceless Social Canvas at `/utils/social-canvas`).
- `app/api/tasks/cron/`: Secure API endpoint for scheduled task reminders.
- `app/api/mock/`: Dynamic path-based mocking engine endpoints (`app/api/mock/[...path]` catch-all and `app/api/mock/manage` management API with strict 15 active endpoint limitation).
- `app/api/strava/`: Strava OAuth callback, sync, and split routes.
- `app/api/auth/refresh-session/`: Proactive Redis session & Supabase token synchronizer.
- `app/sitemap.ts` & `app/robots.ts`: Centralized search indexing and crawler configuration. All public navigation routes (`/`, `/portfolio`, `/work-experience`, `/adventures/*`, `/blog`, `/liverpool`, `/insights`, `/investment`, `/utils`, `/contact`) are registered in `sitemap.ts`. Internal administrative and API endpoints (`/admin/`, `/api/`, `/tasks`, `/login`, `/private/`) are explicitly disallowed in `robots.ts` to focus crawl budgets on public content.
- `app/page.tsx` (Home): Injects `PERSON_SCHEMA` JSON-LD (`<script type="application/ld+json">`) for Google Knowledge Panel and rich result eligibility. Metadata title: `"Polma Tambunan | Software Engineer & Distance Runner"`. Description pulls `SITE.description` (keyword-rich ~150-char SEO copy). Keywords injected from `SEO.baseKeywords`.

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
- **Proxy / Session Synchronizer (`proxy.ts`)**: 
  - Intercepts non-static routes to refresh Supabase tokens and sync Redis session TTL.
  - Implements a fast-path cookie check (`sb-*` / `app_session`) before instantiating the Supabase client to bypass auth lookups on anonymous visitors, eliminating unnecessary roundtrip latency and client overhead.
  - Expected missing sessions (`Auth session missing!`) are handled silently and must NEVER be logged as server warnings.

## 🎨 UI/UX Patterns
- **Next.js 16 Route Transition & Smooth Scrolling**: Whenever `scroll-behavior: smooth` is defined in CSS, `<html lang="en">` in `app/layout.tsx` MUST declare `data-scroll-behavior="smooth"`. This enables Next.js 16 to disable smooth scrolling during route transitions, preventing scroll stutter and console warnings.
- **Framer Motion SVG Attribute Hygiene**: Interactive SVG elements animated with Framer Motion (e.g. `<motion.circle>`, `<motion.path>`) MUST define their initial base SVG attributes (e.g., `strokeWidth={30}`) and/or `initial={false}`. Never animate attributes from an uninitialized state, which causes Framer Motion to throw runtime `unanimatable value` warnings.
- **Core Web Vitals, Responsive Sizes & LCP Image Preloading**: Top above-the-fold cards (such as the first card in destination or activity grids, `index === 0`) must declare `priority={index === 0}` and `loading={index === 0 ? "eager" : "lazy"}` to prioritize Largest Contentful Paint (LCP) and avoid lazy-loading penalties. Additionally, ALL Next.js `<Image fill />` components across the codebase MUST declare responsive `sizes` props (e.g., `sizes="(max-width: 640px) 100vw, ..."` or explicit sizes like `sizes="48px"`) to prevent browser over-fetching and console diagnostics.
- **Solid Productivity Pattern & Pure White Container Standard (Anti-Monolithic Dark Mode)**: 
  - Standard panels, operational views, and telemetry showcases rely strictly on pure white containers (`bg-white border border-slate-200/80 rounded-3xl shadow-xs`).
  - Full-bleed dark slate banners (`bg-slate-900 border-b border-slate-800`) and monolithic dark-slate content dashboards are strictly prohibited across the application — they feel oppressive, clash with the signature light textured canvas (`bg-slate-50/80 bg-dot-pattern`), and hurt legibility. Dark slate panels (`bg-slate-900`) are reserved exclusively for isolated high-priority metric widgets (such as the Total Pending backlog counter in Tasks), technical code blocks, or specialized transparent sticker canvas exports.
- **Metric Anti-Redundancy & Functional Data Hygiene Standard**:
  - Telemetry trays and functional data cards must NEVER display redundant, converted, or duplicate metrics representing the same physical dimension. In running and endurance cards, NEVER show both "Pace" (min/km) AND "Speed" (km/h) simultaneously — pace already conveys endurance speed. Keep metric strips essential, concise, and non-repetitive (e.g. 3-metric strip: Pace, Distance, Elevation).
- **Zero Marketing Fluff Mandate in Data Displays**:
  - NEVER inject compound marketing fluff, decorative benchmark badges, or pompous slogans into functional data cards (e.g., "Tempo Benchmark", "Pinnacle Achievement", "Elite Velocity"). Data cards let raw numbers and verified telemetry speak for themselves. State record types plainly (`10K`, `Chip Time`, `All-Time`) with zero hype.
- **Minimalist Frameless Milestone & Timeline Selector Standard**:
  - Interactive milestone and timeline switchers must avoid heavy, boxed-in segmented pill containers (`bg-slate-100 p-1.5 rounded-2xl`). Standardize on the open frameless track pattern: a continuous hairline track line (`h-[2px] bg-slate-100 rounded-full`), clean icon-labeled milestone triggers (`text-[11px] sm:text-xs font-bold`), and a razor-thin animated sliding underline indicator line (`h-[2px] bg-slate-900 rounded-full z-20`) driven by Framer Motion `layoutId` with spring physics.
- **Restrained Typographic Scale in Cards**:
  - Avoid over-scaled, brutalist typography (such as `text-7xl` or `text-8xl` giants) inside standard cards. Primary telemetry figures must remain confident, well-proportioned, and readable (`text-5xl sm:text-6xl font-black font-mono` for hero times/records), leaving generous whitespace and optical balance.
- **Modern Floating Card Header Standard (Clean Header Architecture)**:
  - Encapsulates hero headers within elevated floating cards (`bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs`) resting on the signature textured canvas (`bg-slate-50/80 bg-dot-pattern`).
  - Standardized across all management, intelligence, operational views, and utility tools: Admin Hub (`/admin`), Blog Management (`/admin/blog`), Blog Editor (`/admin/blog/editor`), Quick Reminders (`/admin/reminders`), Stock Registry (`/utils/stock-explorer/admin`), Tasks Agenda (`/tasks`), Market Intelligence (`/investment`), and all 22 Developer Utilities (`/utils/*`).
  - **No Repetitive Category Section/Pills**: Prohibits generic decorative category pills/squircles (e.g. `Market Guideline`, `Engineering Journal`, `Performance Hub`) placed above titles. Standardizes headers to clean contextual breadcrumbs (`Admin Dashboard › ...` or `Home › Insights › Blog`), bold title typography `h1`, straight-to-the-point description (`p`), and right-aligned buttons or telemetry stats strip. Zero compound slogan badges with `•` or `·`, zero AI-slop subtitles, and zero `whitespace-nowrap` blowouts on mobile viewports.
  - **Spacious 3-Tier Utility Header Standard (`UtilHeader.tsx`)**: Applied across all 22 utility tools to eliminate title squishing and horizontal action collisions:
    - *Tier 1 (Navigation Bar)*: Contextual breadcrumbs (`Home › Utilities › Tool Name`) left-aligned and clean, compact `← Back to Utilities` right-aligned, separated from content by a subtle bottom divider (`pb-4 border-b border-slate-100`).
    - *Tier 2 (Hero Title & Context Stage)*: Tool-specific squircle anchor (`w-11 h-11 sm:w-14 sm:h-14`), full-width `h1` headline (`text-xl sm:text-3xl lg:text-4xl break-words`), and straight-to-the-point description directly underneath.
    - *Tier 3 (Dedicated Actions/Presets Toolbar)*: When interactive presets, scenarios, or export controls are provided, they span a dedicated full-width strip (`pt-4 border-t border-slate-100/90`), keeping the title area spacious and completely unconstrained.
  - Declares calibrated top clearance (`pt-20 sm:pt-24` or `pt-24 sm:pt-28`) ensuring fixed floating navigation switchers (such as `QuickNav` in Tasks) never overlap or clip header titles.
  - **Single Canonical Floating Card Architecture**: Parent admin views (e.g., `/admin/blog`) must NEVER wrap already-contained card components in nested card containers with duplicate borders. Lists, tables, and consoles maintain a single canonical `rounded-3xl border border-slate-200/80 shadow-xs` surface.
- **Card Action & Trigger Hygiene Standard (Anti-Redundant Action Mandate)**:
  - NEVER provide duplicate external link or launch triggers in the same card (e.g., placing an arrow icon button `↗` in the top-right header while simultaneously rendering `Launch Console ↗` or `Launch →` in the footer).
  - Every card must have ONE unambiguous primary interaction trigger:
    - If the whole card container is wrapped in a `<Link>` or already provides a footer action (`Launch →`), do NOT add a redundant top-right squircle or circular arrow button.
    - Top-right corners are reserved strictly for real-time telemetry metrics (`6 Published / 9 Draft`, `4 Pending / Active Backlog`, `IDX Live / Redis Engine`) or distinct secondary actions (`+ New Article`).
  - Banish generic `rounded-full` pills for repetitive category names in card corners (e.g., `PUBLISHING`, `EXECUTION`, `UTILITY REGISTRY`). These create visual noise and dilute real metrics.
  - Telemetry badges must use compact, high-contrast, discrete containers (`rounded-lg` or `rounded-md`, e.g. `bg-slate-50 border border-slate-200/70 text-[11px] font-mono`) and represent concrete state (counts, ratios, connection status), not ornamental category labels.
- **Floating Widget & Anti-Collision Hygiene**:
  - The bottom-right viewport area is strictly reserved for the global command palette trigger (`SEARCH ⌘K`).
  - Redundant floating widgets (such as floating `BackToTop` pills and floating scroll progress HUDs) are eliminated in favor of in-flow document return navigation (e.g. at the bottom of blog articles) and browser-native scroll dynamics, guaranteeing zero gesture or click collisions.
- **Custom Modal System**: Use `features/shared/components/CustomModal.tsx` for high-fidelity alerts and confirmations.
- **Direct Icon-Beside-Title Card Layout (Hub & Aggregator Cards):** In navigation hub, insight aggregator, and admin module cards, the domain icon squircle MUST be placed **directly inline to the left of the card title** in a single `flex items-start gap-3` row — NOT stacked above it. Metric/telemetry pills (count badges) are right-aligned in the same row via `ml-auto`. Do NOT surround the icon with a separate `rounded-full` category badge stacked above the title. The icon IS the visual anchor for the title. Applies to: `/insights` hub cards, `/adventures` module cards, `/admin` command cards. See `ui-uix-guideline.md §17` for the full layout spec.
- **Interactive Feedback**: 
  - All server transitions must provide high-fidelity feedback (e.g., **Synchronization Overlays**, loading spinners).
  - **Global Page-Transition Loading (`app/loading.tsx`) — Brand-Monogram Standard**: The Next.js App Router Suspense fallback MUST use the minimalist brand monogram mark (`PT`) centered in a `w-12 h-12 rounded-2xl bg-white border border-slate-200/80 shadow-md` floating card over the signature textured canvas (`bg-slate-50/70 backdrop-blur-xs bg-dot-pattern`). Features a soft ambient breathing ring (`animate-ping bg-indigo-500/10 opacity-35`) and an emerald liveness dot pip (`animate-ping bg-emerald-400`). **NEVER** add an explicit `"Loading"` text label, a CSS spinner wheel, or any third-party loader component. The entire overlay is `pointer-events-none`. See `ui-uix-guideline.md §24` for the full spec and implementation reference.
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
- **2-Color Palette Mandate:** The nav bar strictly uses only `slate-900` (active pill) and `slate-*` neutrals (inactive). `rose-500` is the sole permitted accent, reserved exclusively for the admin pending badge pip. Per-section accent colors (indigo, emerald, amber, rose per nav group) are **forbidden** — the `accentColor` field has been removed from the `NavItem` type entirely.
- **Compact Footprint:** Bar padding is `p-1`, icon containers are `w-7 h-7` (15–16px icons), button min-width is `44–52px`. Shell is `bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/70` with a lightweight shadow.
- **Sub-Menu Strategy:**
  - "Insights" contains Blog, Investment, Liverpool FC, and Utils.
  - "Admin" contains Tasks, Blog Editor, Stock Manager, and Quick Reminders with dynamic count badges.
  - Submenu pop-over is `bg-white rounded-xl w-48` (compact). Active rows use unified `bg-slate-900 text-white rounded-lg` — no per-category accent colors.
- **Click Pass-through**: Outer `<motion.nav>` uses `pointer-events-none` and the inner bar uses `pointer-events-auto` to prevent the floating workspace container from blocking clicks on underlying page content.
- **SSR & Hydration Strategy**: Avoids returning `null` before mounting. Default public navigation links render server-side (SSR) to preserve SEO internal links and prevent a visual pop-in layout shift, updating dynamically after client-side authentication checks.
- **Optimized Queries**: Pending task count queries only fetch on auth status changes, rather than firing on every page navigation.
- **Dynamic Hover Detection**: Attaches a media query listener to `window.matchMedia("(hover: hover)")` to dynamically adapt UI hover states in real-time.

## 📝 Content Systems

### Liverpool FC Matchday Hub
- **Architecture**: Domain-driven feature in `features/liverpool/` fetching from TheSportsDB free API (`thesportsdb.com/api/v1/json/123/eventsnext.php?id=133602`) with 1-hour Next.js ISR revalidation, Upstash Redis caching (`CACHE_KEYS.LFC_FIXTURES`), and defensive data fallbacks.
- **Dynamic Redis Caching**: Caches raw API response to Upstash Redis with a dynamic TTL set to `strTimestamp + 1 day` of the imminent fixture, ensuring zero stale queries after matchday completion while providing <10ms response times. Includes manual `forceRefresh` cache invalidation via UI refresh button.
- **Next Matchday Focus**: Exclusively focuses on the imminent upcoming matchday with a prominent hero card (`NextMatchHero.tsx`), featuring a live countdown clock, official high-resolution team badges, stadium venue, and local timezone kickoff times.
- **Aesthetics & UI/UX**: **Zero-Scroll Full Viewport Standard** (`h-[100dvh] max-h-[100dvh] overflow-hidden` on both mobile and desktop), pure light model with Liverpool Red accents, signature textured canvas (`bg-slate-50/80 bg-dot-pattern`), and calibrated bottom clearance (`pb-24 sm:pb-28`) clearing `CompactBottomBar`.
- **3-Zone Card Architecture (`NextMatchHero.tsx`)**: The match card is divided into three distinct visual zones:
  - **Zone A (Head Strip)**: Domain badge pill (`Matchday Hub / ${fixture.competition}`) with red squircle `Trophy` icon, right-aligned home/away context chip (red pulsing dot for Anfield / neutral for away). No fixture title headline — team names are shown beneath each crest only.
  - **Zone B (Clash Arena)**: Side-by-side team crests in enlarged squircle containers (`w-20 h-20 sm:w-28 sm:h-28 rounded-3xl`). LFC's crest side receives a red-tinted background (`bg-red-50/70 border-red-100`) when Liverpool is the home team. VS badge is a dark `bg-slate-900` pill with `text-white font-black`. Subtle `hover:scale-[1.04]` lift on each crest.
  - **Zone C (Countdown Tray)**: Recessed `bg-slate-50/90` tray with a `CountdownTile` sub-component for each unit. When imminent (`days === 0 && hours < 2`), the seconds tile turns `bg-red-600 text-white` for urgency. When `isPassed`, a pulsing `MATCHDAY IN PROGRESS` live badge with an `animate-pulse` dot replaces the HUD. Metadata strip below: date, local time, stadium, and relative time.
- **Integrations**: Google Calendar URL export (`createGoogleCalendarUrl`) for 1-click scheduling in user's local timezone. CTA uses `CalendarPlus` icon.

### Blog System
- **Optimization**: Public routes use **Static Site Generation (SSG)** with absolute OG/Twitter metadata.
- **Modern Floating Card Header Standard (`/blog`)**: Elevated card (`bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs`) with contextual breadcrumb navigation (`Home › Insights › Blog`), indigo squircle anchor (`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 border border-indigo-200/70 text-indigo-600 shadow-2xs`) with `BookOpen`, domain theme badge (`ENGINEERING JOURNAL • architecture & distributed systems`), high-contrast `h1` headline (`Engineering Insights`), and responsive 3-metric telemetry strip (`Articles`, `Domains`, `Words`).
- **Pristine 3-Column Floating Article Grid**: Symmetrical floating cards (`rounded-3xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300`) featuring `aspect-[16/10]` responsive image containers, clean category/featured badges, paired calendar date and reading time telemetry row, 3-line clamped excerpts, word count, and tactile `Read Article` CTA button with `ArrowUpRight` micro-interaction.
- **Pagination & Skeletons**: Batch size standardized to **9 articles** (`PAGE_SIZE = 9`) supported by matching 3-column shimmering card skeletons during pagination.
- **Dynamic Filtering & Sorting**: Real-time article counters on category pills (*All, Tech, Finance, Running, General*) with `touch-manipulation`, explicit search input layering hygiene (`pointer-events-none z-10` with `pl-10`), and 4-mode article sort selector (*Newest First, Oldest First, Quickest Read, Deepest Read*).
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
- **Blog Management Portal (`app/admin/blog/page.tsx`)**:
  - **Modern Floating Card Header**: Anchored by a blue squircle icon (`w-12 h-12 rounded-2xl bg-blue-50 border-blue-200/70 text-blue-600 shadow-2xs`) with `BookOpen`, domain badge (`KNOWLEDGE BASE MANAGEMENT • publishing console`), contextual breadcrumbs (`Admin Dashboard › Manage Blog`), and direct dual actions: `View Public Blog ↗` (opens live `/blog` in a new tab) and solid dark `Create New Post` (`bg-slate-900 text-white hover:bg-slate-800`).
  - **4-Tile Interactive Telemetry KPI Strip**: Server-rendered 4-column desktop / 2-column mobile strip (`Total Articles`, `Published`, `Drafts`, `Headlines`) functioning as 1-click filter links (`?status=published`, `?status=draft`, `?headline=true`, reset) with active focus rings and elevated backgrounds. Featured headlines strictly use `Star` (never `Sparkles`).
  - **Single Canonical Floating Card Architecture**: Eliminates redundant outer card wrapping around `DynamicAdminBlogList`. The table, toolbar, search, and bulk operations live inside a single floating card (`bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden`).
  - **Refined Skeleton**: `BlogListSkeleton` matches the rounded-3xl geometry, toolbar height, and shimmer animation.

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
- **Full-Width Alignment & Creation Card**: Full-width container (`w-full space-y-6 sm:space-y-8`) matching `/admin/reminders` (`max-w-5xl`). Features an elevated creation card with an Amber squircle badge (`w-12 h-12 rounded-2xl bg-amber-50 border-amber-200/70 text-amber-600`), live character counter, segmented TTL duration track (`1 Day`, `1 Week`, `1 Month`), and solid dark submit button (`bg-slate-900 text-white hover:bg-slate-800`) with `<kbd>⌘/Ctrl + Enter</kbd>` shortcut.
- **Modern Floating Controls Toolbar**: Segmented filter track with dynamic counter badges (`All`, `Expiring Soon`, `1 Day`, `1 Week`, `1 Month`), active filter summary text, and search input with explicit icon layering (`pointer-events-none z-10`, `pl-10`).
- **Accent Line Reminder Cards**: 1.5px solid top border accents indicating expiry state (`amber-500` for expiring soon, `sky-500` for 1D, `indigo-500` for 1W, `purple-500` for 1M), tactile duration extension pills (`+1D`, `+1W`, `+1M`), one-click note copying, and URL autolinking into interactive pills.
- **Two-Step Delete Confirmation**: Integrated with `CustomModal` (`variant="danger"`), featuring loading spinners on both the modal confirmation button and the card's delete action button to prevent accidental note purges.
- **Consistent Relative Timestamps**: Enforces concise creation timestamps (`formatCreatedTime`), standardizing items created within the last 60 seconds to `Created < 1 min ago` with `whitespace-nowrap` to prevent card footers from wrapping into multi-line layouts.
- **Redis TTL Lifespan**: Backed by Upstash Redis with selectable expiration lifespans (1 Day, 1 Week, 1 Month) and automatic key expiration.
- **Navigation Badge**: Displays dynamic pending reminder counts in `CompactBottomBar.tsx` Admin submenu.

### Stock Explorer Manager (`/utils/stock-explorer/admin`)
- **Architecture**: In-memory IDX stock dataset manager and Redis synchronizer (`app/utils/stock-explorer/admin/page.tsx`).
- **Modern Floating Card Header Standard**: Anchored by an indigo squircle icon (`w-12 h-12 rounded-2xl bg-indigo-50 border-indigo-200/70 text-indigo-600 shadow-2xs`) with `Database`, domain badge (`FINANCIAL REGISTRY • idx market synchronization`), breadcrumbs (`Admin Dashboard › Stock Registry`), and `Back to Explorer` button.
- **Redis In-Memory Registry Telemetry**: Real-time cache indicator (`Active Cache` with pulsing dot, `Verifying`, or `No Cache / Expired`), operational action triggers (`Refresh Status`, `Sync Live` with live radio indicator, and `Purge Cache` modal trigger), and 3 telemetry tiles (`Total Instruments`, `Trading Session`, `Cache Lifespan`).
- **Dismissible Manual Override Notice**: Protocol notice with `ShieldCheck` explaining fallback manual JSON priming when cloud datacenter IPs are blocked by IDX.
- **Interactive JSON Console**: Empty state dashed dropzone (`Paste JSON or Drop File Here`), multi-preset sample triggers (`Sample Banks`, `Sample Tech` using `LayoutTemplate` — strictly no `Sparkles`), syntax formatting tool, character/line counter, and `<kbd>⌘/Ctrl + Enter</kbd>` import shortcut.
- **Searchable Pre-Import Inspector Drawer**: Aggregated session date, total trading volume, turnover value (Rp), detected instrument count, and a collapsible sample table with **real-time ticker search filtering** for previewing instruments before committing to Redis cache.

### Insights Hub
- **Architecture**: Centralized aggregator at `/insights` (`features/insights/`) consolidating Blog, Investment sentiment, Liverpool FC Matchday Hub, and Developer Utilities.
- **Global Intelligence Telemetry**: Clean 4-stat telemetry strip previewing core platform domains (`Engineering Blueprints`, `Market Sentiment`, `Matchday Center`, `Developer Toolkits`) with high-contrast typography, eliminating duplicate highlight pills.
- **Curated 2x2 Module Cards**: Floating cards with category pills, topic tags, high-contrast linkout arrows (`ArrowUpRight`), and organic spring hover interactions (`whileHover={{ y: -4 }}`).

### Investment Compass & Market Intelligence Hub (`/investment`)
- **Architecture**: Domain-driven feature in `features/investment/` and `/investment` route, completely overhauled into a risk-first capital preservation and condition understanding hub designed for disciplined portfolio recovery after severe drawdowns (~80%). Strictly reader-only for visitors (no trade journals or database mutation forms).
- **Decision Engine v2 Architecture (`features/investment/lib/engine/`)**:
  - Modular, deterministic engine decoupling market scoring into isolated domain evaluators:
    - `states.ts`: Threshold evaluation mapping composite scores into 4 states: `risk_on` (≥ 65), `selective` (45–64), `defensive` (30–44), and `stress` (< 30).
    - `ihsg.ts`: Multi-factor composite scoring for Indonesian equities weighting 200-day MA trend (35%), 50-day MA momentum slope (15%), USD/IDR FX pressure (25%), Indonesia 10Y sovereign yield (15%), and 52-week high drawdown (10%).
    - `crypto.ts`: Digital asset liquidity scoring weighting Bitcoin 200-day MA trend (25%), 30-day stablecoin net issuance (25%), BTC 8h perpetual funding rate (20%), and Crypto Fear & Greed (30%).
    - `global.ts`: Overarching global macro & dollar liquidity baseline weighting US Dollar Index DXY (30%), US 10Y Treasury yield (25%), VIX volatility (20%), and High-Yield credit spread (25%).
    - `permissions.ts`: Single source of truth deriving daily execution permissions (`Allowed`, `Selective`, `Not Allowed`, `Paused`) for Scalp, Swing, and Core DCA across IHSG, Crypto Majors, and Speculative Altcoins. Automatically activates the Capital Preservation Protocol during systemic macro stress.
    - `alerts.ts`: Overnight cross-asset anomaly detector surfacing high-priority warnings (e.g., USD/IDR breakouts, Sahm Rule recession triggers, BTC price shocks).
- **Live Market Data Services Layer (`services/market-data/`)**:
  - `history.ts`: Yahoo chart price history fetcher with Redis caching (6h TTL + perpetual backup) providing daily close series for `^JKSE`, `BTC-USD`, and `IDR=X` to calculate live 200-day and 50-day moving averages.
  - `defillama.ts`: Tracks 30-day net stablecoin supply expansion as the primary proxy for fresh fiat liquidity entering digital assets.
  - `okx.ts`: Fetches BTC perpetual swap 8h funding rate and open interest, with an automatic fallback to CoinGecko's public derivatives endpoint (`/derivatives` using `cache: "no-store"` to prevent exceeding Next.js 2MB data cache limit) when OKX is blocked by Indonesian ISP DNS filters (TrustPositif / Telkomsel).
  - `fred.ts`: Federal Reserve Economic Data integration for macroeconomic indicators (Fed Funds, DXY, US 10Y Yield, VIX, High-Yield Spreads). Non-existent series `IRLTLT01IDM156N` removed to eliminate 400 Bad Request console errors, gracefully falling back to defensive 10Y sovereign yield baseline.
- **UI/UX Components & Visual Architecture**:
  - **Top Floating Header & Live Telemetry Strip (`View.tsx`)**: Elevated floating card (`p-5 sm:p-7`) with `Compass` theme badge, active stream status button (`Live`, `Partial`, `Syncing`), live Data Stream Sources popover, Stock Explorer link, and a 4-column desktop / 2-column mobile KPI telemetry strip displaying live IHSG, USD/IDR, Bitcoin spot, and Crypto Fear & Greed.
  - **3-Card Regime Overview (`OverviewRegimes.tsx`)**: Asymmetric grid (`lg:grid-cols-12`) featuring IHSG Composite Regime (6-col), Crypto Liquidity Regime (6-col), and Global Macro Dollar Liquidity Context (12-col) with multi-tiered health score bars (`0–100`), diagnosis narratives, and interactive factor pill popovers.
  - **Tactical Permissions Matrix (`PermissionsMatrix.tsx`)**: Tabular and stacked card view displaying actionable permissions for Scalping, Swing Trading, and Core DCA. Features a prominent rose-tinted **Capital Preservation Protocol Active** banner during systemic stress, enforcing a total lockdown on new margin/leverage.
  - **Execution Playbook & Safe Bucket Anchor (`MarketPlaybook.tsx`)**: Actionable tactical scripts for IHSG and Crypto detailing Dos, Avoids, position sizing mandates (0.5%–1.0% risk cap), thesis invalidation triggers, and predetermined tranche accumulation plans. Paired with a dark slate **Safe Yield & Preservation Anchor Card (40% Target)** outlining Retail SBN (ORI/SBR/ST), liquid bank deposits (RDN), and physical gold (LM Antam).
  - **Disciplined Rebuild Rulebook (`Rulebook.tsx`)**: 6 non-negotiable operational sections:
    1. *Capital Buckets Architecture* (Emergency, 40% Safe Yield, 45% Core, 15% Swing).
    2. *Six Golden Rules of Trading Discipline* (1% max risk, non-negotiable hard stop loss, never average down on losers).
    3. *Mechanical Drawdown Circuit Breakers* (-5% half size, -10% 14-day pause, -15% quarter freeze).
    4. *Non-Negotiable Hard Bans* (Zero crypto perps/futures, zero margin, zero Papan Pemantauan Khusus, zero hype tips).
    5. *Pre-Trade Execution Checklist* (5 gates mandatory before clicking buy).
    6. *The Brutal Math of Drawdown* (Reference table illustrating why an -80% loss requires +400% gain to break even).
  - **Auto-Expiring Event Calendar & Seasonality (`EventCalendar.tsx`)**: High-impact macroeconomic calendar with market filtering (All, ID, Crypto, US) and active seasonal tendency banners (Window Dressing, Sell in May).
  - **5-Tab Market Data Terminal (`MarketDataHub.tsx`)**: High-density console with tabs for Indonesia (IDX Composite, USD/IDR, 10Y Yield, 200D MA, 52W Drawdown), Crypto Majors (BTC, ETH, Stablecoin 30D flows, Funding Rates, Halving Phase), Global Macro (MacroLens), Global Quotes (GlobalMarkets cross-asset matrix), and Sentiment Dials (CNN Fear & Greed gauge).
- **Floating Card Popover & Watermark Hygiene Standard**:
  - Outer card shells hosting dropdown popovers or action menus MUST NOT declare `overflow-hidden`.
  - Large decorative background watermarks (e.g., `<Compass className="w-64 h-64" />`) MUST be contained inside a dedicated clipping wrapper: `<div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">`.
  - Popovers MUST include a full-viewport transparent backdrop overlay (`<div role="presentation" aria-hidden="true" className="fixed inset-0 z-40" onClick={...} />`) behind the popover (`z-50`) to enable natural click-outside dismissal.
- **Deterministic Locale Formatting Standard**:
  - NEVER call bare `.toLocaleString()` on numeric values without an explicit locale. Node.js on the server will format with server locale (often `en-US`), while client browsers with Indonesian locales format with periods instead of commas, causing Next.js SSR/CSR hydration mismatches.
  - Mandatory locales: Always use `.toLocaleString("id-ID")` for Indonesian Rupiah, IDX share volumes, and domestic prices. Always use `.toLocaleString("en-US")` for USD, crypto prices, percentages, and global metrics.
- **Mobile-First & Responsiveness Standard**:
  - Proportional grid scaling (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-12`).
  - Calibrated bottom clearance `pb-32 sm:pb-36` to safely clear `CompactBottomBar`.
  - Defensive text truncation (`min-w-0 flex-1 truncate`) on ticker symbols and macro headers to prevent layout blowout on narrow handheld screens.

### Second Brain / Knowledge Graph
- **Architecture**: Local filesystem-backed (`content/brain/*.md`) knowledge management system.
- **Environment Behavior**: Read/Write in `development` mode (for local note-taking), Read-Only in `production` to accommodate serverless environments.
- **Graph Visualization**: Uses `react-force-graph-2d` loaded dynamically (`ssr: false`) for 2D network visualization of node connections.
- **Link Parsing**: Robust server-side regex engine parsing Obsidian-style wikilinks (`[[Note Title]]`) and frontmatter.
- **Access Control**: Write operations (create, update, delete) are strictly protected by `checkAdmin()` in `features/auth/actions.ts`.

### Contact & Direct Inquiry Hub (`/contact`)
- **Architecture**: Domain-driven feature in `features/contact/` serving the `/contact` route.
- **Desktop Entry Screen Standard**: Zero-scroll layout on desktop (`lg:h-screen lg:max-h-[100dvh] lg:overflow-hidden lg:py-0 lg:pb-0`) with centered alignment, reverting to fluid vertical scrolling on handheld mobile devices with calibrated bottom clearance (`pb-32 sm:pb-36`) clearing `CompactBottomBar`.
- **Asymmetric 12-Column Split Stage (`lg:grid-cols-12`)**:
  - **Left Context Column (`lg:col-span-5`)**:
    - *Liveness Telemetry Chip*: Dynamic operating status calculating Jakarta working hours (08:00–22:00) with a pulsing green `animate-ping` dot (`Active & available`) or muted offline dot (`Resting · offline`).
    - *Dominant Typographic Headline*: Solid text-slate-900 headline (`"Let's build something worth shipping."`) with high-impact font sizing (`text-4xl sm:text-5xl lg:text-[3.5rem]`).
    - *2-Column Location & Time Floating Cards*: Standardized telemetry cards mirroring `HomeView` — Location card (`Toba, ID` with indigo `FaGlobeAsia` squircle) and live Jakarta clock card (`Asia/Jakarta` with emerald `FaClock` squircle).
    - *Relative Timezone Engine*: Compares client browser timezone offset against Jakarta (`UTC+7`), calculating real-time relative offset (`Same timezone`, `Xh ahead of you`, or `Xh behind you`) displayed alongside the system version badge pill.
  - **Right Action Panel (`lg:col-span-7`)**:
    - *Inquiry Topic Selector Card*: Elevated floating card (`bg-white rounded-[2rem] border border-slate-200/80 shadow-sm p-5 sm:p-6`) with an `INQUIRY TOPIC` tracking badge and direct "Compose" mailto link. Hosts a 4-topic selection grid (`Consulting & Advisory`, `Engineering Leadership`, `Fintech Core (LOS/LMS)`, `General Tech Chat`) using domain SVG icons (`Handshake`, `Briefcase`, `Cpu`, `Coffee` — strictly no emojis). Selecting a topic dynamically updates pre-composed `mailto:` parameters (subject line and structured project briefing body). Active card transitions to dark slate elevation (`bg-slate-900 text-white shadow-md shadow-slate-900/10`).
    - *Direct Channels Grid*: 2-column mobile/desktop matrix covering Email, Telegram, LinkedIn, and GitHub. Each channel card features semantic squircle icons (`indigo-50`, `sky-50`, `blue-50`, `slate-100`), primary text with hover transitions to `indigo-600`, 1-click clipboard copy with visual checkmark feedback (`FaRegCopy` → `FaCheck`), and diagonal linkout (`ArrowUpRight`) with `group-hover:translate-x-0.5` micro-interaction.
    - *Animated Copy Toast*: Framer Motion `AnimatePresence` toast positioned at `bottom-24` above the floating navigation bar, displaying instant tactile confirmation (`FaCheck` + `"Copied to clipboard"`) upon copying any address or profile link.

### Adventures & Professional Showcase
- **Adventures**: High-fidelity logs for Running and Travel missions, utilizing solid floating card aesthetics and rich typography.
  - **Adventures Landing Hub (`/adventures`)**: Clean headline typography without gradient text, paired with a global telemetry stats strip (`65.9 km` Max Distance, `2,982 m` Peak Elevation, `10+` Destinations, `2` Canvas Engines) and solid benchmark telemetry cards.
  - **Running Performance (`/adventures/running`)**: High-fidelity endurance telemetry and Strava activity hub on signature dot-pattern canvas (`bg-slate-50/80 bg-dot-pattern`).
    - *Modern Floating Card Header Standard*: Elevated card with emerald squircle (`w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 text-emerald-600 shadow-2xs`), clean contextual breadcrumbs and title (zero marketing slogan badges), and responsive 3-column mobile telemetry box (`Total Runs`, `KM This Year`, `Avg /km`).
    - *12-Column Telemetry & Benchmarks Arena*: Asymmetric split (`lg:grid-cols-12`):
      - Left column (5 cols): `Training Load & Intel` with live pulsing telemetry indicator, 2-column volume metrics, dynamic `PaceRing` gauge, 2x2 intel metric tiles (Longest Run, Fastest Pace, Max Climb, Total Time), and proportional distance distribution bar chart.
      - Right column (7 cols): `PersonalBestsSwipeCard` (`bg-white rounded-3xl border border-slate-200/80 shadow-xs`) with minimalist frameless milestone track with sliding underline indicator (`layoutId="activeMilestoneIndicatorLight"`), official monospace chip time (`text-5xl sm:text-6xl font-black font-mono`), clean 3-metric functional strip (Pace, Distance, Elevation — strictly zero speed redundancy), zero marketing slogans/taglines, keyboard (<kbd>←</kbd> <kbd>→</kbd>) and touch swipe navigation, and 1-click record copy.
    - *Mobile-First Activities Feed*: 2-tier toolbar with full-width search, horizontally scrollable distance filter pills with dynamic count badges, sort selector, and live Strava sync. 3-column responsive activity cards (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) with uniform rounded-3xl floating card architecture, domain squircle anchor, recessed 3-metric instrument tray (zero truncation), elevation/heart rate badges, and `ArrowUpRight` interaction cue triggering `ActivityDetailModal`.
    - *Activity Detail Modal*: Full Strava splits analysis, dual-theme engine (light/dark), transparent canvas background export, and native Web Share API integration (`navigator.share`).
  - **Travel Bucket List Tracker (`/adventures/travel`)**: Domain-driven logic in `features/travel/` featuring a consolidated 4-stat telemetry strip (`Countries`, `Completed`, `Wishlist`, `Postcards`), segmented filter toolbar (responsive pills + live search), 4:3 cards (`rounded-2xl sm:rounded-[1.5rem]`), and `PostcardModal` vintage airmail canvas generator.
  - **Postcard Modal Fixed 8:5 Landscape Ratio**: Postcards (`PostcardModal.tsx`) strictly enforce an **8:5 fixed landscape ratio** across both mobile and desktop viewports (`aspectRatio: "8/5"`, `maxHeight: "min(52vh, 480px)"`, `maxWidth: "min(100%, calc(min(52vh, 480px) * 1.6))"`), eliminating portrait collapse on mobile. The back face features responsive cursive handwriting sizing, stamp, postmarks, and ergonomic action buttons.
- **Professional Showcase**:
  - **Portfolio Core Engines (`/portfolio`)**: Interactive SVG Expertise Distribution visualizer with accordion modules, staggered floating cards, and `PortfolioDetailModal` showcasing deep-dive architectures, capabilities, tech stack matrices, and measurable impact metrics across LOS/LMS and specialized platforms.
  - **Work Experience Timeline (`/work-experience`)**: Chronological career milestones featuring clean brand/legal entity hierarchy, inline technology chips, bottom impact statistics, and `ExperienceDetailModal` delivering comprehensive organizational impact and role breakdowns.
  - **Solid Aesthetic Policy**: Strictly avoids multi-color gradient text, ambient blur glow orbs, and fuzzy glow drop shadows in favor of crisp solid productivity surfaces, semantic badge tints, and high-contrast typography.

### Developer Utilities Ecosystem (22 Tools across 7 Categories)
- **Suite Categorization**:
  1. **Text Tools**: Text Compare (`/utils/text-compare` with custom comparator engine, character diffs, and synchronized scrolling), Diff Viewer (`/utils/diff-viewer`), Case Converter (`/utils/case-converter`), QR Code Generator (`/utils/qr-code-generator` with multi-format support and SVG/PNG export).
  2. **Data Tools**: Device Inspector (`/utils/device-inspector` with hardware diagnostics, audio/video studio, and network speed test), Dynamic Mock API Engine (`/utils/mock-api` & `/api/mock/*` with Redis persistence, sliding-window rate limiting, and strict 15 active endpoint limitation), SQL Formatter (`/utils/sql-formatter`).
  3. **File Tools**: Code to Image (`/utils/code-to-image`), CSV to JSON (`/utils/csv-to-json`), File Renamer (`/utils/file-renamer`), Image Converter (`/utils/image-converter`), Schema Forge / Advanced JSON Converter (`/utils/json-converter-advanced`), JSON Formatter (`/utils/json-formatter`).
  4. **Fun Tools**: Spinner Wheel (`/utils/spinner-wheel` with Web Audio API clicks and confetti), Football Formation Studio (`/utils/football-formation` tactical board and squad sheet exporter), Faceless Social Canvas Studio (`/utils/social-canvas` with 17 templates across 4 categories, breaking news lower-thirds, classy offset typography, light/dark text themes, and high-res canvas exports).
  5. **Security Tools**: JWT & API Token Inspector (`/utils/jwt-inspector` with 100% in-browser decoding, live countdown telemetry, RFC claims dictionary, and Web Crypto HMAC verification sandbox), Hash & Password Generator (`/utils/hash-password-generator`), URL Safety & Threat Inspector (`/utils/url-inspector`).
  6. **Stock Tools**: Stock Explorer (`/utils/stock-explorer` with composite scoring engine, whale/momentum/value presets, foreign flow tracking, sector heatmaps, and AI Analyst Drawer), Stock/Crypto Average Calculator (`/utils/stock-crypto-calculator`).
  7. **Time Tools**: Cron Expression Builder (`/utils/cron-builder` with natural language summaries), Running Interval Timer (`/utils/timer` with Web Audio synthesized beeps and Wake Lock API).
- **Faceless Social Canvas Studio (`/utils/social-canvas`)**:
  - **Architecture**: Domain-driven feature in `features/utils/fun-tools/social-canvas/` (`View.tsx`, `CanvasRenderer.tsx`, `types.ts`, and unit test suite in `__tests__/social-canvas.test.ts`).
  - **Categorized Template Taxonomy**: 17 templates organized into 4 functional groups (`Editorial & Social`, `Modern & Structural`, `Narrative & Text`, `Minimal & Focus`) replacing flat template menus.
  - **Breaking News Lower-Third Standard (`breaking-news`)**: High-urgency cable news presentation with deep red banner stripes, live ticker timestamp, bold all-caps headline, and proportional photo containment.
  - **Classy Offset & High-Contrast Left-Align Standard (`classy-offset`)**: Dedicated Light/Dark text theme toggle (`theme?: "light" | "dark"`), consistent left-aligned staggered layout (both lead-in text and main statement share clean left origin, avoiding awkward right-edge anchoring), high-contrast readability against dark and light backdrops.
  - **Client-Side 2D Canvas Engine**: Pure in-browser rendering across 4 standard aspect ratios (`1:1`, `4:5`, `9:16`, `16:9`), intelligent `wrapText` handling word wrapping, explicit linebreaks, and massive unbroken word splitting, object-position offsets (`imageOffsetX`, `imageOffsetY`, `avatarOffsetX`, `avatarOffsetY`), and high-resolution PNG export with zero server roundtrips.
- **Dynamic Mock API Engine (`/utils/mock-api` & `/api/mock/*`)**:
  - **Architecture**: Dynamic catch-all endpoint (`app/api/mock/[...path]/route.ts`) intercepting all HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) backed by Upstash Redis with 30-day inactivity TTL (`2592000s`). Keys follow the canonical `mock:METHOD:PATH` schema (e.g., `mock:GET:/v1/users`).
  - **Rate Limiting**: Optional per-endpoint sliding-window rate limiting via `@upstash/ratelimit` (10 requests per 10s per client IP) returning HTTP 429 when exceeded.
  - **Strict Quota & 15 Active Endpoint Limitation (`MAX_ENDPOINTS = 15`)**: Double-enforced on both client (`View.tsx`) and server (`app/api/mock/manage/route.ts`). Caps total active mock endpoints to 15. Overwriting/updating an existing mock (matching method and path) is always permitted and preserves its slot without incrementing quota. When at capacity, new mock creation is rejected with HTTP 400 (`LIMIT_REACHED`) and disabled in the UI with a capacity warning callout.
  - **Live Quota Telemetry**: Header displays real-time badge (`Quota: X / 15 Active`), slot tracking, and a progress meter bar color-coded to capacity state (emerald `< 12`, amber `12–14`, rose `15`).
  - **Strict Validation**: Enforces standard HTTP verbs, non-root paths (`/^[a-zA-Z0-9_\-\/]+$/`, max 100 chars, no spaces/queries/fragments/consecutive slashes, automatic leading-slash normalization), integer status codes (100–599) with 6 quick presets (`200`, `201`, `400`, `401`, `404`, `500`), and a 64 KB response body payload limit with a 1-click **Format JSON** indentation tool.
  - **In-Place Editing & Slot Management**: `Edit2` trigger loads active mocks into the form with visual status (`Editing METHOD /path • Slot Preserved`) and "Update Mock Endpoint" CTA. Deletions prompt via `CustomModal` and immediately free active slots.
- **JSON Tree View**: Standardized `JsonValue` component for interactive exploration of parsed data, supporting nested expansion, item counts, and value-level copying.
- **Structure**: Individual utilities implemented as Server (`page.tsx`) / Client (`View.tsx`) pairs to balance SEO and interactivity.
- **Logic Decoupling**: Heavy business logic (e.g., schema generation, formatters, string transformations, comparator engine) is decoupled from the `View.tsx` component into dedicated `utils/` and `types.ts` files within each utility's feature directory.

### Administrative Ecosystem
- **Centralized Management**: Admin dashboard (`/admin`) manages Blog, Tasks, Stock Registry, and Quick Reminders (`/admin/reminders`).
- **Stock Manager**: Re-engineered portal (`/utils/stock-explorer/admin`) featuring the **Modern Floating Card Header** and the **Operational Cache Telemetry & Control Card**:
  - *Header Controls*: Indigo `<Server />` squircle badge, title, pulsing active cache badge, and dedicated action triggers (`[↻ Refresh]`, `[🌐 Sync Live]`, `[🗑 Purge Cache]`).
  - *Full-Width Metric Grid*: Balanced 3-stat grid displaying Total Instruments (e.g. `963 equities`), Trading Settlement Date, and 12-Hour Redis TTL Lifespan.
  - *Defensive States*: Shimmering 3-card skeleton loader for zero CLS, and an amber alert banner with a direct *"Prime Cache Now"* CTA when cache is expired or empty.
- **Quick Reminders Portal (`/admin/reminders`)**: Ephemeral operational note and link repository backed by Upstash Redis with auto-expiry (1 Day, 1 Week, 1 Month):
  - *Modern Floating Card Header Standard*: Elevated card with amber squircle anchor (`w-12 h-12 sm:w-14 sm:h-14 bg-amber-50 text-amber-600 shadow-2xs`), domain theme badge (`ADMINISTRATIVE GATEWAY • ephemeral notes & redis auto-expiry`), bold `h1` headline, contextual breadcrumb, active notes count telemetry, and direct Admin Hub return link.
  - *New Reminder Creation Card*: Modern floating card with tactile segmented duration switcher (`touch-manipulation`), high-contrast character countdown, and keyboard shortcut pill (<kbd>⌘/Ctrl+Enter</kbd>).
  - *Uniform Floating Card Architecture (Zero Colored Top/Left Bars)*: Reminder cards strictly eliminate asymmetric colored strips (`h-1.5` top bar and colored left borders) in favor of uniform `rounded-3xl border border-slate-200/80` floating cards. Includes context-aware domain squircle anchors (`Clock`, `Calendar`, `CalendarDays`), created timestamp, expiring soon badge pill (`< 24h` with pulsing amber dot), linkified URL detection with one-click copy, tactile duration extensions (`+1D / +1W / +1M`), and full-text copy button.
- **Navigation**: "Manage Stocks" and "Quick Reminders" integrated into `CompactBottomBar.tsx` Admin sub-menu with pending counts.

## 🚀 Development & Build Optimization

### Performance Enhancements Implemented
- **pnpm Upgrade:** v11.11.0 → v12.4.2 for faster dependency management and native execution
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

# Testing & Quality Assurance
pnpm test                 # Run Vitest test suite across all domains (45 suites, 424 tests)
pnpm vitest run <path>    # Run target test file or domain (e.g. features/investment)
pnpm run check            # Biome lint and format check across all files
pnpm run format           # Biome format code across all files

# Build
pnpm run build           # Production build
pnpm run build:fast      # Fast build skipping non-critical checks (FAST_BUILD=true)
pnpm run build:analyze   # Build with bundle analysis
pnpm run build:profile   # Build with profiling

# Analysis
pnpm run analyze         # Alias for build:analyze
```

### 🧪 Testing & Quality Assurance Architecture
- **Framework & Runner**: **Vitest** with JSDOM environment, providing ultra-fast execution (~2-3s full runs) with zero configuration drift.
- **Domain-Driven Test Colocation**: All tests are strictly co-located in `__tests__/` subdirectories within their respective domain folders (e.g., `features/<domain>/__tests__/` or `features/<domain>/components/__tests__/`).
- **Comprehensive Investment Domain Test Suite (`features/investment/`)**:
  - `features/investment/lib/__tests__/indicators.test.ts` (8 tests): Pure quantitative calculation helpers (`sma`, `distancePct`, `maSlopePct`, `drawdownFromHigh`, `realizedVol`, `rsi`, `sahmRule`, `getHalvingCyclePhase`).
  - `features/investment/lib/__tests__/engine.test.ts` (17 tests): Legacy macro decision engine with revised capitulation risk mitigation.
  - `features/investment/lib/engine/__tests__/engine-v2.test.ts` (5 tests): Decision Engine v2 composite regime scoring, stress gating, and permissions.
  - `features/investment/components/__tests__/OverviewRegimes.test.tsx` (2 tests): 3-card regime layout, factor details popover.
  - `features/investment/components/__tests__/PermissionsMatrix.test.tsx` (3 tests): Tactical permissions matrix, gating, capital preservation banner.
  - `features/investment/components/__tests__/MarketPlaybook.test.tsx` (2 tests): IHSG & Crypto playbooks, Safe Bucket anchor.
  - `features/investment/components/__tests__/Rulebook.test.tsx` (1 test): 6 sections of the Disciplined Rebuild Rulebook.
  - `features/investment/components/__tests__/EventCalendar.test.tsx` (2 tests): Upcoming catalysts and active seasonality.
  - `features/investment/components/__tests__/MarketDataHub.test.tsx` (5 tests): 5 terminal tabs (Indonesia IDX, Crypto Majors, Global Macro, Global Quotes, Sentiment Dials).
  - `features/investment/components/__tests__/MarketDeltaAlerts.test.tsx` (7 tests): Overnight anomaly detection.
  - `features/investment/components/__tests__/SectorRotation.test.tsx` (4 tests): SPDR ETF rotation groupings and proxies.
  - `features/investment/components/__tests__/TradersCheatsheet.test.tsx` (9 tests): Capital Preservation Mode activation and discipline rules.
  - *Full Investment Domain Health*: 12 test suites, 65 tests passing with zero failures.
- **Full Repository Test Suite Health**: 43 test suites, 408 tests passing with zero failures.

### Configuration Files
- `next.config.ts`: Optimized with bundle analyzer, Sentry (configured with `silent: true` to suppress Turbopack warning noise in CI), and caching
- `tsconfig.json`: Performance-optimized TypeScript settings
- `biome.json`: Strict linter and formatter covering all 360 files across `app/`, `features/`, `lib/`, `services/`, `types/`, and root configs
- `.env.development`: Development-specific environment variables
- `tailwind.config.js`: Optimized Tailwind CSS v4 configuration
- `postcss.config.mjs`: Enhanced with autoprefixer

## 📏 Engineering Standards
- **UI/UX Consistency**: All new or modified pages/components MUST strictly conform to [`ui-uix-guideline.md`](file:///c:/Work/Me/personal-web-v2/ui-uix-guideline.md) (Floating Cards, `bg-slate-50/80 bg-dot-pattern`, `bg-white` containers, `rounded-2xl` to `rounded-[2rem]`, pill badges, mobile-first responsive grids, and `pb-32 sm:pb-36` navigation clearance).
- **Strict Anti-Gradient, Anti-Emoji, Metric Anti-Redundancy & Pure White Container Mandates**: NEVER use gradient headers, gradient modal dialogs, multi-color gradient text, or ambient blur glow orbs. NEVER use raw unicode emojis in UI components, headers, or cards (always use scalable SVG icons). Standard dashboard cards MUST strictly use pure white containers (`bg-white rounded-3xl`); monolithic dark-mode cards are forbidden. Data displays must strictly eliminate redundant metrics (no Pace + Speed redundancy) and zero marketing fluff taglines.
- **Feature-Module Cleanliness**: Domain logic and UI components strictly reside in `features/<domain>/`. Shared global UI components reside exclusively in `features/shared/components/`. Zero orphaned root `components/` folders.
- **Component Design**: Prefer clean abstractions. Use `use client` only when necessary.
- **Defensive Data Handling**: Always implement safety fallbacks and type-casting (e.g., `String(val || "")`) when processing external API data to prevent runtime `TypeError` on missing fields.
- **SEO & Metadata**: Every route must implement `generateMetadata` using `createMetadata` helper in `lib/shared/metadata.ts`.
- **Error Tracking & Monitoring**: Sentry is configured for client (`instrumentation-client.ts`), server (`sentry.server.config.ts`), and edge environment tracking (`sentry.edge.config.ts`), integrated via Next.js instrumentation (`instrumentation.ts`). Sentry builds use `silent: true` to suppress noisy missing source map warnings from Turbopack internal chunks.
- **Git Workflow**: Follow **Conventional Commits**.
- **Linter & Formatter**: **Biome** for strict full-repository formatting and linting (`360 files, 0 warnings, 0 errors`).
- **Performance Tools:** Bundle analyzer, profiling scripts, and optimized configurations.
- **Commit/Push Policy**: **NEVER** stage, commit, or push changes unless explicitly requested by the user for each occurrence.
