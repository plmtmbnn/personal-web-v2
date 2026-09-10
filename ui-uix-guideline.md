# UI/UX Engineering Guidelines

This document outlines the core UI/UX patterns, design principles, and architectural standards for the `personal-web-v2` codebase, standardized around a **Modern Floating Card** dashboard aesthetic.

---

## 1. Core Design Philosophy: Floating Cards & Subtle Neomorphism
The application utilizes a unified, modern dashboard aesthetic characterized by clean surfaces, distinct depth, and precise data visualization.

* **Floating Cards:** The core architectural unit is the "Floating Card." Components are encapsulated within panels featuring large border radii (e.g., `rounded-2xl`, `rounded-3xl`, or `rounded-[2rem]`), subtle border rings (`border border-slate-200/80`), and soft drop shadows (`shadow-xs` to `shadow-xl`) to create a distinct layering effect over the canvas.
* **Subtle Textures:** The global background utilizes an off-white or very light gray canvas (`bg-slate-50/80`) enhanced with a subtle dot-grid pattern (`bg-dot-pattern`), providing tactile depth without distracting from content.
* **Contrast Mastery:** Standard panels rely on pure white containers (`bg-white`). Full-bleed dark slate banners (`bg-slate-900 border-b border-slate-800`) are strictly obsoleted in favor of the unified **Modern Floating Card Header Standard** (`bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs`). Dark slate panels (`bg-slate-900`) are reserved exclusively for isolated high-priority metric widgets (such as the Total Pending backlog counter in Tasks) or technical code blocks.
* **Strict Anti-Gradient Mandate (Headers, Modals & Surfaces):** NEVER use gradient headers, gradient modal dialogs, multi-color gradient text (`bg-clip-text text-transparent bg-gradient-to-*`), colored drop-shadow glow filters (`filter: drop-shadow(...)`), or large ambient blurred orbs (`blur-3xl`, `blur-[100px]`). All page headers, modal containers, cards, and interactive components MUST strictly use clean solid surfaces (`bg-white`, `bg-slate-50`), solid borders (`border border-slate-200/80`), solid semantic badge tints (`bg-indigo-50`, `bg-purple-50`, `bg-blue-50`, `bg-amber-50`, `bg-emerald-50`, `bg-rose-50`), and high-contrast solid typography (`text-slate-900`, `text-indigo-600`).
* **Strict Iconography Standard (Anti-Emoji Mandate):** NEVER use raw unicode emojis (e.g., 🤝, 💼, 🚀, ☕, ⚡, 🏆, 🌍) in UI components, topic selectors, headers, or cards. Always use dedicated, scalable SVG icons from `lucide-react` or `react-icons` (e.g., `Handshake`, `Briefcase`, `Cpu`, `Coffee`, `Zap`, `Award`, `Globe`). Emojis render inconsistently across operating systems and degrade the clean, professional engineering aesthetic.
* **Global Telemetry Summary Strip Pattern:** Domain entry points (such as Adventures Landing Hub and Insights Hub) employ a prominent 4-column desktop / 2-column mobile telemetry strip (`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4`) directly beneath the hero header. Each telemetry item is housed in a `bg-white rounded-2xl border border-slate-200/80 shadow-xs` card with a solid semantic squircle icon badge, uppercase tracking label, bold metric value, and descriptive subtext.
* **Pure Light Explorer & Matchday Hub Standard:** Aesthetic hubs (such as Travel Bucket List Tracker and Liverpool FC Matchday Hub) employ an airy centered hero (`pt-24 sm:pt-32`), quick stat pill rows (`px-4 py-2.5 bg-white border border-slate-200/80 rounded-full shadow-xs`), responsive search & filter toolbars (venue, competition, month), and `rounded-[2rem]` floating cards with organic spring hover interactions (`whileHover={{ y: -4 }}`).

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
* **Card Header & Spatial Alignment Hygiene:** Never use arbitrary hardcoded left padding offsets (like `pl-11`) to manually align subheaders beneath an icon; this causes text and badges to wrap awkwardly on narrow mobile viewports. Instead, structure headers using flex columns/rows with direct icon containers (`w-11 h-11 shrink-0`), placing brand names, legal entity subtitles, domain badges, and right-aligned location pills into distinct, dedicated flex groups.
* **Desktop Entry Screen Standard:** Primary single-page entry points (e.g., `HomeView`, `ContactView`) utilize a compact 100vh entry screen layout on desktop (`lg:h-screen lg:max-h-[100dvh] lg:overflow-hidden lg:py-0 lg:pb-0`) to eliminate unnecessary vertical or horizontal scrollbars entirely.
* **Mobile-First Scrolling:** On handheld and tablet devices (`< lg`), views revert to fluid vertical scrolling (`min-h-screen overflow-y-auto py-20 pb-32 sm:py-24 sm:pb-36`) to accommodate the floating bottom navigation bar (`CompactBottomBar`).
* **Fluid Spacing & Typography:** Margins, padding, and font sizes scale smoothly based on breakpoints (e.g., `pt-24 sm:pt-32`, `text-3xl sm:text-5xl lg:text-6xl`, `px-3 sm:px-4`).
* **Touch Targets & Feedback:** Interactive elements feature generous touch target areas and active feedback (`active:scale-95`, `active:scale-[0.98]`) for tactile confirmation on mobile devices.

---

## 4. Floating Bottom Navigation (`CompactBottomBar`)
The primary application navigation utilizes a floating glassmorphic pill bar positioned at the bottom of the viewport:

* **Glassmorphic Surface:** Enclosed in `bg-white/90 backdrop-blur-2xl` with a subtle inner ring (`ring-1 ring-slate-900/5`) and soft ambient drop shadow (`shadow-[0_16px_48px_-12px_rgba(15,23,42,0.15)]`).
* **Active Tab Contrast:** Active tabs feature an animated dark slate spring pill background (`bg-slate-900`). Active text and icons MUST enforce explicit high contrast (`!text-white`) to prevent global `a` element styles from bleeding through.
* **Submenu Affordances:** Submenu popovers feature a `ChevronUp` indicator visible on both mobile and desktop to provide clear visual affordance for expandable navigation items. "Insights" sub-menu hosts Blog, Investments, Liverpool FC, and Utils. "Admin" sub-menu hosts Tasks, Blog Editor, Stock Manager, and Quick Reminders with pending count badges.

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
* **Dynamic Category Count Pills:** Category selectors MUST compute and display dynamic count badges next to category labels (e.g., `All (12)`, `Tech (6)`, `Finance (3)`) to communicate dataset scale.
* **Sorting Standard:** Provide clean, accessible sorting dropdowns with standardized modes: `date-desc` (Newest First), `date-asc` (Oldest First), `read-asc` (Quickest Read), `read-desc` (Deepest Read).
* **IntersectionObserver Sentinel:** Use a sentinel element combined with `IntersectionObserver` at the bottom of lists for seamless auto-loading. Provide shimmering `Skeleton` placeholders during load transitions.
* **Filter State Resets:** Automatically reset visible pagination counts to page 1 whenever category filters or search inputs change.
* **End-of-Archive Indicator:** When all items are loaded (`!hasMore`), display a clean end-of-archive badge summarizing the total record count.

---

## 9. Empty State Design Patterns
Empty states are critical UX moments that guide users when no data is available. They must be contextual, actionable, and visually consistent.

* **Floating Card Container:** Use solid white surfaces (`bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-xs`).
* **Actionable CTAs:** Always provide a clear action when the user can fix the empty state (connect account, clear filters, refresh, etc.).
* **Icon Selection:** 
  - `CheckCircle` = Success/Ready
  - `ShieldAlert` = Warning/Error
  - `Sparkles` = Empty but ready for content
  - `Activity` = Integration/Sync related
  - `TrendingUp` = Data exists elsewhere

---

## 10. Error Page Standards
Error pages (404, 500, etc.) must be simple, direct, and provide clear navigation options.

* **404 Not Found Pattern:**
  - Large, bold 404 number (7xl-8xl font size)
  - Clear headline: "Page Not Found"
  - Brief explanation: One sentence maximum
  - Dual action buttons: Primary (Go Home) + Secondary (Go Back)
  - Centered floating card (`max-w-md bg-white border border-slate-200/80 rounded-3xl shadow-xs`)

---

## 11. Authentication & Session Management UX
Authentication flows must be seamless, secure, and user-friendly with automatic session maintenance.

* **TOTP Authenticator Protection (`PinGuard.tsx`):** Protects restricted sections (Admin, Tasks) using a 6-digit Google Authenticator code verified via `otplib`. Optimized for device numeric keypads with 12-hour session lifetime.
* **Multi-Layer Token Refresh System:**
  - Server-side token refresh on every page request via `proxy.ts`.
  - Client-side proactive monitoring every 5 minutes (`AuthProvider`).
  - Redis session layer maintaining 30-week sessions with automatic TTL extension on activity.

---

## 12. HTML5 Canvas Export & Web Share Standards
Dynamic image and sticker generation provides engaging, shareable visual summaries across adventures, utilities, and travel.

### Canvas Rendering Principles
* **High-DPI Retina Scaling:** Canvas dimensions MUST be scaled by `window.devicePixelRatio` or a minimum of `2x` (e.g. `800x500` rendered at `1600x1000`) before rendering to prevent blurry text and pixelated artifacts on high-density displays.
* **Next.js CSS Variable Font Extraction:** Canvas 2D contexts do not parse CSS variables (like `var(--font-caveat)`). When rendering custom Next.js fonts on Canvas, dynamically resolve the true computed font-family name from a temporary DOM element (`window.getComputedStyle(dummy).fontFamily`) and await `document.fonts.ready` before drawing.
* **CORS-Safe Asset Loading:** External images must be loaded using `img.crossOrigin = "anonymous"` to avoid tainting the canvas and blocking image export.

### Web Share API & Export Action Ergonomics
* **Native Web Share Sheet (`navigator.share`):** On supported devices (iOS Safari, Android Chrome, macOS Safari), integrate `navigator.share({ title, text, url })` formatting rich activity summaries (*"🏃 Morning Run • 10.02 km in 52m 14s (Avg 5:13/km)"*) to open native system share dialogs (WhatsApp, Telegram, AirDrop, Messages).
* **Direct Sticker / File Sharing:** When supported (`navigator.canShare({ files: [file] })`), allow direct sharing of generated transparent PNG stickers to Instagram Stories and messaging apps.
* **Clipboard API Fallback:** When Web Share API is unavailable or cancelled, copy the payload to clipboard (`navigator.clipboard.writeText` for URLs, `navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])` for stickers) with tactile visual confirmation (`Check` icon and toast alert).

### Specialized Export Formats
* **Vintage Airmail Travel Postcard (`postcardCanvas.ts` & `PostcardModal.tsx`):**
  - **3D Card Flip Experience:** Postcard modal utilizes CSS 3D perspective with `preserve-3d` and `backface-visibility: hidden` to allow users to interactively flip between the front polaroid sticker and the back handwritten postcard.
  - **Border Pattern:** Diagonal striped airmail border (`#1E3A8A`, `#FAF5EC`, `#BE123C`) with rounded inner cream backing (`#FAF5EC`).
  - **Postal Ephemera:** High-accuracy stamp rendering, overlapping postmark stamp circle with wavy cancellation lines, and handwritten address lines with randomized organic line rotations.
* **Strava Running Activity Canvas (`ActivityDetailModal.tsx`):**
  - **Theme Adaptability:** Dual-theme engine supporting clean light canvas (`#000000` text) and high-contrast dark canvas (`#FFFFFF` text).
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
5. **Security Tools:** JWT & API Token Inspector, Hash & Password Generator, URL Safety & Threat Inspector.
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

---

## 15. Admin & Operational Productivity Patterns
Operational views (e.g., Admin Dashboard, Task Agenda, Quick Reminders, Stock Manager) emphasize speed, clarity, and zero cognitive friction.

### Keyboard Shortcuts Standard
* **Instant Submission:** All administrative forms and text entry tools (Quick Reminders note area, Stock Admin JSON input) MUST support <kbd>⌘ + Enter</kbd> (Mac) and <kbd>Ctrl + Enter</kbd> (Windows/Linux) to immediately submit or import data without clicking the button.

### Quick Reminders Standard (`/admin/reminders`)
* **Time-to-Live (TTL) Hierarchy:** Backed by Redis with selectable lifespans: `1 Day`, `1 Week`, `1 Month`.
* **Automatic Linkification:** Detect URLs in reminder text and render them as interactive, clickable pill buttons (`bg-indigo-50 text-indigo-700 hover:bg-indigo-100`) accompanied by one-click copy buttons.
* **One-Click Lifespan Extensions:** Provide rapid duration extension badges (`+1D`, `+1W`, `+1M`) on each card to extend TTL without re-entering reminder text.
* **Card-Level Note Copying:** Dedicated `Copy` button on each card with visual checkmark feedback.
* **Search & TTL Filter Strip:** Live search input combined with category pills (*All, Expiring Soon, 1 Day, 1 Week, 1 Month*).

### Stock Manager Import Protocol (`/utils/stock-explorer/admin`)
* **JSON File Upload:** Provide a direct `.json` file upload reader (`<input type="file" accept=".json" />`) to load large dataset files directly from disk without manual copy-paste overhead.
* **JSON Formatting Tool:** One-click syntax validator and prettifier.
* **Sample Template Generator:** One-click "Load Sample" button prefilling valid IDX payload structure (`BBCA`, `BBRI`, `BMRI`).

---

## 16. Insights & Aggregation Hub Standards
Hub and aggregator pages (e.g., `/insights`, `/adventures`) provide curated entry points into the platform's analytical subsystems.

* **Global Intelligence Telemetry Strip:** Top 4-stat telemetry strip previewing core platform domains with solid icon squircles and high-contrast numbers.
* **Module Cards:** Encapsulated in `rounded-[2rem]` floating cards with category badges, high-contrast linkout arrows (`ArrowUpRight`), descriptive body text, and thematic topic tags.
* **Spring Hover Physics:** Cards lift organically on hover (`whileHover={{ y: -4 }}`) with subtle shadow expansion (`shadow-md`).
* **Thematic Accents:** Use distinct badge color pairings to reinforce domain boundaries (Indigo for Architecture/Blog, Emerald for Financial/Investments, Rose for Liverpool FC, Cyan for Developer Utilities).
* **Navigation Clearance:** Standardize bottom padding clearance to `pb-32 sm:pb-36` to ensure comfortable clearance above `CompactBottomBar`.

---

## 17. Modern Floating Card Header Standard
Full-bleed dark slate banners (`bg-slate-900 border-b border-slate-800`) are strictly obsoleted across the entire application in favor of the **Modern Floating Card Header Standard**:

* **Container Architecture:** All management, intelligence, and operational views (e.g., `/admin`, `/admin/blog`, `/admin/reminders`, `/utils/stock-explorer/admin`, `/tasks`, `/investment`) encapsulate the hero header within a floating card (`bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs`) resting on the signature textured canvas (`bg-slate-50/80 bg-dot-pattern`).
* **Container Alignment & Max-Width:** The floating header card MUST share the exact same `max-w-*` container width and padding as the cards beneath it (`max-w-4xl`, `max-w-5xl`, or `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`).
* **Header Hierarchy & Elements:**
  - **Domain Theme Badge:** A pill badge at the top featuring a domain icon squircle, uppercase tracking title, dot separator, and lowercase sublabel (e.g., `OPERATIONS HUB • daily task orchestration`, `FINANCIAL REGISTRY • idx market synchronization`, `REMINDERS REGISTRY • quick ephemeral notes`, `MARKET INTELLIGENCE ENGINE • sentiment telemetry & indicators`).
  - **Confident Headline:** Extra-bold solid heading `h1` (`text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight`).
  - **Breadcrumbs Navigation:** Contextual breadcrumbs (`Admin Dashboard › ...` or `Home › ...`) using semantic muted links (`!text-slate-500 hover:!text-slate-900`) and `<ChevronRight className="w-3 h-3 text-slate-400" />`.
* **Right-Aligned Controls Group:** Functional controls, back-links, or live telemetry badges are right-aligned (`flex flex-wrap items-center gap-2.5 sm:gap-3`) to maintain balance and avoid vertical dead space.
* **Top Clearance Hygiene:** Main content containers must declare sufficient top clearance (`pt-20 sm:pt-24` or `pt-24 sm:pt-28` when fixed switchers like `QuickNav` are present) to ensure floating navigation switchers never overlap, clip, or obscure header titles.

---

## 18. Floating Widget Hygiene & Anti-Collision Mandate
To maintain an uncluttered viewport and eliminate gesture conflicts on both mobile and desktop:

* **Zero Bottom-Right Overlays:** The bottom-right viewport area is reserved exclusively for the global command palette trigger (`SEARCH ⌘K`). No secondary floating buttons (such as floating "Back to Top" pills or floating scroll progress indicators) are permitted in this area.
* **In-Flow Document Return:** Long-scroll views (such as Blog Reading pages at `/blog/[slug]`) must use in-flow document return navigation (e.g., a centered "Back to Top" button positioned at the end of the article alongside "Back to Insights") rather than fixed floating buttons that obscure underlying content or bottom controls.
* **Native & Lightweight Progress Indicators:** Reading progress is communicated via discrete header metadata (e.g. estimated reading time, word count) or browser-native scroll dynamics, eliminating intrusive circular HUDs or redundant floating bars.

---

## 19. Operational Cache Telemetry & Control Pattern
For administrative caching engines and backend synchronization portals (such as the Stock Explorer Manager at `/utils/stock-explorer/admin`):

* **Distinct Separation of Controls & Metrics:** Do NOT cram operational action buttons side-by-side with metric values in an uneven horizontal flex row.
* **Header Operational Bar:** Administrative mutation triggers (`Refresh Status`, `Sync Live`, `Purge Cache`) sit in the card's top header bar directly beside the cache engine title, squircle icon, and pulsing active/expired status chip.
* **Full-Width Telemetry Grid:** Below a subtle divider (`border-b border-slate-100 pb-5`), metric data spans the card's full width in a balanced grid (`grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4`):
  1. *Total Instruments*: Primary count with domain icon squircle and index sublabel.
  2. *Settlement Date*: Formatted trading date with calendar squircle.
  3. *Lifespan / TTL*: Cache duration with clock squircle and rolling purge description.
* **Defensive Loading & Fallback States:**
  - *Loading State*: Shimmering 3-card skeleton loaders matching the exact dimensions of the telemetry cards to eliminate cumulative layout shifts (CLS).
  - *Expired/Empty State*: Elevated alert callout banner (`bg-amber-50/60 border border-amber-200/80`) featuring clear diagnostic messaging and a direct *"Prime Cache Now"* CTA button.

---

## 20. Feature-Module Cleanliness & Dead Code Policy
* **Domain-Driven Isolation:** All application logic and UI components reside under domain folders in `features/<domain>/` (e.g. `features/tasks/`, `features/investment/`, `features/adventures/`).
* **Shared UI Consolidation:** Reusable global primitives (such as `CustomModal`, `CompactBottomBar`, `StockTicker`, `Skeleton`, `JsonValue`, `InfoTooltip`) reside exclusively in `features/shared/components/`.
* **Zero Orphaned Directories:** Legacy root `components/` folders and dead UI components (such as standalone `Button.tsx`) must be purged to maintain single-source architectural integrity.
* **Full-Repository Biome Coverage:** The entire codebase must be continuously formatted and linted via Biome, with `biome.json` explicitly including all TypeScript and TSX files across `app/`, `features/`, `lib/`, `services/`, and `types/`.

---

## 21. Blog Reading Experience & Markdown Typography Standards (`/blog`, `/blog/[slug]`)
To ensure an exceptional reading experience across long-form essays, technical architectures, and training logs:

* **Modern Floating Reading Stage:** The article body is encased inside an elevated floating container (`bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 lg:p-14 shadow-xs`) resting on the signature dot-pattern canvas (`bg-slate-50/80 bg-dot-pattern`).
* **Interactive Table of Contents (`TableOfContents.tsx`):**
  - Extracts `h2` and `h3` headings dynamically.
  - Automatically disambiguates duplicate titles using `HeadingSlugger` (`workout`, `workout-1`, `workout-2`) to guarantee unique DOM IDs.
  - AST-level heading ID attachment via `rehypeHeadingIds` guarantees 100% hydration parity between server-rendered HTML and client re-renders without mutation.
  - Interactive scroll-spy active state highlights the current chapter with `text-emerald-700 bg-white font-extrabold border border-emerald-200/70`.
* **GFM Table Architecture & Responsive Mobile Scrolling:**
  - Standard GFM tables compile to semantic HTML `<table>` elements encased in a responsive card wrapper (`not-prose overflow-x-auto my-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs bg-white`).
  - Strict preservation of column alignment (`:---` left, `:---:` center, `---:` right) via inline styles and subtle zebra hover transitions (`hover:bg-slate-50/60`).
  - Multi-column tables (such as 8-week training matrices or complex financial reports) scroll horizontally on narrow viewports without breaking container bounds or clipping text.
  - Built-in resilience against collapsed single-line table rows (`| |` / `||`) via `normalizeMarkdown`.
* **URL Autolinking & Interactive Code Pills:**
  - Raw URLs in prose autolink to external destinations opening in a new tab (`target="_blank" rel="noopener noreferrer"`).
  - Inline code URLs (e.g. `` `https://strava.com` ``) are rendered as interactive pill badges with an `ExternalLink` icon and hover transitions.
  - Automatic security upgrade converts insecure `http://www.` URLs to secure `https://www.`.
* **GitHub-Style Alert Callouts:**
  - Supports GitHub alert blocks (`[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`) styled with thematic Lucide icons (`Info`, `Sparkles`, `AlertCircle`, `AlertTriangle`, `ShieldAlert`), tinted borders, and high-contrast solid backgrounds.
* **Editor Toolbar Scaffolding (`BlogForm.tsx`):**
  - Provides quick scaffolding buttons clustered into logical groups (`[ H2 | Bold | Italic ]`, `[ Code | Code Block | Link ]`, `[ Bullet List | Numbered List | Callout Note | Table | Divider ]`).
  - One-click GFM Table injection scaffolds alignment delimiters (`:---`, `:---:`) to eliminate manual pipe formatting syntax.

---