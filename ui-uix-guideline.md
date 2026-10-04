# UI/UX Engineering Guidelines

This document outlines the core UI/UX patterns, design principles, and architectural standards for the `personal-web-v2` codebase, standardized around a **Modern Floating Card** dashboard aesthetic.

> [!CAUTION]
> **Anti-AI-Slop Mandate (Strict).** Every AI assistant working on this codebase MUST treat this guideline as a hard constraint — not a suggestion. The most common failure mode is AI-generated "slop": predictable, generic, template-like UI patterns that look like every other SaaS product. The rules in this document exist to prevent that outcome. Violations will be reverted.

---

## 1. Core Design Philosophy: Floating Cards & Precision Surfaces

The application utilizes a unified, modern dashboard aesthetic characterized by clean surfaces, distinct depth, and precise data visualization. **No aesthetic decision should ever look auto-generated.**

* **Floating Cards:** The core architectural unit is the "Floating Card." Components are encapsulated within panels featuring large border radii (e.g., `rounded-2xl`, `rounded-3xl`, or `rounded-[2rem]`), subtle border rings (`border border-slate-200/80`), and soft drop shadows (`shadow-xs` to `shadow-xl`) to create a distinct layering effect over the canvas.
* **Subtle Textures:** The global background utilizes an off-white or very light gray canvas (`bg-slate-50/80`) enhanced with a subtle dot-grid pattern (`bg-dot-pattern`), providing tactile depth without distracting from content.
* **Contrast Mastery:** Standard panels rely on pure white containers (`bg-white`). Full-bleed dark slate banners (`bg-slate-900 border-b border-slate-800`) are strictly obsoleted in favor of the unified **Modern Floating Card Header Standard** (`bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs`). Dark slate panels (`bg-slate-900`) are reserved exclusively for isolated high-priority metric widgets (such as the Total Pending backlog counter in Tasks) or technical code blocks.
* **Strict Anti-Gradient Mandate (Headers, Modals & Surfaces):** NEVER use gradient headers, gradient modal dialogs, multi-color gradient text (`bg-clip-text text-transparent bg-gradient-to-*`), colored drop-shadow glow filters (`filter: drop-shadow(...)`), or large ambient blurred orbs (`blur-3xl`, `blur-[100px]`). All page headers, modal containers, cards, and interactive components MUST strictly use clean solid surfaces (`bg-white`, `bg-slate-50`), solid borders (`border border-slate-200/80`), solid semantic badge tints (`bg-indigo-50`, `bg-purple-50`, `bg-blue-50`, `bg-amber-50`, `bg-emerald-50`, `bg-rose-50`), and high-contrast solid typography (`text-slate-900`, `text-indigo-600`).
* **Strict Iconography Standard (Anti-Emoji Mandate):** NEVER use raw unicode emojis (e.g., 🤝, 💼, 🚀, ☕, ⚡, 🏆, 🌍) in UI components, topic selectors, headers, or cards. Always use dedicated, scalable SVG icons from `lucide-react` or `react-icons` (e.g., `Handshake`, `Briefcase`, `Cpu`, `Coffee`, `Zap`, `Award`, `Globe`). Emojis render inconsistently across operating systems and degrade the clean, professional engineering aesthetic.
* **Global Telemetry Summary Strip Pattern:** Domain entry points (such as Adventures Landing Hub and Insights Hub) employ a prominent 4-column desktop / 2-column mobile telemetry strip (`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4`) directly beneath the hero header. Each telemetry item is housed in a `bg-white rounded-2xl border border-slate-200/80 shadow-xs` card with a solid semantic squircle icon badge, uppercase tracking label, bold metric value, and descriptive subtext.
* **Pure Light Explorer, Matchday & Market Intelligence Hub Standards:** Aesthetic hubs employ domain-calibrated architectures:
  - **Travel Bucket List Tracker (`/adventures/travel`)**: Airy centered hero (`pt-24 sm:pt-32`), quick stat pill rows (`px-4 py-2.5 bg-white border border-slate-200/80 rounded-full shadow-xs`), responsive search & filter toolbars (venue, competition, month), and `rounded-[2rem]` floating cards with organic spring hover interactions (`whileHover={{ y: -4 }}`). Wishlist and future expedition cards maintain a clean, inspiring future expedition card layout without "spoiler themes" (no image blurring or manual reveal toggles).
  - **Liverpool FC Matchday Hub (`/liverpool`)**: **Zero-Scroll Full Viewport Standard** (`h-[100dvh] max-h-[100dvh] overflow-hidden` on both mobile and desktop), compact breadcrumb navigation, 3-zone floating match card (`NextMatchHero.tsx`) — Head Strip (domain badge + home/away chip), Clash Arena (prominent `w-28 h-28` crests; LFC home side tinted `bg-red-50/70`; dark VS pill), and Countdown Tray (4-tile HUD; seconds tile turns `bg-red-600` when imminent; `MATCHDAY IN PROGRESS` pulsing badge). No redundant fixture headline — team names shown only beneath crests. Calibrated bottom clearance (`pb-24 sm:pb-28`) above `CompactBottomBar`.
  - **Investment Compass & Market Intelligence Hub (`/investment`)**:
    - **Modern Floating Card Standard**: `bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8` resting on the signature textured canvas (`bg-slate-50/80 bg-dot-pattern`).
    - **Risk-First Capital Preservation Standard**: Tailored specifically for rebuilding after extreme portfolio drawdowns (~80%). Prioritizes capital survival, strict exposure limits, and capital preservation over reckless high-frequency speculation. Strictly reader-only for visitors (no trade journals or database mutation forms).
    - **Top Floating Header & Live Telemetry**: Elevated header card (`p-5 sm:p-7`) with `Compass` theme badge, active connection indicator dot (`Live`, `Partial`, `Syncing`), live Data Stream Sources popover, Stock Explorer CTA link with `active:scale-95`, and a 4-column desktop / 2-column mobile KPI telemetry strip (`grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4`) with live IHSG (`^JKSE`), USD/IDR, Bitcoin spot, and Crypto Fear & Greed.
    - **3-Card Regime Overview Layout (`OverviewRegimes.tsx`)**: Asymmetric grid (`grid-cols-1 lg:grid-cols-12`) featuring IHSG Composite Regime (6-col), Crypto Liquidity Regime (6-col), and Global Macro Dollar Liquidity Context (12-col) with multi-tiered health score bars (`0–100`), diagnosis narratives, and interactive factor pill popovers.
    - **Tactical Permissions Matrix (`PermissionsMatrix.tsx`)**: Single source of truth driving daily trading permissions (`Allowed`, `Selective`, `Not Allowed`, `Paused`) for Scalp, Swing, and Core DCA across IHSG, Crypto Majors, and Speculative Altcoins. Automatically displays the prominent rose-tinted **Capital Preservation Protocol Active** banner during systemic stress with a hard lockdown on new margin/leverage.
    - **Execution Playbook & Safe Bucket Anchor (`MarketPlaybook.tsx`)**: Dual-card tactical script for IHSG and Crypto detailing actionable Dos, Avoids, position sizing mandates (0.5%–1.0% risk cap), thesis invalidation triggers, and predetermined tranche accumulation plans. Paired with a dark slate **Safe Yield & Preservation Anchor Card (40% Target)** outlining Retail SBN (ORI/SBR/ST), liquid bank deposits (RDN), and physical gold (LM Antam).
    - **Disciplined Rebuild Rulebook (`Rulebook.tsx`)**: 6 non-negotiable operational sections: Capital Buckets Architecture (Emergency, 40% Safe Yield, 45% Core, 15% Swing), 6 Golden Rules of Trading Discipline, Mechanical Drawdown Circuit Breakers (-5% half size, -10% 14-day pause, -15% freeze), Non-Negotiable Hard Bans (zero crypto perps/futures, zero margin, zero Papan Pemantauan Khusus), Pre-Trade Checklist (5 gates), and Drawdown Recovery Math table (-80% requires +400%).
    - **Auto-Expiring Event Calendar & Seasonality (`EventCalendar.tsx`)**: High-impact macro dates with automatic expiry filtering by market (All, ID, Crypto, US) and active seasonal tendency banners (Window Dressing, Sell in May).
    - **5-Tab Market Data Terminal (`MarketDataHub.tsx`)**: Full-featured terminal console consolidating 5 dedicated data panes: Indonesia (IDX Composite, USD/IDR, 10Y Yield, 200D MA, 52W Drawdown), Crypto Majors (BTC, ETH, Stablecoin 30D flows, Funding Rates, Halving Phase), Global Macro (MacroLens), Global Quotes (GlobalMarkets cross-asset matrix), and Sentiment Dials (CNN Fear & Greed gauge).
    - **Floating Card Popover & Watermark Hygiene Standard**: Outer card shells hosting dropdowns or popovers MUST NOT declare `overflow-hidden`. Large background watermarks (e.g., decorative `Compass` SVG) must be wrapped in a dedicated clipping container (`<div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">`). Popovers must feature a full-viewport transparent backdrop overlay (`<div role="presentation" aria-hidden="true" className="fixed inset-0 z-40" onClick={...} />`) behind the popup (`z-50`) to enable seamless click-outside dismissal.
    - **Deterministic Number & Currency Locale Standard**: NEVER call bare `.toLocaleString()` without an explicit locale string. All Rupiah amounts and Indonesian share volumes must use `.toLocaleString("id-ID")`. All USD values, crypto prices, and percentages must use `.toLocaleString("en-US")` to prevent Next.js SSR/CSR hydration mismatches across client browser locales.
    - **Safe Bottom Clearance**: Calibrated bottom clearance `pb-32 sm:pb-36` to safely clear `CompactBottomBar`.
  - **Contact & Direct Inquiry Hub (`/contact`)**: Desktop Entry Screen Standard (`lg:h-screen lg:max-h-[100dvh] lg:overflow-hidden`), centered 12-column stage (`lg:grid-cols-12`, 5/7 split). Left context column: active status chip with `animate-ping` pulsing dot, solid headline (`"Let's build something worth shipping."`), 2-column Location & Jakarta Clock widget, system version pill, and relative timezone calculator. Right action panel: floating inquiry topic selector card (`rounded-[2rem]`) with 4 presets (`Consulting & Advisory`, `Engineering Leadership`, `Fintech Core (LOS/LMS)`, `General Tech Chat`) using domain SVG icons (`Handshake`, `Briefcase`, `Cpu`, `Coffee`) compiling dynamic `mailto:` parameters, and a 2x2 grid of direct contact channels (Email, Telegram, LinkedIn, GitHub) featuring domain icon squircles, 1-click clipboard copying (`FaRegCopy` → `FaCheck`), and external linkout arrows (`ArrowUpRight`).
  - **Running Performance Hub (`/adventures/running`)**: High-fidelity endurance telemetry and Strava activity hub on signature dot-pattern canvas (`bg-slate-50/80 bg-dot-pattern`). Floating card header standard with emerald squircle anchor (`w-12 h-12 sm:w-14 sm:h-14`), domain theme badge (`Performance Hub`), and responsive 3-column mobile telemetry box. 12-column arena split: left column (5 cols) `Training Load & Intel` with live pulsing telemetry indicator, dynamic `PaceRing` gauge, 2x2 intel metric tiles, and proportional distance distribution; right column (7 cols) `PersonalBestsSwipeCard` (`rounded-3xl`) with tactile 5-item segmented milestone track (`touch-manipulation`), official chip time, 4-metric grid, keyboard/swipe navigation, and 1-click record copy. Activities feed with 2-tier mobile-first controls toolbar, 3-column responsive activity cards with uniform rounded-3xl floating card architecture, domain squircle anchor, recessed 3-metric instrument tray (zero truncation), elevation/heart rate badges, and `ArrowUpRight` interaction cue triggering `ActivityDetailModal`.

---

## 2. Anti-AI-Slop Mandate (UI/UX)

This section defines explicit prohibitions against the most common AI-generated UI patterns. These are "red flags" — immediately recognizable signs of lazy, template-driven UI work. **Any component, page, or PR that exhibits these patterns must be refactored.**

### 2.1 Prohibited Visual Patterns ("Slop Signatures")

The following patterns are **strictly forbidden** in this codebase:

* **Hero Section Clichés:**
  - NEVER center a large gradient headline with a subtitle below it and a "Get Started" CTA button as the entire hero. This is the most recognizable AI-slop hero pattern.
  - NEVER place ambient glowing orbs or blurred gradient blobs (`blur-3xl`) behind hero content. This is a hallmark of AI-generated landing pages circa 2023–2024.
  - NEVER use multi-color gradient text (e.g., `from-purple-400 to-cyan-400`) as a headline effect. Headlines must be solid `text-slate-900` or a single, deliberate semantic accent.
  - NEVER stack: big emoji → headline → subtitle → CTA button in that exact order. This is a cargo-cult pattern from AI code generators.

* **Spoiler Themes & Gatekeeping UI:**
  - NEVER use "spoiler themes" (image blurring, masking overlays, or manual "reveal" toggle buttons) for lists or wishlist items. Wishlist or future expedition cards should present clean, inspiring layouts using standard floating cards, not obscured or gated content.

* **Card Grid Uniformity:**
  - NEVER render a grid of 3 or 4 identical cards with the exact same structure: icon (top-left) → title → description → CTA link. This looks machine-generated.
  - Cards within the same view MUST have intentional visual differentiation: varying accent colors, differing content density, asymmetric badge placement, or distinct semantic roles.
  - NEVER use generic placeholder icons (`Star`, `Zap`, `Shield`, `Rocket`, `Check`) as the primary icon for a card without a deliberate, domain-specific reason. Every icon choice must be semantically justified.

* **Feature List Sections:**
  - NEVER render a "Features" section as a uniformly spaced icon-title-description list with 6 identical items in a 3×2 grid. This is a SaaS landing page cliché.
  - If feature breakdowns are needed, they must be embedded as functional UI patterns (e.g., a live demo, a data table, a telemetry strip) — not a marketing bullet list.

* **Forbidden Badge/Pill Patterns & Anti-AI-Slop Slogan Mandate:**
  - NEVER render a floating "✨ New" or "🚀 Introducing..." marquee badge above a hero headline. This is a startup landing page trope.
  - **STRICT ANTI-SPARKLES MANDATE (Zero AI-Slop Icons):** NEVER use the `Sparkles` icon (from `lucide-react` or any icon library) anywhere in the application. It is **STRICTLY BLACKLISTED FOREVER** sitewide with zero exceptions. It is the single most overused AI-slop icon and immediately signals generic, auto-generated UI. Always use purpose-specific, domain-accurate icons instead (e.g., `Star` for featured headlines/favorites, `LayoutTemplate` for presets/templates, `Award` / `Trophy` for achievements, `FileCode` / `Code2` for technical snippets, `Cpu` for hardware/engines, `Gem` for values).
  - NEVER combine `Sparkles` + gradient text + ambient blur orbs in the same component. This combination is the canonical AI-slop signature and is completely forbidden.
  - **STRICT ANTI-BULLET, ANTI-SLOGAN & CLEAN HEADER MANDATE:**
    - NEVER place repetitive decorative category sections, pills, or badge squircles (e.g. `Market Guideline`, `Engineering Journal`, `Performance Hub`, `Knowledge Base`, `Operations Hub`, `Utility Registry`) above the page `h1`. Every page must NOT share the exact same template header with formulaic category pills.
    - **Clean Header Standard (General Guideline)**: Standardize all page hero headers across public, admin, and operational views to:
      1. Contextual breadcrumbs (`Home > Insights > Blog`, `Home > Utilities`, or `Admin Dashboard > Manage Blog`).
      2. Prominent, bold title `h1`.
      3. Straight-to-the-point concise description (`p`).
      4. Action buttons or telemetry stats strip (if present) aligned to the right (desktop) or stacked cleanly (mobile).
    - NEVER use `'•'` or `'·'` (middots) as bullet points, separators, or slogan dividers in headers, cards, or pills. They look like auto-generated marketing fluff and create awkward line breaks or overflow bugs. Use clean commas, slashes (`/`), em-dashes (`—`), or standard native list styling (`list-disc pl-4`) instead.
    - NEVER construct compound marketing slogan badges (e.g. `CATEGORY • marketing sublabel & buzzwords`) or stack redundant subtitle paragraphs (`Technical essays · fintech systems · production learnings`) under badges.
    - NEVER apply `whitespace-nowrap` to badges or headers that break mobile viewports and overflow outside card boundaries.
  
  - **CARD ACTION & PILL HYGIENE (ANTI-REDUNDANT TRIGGER MANDATE):**
    - NEVER provide duplicate external link or launch triggers in the same card (e.g., placing an arrow icon button `↗` in the top-right header while simultaneously rendering `Launch Console ↗` or `Launch →` in the footer).
    - Every card must have ONE unambiguous primary interaction trigger:
      - If the card container is wrapped in a `<Link>` or already provides a footer action (`Launch →`), do NOT add a redundant top-right squircle or circular arrow button.
      - Top-right corners are reserved strictly for real-time telemetry metrics (`6 Published / 9 Draft`, `4 Pending`) or distinct secondary actions (`+ New Article`).
    - Banish generic `rounded-full` pills for repetitive category names in card corners (e.g., `PUBLISHING`, `EXECUTION`). These create visual noise and dilute real data.
    - Telemetry badges must use compact, high-contrast, discrete containers (`rounded-lg` or `rounded-md`, e.g. `bg-slate-50 border border-slate-200/70 text-[11px] font-mono`) and represent concrete state (counts, ratios, connection status), not ornamental category labels.

* **Loading & Skeleton States:**
  - NEVER show a full-screen spinner with a brand logo in the center. Use targeted, in-component skeleton placeholders that match the exact shape and dimensions of the incoming content.
  - NEVER use a generic `CircleLoader` or `BounceLoader` from external spinner libraries. Skeletons must use `animate-pulse bg-slate-200 rounded-*` blocks mirroring real content dimensions.

* **Section Dividers & Spacers:**
  - NEVER use decorative SVG wave/curve dividers between page sections. These are template-kit artifacts.
  - NEVER inject arbitrary `<Separator />` lines between every card or every section. Spacing and visual rhythm must come from deliberate padding and card structure, not ornamental rules.

* **Copy & Microcopy:**
  - NEVER use the phrases: "Supercharge your workflow", "Built for the modern developer", "Unlock the power of...", "Seamlessly integrate...", "Level up your...", "Take it to the next level", "Game-changing", or any AI-speak superlatives in any UI label, button, heading, badge, or tooltip. All copy must be direct, specific, and first-person authentic.
  - NEVER auto-generate placeholder text with `Lorem ipsum`. All placeholder and sample content must be contextually accurate to the domain.

### 2.2 Anti-Pattern Icon Blacklist

The following icons are **banned from use in UI surfaces** unless there is an exceptional, documented, domain-specific justification approved in a code review:

| Banned Icon | Reason | Preferred Alternatives |
|---|---|---|
| `Sparkles` | #1 most overused AI-slop icon — STRICTLY BLACKLISTED FOREVER sitewide | `Star` (featured/headlines), `LayoutTemplate` (presets/templates), `Award`, `Cpu`, `Gem` |
| `Rocket` (as decoration) | Generic "launch/startup" cliché | `ArrowUpRight`, `ExternalLink`, `Play` |
| `Zap` (as decoration) | Generic "fast/powerful" cliché | Context-specific: `Timer`, `Bolt`, `Activity` |
| `Star` (as decoration) | Generic "rating/favorite" misuse | `Award`, `Trophy`, `Bookmark` |
| `Shield` (as generic security) | Lazy security icon | `ShieldCheck`, `ShieldAlert`, `Lock`, `KeyRound` |
| `Globe` (as generic icon) | Overused "global/web" cliché | `Map`, `Navigation`, `Compass`, `Earth` |
| `Magic` / `Wand` (as decoration) | AI tool marketing trope | Only use when the feature is genuinely algorithmic |

### 2.3 Layout Structural Anti-Patterns

* **NEVER flatten an entire page into a vertical stack of full-width sections.** Pages must have visual rhythm: sidebar + main, asymmetric two-column, floating card clusters with varying widths, or a defined information hierarchy.
* **NEVER use `justify-between` + icon + title + arrow as the universal card pattern.** This creates visually monotonous lists that read like a file explorer.
* **NEVER default to centering all content.** Centered layouts are appropriate for single-focus views (empty states, 404, login). Multi-content pages must use left-aligned or grid-based layouts.
* **NEVER use `opacity-50` on entire disabled sections.** This creates a murky, indistinct UI. Use specific skeleton states, disabled chip badges, or contextual empty states instead.
* **NEVER stack more than 2 consecutive full-width section dividers (`w-full border-b border-slate-200`).** Use card grouping and spatial rhythm instead.

### 2.4 Motion & Animation Anti-Patterns

* **NEVER animate everything.** Applying `framer-motion` or CSS transitions to every single element on page load creates visual noise, not sophistication. Animations must be purposeful: state changes, user-triggered interactions, data loading transitions.
* **NEVER use `animate-bounce` on decorative icons.** Bouncing icons are a UI regression to early 2010s web design.
* **NEVER use `animate-spin` on static decorative elements.** Rotation animations are reserved for genuine loading indicators only.
* **NEVER apply `transition-all duration-300` as a blanket style** across all elements. Specify exactly which CSS properties to animate (e.g., `transition-shadow`, `transition-transform`).
* **Stagger animations deliberately:** If multiple items animate in, use `staggerChildren` with a conservative `delayChildren: 0.05` to `0.1` seconds. Never exceed `0.2s` per item stagger — it makes the page feel sluggish.

### 2.5 Color & Contrast Anti-Patterns

* **NEVER use raw Tailwind spectrum colors as primary UI accents** (e.g., plain `blue-500`, `green-500`, `red-500`, `purple-500` straight from the palette). All colors must be deliberately chosen within the established semantic palette (see §8).
* **NEVER place light text on a light background** without checking WCAG AA contrast ratios. The minimum acceptable contrast is 4.5:1 for body text and 3:1 for large headings.
* **NEVER use `text-gray-*` classes.** This project uses the `slate` neutral scale exclusively. `gray` and `zinc` neutrals are forbidden to maintain color system consistency.
* **NEVER use more than 3 distinct accent colors within a single card component.** Visual overload is a direct result of AI models applying every available color to signal "rich" UI.

---

## 3. CSS Hygiene & Preflight Standards

To prevent layout degradation, hardcoded specificity conflicts, and broken mobile variants:

* **No Aggressive Universal Resets:** Never define `* { margin: 0; padding: 0; }` in `globals.css`. Allow Tailwind CSS v4 Preflight to handle box resets naturally.
* **Scoped Document Typography (`.prose`):** Document typography spacing (`h1`-`h6`, `p`, `ul`, `ol`, `li` margins) MUST be scoped under `.prose` for markdown or editorial pages. Never force global bottom margins on raw `<p>` or `<h1-h6>` elements, as this corrupts UI components like cards, badges, and modals.
* **No Raw HTML Tag Overrides:** Never apply default padding or background colors to raw HTML elements (e.g., `button`, `input`). Utility classes (`.btn`, `.input-base`, Tailwind classes) must be used explicitly.
* **Input & Search Icon Layering:** Search inputs featuring internal icons MUST position icons using `pointer-events-none z-10` with matching explicit left padding (`pl-10` or `pl-11`) on the `<input>` element to prevent text and placeholder overlapping.
* **Tailwind Utility First:** Component spacing must rely on Tailwind utility classes (`gap-4`, `p-4`, `mb-6`) rather than manual CSS rules in `globals.css`.

---

## 4. Mobile-First & Responsive Approach

A mobile-first mindset is strictly enforced across the codebase. Layouts gracefully scale up rather than gracefully degrading.

* **Responsive Grids:** Complex layouts start stacked on mobile (`grid-cols-1`) and expand to multi-column grid layouts on larger screens (`md:grid-cols-2`, `lg:grid-cols-3` or `xl:grid-cols-3`).
* **Nested & Side-by-Side Grid Column Sizing:** When embedding card grids inside side-by-side split layouts (e.g., `lg:flex-row`, multi-column parent panes), NEVER use high column counts like `grid-cols-4` in a half-width container. A split pane only has ~350px-450px available width. In split containers, use a 2x2 grid (`grid-cols-2`) so each card maintains a minimum comfortable width ($\ge 160\text{px}-200\text{px}$). Full 4-column grids (`grid-cols-4`) are strictly reserved for standalone, full-width rows.
* **Defensive Card Layout Hygiene:** All nested grid items, stat buttons, and flex containers MUST include `min-w-0` to prevent flex blowout. Card header labels and subtexts must use `truncate` with `shrink-0` on icons to guarantee text never breaks into awkward vertical stacks or overlaps adjacent cards.
* **Card Header & Spatial Alignment Hygiene:** Never use arbitrary hardcoded left padding offsets (like `pl-11`) to manually align subheaders beneath an icon; this causes text and badges to wrap awkwardly on narrow mobile viewports. Instead, structure headers using flex columns/rows with direct icon containers (`w-11 h-11 shrink-0`), placing brand names, legal entity subtitles, domain badges, and right-aligned location pills into distinct, dedicated flex groups.
* **Zero-Scroll Full Viewport Standard (Mobile & Desktop):** Dedicated single-focus views (such as `Liverpool FC Matchday Hub`) utilize a strict full viewport layout (`h-[100dvh] max-h-[100dvh] overflow-hidden`) across *both* mobile and desktop viewports. The match card uses a **3-zone architecture**: Head Strip (domain badge + home/away context chip), Clash Arena (side-by-side crests `w-28 h-28 rounded-3xl`; LFC home side tinted red; dark VS pill), and Countdown Tray (recessed `bg-slate-50/90`; 4 `CountdownTile` units; seconds tile accents red when imminent). No redundant fixture headline text — team names are shown only beneath each crest. Calibrated bottom clearance (`pb-24 sm:pb-28`) clearing `CompactBottomBar` without clipping or scrolling.
* **Desktop Entry Screen Standard:** Single-page entry points (`HomeView`, `ContactView`) utilize a compact 100vh layout on desktop (`lg:h-screen lg:max-h-[100dvh] lg:overflow-hidden lg:py-0 lg:pb-0`) to eliminate unnecessary scrollbars, while reverting to fluid vertical scrolling on handheld mobile devices (`min-h-screen overflow-y-auto py-20 pb-32 sm:py-24 sm:pb-36`) to comfortably clear `CompactBottomBar`.
  - **Compact Profile Dashboard (`HomeView.tsx`):** Symmetric `lg:grid-cols-12` split (6/6: content left, metrics right). Left column: responsive `64px` to `80px` rounded avatar with grayscale-to-color hover transition, active status chip with `animate-ping` pulsing dot, bold `h1` headline with alternating solid weights (`text-slate-900` for power words, `text-slate-400` for prepositions — e.g. `"Engineering systems / by day. Miles / everywhere."`), short bio, and a unified 2-column floating card widget for Location and live Jakarta time. Right column: "Professional Impact" metrics panel (strict symmetric 3-column dense grid) and Direct Channels grid (Explore Work, Contact, GitHub, LinkedIn) with touch-optimized hover actions. Enforces a strict zero-redundancy rule where each data point appears exactly once.
  - **Compact Contact & Inquiry Hub (`ContactView.tsx`):** Asymmetric `lg:grid-cols-12` split (5/7: context left, actions right). Left column: active status chip with `animate-ping` pulsing dot, dominant typographic headline (`"Let's build something worth shipping."`), sub-copy, unified 2-column Location & Time floating card widget (`Toba, ID` and live Jakarta clock), system version pill, and client-calculated relative timezone offset (`Same timezone`, `Xh ahead of you`, or `Xh behind you`). Right column: floating inquiry topic card (`rounded-[2rem] border border-slate-200/80 shadow-sm p-5 sm:p-6`) with 4 domain presets (`Handshake`, `Briefcase`, `Cpu`, `Coffee`) compiling dynamic `mailto:` parameters, and a 2x2 grid of direct contact channels (Email, Telegram, LinkedIn, GitHub) featuring domain icon squircles, 1-click clipboard copying (`FaRegCopy` → `FaCheck`), diagonal linkout arrows (`ArrowUpRight`) with `group-hover:translate-x-0.5`, and a floating `AnimatePresence` copy confirmation toast.
* **Mobile-First Scrolling:** On standard multi-card feeds and dashboard views (`< lg`), pages revert to fluid vertical scrolling (`min-h-screen overflow-y-auto py-20 pb-32 sm:py-24 sm:pb-36`) to accommodate the floating bottom navigation bar (`CompactBottomBar`).
* **Fluid Spacing & Typography:** Margins, padding, and font sizes scale smoothly based on breakpoints (e.g., `pt-24 sm:pt-32`, `text-3xl sm:text-5xl lg:text-6xl`, `px-3 sm:px-4`).
* **Touch Targets & Feedback:** Interactive elements feature generous touch target areas and active feedback (`active:scale-95`, `active:scale-[0.98]`) for tactile confirmation on mobile devices.

---

## 5. Floating Bottom Navigation (`CompactBottomBar`)

The primary application navigation utilizes a floating dock card positioned at the bottom of the viewport:

* **Dock Card Surface:** `bg-white/95 backdrop-blur-md border border-slate-200/70 rounded-2xl` with a lightweight shadow (`0 4px 24px -4px rgba(15,23,42,0.10)`). Uses `backdrop-blur-md` for a subtle glass quality without visual noise.
* **Size & Footprint:** Deliberately compact — `p-1` bar padding, `min-w-[44px] sm:min-w-[52px]` per button, `w-7 h-7` icon container, `15–16px` icons. Keeps a low visual profile while remaining comfortably tappable.
* **2-Color Palette (Strictly Enforced):** The nav bar uses only **2 core colors** — `slate-900` (active pill background) and neutral `slate-*` (inactive labels/icons). The only permitted accent color is `rose-500` for the admin pending badge pip. Per-category multi-color accent systems (indigo/emerald/amber/rose per section) are **strictly forbidden** in the nav bar.
* **Item Layout:** Each nav item is a vertical `flex-col` stack — **icon on top, label below** — always visible on all breakpoints (`text-[9px]`). Labels are never hidden. `ChevronUp` (`w-2 h-2`) indicator inline with the label for items with submenus.
* **Active State:** Active items render a `bg-slate-900 rounded-[0.625rem]` squircle **behind the icon only** (`w-7 h-7` container with `layoutId="nav-active-icon"` spring animation). The label transitions to `font-bold text-slate-900`. The squircle slides fluidly between items via Framer Motion `layoutId`.
* **Inactive State:** Icon is `text-slate-400`, label is `font-medium text-slate-400`. On hover: icon lifts to `text-slate-700`, label to `text-slate-600`, with a subtle `bg-slate-100/60` background pill.
* **Section Divider:** A `w-px h-5 bg-slate-200/80 mx-0.5` vertical line separates the public nav group (Home → Adventures) from the admin section (Admin).
* **Submenu Pop-over:** `bg-white rounded-xl border border-slate-200/70 w-48` — smaller than before (`rounded-xl` not `rounded-2xl`, `w-48` not `w-52`). Features a compact section header with a neutral `w-6 h-6 rounded-lg bg-slate-100` squircle icon. "Insights" sub-menu hosts Blog, Investments, Liverpool FC, and Utils. "Admin" sub-menu hosts Tasks, Blog Editor, Stock Manager, and Quick Reminders with pending count badges.
* **Submenu Active Rows:** Active sub-items use a unified `bg-slate-900 text-white rounded-lg` row — no per-category colors. Inactive rows use `hover:bg-slate-50`. Badge pills in submenus use `bg-slate-900 text-white` (inactive) or `bg-white/20 text-white` (active).
* **Admin Badge Pip:** `rose-500` dot (`h-[12px] min-w-[12px] rounded-full`) at `absolute -top-1 -right-1` on the icon container, with `ring-[1.5px] ring-white`. Disappears when the Admin submenu is open.

---

## 6. Motion, Animation, & Feedback

Animations are used purposefully to guide attention and provide feedback. **Less is more.**

* **Framer Motion Integration:** Page transitions, popovers, and animated tab pills utilize `framer-motion` for fluid state changes.
* **Spring Physics:** Animations favor spring physics (`type: "spring", stiffness: 380, damping: 30` or `stiffness: 260, damping: 20` for floating card hover lifts) over linear easing for a snappy, organic feel.
* **Micro-interactions:** Hover states are enriched with slight translations (`hover:-translate-y-1.5`, `whileHover={{ y: -4 }}`), scale boosts (`hover:scale-105`), and subtle shadow enhancements.
* **Accessibility (Reduced Motion):** All animations respect user accessibility settings via the `useReducedMotion()` hook.
* **Animation Discipline:** Apply animations only to state-driven transitions (hover, focus, mount, dismiss). Never animate static decorative elements. Never use `animate-bounce` or `animate-spin` on non-functional icons.

---

## 7. Typography & Text Contrast

* **Metric Typography:** Primary values use large font sizes and extra-bold weights (`text-xl sm:text-3xl font-extrabold text-slate-900`) for immediate legibility.
* **High Contrast Hierarchy:** Primary labels use `text-slate-700 font-bold`, while secondary units and sublabels use `text-slate-500 font-semibold`.
* **Dark Mode & Dark Panels:** When using dark containers (`bg-slate-900`), text MUST be set to pure white or vibrant glowing accents (`text-indigo-400`, `text-emerald-400`, `text-cyan-400`, `text-red-400`) with sufficient contrast.
* **Zero Gradient Text:** Multi-color gradient text (`bg-clip-text text-transparent`) is absolutely prohibited on any headline, badge, or label. All text must be a single, deliberate solid color.
* **Authentic Microcopy:** All button labels, tooltips, placeholders, and section headings must be written in plain, direct language. No AI-speak marketing phrases (see §2.1).

---

## 8. Color System & Semantic Accents

* **Base Palette:** Neutral slates for structure (`slate-50` to `slate-950`). Use exclusively `slate-*` for neutral tones — never `gray-*` or `zinc-*`.
* **Semantic Accents:**
  * **Indigo/Blue:** Engineering, systems architecture, primary actions.
  * **Emerald/Teal:** Active states, running/endurance logs, match victory results (`WIN`), success metrics.
  * **Cyan:** Fintech systems, interactive data cards, chart indicators.
  * **Red / Crimson (`red-600` / `#C8102E`):** Liverpool FC Matchday Hub, Anfield home badges, countdown highlights, live matchday indicators.
  * **Amber / Gold (`amber-500`):** Match draws (`DRAW`), trophies, wishlists, market volatility warnings.
  * **Rose / Coral (`rose-600`):** Alerts, notifications, match losses (`LOSS`), pending task counters.
* **Color Discipline:** NEVER apply more than 3 distinct accent colors within a single card component. Color choices must reinforce semantic meaning, not decoration.

---

## 9. Progressive Loading & Infinite Pagination Standards

For content-heavy feeds, journals, and dynamic list views:

* **Progressive Batch Slicing:** Render initial content in controlled batches (e.g. `PAGE_SIZE = 6`) to optimize DOM tree performance and initial rendering speed.
* **Dynamic Category Count Pills:** Category selectors MUST compute and display dynamic count badges next to category labels (e.g., `All (12)`, `Tech (6)`, `Finance (3)`) to communicate dataset scale.
* **Sorting Standard:** Provide clean, accessible sorting dropdowns with standardized modes: `date-desc` (Newest First), `date-asc` (Oldest First), `read-asc` (Quickest Read), `read-desc` (Deepest Read).
* **IntersectionObserver Sentinel:** Use a sentinel element combined with `IntersectionObserver` at the bottom of lists for seamless auto-loading. Provide shimmering `Skeleton` placeholders during load transitions.
* **Filter State Resets:** Automatically reset visible pagination counts to page 1 whenever category filters or search inputs change.
* **End-of-Archive Indicator:** When all items are loaded (`!hasMore`), display a clean end-of-archive badge summarizing the total record count.

---

## 10. Empty State Design Patterns

Empty states are critical UX moments that guide users when no data is available. They must be contextual, actionable, and visually consistent.

* **Floating Card Container:** Use solid white surfaces (`bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-xs`).
* **Actionable CTAs:** Always provide a clear action when the user can fix the empty state (connect account, clear filters, refresh, etc.).
* **Icon Selection (domain-specific only):**
  - `CheckCircle` = Success / ready state
  - `ShieldAlert` = Warning or error state
  - `InboxIcon` = Empty inbox or no results found
  - `Activity` = Integration / sync related
  - `TrendingUp` = Data exists elsewhere or awaiting first entry
  - **Do NOT use `Sparkles` for any empty state.** Use `InboxIcon`, `FolderOpen`, or a domain-specific icon instead.
* **Copy Discipline:** Empty state messages must be specific to the domain. NEVER use generic phrases like "Nothing here yet!" or "No data found." Write contextual, instructional copy (e.g., "No running activities synced. Connect your Strava account to import your logs.").

---

## 11. Error Page Standards

Error pages (404, 500, etc.) must be simple, direct, and provide clear navigation options.

* **404 Not Found Pattern:**
  - Large, bold 404 number (7xl-8xl font size)
  - Clear headline: "Page Not Found"
  - Brief explanation: One sentence maximum
  - Dual action buttons: Primary (Go Home) + Secondary (Go Back)
  - Centered floating card (`max-w-md bg-white border border-slate-200/80 rounded-3xl shadow-xs`)
  - No decorative emojis, no `Sparkles` icon, no gradient text on error pages.

---

## 12. Authentication & Session Management UX

Authentication flows must be seamless, secure, and user-friendly with automatic session maintenance.

* **TOTP Authenticator Protection (`PinGuard.tsx`):** Protects restricted sections (Admin, Tasks) using a 6-digit Google Authenticator code verified via `otplib`. Optimized for device numeric keypads with 12-hour session lifetime.
* **Multi-Layer Token Refresh System:**
  - Server-side token refresh on every page request via `proxy.ts`.
  - Client-side proactive monitoring every 5 minutes (`AuthProvider`).
  - Redis session layer maintaining 30-week sessions with automatic TTL extension on activity.

---

## 13. HTML5 Canvas Export & Web Share Standards

Dynamic image and sticker generation provides engaging, shareable visual summaries across adventures, utilities, and travel.

### Canvas Rendering Principles
* **High-DPI Retina Scaling:** Canvas dimensions MUST be scaled by `window.devicePixelRatio` or a minimum of `2x` (e.g. `800x500` rendered at `1600x1000`) before rendering to prevent blurry text and pixelated artifacts on high-density displays.
* **Next.js CSS Variable Font Extraction:** Canvas 2D contexts do not parse CSS variables (like `var(--font-caveat)`). When rendering custom Next.js fonts on Canvas, dynamically resolve the true computed font-family name from a temporary DOM element (`window.getComputedStyle(dummy).fontFamily`) and await `document.fonts.ready` before drawing.
* **CORS-Safe Asset Loading:** External images must be loaded using `img.crossOrigin = "anonymous"` to avoid tainting the canvas and blocking image export.

### Web Share API & Export Action Ergonomics
* **Native Web Share Sheet (`navigator.share`):** On supported devices (iOS Safari, Android Chrome, macOS Safari), integrate `navigator.share({ title, text, url })` formatting rich activity summaries (*"🏃 Morning Run — 10.02 km in 52m 14s (Avg 5:13/km)"*) to open native system share dialogs (WhatsApp, Telegram, AirDrop, Messages).
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

## 14. Developer Utilities UI/UX & Module Focus Patterns

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

## 15. System Audio & Hardware Integration Standards

When utilizing native browser and device APIs for real-time utilities:

* **Web Audio API (Synthesized Audio):**
  - Synthesize sounds programmatically using `AudioContext` and `OscillatorNode` (e.g., countdown beeps in `timer`, ticker clicks in `spinner-wheel`) instead of relying on heavy external audio files.
  - Initialize the `AudioContext` only after explicit user interaction (click or start button) to adhere to browser autoplay policies.
* **Screen Wake Lock API:**
  - For continuous operations (e.g. Running Interval Timer, Device Benchmarks), acquire a wake lock via `navigator.wakeLock.request("screen")`.
  - Automatically re-acquire the wake lock if the page visibility changes from hidden back to visible (`document.addEventListener("visibilitychange", ...)`).

---

## 16. Admin & Operational Productivity Patterns

Operational views (e.g., Admin Dashboard, Task Agenda, Quick Reminders, Stock Manager) emphasize speed, clarity, and zero cognitive friction.

### Keyboard Shortcuts Standard
* **Instant Submission:** All administrative forms and text entry tools (Quick Reminders note area, Stock Admin JSON input) MUST support <kbd>⌘ + Enter</kbd> (Mac) and <kbd>Ctrl + Enter</kbd> (Windows/Linux) to immediately submit or import data without clicking the button.

### Multi-Modal Clipboard Copy Ergonomics
* **Immediate Visual & In-Place Confirmation**: Interactive copy actions (e.g. in `ContactView`, `QuickReminders`, and code utilities) MUST provide immediate dual-channel feedback:
  1. *In-place Icon Transition*: The copy trigger switches instantly from `FaRegCopy` to `FaCheck` in `emerald-500` for 2 seconds.
  2. *Floating Confirmation Toast*: An animated pill toast (`AnimatePresence` with `y: 16` slide-up) renders centered above the bottom bar (`fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-xl shadow-lg z-[100]`) displaying `FaCheck` and `"Copied to clipboard"`, dismissing automatically after 2000ms.
  3. *Accessible Labels*: Semantic `aria-label` attributes (e.g. `Copy Email`, `Copy LinkedIn`) and native `type="button"` with `cursor-pointer`.

### Quick Reminders Standard (`/admin/reminders`)
* **Full-Width Alignment & Creation Card:** Container uses `w-full space-y-6 sm:space-y-8` inside `max-w-5xl`. Features an elevated creation card with an Amber squircle badge (`w-12 h-12 rounded-2xl bg-amber-50 border-amber-200/70 text-amber-600`), character limit counter, segmented TTL duration track (`1 Day`, `1 Week`, `1 Month`), and solid dark submit button (`bg-slate-900 text-white`) with <kbd>⌘/Ctrl + Enter</kbd>.
* **Modern Floating Controls Toolbar:** Elevated floating toolbar featuring segmented filter tabs with dynamic count badges (*All, Expiring Soon, 1 Day, 1 Week, 1 Month*), active filter summary text, and search input with explicit icon layering (`pointer-events-none z-10`, `pl-10`).
* **Accent Line Reminder Cards:** 1.5px solid top border accents indicating expiry state (`amber-500` for expiring soon, `sky-500` for 1D, `indigo-500` for 1W, `purple-500` for 1M), tactile duration extension pills (`+1D`, `+1W`, `+1M`), one-click note text copy with visual checkmark feedback, and interactive linkified URL pills.

### Stock Manager Import Protocol (`/utils/stock-explorer/admin`)
* **Modern Floating Card Header Standard:** Anchored by an indigo squircle icon (`w-12 h-12 rounded-2xl bg-indigo-50 border-indigo-200/70 text-indigo-600 shadow-2xs`) with `Database`, domain badge (`Financial Registry`), breadcrumbs (`Admin Dashboard › Stock Registry`), and `Back to Explorer` button.
* **Redis In-Memory Registry Telemetry:** Real-time cache indicator (`Active Cache` with pulsing dot, `Verifying`, or `No Cache / Expired`), operational action triggers (`Refresh Status`, `Sync Live` with live radio indicator, and `Purge Cache` modal trigger), and 3 telemetry tiles (`Total Instruments`, `Trading Session`, `Cache Lifespan`).
* **Dismissible Manual Override Notice:** Protocol notice with `ShieldCheck` explaining fallback manual JSON priming when cloud datacenter IPs are blocked by IDX.
* **Interactive JSON Console:** Empty state dashed dropzone (`Paste JSON or Drop File Here`), multi-preset sample triggers (`Sample Banks`, `Sample Tech` using `LayoutTemplate` — strictly no `Sparkles`), syntax formatting tool, character/line counter, and <kbd>⌘/Ctrl + Enter</kbd> import shortcut.
* **Searchable Pre-Import Inspector Drawer:** Aggregated session date, total trading volume, turnover value (Rp), detected instrument count, and a collapsible sample table with **real-time ticker search filtering** for previewing instruments before committing to Redis cache.

### Blog Management Portal Standard (`/admin/blog`)
* **Modern Floating Card Header Standard:** Anchored by a blue squircle icon (`w-12 h-12 rounded-2xl bg-blue-50 border-blue-200/70 text-blue-600 shadow-2xs`) with `BookOpen`, domain badge (`Knowledge Base`), contextual breadcrumbs (`Admin Dashboard › Manage Blog`), and direct dual actions: `View Public Blog ↗` (opens live `/blog` in a new tab) and solid dark `Create New Post` (`bg-slate-900 text-white hover:bg-slate-800`).
* **4-Tile Interactive Telemetry KPI Strip:** Server-rendered 4-column desktop / 2-column mobile strip (`Total Articles`, `Published`, `Drafts`, `Headlines` with `Star` — strictly no `Sparkles`) functioning as 1-click filter links (`?status=published`, `?status=draft`, `?headline=true`, reset) with active focus rings and elevated backgrounds.
* **Single Canonical Floating Card Architecture:** Eliminates redundant outer card wrapping around `DynamicAdminBlogList`. The table, toolbar, search, and bulk operations live inside a single floating card (`bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden`).
* **Refined Skeleton:** `BlogListSkeleton` matches the rounded-3xl geometry, toolbar height, and shimmer animation.

---

## 17. Insights & Aggregation Hub Standards

Hub and aggregator pages (e.g., `/insights`, `/adventures`) provide curated entry points into the platform's analytical subsystems.

* **Global Intelligence Telemetry Strip:** Top 4-stat telemetry strip previewing core platform domains with solid icon squircles and high-contrast numbers.
* **Module Cards:** Encapsulated in `rounded-[2rem]` floating cards with category badges, high-contrast linkout arrows (`ArrowUpRight`), descriptive body text, and thematic topic tags.
* **Spring Hover Physics:** Cards lift organically on hover (`whileHover={{ y: -4 }}`) with subtle shadow expansion (`shadow-md`).
* **Thematic Accents:** Use distinct badge color pairings to reinforce domain boundaries (Indigo for Architecture/Blog, Emerald for Financial/Investments, Rose for Liverpool FC, Cyan for Developer Utilities).
* **Navigation Clearance:** Standardize bottom padding clearance to `pb-32 sm:pb-36` to ensure comfortable clearance above `CompactBottomBar`.

---

## 18. Modern Floating Card Header Standard

Full-bleed dark slate banners (`bg-slate-900 border-b border-slate-800`) are strictly obsoleted across the entire application in favor of the **Modern Floating Card Header Standard**:

* **Container Architecture:** All management, intelligence, operational views, and utility tools (e.g., `/admin`, `/admin/blog`, `/admin/reminders`, `/utils/stock-explorer/admin`, `/tasks`, `/investment`, and `/utils/*`) encapsulate the hero header within a floating card (`bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs`) resting on the signature textured canvas (`bg-slate-50/80 bg-dot-pattern`).
* **Container Alignment & Max-Width:** The floating header card MUST share the exact same `max-w-*` container width and padding as the cards beneath it (`max-w-4xl`, `max-w-5xl`, or `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`).
* **Header Hierarchy & Elements:**
  - **Domain Theme Badge:** A clean, concise domain badge pill (e.g. `Operations Hub`, `Financial Registry`, `Quick Reminders`, `Knowledge Base`, `Market Intelligence`, `Development & Code`). Strictly forbid `'•'` or `'·'` (middots) as separators, eliminate compound slogan badges (`CATEGORY • marketing sublabel`), avoid stacking redundant subtitle paragraphs, and avoid `whitespace-nowrap` on long badges that causes mobile horizontal blowout.
  - **Mobile Clearance Hygiene:** Badges must never blow out card containers on narrow viewports. When additional telemetry badges are shown alongside the domain pill, they wrap naturally (`flex-wrap gap-2`).
  - **Domain Icon Squircle Anchor:** An elevated visual anchor squircle (`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-<domain>-50 border border-<domain>-200/70 text-<domain>-600 shadow-2xs`) placed beside the title block.
  - **Confident Headline:** Extra-bold solid heading `h1` (`text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight`).
  - **Breadcrumbs Navigation:** Contextual breadcrumbs (`Admin Dashboard › ...` or `Home › Utilities › ...`) using semantic muted links (`!text-slate-500 hover:!text-slate-900`) and `<ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />`.
* **Utility Tool Header Architecture (`UtilHeader.tsx` & 3-Tier Pattern):**
  To prevent title compression, badge distortion, and horizontal action collisions on tools with long names or multi-button controls (e.g., `Text Compare Studio`, `Asset Averaging Calculator`, `Code to Image`):
  - **Tier 1 (Navigation Bar):** Breadcrumb trail on the left, clean compact `← Back to Utilities` return button on the right, separated from content with `pb-4 border-b border-slate-100`. Eliminates navigation buttons from fighting with the title for horizontal width.
  - **Tier 2 (Hero Title & Intellectual Context):** Large domain squircle anchor, domain theme badge with `whitespace-nowrap`, bold `h1` headline with 100% horizontal clearance, and a lede subtitle/description directly underneath the title.
  - **Tier 3 (Dedicated Action & Presets Toolbar):** When interactive presets, scenarios, or export controls are provided, they span a dedicated full-width strip (`pt-4 border-t border-slate-100/90`), keeping the title area spacious and completely unconstrained.
* **Top Clearance Hygiene:** Main content containers must declare sufficient top clearance (`pt-20 sm:pt-24` or `pt-24 sm:pt-28` when fixed switchers like `QuickNav` are present) to ensure floating navigation switchers never overlap, clip, or obscure header titles.
* **Single Canonical Floating Card Architecture:** Parent admin views (e.g., `/admin/blog`) must NEVER wrap already-contained card components in nested card containers with duplicate borders. Lists, tables, and consoles maintain a single canonical `rounded-3xl border border-slate-200/80 shadow-xs` surface.
* **Quick Reminders Modern Floating Card Standard (`/admin/reminders`):**
  - **Zero Colored Accent Strips Mandate:** Reminder cards strictly eliminate asymmetric colored strips (`h-1.5` top bars or colored left borders) in favor of uniform, symmetrical `rounded-3xl border border-slate-200/80 hover:border-slate-300` floating cards.
  - **Context-Aware Domain Squircles:** Each card is anchored by a duration squircle (`Clock` for 1 Day, `Calendar` for 1 Week, `CalendarDays` for 1 Month) paired with uppercase TTL labels and created timestamps.
  - **Expiry Telemetry Pill:** Expiring notes (< 24h) display an amber alert pill (`bg-amber-50 border border-amber-200 text-amber-800`) with an organic pulsing dot indicator (`animate-pulse`).
  - **Ergonomic Action Tray:** Card footer isolates 1-click note copy (`Copy Note` with checkmark animation), segmented duration extensions (`+1D`, `+1W`, `+1M` with `touch-manipulation`), and danger-gated deletion with `CustomModal`.

---

## 19. Floating Widget Hygiene & Anti-Collision Mandate

To maintain an uncluttered viewport and eliminate gesture conflicts on both mobile and desktop:

* **Zero Bottom-Right Overlays:** The bottom-right viewport area is reserved exclusively for the global command palette trigger (`SEARCH ⌘K`). No secondary floating buttons (such as floating "Back to Top" pills or floating scroll progress indicators) are permitted in this area.
* **In-Flow Document Return:** Long-scroll views (such as Blog Reading pages at `/blog/[slug]`) must use in-flow document return navigation (e.g., a centered "Back to Top" button positioned at the end of the article alongside "Back to Insights") rather than fixed floating buttons that obscure underlying content or bottom controls.
* **Native & Lightweight Progress Indicators:** Reading progress is communicated via discrete header metadata (e.g. estimated reading time, word count) or browser-native scroll dynamics, eliminating intrusive circular HUDs or redundant floating bars.

---

## 20. Operational Cache Telemetry & Control Pattern

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

## 21. Feature-Module Cleanliness & Dead Code Policy

* **Domain-Driven Isolation:** All application logic and UI components reside under domain folders in `features/<domain>/` (e.g. `features/tasks/`, `features/investment/`, `features/adventures/`).
* **Shared UI Consolidation:** Reusable global primitives (such as `CustomModal`, `CompactBottomBar`, `StockTicker`, `Skeleton`, `JsonValue`, `InfoTooltip`) reside exclusively in `features/shared/components/`.
* **Zero Orphaned Directories:** Legacy root `components/` folders and dead UI components (such as standalone `Button.tsx`) must be purged to maintain single-source architectural integrity.
* **Full-Repository Biome Coverage:** The entire codebase must be continuously formatted and linted via Biome, with `biome.json` explicitly including all TypeScript and TSX files across `app/`, `features/`, `lib/`, `services/`, and `types/`.

---

## 22. Engineering Journal & Blog Standards (`/blog`, `/blog/[slug]`)

To ensure an exceptional reading and browsing experience across long-form essays, technical architectures, and training logs:

* **Engineering Journal Hub Standard (`/blog`):**
  - **Modern Floating Card Header Standard:** Elevated card (`bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs`) anchored by an indigo squircle (`BookOpen`), domain badge (`Engineering Journal`), contextual breadcrumbs (`Home › Insights › Blog`), and responsive 3-stat telemetry box (`Articles`, `Domains`, `Words`). Zero AI-slop slogan badges, zero redundant subtitle strings, and zero mobile overflow.
  - **Symmetrical 3-Column Floating Cards:** Clean `rounded-3xl` cards without asymmetric colored strips. Features responsive `aspect-[16/10]` image container, category pill, featured/protected status badges, paired calendar date and reading time telemetry row, 3-line clamped excerpts, and tactile `Read Article` button with `ArrowUpRight` micro-interaction.
  - **Mobile-First Filter Toolbar:** Category filter pills with count badges and `touch-manipulation`, explicit search input layering (`pointer-events-none z-10` with `pl-10`), and sort selector.
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
  - Supports GitHub alert blocks (`[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`) styled with thematic Lucide icons (`Info`, `Lightbulb`, `AlertCircle`, `AlertTriangle`, `ShieldAlert`), tinted borders, and high-contrast solid backgrounds.
  - **Do NOT use `Sparkles` as an alert callout icon.** Use `Lightbulb` for tips, `Info` for notes.
* **Editor Toolbar Scaffolding (`BlogForm.tsx`):**
  - Provides quick scaffolding buttons clustered into logical groups (`[ H2 | Bold | Italic ]`, `[ Code | Code Block | Link ]`, `[ Bullet List | Numbered List | Callout Note | Table | Divider ]`).
  - One-click GFM Table injection scaffolds alignment delimiters (`:---`, `:---:`) to eliminate manual pipe formatting syntax.

---

## 23. AI Code Review Checklist

Before submitting any AI-generated or AI-assisted component for code review, verify the following:

### Visual Integrity
- [ ] No gradient text, gradient headers, or gradient modals
- [ ] No ambient blur orbs (`blur-3xl`, `blur-[100px]`)
- [ ] No `Sparkles` icon used anywhere in the component (strictly blacklisted forever sitewide)
- [ ] Single canonical card architecture respected (zero nested duplicate card borders on admin portals)
- [ ] Floating cards hosting dropdowns or popovers do NOT declare `overflow-hidden` (decorative watermarks wrapped in dedicated inner clipping wrapper)
- [ ] No raw unicode emojis in UI surfaces
- [ ] No more than 3 accent colors in a single card

### Pattern Discipline
- [ ] Clean Header Standard followed: contextual breadcrumbs at top, bold title `h1`, straight-to-the-point description, and right-aligned buttons or telemetry stats
- [ ] No repetitive decorative category section pills or squircles (`Market Guideline`, `Engineering Journal`, `Performance Hub`, `Utility Registry`) above page titles
- [ ] No redundant action triggers in cards (never declare both a top-right arrow button `↗` and a bottom `Launch Console ↗` / `Launch →` action in the same card)
- [ ] No generic `rounded-full` category pills in card corners (reserve badges strictly for real-time telemetry metrics with discrete `rounded-lg`/`rounded-md` borders)
- [ ] Hero section does NOT follow: emoji → gradient headline → subtitle → CTA button pattern
- [ ] Card grid items are NOT all structurally identical (icon + title + description + link)
- [ ] No "Feature section" with 6 uniformly identical icon-description blocks in a 3x2 grid
- [ ] Loading states use in-shape skeleton placeholders, not generic spinners
- [ ] Empty states have domain-specific copy, not generic "Nothing here yet!" phrases

### Motion & Animation
- [ ] No `animate-bounce` or `animate-spin` on decorative elements
- [ ] Animations are state-driven only (hover, mount, dismiss)
- [ ] `transition-all` is NOT used as a blanket style; specific properties are targeted
- [ ] Stagger animations use 0.1s or less delay per item
- [ ] Interactive SVG motion elements declare explicit base attributes (e.g., `strokeWidth={30}`, `initial={false}`)
- [ ] Above-the-fold hero grid images declare `priority={index === 0}` and `loading="eager"` for optimal LCP scores
- [ ] All Next.js `<Image fill />` components declare responsive `sizes` attributes to prevent browser over-fetching and console warnings

### Copy & Microcopy
- [ ] No AI-speak phrases ("Supercharge", "Level up", "Game-changing", "Seamlessly", "Unlock")
- [ ] Button labels are action-specific verbs, not generic ("Submit", "Click Here", "Learn More")
- [ ] No Lorem ipsum placeholder text anywhere

### Code Structure
- [ ] Component lives in the correct `features/<domain>/` directory
- [ ] No orphaned files in root-level `components/` directory
- [ ] Icon imports come exclusively from `lucide-react` or `react-icons/fa`
- [ ] `gray-*` or `zinc-*` Tailwind classes are NOT used (use `slate-*` only)
- [ ] Numeric and currency formatting uses explicit locale strings (`.toLocaleString("id-ID")` for IDR/IDX, `.toLocaleString("en-US")` for USD/Crypto/percentages) to prevent SSR/CSR hydration mismatches

---