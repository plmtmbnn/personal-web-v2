# UI/UX Engineering Guidelines

This document outlines the core UI/UX patterns, design principles, and architectural standards for the `personal-web-v2` codebase, standardized around a **Modern Floating Card** dashboard aesthetic.

---

## 1. Core Design Philosophy: Floating Cards & Subtle Neomorphism
The application utilizes a unified, modern dashboard aesthetic characterized by clean surfaces, distinct depth, and precise data visualization.

* **Floating Cards:** The core architectural unit is the "Floating Card." Components are encapsulated within panels featuring large border radii (e.g., `rounded-2xl`, `rounded-3xl`, or `rounded-[2rem]`), subtle border rings (`border border-slate-200/80`), and soft drop shadows (`shadow-xs` to `shadow-xl`) to create a distinct layering effect over the canvas.
* **Subtle Textures:** The global background utilizes an off-white or very light gray canvas (`bg-slate-50/80`) enhanced with a subtle dot-grid pattern (`bg-dot-pattern`), providing tactile depth without distracting from content.
* **Contrast Mastery:** Standard panels rely on pure white containers (`bg-white`), while high-priority metrics or visualizations may utilize dark slate panels (`bg-slate-900`) to create stark visual breaks and guide user attention.
* **Pure Light Explorer & Matchday Hub Standard:** Aesthetic hubs (such as Travel Bucket List Tracker and Liverpool FC Matchday Hub) employ an airy centered hero (`pt-24 sm:pt-32`), quick stat pill rows (`px-4 py-2.5 bg-white border border-slate-200/80 rounded-full shadow-xs`), segmented pill tab switchers, and `rounded-[2rem]` floating cards with organic spring hover interactions (`whileHover={{ y: -4 }}`).

---

## 2. CSS Hygiene & Preflight Standards
To prevent layout degradation, hardcoded specificity conflicts, and broken mobile variants:

* **No Aggressive Universal Resets:** Never define `* { margin: 0; padding: 0; }` in `globals.css`. Allow Tailwind CSS v4 Preflight to handle box resets naturally.
* **Scoped Document Typography (`.prose`):** Document typography spacing (`h1`-`h6`, `p`, `ul`, `ol`, `li` margins) MUST be scoped under `.prose` for markdown or editorial pages. Never force global bottom margins on raw `<p>` or `<h1-h6>` elements, as this corrupts UI components like cards, badges, and modals.
* **No Raw HTML Tag Overrides:** Never apply default padding or background colors to raw HTML elements (e.g., `button`, `input`). Utility classes (`.btn`, `.input-base`, Tailwind classes) must be used explicitly.
* **Input & Search Icon Layering:** Search inputs featuring internal icons MUST position icons using `pointer-events-none z-10` with matching explicit left padding (`pl-10` or `pl-11`) on the `<input>` element to prevent text and placeholder overlapping.
* **Tailwind Utility First:** Component spacing must rely on Tailwind utility classes (`gap-4`, `p-4`, `mb-6`) rather than manual CSS rules in `globals.css`.

---

## 3. Mobile-First & Responsive Approach
A mobile-first mindset is strictly enforced across the codebase. Layouts gracefully scale up rather than gracefully degrading.

* **Responsive Grids:** Complex layouts start stacked on mobile (`grid-cols-1`) and expand to multi-column grid layouts on larger screens (`md:grid-cols-2`, `lg:grid-cols-3` or `xl:grid-cols-3`).
* **Nested & Side-by-Side Grid Column Sizing:** When embedding card grids inside side-by-side split layouts (e.g., `lg:flex-row`, multi-column parent panes), NEVER use high column counts like `grid-cols-4` in a half-width container. A split pane only has ~350px-450px available width. In split containers, use a 2x2 grid (`grid-cols-2`) so each card maintains a minimum comfortable width ($\ge 160\text{px}-200\text{px}$). Full 4-column grids (`grid-cols-4`) are strictly reserved for standalone, full-width rows.
* **Defensive Card Layout Hygiene:** All nested grid items, stat buttons, and flex containers MUST include `min-w-0` to prevent flex blowout. Card header labels and subtexts must use `truncate` with `shrink-0` on icons to guarantee text never breaks into awkward vertical stacks or overlaps adjacent cards.
* **Desktop Entry Screen Standard:** Primary single-page entry points (e.g., `HomeView`, `ContactView`) utilize a compact 100vh entry screen layout on desktop (`lg:h-screen lg:max-h-[100dvh] lg:overflow-hidden lg:py-0 lg:pb-0`) to eliminate unnecessary vertical or horizontal scrollbars entirely.
* **Mobile-First Scrolling:** On handheld and tablet devices (`< lg`), views revert to fluid vertical scrolling (`min-h-screen overflow-y-auto py-20 pb-32 sm:py-24 sm:pb-36`) to accommodate the floating bottom navigation bar (`CompactBottomBar`).
* **Fluid Spacing & Typography:** Margins, padding, and font sizes scale smoothly based on breakpoints (e.g., `pt-24 sm:pt-32`, `text-3xl sm:text-5xl lg:text-6xl`, `px-3 sm:px-4`).
* **Touch Targets & Feedback:** Interactive elements feature generous touch target areas and active feedback (`active:scale-95`, `active:scale-[0.98]`) for tactile confirmation on mobile devices.

---

## 4. Floating Bottom Navigation (`CompactBottomBar`)
The primary application navigation utilizes a floating glassmorphic pill bar positioned at the bottom of the viewport:

* **Glassmorphic Surface:** Enclosed in `bg-white/90 backdrop-blur-2xl` with a subtle inner ring (`ring-1 ring-slate-900/5`) and soft ambient drop shadow (`shadow-[0_16px_48px_-12px_rgba(15,23,42,0.15)]`).
* **Active Tab Contrast:** Active tabs feature an animated dark slate spring pill background (`bg-slate-900`). Active text and icons MUST enforce explicit high contrast (`!text-white`) to prevent global `a` element styles from bleeding through.
* **Submenu Affordances:** Submenu popovers feature a `ChevronUp` indicator visible on both mobile and desktop to provide clear visual affordance for expandable navigation items. "Insights" sub-menu hosts Blog, Investments, Liverpool FC, and Utils.

---

## 5. Motion, Animation, & Feedback
Animations are used purposefully to guide attention and provide feedback.

* **Framer Motion Integration:** Page transitions, popovers, and animated tab pills utilize `framer-motion` for fluid state changes.
* **Spring Physics:** Animations favor spring physics (`type: "spring", stiffness: 380, damping: 30` or `stiffness: 260, damping: 20` for floating card hover lifts) over linear easing for a snappy, organic feel.
* **Micro-interactions:** Hover states are enriched with slight translations (`hover:-translate-y-1.5`, `whileHover={{ y: -4 }}`), scale boosts (`hover:scale-105`), and subtle shadow enhancements.
* **Accessibility (Reduced Motion):** All animations respect user accessibility settings via the `useReducedMotion()` hook.

---

## 6. Typography & Text Contrast
* **Metric Typography:** Primary values use large font sizes and extra-bold weights (`text-xl sm:text-3xl font-extrabold text-slate-900`) for immediate legibility.
* **High Contrast Hierarchy:** Primary labels use `text-slate-700 font-bold`, while secondary units and sublabels use `text-slate-500 font-semibold`.
* **Dark Mode & Dark Panels:** When using dark containers (`bg-slate-900`), text MUST be set to pure white or vibrant glowing accents (`text-indigo-400`, `text-emerald-400`, `text-cyan-400`, `text-red-400`) with sufficient contrast.

---

## 7. Color System & Semantic Accents
* **Base Palette:** Neutral slates for structure (`slate-50` to `slate-950`).
* **Semantic Accents:** 
  * **Indigo/Blue:** Engineering, systems architecture, primary actions.
  * **Emerald/Teal:** Active states, running/endurance logs, match victory results (`WIN`), success metrics.
  * **Cyan:** Fintech systems, interactive data cards, chart indicators.
  * **Red / Crimson (`red-600` / `#C8102E`):** Liverpool FC Matchday Hub, Anfield home badges, countdown highlights, live matchday indicators.
  * **Amber / Gold (`amber-500`):** Match draws (`DRAW`), trophies, wishlists, market volatility warnings.
  * **Rose / Coral (`rose-600`):** Alerts, notifications, match losses (`LOSS`), pending task counters.

---

## 8. Progressive Loading & Infinite Pagination Standards
For content-heavy feeds, journals, and dynamic list views:

* **Progressive Batch Slicing:** Render initial content in controlled batches (e.g. `PAGE_SIZE = 6`) to optimize DOM tree performance and initial rendering speed.
* **IntersectionObserver Sentinel:** Use a sentinel element combined with `IntersectionObserver` at the bottom of lists for seamless auto-loading. Provide shimmering `Skeleton` placeholders during load transitions.
* **Filter State Resets:** Automatically reset visible pagination counts to page 1 whenever category filters or search inputs change.
* **End-of-Archive Indicator:** When all items are loaded (`!hasMore`), display a clean end-of-archive badge summarizing the total record count.
* **Skeleton Loading Best Practices:**
  - Use skeletons only for actual loading states, not for filter results
  - Remove skeletons immediately when data arrives or when empty state is confirmed
  - Never show indefinite skeleton loading when no data exists
  - Prefer immediate empty states over prolonged skeleton loading

---

## 9. Empty State Design Patterns
Empty states are critical UX moments that guide users when no data is available. They must be contextual, actionable, and visually consistent.

### Core Principles
* **Context-Aware Messaging:** Distinguish between different empty scenarios
  - No data exists yet (first-time user)
  - No results match current filters
  - Data failed to load (API error)
  - Connection required (authentication/integration)
  - Data exists elsewhere but not in current view
* **Visual Hierarchy:** 
  - Floating card container (`bg-white`, `rounded-3xl`, `border border-slate-200/80`)
  - Icon or visual indicator (large, centered, colored based on context)
  - Bold headline (concise, state what's missing)
  - Descriptive text (explain why it's empty and what to do)
  - Action button(s) when user action is needed
* **Color Semantics:**
  - Success/Ready: Emerald gradient background (`from-emerald-50/50 to-slate-50`)
  - Error/Warning: Amber accents (`text-amber-600`, `ShieldAlert` icon)
  - Neutral/No Data: Slate accents (`text-slate-600`)
  - Info/Loading: Cyan/Indigo accents

### Implementation Examples

#### Connected But No Data (Strava Running)
```tsx
{!hasRunData && isConnected && (
  <div className="mt-12 text-center py-20 bg-gradient-to-br from-emerald-50/50 to-slate-50 border border-emerald-100/80 rounded-3xl shadow-sm">
    <Activity className="w-10 h-10 text-emerald-600" />
    <p className="text-base font-extrabold text-slate-900 mb-2">
      Connected & Ready!
    </p>
    <p className="text-xs text-slate-600">
      Your account is connected. Start running and activities will sync automatically.
    </p>
    <CheckCircle className="w-4 h-4 text-emerald-600" />
    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
      Synced with Strava
    </span>
  </div>
)}
```

#### API Sync Error
```tsx
{runsIsNull && (
  <div>
    <ShieldAlert className="w-10 h-10 text-amber-600" />
    <p className="text-base font-extrabold text-slate-900">
      Unable to Load Activities
    </p>
    <p className="text-xs text-slate-600">
      Temporary API issue. Try refreshing the page in a moment.
    </p>
    <button onClick={() => window.location.reload()}>
      <Activity className="w-4 h-4" />
      Refresh Page
    </button>
  </div>
)}
```

#### Filter Results Empty (Blog)
```tsx
{sortedBlogs.length === 0 && hasActiveFilter && (
  <div>
    <Sparkles className="w-5 h-5 text-indigo-600" />
    <h3>No Stories Found</h3>
    <p>No articles matching your search query or selected category.</p>
    <button onClick={clearFilters}>Clear Filters</button>
  </div>
)}
```

#### Stats Show Data But Activities Not Loaded
```tsx
{hasStats && stats.all_run_totals?.count > 0 && (
  <div>
    <p>Activities Loading...</p>
    <p>Your stats show {stats.all_run_totals.count} total runs, but activities are syncing.</p>
    <TrendingUp className="w-4 h-4 text-cyan-600" />
    <span>{stats.all_run_totals.count} Total Runs on Strava</span>
  </div>
)}
```

### Guidelines
* **No Skeleton Loading for Empty States:** Replace skeleton loading with immediate empty state display when data doesn't exist
* **Actionable CTAs:** Always provide a clear action when the user can fix the empty state (connect account, clear filters, refresh, etc.)
* **Progressive Disclosure:** Show different levels of detail based on whether the user can take action
* **Micro-copy Matters:** Use friendly, direct language that explains the situation clearly
* **Icon Selection:** 
  - `CheckCircle` = Success/Ready
  - `ShieldAlert` = Warning/Error
  - `Sparkles` = Empty but ready for content
  - `Activity` = Integration/Sync related
  - `TrendingUp` = Data exists elsewhere

---

## 10. Error Page Standards
Error pages (404, 500, etc.) must be simple, direct, and provide clear navigation options.

### 404 Not Found Pattern
* **Structure:**
  - Large, bold 404 number (7xl-8xl font size)
  - Clear headline: "Page Not Found"
  - Brief explanation: One sentence maximum
  - Dual action buttons: Primary (Go Home) + Secondary (Go Back)
* **Design:**
  - Centered floating card (`max-w-md`)
  - White background with subtle border
  - Full-width buttons for better mobile UX
  - Proper color contrast on all text
* **Interactivity:**
  - Must use `"use client"` directive for interactive buttons
  - Primary action: Link to home page (indigo button)
  - Secondary action: Browser back (`window.history.back()`)
* **Button Colors:**
  - Primary: `bg-indigo-600 hover:bg-indigo-700 text-white`
  - Secondary: `bg-slate-100 hover:bg-slate-200 text-slate-700`
  - Always explicitly set icon and text colors (e.g., `text-white` on both icon and span)

---

## 11. Authentication & Session Management UX
Authentication flows must be seamless, secure, and user-friendly with automatic session maintenance.

### Token Refresh Architecture
* **Multi-Layer Refresh System:**
  - **Server-Side (proxy.ts):** Automatic token refresh on every page request via Next.js proxy convention
  - **Client-Side (AuthProvider):** Proactive monitoring and refresh every 5 minutes
  - **Redis Session Layer:** 30-week sessions with automatic TTL extension on activity
  - **API Endpoint:** `/api/auth/refresh-session` synchronizes Redis with Supabase tokens
* **User Experience Goals:**
  - Zero manual re-logins for active users
  - Seamless background refresh without UI interruption
  - Clear feedback only when action is required (re-login after 30 weeks inactivity)
* **Session Lifecycle:**
  - Active users stay logged in indefinitely
  - Inactive for < 30 weeks: Still logged in when they return
  - Inactive > 30 weeks: Must re-authenticate (security measure)

### Login Flow UX
* **Path Preservation:** Login button captures current path and redirects back after authentication
* **OAuth Provider:** Google OAuth with PKCE flow and visual branding
* **Loading States:** 
  - Button text changes: "Continue with Google" → "Connecting..."
  - Disabled state during OAuth redirect
* **Redirect Security:** Whitelist-based validation for admin route patterns prevents open redirect attacks
* **Smart Defaults:** Callback redirects to `/admin` if no specific path, not hardcoded `/tasks`

### Protected Route Patterns
* **Admin Routes:** `/admin/*`, `/tasks/*`, `/adventures/running`, `/utils/*/admin`
* **Callback Handling:** Enhanced auth callback (`/auth/callback`) with smart redirect to intended destination
* **Session Indicators:** Minimal, non-intrusive session status (no constant "logged in" badges)
* **PinGuard Usage:** Removed from Investment feature; now used selectively for high-security areas only

### Error Handling
* **Session Expiration:** Redirect to `/login` with clear message
* **Auth Failure:** Show error banner with actionable guidance
* **Token Refresh Failure:** Silent retry, then prompt for re-login if persistent
* **Unauthorized Access:** Redirect to `/unauthorized` with explanation

### Debug-Friendly Architecture
* **Console Logging:** Structured logs for debugging:
  ```
  [Middleware] Session active for user: <id>
  [AuthProvider] Token refreshed proactively
  [AuthProvider] Redis session synced
  [Redis] Session refreshed: <session-id>
  ```
* **Session Metadata:** Track creation time, last refresh, expiration for monitoring via `getSessionMetadata()`
* **Environment Toggles:** Feature flags for auth system components (Google OAuth, PinGuard)

### Technical Implementation
* **File Convention:** Use `proxy.ts` (Next.js 16+), not deprecated `middleware.ts`
* **Function Export:** Must export as `export async function proxy(request: NextRequest)`
* **Auth Provider Integration:** Wrap root layout with `<AuthProvider>` in `app/layout.tsx`
* **Client Components:** Auth-related interactivity requires `"use client"` directive
* **Documentation:** Complete technical details in `docs/AUTH_TOKEN_REFRESH.md`

---

## 12. HTML5 Canvas Export & Sticker Generation Standards
Dynamic image and sticker generation provides engaging, shareable visual summaries across adventures, utilities, and travel.

### Canvas Rendering Principles
* **High-DPI Retina Scaling:** Canvas dimensions MUST be scaled by `window.devicePixelRatio` or a minimum of `2x` (e.g. `800x500` rendered at `1600x1000`) before rendering to prevent blurry text and pixelated artifacts on high-density displays.
* **Font Pre-loading & Fallbacks:** Always load and verify custom web fonts (such as `Montserrat`, `Georgia`, or system serif/sans-serif fonts) before initiating canvas drawing routines.
* **CORS-Safe Asset Loading:** External images (e.g., Strava profile pictures, destination photos) must be loaded using `img.crossOrigin = "anonymous"` to avoid tainting the canvas and blocking image export.
* **Export Action Ergonomics:**
  - **Clipboard API First:** Provide a primary "Copy to Clipboard" button utilizing `navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])` with immediate tactile feedback (`Check` icon and "Copied!" state).
  - **Fallback PNG Download:** Provide a secondary "Download PNG" button that generates an anchor download link (`a.download = filename.png`).

### Specialized Export Formats
* **Vintage Airmail Travel Postcard (`postcardCanvas.ts`):**
  - **Border Pattern:** Diagonal striped airmail border (`#1E3A8A`, `#FAF5EC`, `#BE123C`) with rounded inner cream backing (`#FAF5EC`).
  - **Polaroid Photo Frame:** Left-aligned framed photo with white padding, subtle drop shadow, and handwritten-style caption.
  - **Postal Ephemera:** Right-aligned postmark stamp circle, vintage airmail badge, destination coordinates, completed dates, and memo lines.
* **Strava Running Activity Canvas (`ActivityDetailModal.tsx`):**
  - **Theme Adaptability:** Dual-theme engine supporting clean light canvas (`#FFFFFF` with `#0F172A` metrics) and high-contrast dark canvas (`#0F172A` with `#FFFFFF` metrics).
  - **Transparent Mode:** Support a transparent background toggle for sticker overlays on Instagram Stories or photo collages.
  - **Telemetry Typography:** Large hero distance (`72px font-black`), pace, elevation gain, moving time, heart rate, and split pacing breakdown bars.

---

## 13. Developer Utilities UI/UX & Module Focus Patterns
Utilities must balance high data density with focused productivity and clear mental models.

### Categorized Utility Architecture
Utilities are structured into 7 distinct domains for easy discovery and mental categorization:
1. **Text Tools:** Text Compare, Diff Viewer, Case Converter, QR Code Generator.
2. **Data Tools:** Device Inspector, Mock API Engine, SQL Formatter.
3. **File Tools:** Code to Image, CSV to JSON, File Renamer, Image Converter, Schema Forge (Advanced JSON Converter), JSON Formatter.
4. **Fun Tools:** Spinner Wheel decision maker.
5. **Security Tools:** Hash & Password Generator, URL Safety & Threat Inspector.
6. **Stock Tools:** Stock Explorer, Stock/Crypto Average Calculator.
7. **Time Tools:** Cron Expression Builder, Running Interval Timer.

### Module Focus & Split-View Pattern
For side-by-side split utilities (e.g. Input vs Output, Side-by-Side Text Compare):
* **Pane Collapse/Expand:** Include `Minimize2` and `Maximize2` action buttons in pane headers to collapse the complementary pane, giving 100% width to the active pane.
* **Framer Motion Layout Transitions:** Smoothly animate pane expansion using `framer-motion` layout animations without CSS transform conflicts.
* **Synchronized Scrolling:** Side-by-side comparators (e.g., `TextCompare`) must synchronize scroll positions between source and modified panes with matching line heights.
* **Interactive Tree Explorer (`JsonValue`):** Standardize JSON payloads and tree representations with recursive collapsibility, type color coding (string, number, boolean, null), and value-level copy triggers.

---

## 14. System Audio & Hardware Integration Standards
When utilizing native browser and device APIs for real-time utilities:

* **Web Audio API (Synthesized Audio):**
  - Synthesize sounds programmatically using `AudioContext` and `OscillatorNode` (e.g., countdown beeps in `timer`, ticker clicks in `spinner-wheel`) instead of relying on heavy external audio files.
  - Initialize the `AudioContext` only after explicit user interaction (click or start button) to adhere to browser autoplay policies.
* **Screen Wake Lock API:**
  - For continuous operations (e.g. Running Interval Timer, Device Benchmarks), acquire a wake lock via `navigator.wakeLock.request("screen")`.
  - Automatically re-acquire the wake lock if the page visibility changes from hidden back to visible (`document.addEventListener("visibilitychange", ...)`).
* **Hardware Diagnostics & Studio:**
  - Provide visual live meters (frequency visualizers, decibel meters, canvas frame rate benchmarks) with clear permission prompts and graceful error fallbacks when hardware access (microphone/camera) is denied.

---

## 15. Admin & Operational Productivity Patterns
Operational views (e.g., Admin Dashboard, Task Agenda, Quick Reminders) emphasize speed, clarity, and zero cognitive friction.

### Quick Reminders Standard (`/admin/reminders`)
* **Time-to-Live (TTL) Hierarchy:** Backed by Redis with selectable lifespans:
  - `1 Day` (Transient / Day-specific reminders)
  - `1 Week` (Short-term deliverables)
  - `1 Month` (Monthly review items)
* **Automatic Linkification:** Detect URLs in reminder text and render them as interactive, clickable pill buttons (`bg-indigo-50 text-indigo-700 hover:bg-indigo-100`) accompanied by one-click copy buttons.
* **One-Click Lifespan Extensions:** Provide rapid duration extension badges (`+1D`, `+1W`, `+1M`) on each card to extend TTL without re-entering reminder text.
* **Navigation Integration:** Display live count badges in `CompactBottomBar` under the Admin submenu so pending administrative items are immediately visible.

---

## 16. Insights & Aggregation Hub Standards
Hub and aggregator pages (e.g., `/insights`) provide curated entry points into the platform's analytical subsystems.

* **Module Cards:** Encapsulated in `rounded-[2rem]` floating cards with category badges, high-contrast linkout arrows (`ArrowUpRight`), descriptive body text, and thematic topic tags.
* **Spring Hover Physics:** Cards lift organically on hover (`whileHover={{ y: -4 }}`) with subtle shadow expansion (`shadow-md`).
* **Thematic Accents:** Use distinct badge color pairings to reinforce domain boundaries (Indigo for Architecture/Blog, Emerald for Financial/Investments, Red for Liverpool FC, Amber for Developer Utilities).

---