# UI/UX Engineering Guidelines

This document outlines the core UI/UX patterns, design principles, and architectural standards for the `personal-web-v2` codebase, standardized around a **Modern Floating Card** dashboard aesthetic.

> [!CAUTION]
> **Anti-AI-Slop Mandate (Strict).** Every AI assistant working on this codebase MUST treat this guideline as a hard constraint — not a suggestion. The most common failure mode is AI-generated "slop": predictable, generic, template-like UI patterns that look like every other SaaS product. The rules in this document exist to prevent that outcome. Violations will be reverted.

---

## 1. Core Design Philosophy: Floating Cards & Precision Surfaces

The application utilizes a unified, modern dashboard aesthetic characterized by clean surfaces, distinct depth, and precise data visualization. **No aesthetic decision should ever look auto-generated.**

* **Subtle Textures & Clean Dot-Free Canvas:** The global background utilizes a clean off-white or very light gray canvas (`bg-slate-50/80` or `var(--canvas-bg, #eceef2)`). Dot pattern overlays are permanently removed across all backgrounds to ensure pristine legibility, distraction-free surfaces, and optimal contrast for floating cards.
* **Contrast Mastery & Pure White Container Standard (Anti-Monolithic Dark Mode):** Standard panels, telemetry showcases, and operational cards rely strictly on pure white containers (`bg-white border border-slate-200/80 rounded-3xl shadow-xs`). Full-bleed dark slate banners (`bg-slate-900 border-b border-slate-800`) and monolithic dark-mode content dashboards are strictly prohibited — they feel oppressive, clash with the signature light textured canvas (`bg-slate-50/80 bg-dot-pattern`), and degrade legibility. Dark slate panels (`bg-slate-900`) are reserved exclusively for isolated high-priority metric widgets (such as the Total Pending backlog counter in Tasks), technical code blocks, or specialized transparent sticker canvas exports.
* **Strict Anti-Gradient Mandate (Headers, Modals & Surfaces):** NEVER use gradient headers, gradient modal dialogs, multi-color gradient text (`bg-clip-text text-transparent bg-gradient-to-*`), colored drop-shadow glow filters (`filter: drop-shadow(...)`), or large ambient blurred orbs (`blur-3xl`, `blur-[100px]`). All page headers, modal containers, cards, and interactive components MUST strictly use clean solid surfaces (`bg-white`, `bg-slate-50`), solid borders (`border border-slate-200/80`), solid semantic badge tints (`bg-indigo-50`, `bg-purple-50`, `bg-blue-50`, `bg-amber-50`, `bg-emerald-50`, `bg-rose-50`), and high-contrast solid typography (`text-slate-900`, `text-indigo-600`).
* **Strict Iconography Standard (Anti-Emoji Mandate):** NEVER use raw unicode emojis (e.g., 🤝, 💼, 🚀, ☕, ⚡, 🏆, 🌍) in UI components, topic selectors, headers, or cards. Always use dedicated, scalable SVG icons from `lucide-react` or `react-icons` (e.g., `Handshake`, `Briefcase`, `Cpu`, `Coffee`, `Zap`, `Award`, `Globe`). Emojis render inconsistently across operating systems and degrade the clean, professional engineering aesthetic.
* **Global Telemetry Summary Strip Pattern:** Domain entry points (such as Adventures Landing Hub and Insights Hub) employ a prominent 4-column desktop / 2-column mobile telemetry strip (`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4`) directly beneath the hero header. Each telemetry item is housed in a `bg-white rounded-2xl border border-slate-200/80 shadow-xs` card with a solid semantic squircle icon badge, uppercase tracking label, bold metric value, and descriptive subtext.
* **Direct Icon-Beside-Title Card Layout (Hub & Aggregator Cards):** Navigation and aggregator cards (in `/insights`, `/adventures`, `/admin`) MUST position the domain icon squircle **directly beside the title text** in a single horizontal `flex items-start gap-3` row — NOT stacked above it. The icon anchor (`w-10 h-10 sm:w-11 sm:h-11 rounded-xl`) and bold title (`font-bold text-slate-900`) form a cohesive visual unit. Metric/telemetry pills (e.g. count badges) are right-aligned in the same row via `ml-auto`. Avoid floating the icon into a separate decorative zone or stacking it above the title with redundant category badges — the icon IS the visual anchor for the title.
  - **Travel Tracker & Global Footprint Hub (`/adventures/travel`)**: Airy centered hero (`pt-24 sm:pt-32`), quick stat pill rows (`px-4 py-2.5 bg-white border border-slate-200/80 rounded-full shadow-xs`), responsive search & filter toolbars, and `rounded-[2rem]` floating cards with organic spring hover interactions (`whileHover={{ y: -4 }}`). Strictly enforces the **Travel Wishlist Privacy & Classified Teaser Standard**: private bucket lists and unvisited itineraries are never leaked or detailed openly. Instead, unvisited destinations render as atmospheric, high-tech tactical teaser cards with concentric radar SVG grids, pulsing `Radio` squircle emblems, `Lock` / `Classified` badges, target classification codes (`EXP-01`, `EXP-02`), generalized regional archetypes (*Domestic Archipelago*, *European Horizon*, *East Asian Corridor*, *Southeast Asian Trail*), and redacted coordinate pills (`Coordinates: [REDACTED]` with *"Itinerary kept offline. Revealed upon touchdown."*). Wishlist teaser cards are non-clickable with zero modal exposure. Visited destinations retain full rich imagery, UTC-parsed dates, and launch the interactive 3D PostcardModal for vintage canvas card generation.
  - **Liverpool FC Matchday Hub (`/liverpool`)**: **Zero-Scroll Full Viewport Standard** (`h-[100dvh] max-h-[100dvh] overflow-hidden` on both mobile and desktop), compact breadcrumb navigation, 3-zone floating match card (`NextMatchHero.tsx`) — Head Strip (domain badge + home/away chip), Clash Arena (prominent `w-28 h-28` crests; LFC home side tinted `bg-red-50/70`; dark VS pill), and Countdown Tray (4-tile HUD; seconds tile turns `bg-red-600` when imminent; `MATCHDAY IN PROGRESS` pulsing badge). No redundant fixture headline — team names shown only beneath crests. Calibrated bottom clearance (`pb-24 sm:pb-28`) above `CompactBottomBar`.
  - **Investment Compass & Market Intelligence Hub (`/investment`)**:
    - **Modern Floating Card Standard**: `bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8` resting on the signature textured canvas (`bg-slate-50/80 bg-dot-pattern`).
    - **Risk-First Capital Preservation Standard**: Tailored specifically for rebuilding after extreme portfolio drawdowns (~80%). Prioritizes capital survival, strict exposure limits, and capital preservation over reckless high-frequency speculation. Strictly reader-only for visitors (no trade journals or database mutation forms).
    - **Top Floating Header & Live Telemetry**: Elevated header card (`p-5 sm:p-7`) with `Compass` theme badge, active connection indicator dot (`Live`, `Partial`, `Syncing`), live Data Stream Sources popover (adapting to a centered modal card with soft backdrop overlay on mobile: `fixed inset-x-4 top-28 sm:absolute sm:inset-auto sm:right-0`), Stock Explorer CTA link with `active:scale-95`, and a 4-column desktop / 2-column mobile KPI telemetry strip (`grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4`) with live IHSG (`^JKSE`), USD/IDR, Bitcoin spot, and Crypto Fear & Greed.
    - **High-Precision Financial Telemetry Standard**: Index quotes (e.g., IHSG `^JKSE`) strictly declare 2-decimal financial precision (`6,146.72`) and pair nominal point changes with percentage deltas (`-46.2 (-0.75%)`). Yahoo quote parsing (`services/market-data/yahoo.ts`) prioritizes official `regularMarketChange`/`fulldayChange` over stale `chartPreviousClose` baselines to guarantee exact index deltas.
    - **Decision Engine V3 Strict Weighting**: Engine factor weights (e.g., in `ihsg.ts`, `crypto.ts`, `global.ts`) MUST ALWAYS sum up to exactly `100`. If global telemetry is insufficient, engines must safely exclude the macro carry-in factor rather than absorbing generic default scores.
    - **Strict Instrument Registry Standard**: Never hardcode ticker fallbacks or aliases (like mapping JKSE to IHSG manually in data fetching logic). All symbol mappings and API fallbacks must be strictly handled through the central `INSTRUMENTS` registry.
    - **3-Card Regime Overview Layout & Dual-Axis Telemetry (`OverviewRegimes.tsx`)**: Asymmetric grid (`grid-cols-1 lg:grid-cols-12`) featuring IHSG Composite Regime (6-col), Crypto Liquidity Regime (6-col), and Global Macro Dollar Liquidity Context (12-col) with multi-tiered health score bars (`0–100`), diagnosis narratives, and **Contextual Inline Drawer Pattern**: tapping any factor pill highlights the trigger and expands an animated inline drawer directly inside that active card shell with a quick close button, preventing off-screen scroll jumps on mobile viewports. Features prominent **Asymmetry Zone Overrides** with organic pulsing beacons (`animate-ping`) for generational accumulation and distribution tops. Each market card embeds a compact 2-column **Dual-Axis Telemetry Strip** displaying `Trend / Trading Gate` alongside `Valuation / Accumulation Pace`, visually decoupling short-term momentum trading stops from deep-cycle valuation accumulation.
    - **Macro Scenario Sandbox Simulator (`ScenarioSandbox.tsx`)**: Pure white floating card (`bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs`) with responsive 4-column layout (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) and reactive sliders for Fed Funds Rate (2.00%–6.50%), USD/IDR FX (Rp 14,500–18,000), Bitcoin Price ($30,000–$150,000), and IHSG Index Level (5,500–8,500), instant client-side score recomputation, signed delta badges, and 3 one-click stress-test presets (strictly zero emojis).
    - **Tactical Permissions Matrix (`PermissionsMatrix.tsx`)**: Single source of truth driving daily trading permissions (`Allowed`, `Selective`, `Not Allowed`, `Paused`) for Scalp, Swing, and Core DCA across IHSG, Crypto Majors, and Speculative Altcoins. On mobile viewports (`< lg`), employs an **Executive Stacked Action Card Layout**: distinct header row with action label on left and status badge on right, paired with full-width, comfortably readable explanatory text below, completely eliminating cramped multi-column splits and hardcoded `max-w` truncations. Automatically displays the prominent rose-tinted **Capital Preservation Protocol Active** banner during systemic stress with a hard lockdown on new margin/leverage.
    - **Contradiction-Free Execution Playbook & Pure White Safe Bucket Anchor (`MarketPlaybook.tsx`)**: Dual-card tactical script for IHSG and Crypto mapped strictly to effective permission states (never raw scores), detailing actionable Dos, Avoids, single-source-of-truth position sizing mandates (`getSizingMandate` 40/45/15 standard), thesis invalidation triggers, and predetermined tranche accumulation plans. Guarantees complete visual and mathematical synchronization with the Permissions Matrix. Strictly adheres to the **Pure White Container Standard** via the **Safe Yield & Preservation Anchor Card (40% Target)** (`bg-white rounded-[2rem] border border-slate-200/80 shadow-xs` with high-contrast amber accents and slate sub-cards, prohibiting monolithic dark containers) outlining Retail SBN (ORI/SBR/ST), liquid bank deposits (RDN), and physical gold (LM Antam).
    - **Disciplined Rebuild Rulebook Separation & Linkout Standard (`RulebookActionCard.tsx`, `/utils/rebuild-rulebook`)**: The full 6-section Disciplined Rebuild Rulebook is separated into a dedicated standalone developer utility at `/utils/rebuild-rulebook` (`features/utils/stock-tools/rebuild-rulebook/`). The Investment Compass links to it via a compact Pure White Floating Card action module (`RulebookActionCard`) featuring single-action trigger hygiene, high-contrast button styling (`!text-white font-bold`), and concise label (`"Open Rulebook"`), strictly avoiding inline layout duplication.
    - **Dynamic Recurrent Macro Calendar & Deterministic UTC Parsing (`EventCalendar.tsx`)**: High-impact macro dates with algorithmic recurrence generation across any future year (`generateRecurrentEvents`), market filtering (All, ID, Crypto, US), active seasonal tendency banners (Window Dressing, Musim Dividen, Sell in May), and weekend snapping (`snapToWeekday`) ensuring exchange-bound catalysts (Bank Earnings, Window Dressing, MSCI rebalances) snap to the preceding Friday when landing on Saturday or Sunday. FOMC quarterly dot-plot meetings approximate the 3rd Wednesday. All calendar and catalyst dates in ISO `YYYY-MM-DD` format MUST be parsed via explicit UTC components (`Date.UTC(y, m - 1, d)`) to prevent local client timezone drift.
    - **Critical Catalyst Soft Pre-Alert (H-3 Weekday Window)**: Prominent amber/rose pre-alert cards highlighting Critical catalysts approaching within 0–3 business days with domain impact explanations for IHSG and Crypto. Synchronized with the Telegram daily briefing (`runRegimeAlerts`).
    - **Calibrated Circular SVG Progress Gauge (`RingProgress` in `FearAndGreedGauge.tsx`)**: Standardized circular progress geometry (`radius = 46`, `strokeWidth = 12`) with explicit base initial SVG attributes to eliminate Framer Motion unanimatable value warnings, responsive viewBox scaling, and a centered status indicator. Sparkline trend velocity computations defensively filter non-finite values (`Number.isFinite(d.y)`) to prevent `NaN` coordinates.
    - **Trading Session & Weekend Flow Guard (`idx-flows.ts`)**: Flow records require active market hours (`hour >= 9 WIB` on weekdays) before recording new sessions, and legacy weekend records are automatically pruned to prevent artificial multi-day streak alerts on Mondays.
    - **Zero Dummy/Placeholder Telemetry Policy**: Never hardcode fake fallback rates or metrics (such as defaulting missing bond yields to `"6.85%"`). If telemetry is null or missing, components MUST render clean fallback placeholders (`"---"`).
    - **Post-ETF Bitcoin Dominance Dynamic Threshold Alignment**: Altcoin gate threshold copy and UI logic must dynamically reference `DEFAULT_THRESHOLDS.crypto.altcoinBtcDominanceMax` (calibrated to `59.0%`), never relying on hardcoded or stale threshold strings (e.g. `54.0%`).
    - **Market Delta Alerts Pure White Container Standard (`MarketDeltaAlerts.tsx`)**: Alert cards and drawer regions must strictly follow the Pure White Container Standard (`bg-white rounded-3xl border border-amber-200/90 shadow-xs` with semantic `<section aria-label="Critical Market Delta Alerts">`), strictly forbidding full-bleed amber/colored background containers (`bg-amber-50`).
    - **3-Tab Market Data Terminal & Regime-Aligned Alpha Shortlist (`MarketDataHub.tsx`)**: Full-featured terminal console consolidating 3 dedicated data panes: Indonesia (deduplicated Sovereign & Inflation Telemetry strip for Indo-US 10Y Spread and Indonesia CPI YoY corridor, 6-bellwether Sector Leadership strip with Breadth gauge + Net Foreign Flow streak badge, and live **Regime-Aligned IDX Alpha Shortlist** (`topAlphaPicks`) linking directly to `/utils/stock-explorer?q=TICKER`), Crypto Majors (BTC, ETH, MVRV, Stablecoin 30D flows, Funding Rates, BTC Dominance, Halving Phase), and Global Macro & Contagion (7-anchor Regional Transmission Pulse + Global Commodities Barometer + US/Global Liquidity Signals). Follows strict WAI-ARIA tab semantics (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `role="tabpanel"`).
    - **Floating Card Popover & Watermark Hygiene Standard**: Outer card shells hosting dropdowns or popovers MUST NOT declare `overflow-hidden`. Large background watermarks (e.g., decorative `Compass` SVG) must be wrapped in a dedicated clipping container (`<div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">`). Popovers must feature a full-viewport transparent backdrop overlay (`<div role="presentation" aria-hidden="true" className="fixed inset-0 z-40" onClick={...} />`) behind the popup (`z-50`), declare `role="dialog"` / `aria-expanded` / `aria-haspopup="dialog"`, and bind <kbd>Escape</kbd> key listeners to enable seamless dismissal.
    - **Deterministic Number & Currency Locale Standard**: NEVER call bare `.toLocaleString()` without an explicit locale string. All Rupiah amounts and Indonesian share volumes must use `.toLocaleString("id-ID")`. All USD values, crypto prices, index levels with decimal fractions, and percentages must use `.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })` to prevent Next.js SSR/CSR hydration mismatches across client browser locales.
    - **Safe Bottom Clearance**: Calibrated bottom clearance `pb-32 sm:pb-36` to safely clear `CompactBottomBar`.
  - **Contact & Direct Inquiry Hub (`/contact`)**: Desktop Entry Screen Standard (`lg:h-screen lg:max-h-[100dvh] lg:overflow-hidden`), centered 12-column stage (`lg:grid-cols-12`, 5/7 split). Left context column: active status chip with `animate-ping` pulsing dot, solid headline (`"Let's build something worth shipping."`), 2-column Location & Jakarta Clock widget, system version pill, and relative timezone calculator. Right action panel: floating inquiry topic selector card (`rounded-[2rem]`) with 4 presets (`Consulting & Advisory`, `Engineering Leadership`, `Fintech Core (LOS/LMS)`, `General Tech Chat`) using domain SVG icons (`Handshake`, `Briefcase`, `Cpu`, `Coffee`) compiling dynamic `mailto:` parameters, and a 2x2 grid of direct contact channels (Email, Telegram, LinkedIn, GitHub) featuring domain icon squircles, 1-click clipboard copying (`FaRegCopy` → `FaCheck`), and external linkout arrows (`ArrowUpRight`).
  - **Running Performance Hub (`/adventures/running`)**: High-fidelity endurance telemetry and Strava activity hub on signature dot-pattern canvas (`bg-slate-50/80 bg-dot-pattern`). Floating card header standard with emerald squircle anchor (`w-12 h-12 sm:w-14 sm:h-14`), clean domain breadcrumbs and title (zero marketing slogan badges), and responsive 3-column mobile telemetry box. 12-column arena split: left column (5 cols) `Training Load & Intel` with live pulsing telemetry indicator, dynamic `PaceRing` gauge, 2x2 intel metric tiles, and proportional distance distribution; right column (7 cols) `PersonalBestsSwipeCard` (`bg-white rounded-3xl border border-slate-200/80 shadow-xs`) with minimalist frameless milestone track with sliding underline indicator (`layoutId="activeMilestoneIndicatorLight"`), official monospace chip time (`text-5xl sm:text-6xl font-black font-mono`), clean 3-metric functional strip (Pace, Distance, Elevation — strictly zero speed redundancy), zero marketing slogans/taglines, keyboard (<kbd>←</kbd> <kbd>→</kbd>) and touch swipe navigation, and 1-click record copy. Activities feed with 2-tier mobile-first controls toolbar, 3-column responsive activity cards with uniform rounded-3xl floating card architecture, domain squircle anchor, recessed 3-metric instrument tray (zero truncation), elevation/heart rate badges, and `ArrowUpRight` interaction cue triggering `ActivityDetailModal`.
  - **Stock Explorer, Paper Trading Simulator & Trade Journal Hub (`/utils/stock-explorer`)**:
    - **Dual-Mode Workstation Architecture & Live Compass Regime Bridge**: Frameless sliding workstation switcher (`layoutId="stockExplorerMode"`) toggling between Screener/Microstructure Workstation and Stockpick Simulator & Paper Trading Ledger without page reload or state loss, paired with a live **IHSG Compass Regime Bridge** banner (`CompassBridgeSummary`) synchronizing `/investment` macro regime, effective state, composite score, `riskPerTrade`, and foreign flow streak into the Stock Explorer.
    - **Pure White Container & Decluttered Layout Standard**: `HeroOverview.tsx` strictly uses a pure white container (`bg-white rounded-3xl border border-slate-200/80 shadow-xs`) with an integrated Advance/Unchanged/Decline breadth bar inside Card 1 (prohibiting monolithic dark `bg-slate-900` cards). Standalone `TopMovers.tsx` and `MarketBreadth.tsx` cards are eliminated from `View.tsx`, and `SmartTable.tsx` is promoted directly above the collapsible Factor Scoring accordion with an out-of-the-box `Rp 1B` default `minTurnover` floor (`Rp 5B` in Defensive/Stress).
    - **Zero Fake/Hash Data & Verified IDX Sector Classification**: `getMockFundamentals` is permanently purged. Sector classification uses `VERIFIED_IDX_SECTORS` (`getIdxSector`) plus business-keyword matching, labeling unmapped micro-caps `"Unclassified"` and excluding them from `SectorRotation.tsx` averages. `AIInsights.tsx` replaces fabricated PE/PBV narratives with real **Session VWAP** positioning (`Above VWAP` / `Below VWAP`) and `ForeignStreakDays`.
    - **Rolling 10-Session Microstructure Ring Buffer & 7 Regime-Tagged Setups**: Backed by `idx:ticker:history:10d` in Redis (`ForeignStreakDays`, `ForeignNet5D`, `RVOL`, `High10D`, `Low10D`, `Return5D`, `History10D`). `OpportunityScanner.tsx` evaluates 7 high-signal setups (*Foreign Stealth*, *10D RVOL Breakout*, *Whale / Bandar*, *Blue-Chip Pullback*, *High-Velocity Scalp*, *ARB Washout*, *Near ARA*) with `Counter-Regime` warning banners during `Defensive`/`Stress`.
    - **Unified Single-Scroll Inspector & Mechanical BEI Tick-Valid `TradePlan` (`StockDetailDrawer.tsx`)**: Merges `AIInsights`, `calculateStockTradePlan(stock)` (`StockTradePlan`: tick-rounded `entryLow`, `entryHigh`, `stopLoss`, `target1` `2R`, `target2` `3R`, `riskRewardRatio`, `setupBucket`, `setupNote`), 10-session Foreign Flow & Turnover sparkbars, and Order Book/ARA-ARB telemetry into a single unified inspector.
    - **Risk-First Simulator Lot Sizing, RRR Gate & Live Alert Badges**: `StockpickModal.tsx` auto-populates tick-valid `stopLoss` and `target1 (2R)` from `stock.TradePlan`, enforces a `1.5:1 RRR` advisory gate, and provides a 1-click **Compass Risk-Based Lot Sizing** calculator (`accountEquityIdr` + `riskPerTradePct`). `StockpickCard.tsx` and `SimulatorTelemetryStrip.tsx` surface live `Stop Breached`, `Target Hit`, and `Trailing Protect` (`peakGainPct >= 6%` round-trip guard) badges alongside `Core (45%) vs Swing (15%)` Rulebook bucket allocation tracking.
    - **Supabase Cloud Single Source of Truth**: Positions and closed journal records reside strictly in PostgreSQL (`public.stock_picks`), completely eliminating fragile browser `localStorage` and enabling multi-device synchronization.
    - **PostgreSQL Schema Compatibility & Defensive UI Standard**: Cloud persistence supports live Supabase column mappings (`ticker`, `company_name`, `lots`, `shares`, `high_watermark`, `low_watermark`, `stop_loss`, `exit_price`, `exit_date`, `realized_pnl_idr`, `realized_pnl_pct`) alongside normalized aliases, while all UI components strictly employ defensive `(p.stockCode || "").toUpperCase()` string fallbacks to prevent runtime crashes.
    - **Foreign Market Participation VWAP Normalization (`AIInsights.tsx`)**: Nominally reported trades must be normalized to share volume via VWAP (`val / vwap`) before evaluating against total stock volume (`stock.Volume`), completely preventing distorted 100% participation figures.
    - **Cross-Module Investment Compass Alignment**: Screener strategy presets include `Compass Defensive Blue-Chip` (Foreign 45%, Liquidity 30%, Price 15%, Volume 10%, Volatility 0%) and `Compass Risk-On Momentum` (Price 35%, Volume 35%, Liquidity 15%, Foreign 10%, Volatility 5%) with `applyCompassRegime()` allowing instant 1-click synchronization with live macro regimes.
    - **Continuous Watermark Excursion Tracing & Out-of-Band Sync**: Live quote feeds continuously calculate High and Low price watermarks (`highWatermark`, `lowWatermark`) to measure maximum potential peak excursion and worst drawdown exposure during position lifespan. Cloud synchronization of watermarks is dispatched out-of-band via debounced macrotasks, guaranteeing zero `<Router>` state collisions during render passes.
    - **Trade Journal Alpha Attribution & Performance Ledger**: Post-trade analytical journal calculating holding days, realized P/L (IDR and %), peak gain captured %, maximum drawdown endured %, and exit thesis categorization (`Target Hit`, `Stop Loss`, `Thesis Invalidation`, `Rebalance`, `Time Stop`) with filterable summary metrics.
  - **Disciplined Rebuild Rulebook Workstation (`/utils/rebuild-rulebook`)**:
    - **3-Tier Standard Utility Header (`UtilHeader.tsx`)**: Contextual breadcrumbs (`Home › Utilities › Rebuild Rulebook`), `ShieldAlert` squircle anchor, bold title, and dedicated quick preset strip (`Default 40/45/15`, `Conservative 55/35/10`, `Aggressive 30/50/20`).
    - **Frameless 3-Workstation Switcher**: Seamless tabbed navigation without layout shifts between:
      1. *Capital Allocation & Bucket Sizer*: Real-time calculator dividing portfolio capital into Safe Yield (40%), Core Swing (45%), and Tactical Alpha (15%) with quick IDR chips and per-trade risk limits.
      2. *5-Gate Pre-Trade Checklist*: Interactive verification (G1 Trend Alignment, G2 Liquidity & Foreign Flow, G3 Risk:Reward Ratio $\ge 2:1$, G4 Position Sizing Discipline, G5 Hard Invalidation Stop) with dynamic progress tracking and warning banner.
      3. *Drawdown Recovery & Breakeven Simulator*: Interactive slider calculating required gain to break even ($Gain = \frac{Loss}{1 - Loss}$), capital remaining, and psychological recovery stage advisory.
    - **Collapsible Reference Protocols Drawer**: Pure white expandable container detailing the 6 Golden Rules, Mechanical Circuit Breakers, Non-Negotiable Hard Bans, and Recovery Math reference tables.
  - **Daily Movement Snacks Hub (`/admin/movement`)**:
    - **Frictionless Habit Tracking Standard (Zero Overengineering)**: Lightweight activity tracker designed specifically for desk workers and distance runners to break up prolonged sitting without creating workout pressure or tracking fatigue.
    - **Clean Header Standard**: Contextual breadcrumbs (`Admin Console > Movement Snacks`), emerald squircle anchor (`Activity`), bold title `h1`, straight-to-the-point description, right-aligned action triggers (`Log Movement`, `Settings`), and a 4-tile desktop / 2-tile mobile telemetry strip (*Today's Breaks*, *Target Progress*, *Active Streak*, *All-Time Breaks*).
    - **Dynamic Pressure-Free Progress Card**: Pure white floating card (`bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs`) with circular SVG progress ring, centered percentage telemetry, pressure-free encouragement messages (avoiding guilt-inducing warnings for missed sessions), dedicated post-meal walking break recorder, and suggested next slot chip.
    - **Today's Flexible Schedule Timeline**: Vertical timeline of 6 configurable suggested slots (09:00 to 17:00). Direct 1-click **Complete** action on each card for instantaneous recording, unskip/skip toggle, undo capability, and a separate tray for spontaneous bonus breaks.
    - **Anti-Overengineering & Clean Exercise Guide Pattern**: Prohibits redundant timer/rep-stepper hybrid overlays for standard bodyweight movements. Tapping an exercise guide provides clean, direct execution instructions, target repetitions/duration, primary muscle groups, tempo guidelines, and a Google Video Demo search link, with simple **Cancel** and **Mark Completed** triggers.
    - **4-Week Consistency Calendar Heatmap**: Neutral visual intensity dots/tiles representing daily movement volume, emphasizing sustainable multi-week consistency over fragile daily streaks (with weekend/rest day grace).
    - **Local Persistence & Zero-PIN Admin Security**: Client-side single source of truth in `localStorage` (`movement:snacks:v1`) grouped strictly by local calendar date (`YYYY-MM-DD`), JSON backup export/import, and protected solely by `checkAdmin()` without requiring `PinGuard`.
  - **Order Trade Hub & Tape Reading Screener (`/admin/running-trade`)**:
    - **3-Tab Workstation Navigation (`OrderTradeTabs.tsx`)**: High-density admin console supporting instant mode switching between Tape Reading Analyzer (`?tab=tape-analyzer`), Running Trade Retriever (`?tab=running-trade`), and Trade Book Chart (`?tab=trade-book`) under a unified React Suspense boundary, defaulting to Tape Reading Analyzer.
    - **Feed Ingestion & Engine Status with Bulk ZIP Download**: Real-time progress checklist tracking Running Trade (CSV), Trade Book (JSON), and FastAPI Engine (JSON). Features individual download triggers and a 1-click bulk `Download All (.ZIP)` button powered by zero-dependency Store-mode ZIP builder (`@/lib/shared/zip`).
    - **Direct-to-FastAPI In-Memory Multipart Pipeline (`lib/tape-analyzer.ts`)**: In-memory CSV and JSON Blobs (`FormData`) bypass Vercel Next.js Serverless 4.5MB request payload ceilings and function execution timeouts on large multi-megabyte intraday tick files.
    - **In-Memory Cross-Tab Session Cache (`lib/session-cache.ts`)**: In-memory singleton caching trades and trade-book charts across tabs, providing instant (<500ms) re-analysis without re-hitting upstream broker endpoints.
    - **Zero Truncation Standard for Trading Setups & Execution Playbooks (`PlaybookSetupsCard.tsx`)**: Every trigger condition, entry level, stop-loss price, trailing rule, and setup explanation rendered in full with `break-words` and `leading-relaxed` (strictly prohibiting `truncate` or `...`).
    - **Separated Milestone Target Architecture (TP1 vs TP2)**: Take-Profit 1 (conservative scalp/partial scale-out) and Take-Profit 2 (runner/structural target) rendered in distinct dedicated target cards with individual tick levels, percentage gains, and execution guidance.
    - **Execution Governance & Net RRR Standard**: Calculates and displays true Net Risk:Reward Ratio after subtracting round-trip broker commission fees (0.40% round-trip), preventing traders from entering negative-expectancy scalps.
    - **Defensive Microstructure Telemetry & Anti-Forced-Side-by-Side Standard (`MicrostructureGrid.tsx`)**: 4 pure white floating telemetry cards (Value Area Profile, 15m Flow Dynamics, Big Money Flow, Low Absorption) utilizing the canonical 4-tier vertical hierarchy without horizontal overcrowding or label clipping.
    - **Executive Tactical Action Header (`ActionBanner.tsx`)**: Replaces raw JSON status strings and emojis with domain squircle badges (`Target`, `Clock`, `ShieldAlert`), providing immediate visual cues on market regime, trade bias, and liquidity condition alongside complete OHLC, turnover, volume, and tick size telemetry.
    - **Mobile Touch Target & Tap Hygiene**: All segmented toggles, filter pills, collapsible accordions, and action buttons maintain touch targets $\ge 44\times 44$px for tactile control on mobile viewports.
  - **Swing Trade Hub & Market Microstructure Screener (`/admin/swing-trade`)**:
    - **6-Tab Workstation Navigation (`SwingTradeTabs.tsx`)**: High-density admin console supporting instant mode switching between Swing Screener (`?tab=swing-screener`), Historical Trade (`?tab=historical-trade`), Market Detector (`?tab=market-detector`), Trade Book 5M (`?tab=trade-book-5m`), Running Trade Chart (`?tab=running-trade-chart`), and Broker Distribution (`?tab=broker-distribution`) under a unified React Suspense boundary, defaulting to Swing Screener.
    - **Feed Ingestion & Engine Status with Bulk ZIP Download**: Progress card with granular one-by-one file downloads and 1-click bulk export bundling all active feeds into `swing-feeds_{TICKER}_{YYYYMMDD}.zip` via pure TypeScript Store-mode builder (`@/lib/shared/zip`).
    - **Unified Market API Credentials & Connection Standard**: Persistent Upstash Redis credential storage (`admin:market:credentials`) eliminating fragile local storage keys. Top-bar live connection status pill (`Market API Connected` in emerald / `Configure Market API` in amber) launching the pure white `MarketCredentialsModal` with masked password inputs, 1-click test/save/clear triggers, and cross-tab reactive synchronization.
    - **Executive Action Trade Plan Banner & 5-Layer Scoring Visualization**: Prominent recommendation header converting 5-layer composite scores into actionable domain badges (`STRONG_BUY`, `BUY_ON_WEAKNESS`, `WAIT_FOR_TRIGGER`, `AVOID`, `AVOID_DISTRIBUTION` with zero sparkles and zero emojis). Displays setup classification, ideal entry zone, invalidation stop, TP1/TP2 targets, and Net RRR (after 0.40% round-trip broker fee deduction).
    - **Deep Dive Workstation Standard (`DeepDiveWorkstation.tsx`)**: Pure white floating card (`bg-white rounded-3xl border border-slate-200/80 shadow-xs`) with modern 5-tab swipeable segmented navigation (`touch-pan-x min-h-11`), primary setup highlighting (`Primary Setup` badge), separated TP1 vs TP2 milestone target cards, mobile-first stacked cards (`< sm`) transitioning to high-density desktop tables (`>= sm`) for Top Accumulators & Flow Windows, prominent `Paint-the-Tape Bull Trap` alert, `Trapped Legacy` accumulators flag, Self-Match wash-trading verification table, 10D/20D/60D Value Area Migration, and VCP/Volume dry-up telemetry.
    - **Defensive Microstructure Data Formatting**: IEEE-754 scientific notation parsing, compact scaling (`1K`, `1M`, `1B`, `1T`), iterative 50-limit auto-pagination loop for historical trade backtests, and bilateral counterparty network diagrams with interactive Volume vs Value dimensions.
    - **Mobile Touch Target & Tap Hygiene**: Standardized to $\ge 44\times 44$px for all segmented tabs, action triggers, and file dropzones.
  - **Admin Operations & Control Center (`/admin`)**:
    - **Clean Header Standard**: Contextual breadcrumbs (`Home > Admin Console`), bold title `h1`, straight-to-the-point description, right-aligned Sign Out trigger, and 4-metric quick telemetry strip (*Articles*, *Pending Tasks*, *Reminders*, *Infra Engines*).
    - **Clean Dot-Free Canvas**: Clean textured canvas (`bg-slate-50/80`), dot pattern permanently removed.
    - **2-Group Minimalist Taxonomy**: Continuous sections separating *Operations & Productivity* (4 Tools: Blog, Tasks, Reminders, Movement) and *Market Systems* (3 Tools: Stock Explorer, Running Trade, Swing Trade Hub) with discrete domain icons, titles, and item count pills.
    - **Streamlined Modern Floating Cards**: Pure white containers (`bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md`) implementing Direct Icon-Beside-Title layout, top-right live status badges (`{publishedBlogs} Published`, `{pendingTasks} Active`, `{reminderCount} In Memory`, `6 Daily Slots`, `Redis Engine`, `BEI / IDX Feed`, `6 Feeds`), zero redundant capability tags, single primary `Launch Console` trigger, and `+ New Article` for Blog.
    - **Synchronized Structural Skeleton**: Localized `AdminSkeleton` loader (consumed by `app/admin/loading.tsx`) perfectly mirroring the 2-group hierarchy and card geometry.

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
    - NEVER use `'•'` or `'·'` (middots) as bullet points, separators, or slogan dividers in headers, cards, or pills. They look like auto-generated marketing fluff and create awkward line breaks or overflow bugs. Use clean commas, slashes (`/`), hyphens (`-`), or standard native list styling (`list-disc pl-4`) instead. Furthermore, adhere strictly to `antislop-copywriting` Rule R-02 banning em dashes (`—`) in copy, subtitles, and comments.
    - NEVER construct compound marketing slogan badges (e.g. `CATEGORY • marketing sublabel & buzzwords`) or stack redundant subtitle paragraphs (`Technical essays · fintech systems · production learnings`) under badges.
    - NEVER apply `whitespace-nowrap` to badges or headers that break mobile viewports and overflow outside card boundaries.
  
  - **CARD ACTION & PILL HYGIENE (ANTI-REDUNDANT TRIGGER MANDATE):**
    - NEVER provide duplicate external link or launch triggers in the same card (e.g., placing an arrow icon button `↗` in the top-right header while simultaneously rendering `Launch Console ↗` or `Launch →` in the footer).
    - Every card must have ONE unambiguous primary interaction trigger:
      - If the card container is wrapped in a `<Link>` or already provides a footer action (`Launch →`), do NOT add a redundant top-right squircle or circular arrow button.
      - Top-right corners are reserved strictly for real-time telemetry metrics (`6 Published / 9 Draft`, `4 Pending`) or distinct secondary actions (`+ New Article`).
    - Banish generic `rounded-full` pills for repetitive category names in card corners (e.g., `PUBLISHING`, `EXECUTION`). These create visual noise and dilute real data.
    - Telemetry badges must use compact, high-contrast, discrete containers (`rounded-lg` or `rounded-md`, e.g. `bg-slate-50 border border-slate-200/70 text-[11px] font-mono`) and represent concrete state (counts, ratios, connection status), not ornamental category labels.

  - **METRIC ANTI-REDUNDANCY MANDATE (FUNCTIONAL DATA HYGIENE):**
    - NEVER display duplicate, converted, or functionally redundant metrics in the same telemetry tray or card. For example, in running/endurance logs, NEVER show both "Pace" (min/km) AND "Speed" (km/h) simultaneously — pace is already the endurance domain standard for velocity; displaying both wastes horizontal space and creates visual clutter.
    - Metric grids must remain lean, essential, and strictly non-repetitive (e.g., a balanced 3-metric strip: Pace, Distance, Elevation).
    - If a secondary conversion is truly needed by users, provide an interactive toggle or tooltip rather than bloating the default grid with duplicate dimensional data.

  - **ZERO MARKETING FLUFF IN DATA DISPLAYS (ANTI-TAGLINE MANDATE):**
    - NEVER inject compound marketing taglines, decorative benchmark labels, or pompous slogans into functional data cards (e.g., "Tempo Benchmark", "Pinnacle Achievement", "Elite Velocity", "Next-Gen Performance", "Ultimate Endurance").
    - Data cards must let raw numbers and verified telemetry speak for themselves. State the record type plainly (e.g. `10K`, `Chip Time`, `All-Time`), verified status, and verified metric values. Zero marketing hype or AI-generated fluff.

* **Loading & Skeleton States:**
  - NEVER show a full-screen spinner with a brand logo and an explicit **"Loading"** text label. The word "Loading" adds no information and clutters the UI. Loading states must be implicit, ambient, and brand-aligned.
  - NEVER use a generic `CircleLoader` or `BounceLoader` from external spinner libraries. Skeletons must use `animate-pulse bg-slate-200 rounded-*` blocks mirroring real content dimensions.
  - **Localized Route Skeletons (Anti-Global-Fallback Mandate):** Core architectural hubs (such as `/portfolio`, `/work-experience`, `/insights`, `/utils`, `/adventures`, `/adventures/running`, `/adventures/travel`, `/admin`, `/admin/movement`, `/liverpool`, `/investment`, `/contact`, `/blog`) MUST NOT lazily rely on the global `app/loading.tsx` monogram during server-side data fetching or route transitions. They MUST implement precise structural skeleton loaders (e.g. `app/portfolio/loading.tsx`, `app/work-experience/loading.tsx`, `app/insights/loading.tsx`, `app/utils/loading.tsx`, `app/adventures/loading.tsx`, `app/adventures/running/loading.tsx`, `app/adventures/travel/loading.tsx`, `app/admin/loading.tsx`, `app/admin/movement/loading.tsx`, `app/liverpool/loading.tsx`, `app/investment/loading.tsx`, `app/contact/loading.tsx`) or Suspense fallback components that perfectly mirror the exact floating card layouts, column splits, and visual rhythm of the target page.
  - **Brand-Monogram Global Fallback (Next.js `loading.tsx`):** The root page-transition loading fallback uses a minimalist brand monogram mark (`PT`) in a `w-16 h-16 sm:w-[4.25rem] sm:h-[4.25rem] rounded-[1.25rem] bg-white border border-slate-200/80 shadow-xl shadow-slate-900/5` floating card, centered over the textured canvas (`bg-slate-50/75 backdrop-blur-xs bg-dot-pattern`). A soft ambient breathing ring (`animate-ping opacity-35`) surrounds the card, a small emerald pulsing liveness beacon (`animate-ping bg-emerald-400` + solid `bg-emerald-500 border-2 border-white`) sits at the top-right corner, and an integrated hairline micro-track (`w-7 h-[2px] bg-slate-100 mt-1.5`) hosts a smooth GPU-accelerated scanning beam (`animate-scan-glide`). No text label, no spinner wheel — only the brand mark, liveness pulse, and micro-activity track signal an active transition. The entire overlay is `pointer-events-none` to prevent interaction blocking. Server Component with 0 client JS bundle overhead.

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

### 2.6 Full Integration with Antislop & Ponytail Skill Suites

Every AI coding assistant working in this repository MUST strictly align with the **Antislop** and **Ponytail** skill suites on every interaction:

* **Antislop Skill Suite Integration (`antislop`)**:
  - **`antislop` (Core Filter)**: Prohibits generic AI templates, decorative fluff, formulaic layout structures, and artificial complexities across every generated file.
  - **`antislop-ui`**: Prohibits generic SaaS hero cards, full-bleed dark-mode dashboards, colored glow drops, ambient blur orbs (`blur-3xl`), and multi-color gradient text. Mandates solid surfaces, high-contrast typography, and purposeful domain-specific iconography.
  - **`antislop-copywriting`**: Enforces authentic, technical, grounded copy. Strictly bans em dashes (`—`) in UI copy, titles, and comments (Rule R-02). Eliminates generic marketing jargon, superlatives, and repetitive slogan pills.
  - **`antislop-human`**: Enforces strict accessibility standards (WCAG AA/AAA contrast ratios $\ge 4.5:1$ for body and $\ge 3:1$ for large text), visible keyboard focus rings (`focus-visible:ring-2`), minimum touch targets ($\ge 44\times 44$px), and full WAI-ARIA semantic states.
  - **`antislop-layoutmobile`**: Enforces mobile-first responsive design, defensive horizontal overflow protection (`min-w-0`, `max-w-full`, `break-words`), and top-and-bottom flow in constrained spaces (< 600px width).
  - **`antislop-code`**: Enforces clean code comment hygiene. Eliminates decorative box-drawing banners (`// ───`, `/* ───`, `{/* ───`), empty section labels (`// Render`, `// Types`, `// State`), workflow step narration (`// Step 1:`, `// 1. Fetch`), and obvious JSX restatements. Preserves genuine why/architectural/workaround rationale while never altering executable code.

* **Ponytail Skill Integration (`ponytail`)**:
  - **The Smallest Complete Change**: Solve the entire problem with the least new code. The best code is the code never written.
  - **Check Scope & Blast Radius Before Writing**: Inspect every touchpoint (callers, tests, fixtures, config, exports) before proposing or implementing changes.
  - **Reuse Existing Codebase Assets**: Reach first for existing components, utilities, and patterns already in the codebase (`features/shared/components/`, `lib/`). House components beat custom widgets.
  - **No Speculative Abstractions**: Zero wrapper layers, premature abstractions, or "for later" configuration that nobody asked for.
  - **Verified Quality & Checks**: Lazy code without checks is unfinished. Non-trivial changes must be verified against affected Vitest test suites or assert-based checks.
  - **Reply Summary Requirement**: Conclude agent replies with 1–2 lines identifying what was skipped or not checked, and any risks the user must know.

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
  - **Compact Profile Dashboard (`HomeView.tsx` & `HomeAnimatedBackground.tsx`):** Symmetric `lg:grid-cols-12` split (6/6: content left, metrics right) hosted over `HomeAnimatedBackground.tsx` — a calming atmospheric backdrop of soft, drifting sky clouds in the upper horizon and gentle rolling sea swells in the lower horizon (100% GPU-accelerated CSS compositor keyframes, zero noisy lines or text badges, zero `blur-3xl` ambient orbs, and native `prefers-reduced-motion` accessibility). Left column: responsive `64px` to `80px` rounded avatar with grayscale-to-color hover transition, active status chip with `animate-ping` pulsing dot, bold `h1` headline with alternating solid weights (`text-slate-900` for power words, `text-slate-400` for prepositions — e.g. `"Engineering systems / by day. Miles / everywhere."`), short bio, and a unified 2-column floating card widget for Location and live Jakarta time. Right column: "Professional Impact" metrics panel (strict symmetric 3-column dense grid) and Direct Channels grid (Explore Work, Contact, GitHub, LinkedIn) with touch-optimized hover actions. Enforces a strict zero-redundancy rule where each data point appears exactly once.
  - **Compact Contact & Inquiry Hub (`ContactView.tsx`):** Asymmetric `lg:grid-cols-12` split (5/7: context left, actions right). Left column: active status chip with `animate-ping` pulsing dot, dominant typographic headline (`"Let's build something worth shipping."`), sub-copy, unified 2-column Location & Time floating card widget (`Indonesia` and live Jakarta clock), system version pill, and client-calculated relative timezone offset (`Same timezone`, `Xh ahead of you`, or `Xh behind you`). Right column: floating inquiry topic card (`rounded-[2rem] border border-slate-200/80 shadow-sm p-5 sm:p-6`) with 4 domain presets (`Handshake`, `Briefcase`, `Cpu`, `Coffee`) compiling dynamic `mailto:` parameters, and a 2x2 grid of direct contact channels (Email, Telegram, LinkedIn, GitHub) featuring domain icon squircles, 1-click clipboard copying (`FaRegCopy` → `FaCheck`), diagonal linkout arrows (`ArrowUpRight`) with `group-hover:translate-x-0.5`, and a floating `AnimatePresence` copy confirmation toast.
* **Mobile-First Scrolling:** On standard multi-card feeds and dashboard views (`< lg`), pages revert to fluid vertical scrolling (`min-h-screen overflow-y-auto py-20 pb-32 sm:py-24 sm:pb-36`) to accommodate the floating bottom navigation bar (`CompactBottomBar`).
* **Fluid Spacing & Typography:** Margins, padding, and font sizes scale smoothly based on breakpoints (e.g., `pt-24 sm:pt-32`, `text-3xl sm:text-5xl lg:text-6xl`, `px-3 sm:px-4`).
* **Touch Targets & Feedback:** Interactive elements feature generous touch target areas and active feedback (`active:scale-95`, `active:scale-[0.98]`) for tactile confirmation on mobile devices.

### 4.1 Anti-Forced-Side-by-Side & Anti-Cramping Standard (Top-and-Bottom Flow)

AI assistants exhibit a chronic tendency to force components into side-by-side columns (e.g. cramming Take-Profit and Stop-Loss into side-by-side pillars, forcing 3 mini-cards into a half-width container, or putting form inputs side-by-side in tight spaces). In constrained spaces (< 600px width, mobile screens, or inside split cards/drawers), **forced side-by-side layouts break responsiveness, cause text clipping (`...`), shove badges past card boundaries, and produce messy interfaces**.

* **Mandatory Top-to-Bottom Flow (Vertical Stacking)**: When horizontal space is constrained or when displaying detailed financial/operational data, stack complementary sections vertically (`space-y-4 sm:space-y-6`), giving each section 100% full width to breathe.
* **Segmented Mode Switchers over Squeezed Dual Pillars**: When comparing or operating two distinct views (e.g., `[ Take-Profit Target ] [ Capital Protection Floor ]`, `[ Buy ] [ Sell ]`, `[ Input ] [ Output ]`), NEVER force them into two 240px cramped side-by-side columns. Standardize on a clean, full-width segmented switcher where the active mode occupies the full width of the card, giving milestone button tracks, detailed key-value rows, and summary highlights ample room.
* **Full-Width Stages over Narrow Split Panes**: For high-density operational utilities, prefer full-width stacked stages (Hero Header → Global 4-Stat Telemetry Strip → Full-Width Input Ledger → Full-Width Workstation) over rigid 2-column layouts that squeeze complex calculations into narrow columns.
* **Mobile Text Fallbacks for Segment Controls**: Multi-button segment selectors and tabs must provide responsive text variants (e.g., `<span className="hidden sm:inline">IDX Stock (Lots)</span><span className="sm:hidden truncate">IDX (Lots)</span>`) so that 3-way or 4-way toggles fit without text collisions down to 320px viewports.

### 4.2 Standard 2-Tier Vertical Layout for Small & 2-Column Telemetry Cards

In 2-column mobile grids or cards narrower than ~220px, **NEVER force `[Icon + Category Label + Status Badge]` onto the same horizontal line**. Mathematically, an icon (32px) + label (~100px) + badge (~50px) exceeds ~140px-180px inner card width, shoving badges past the card border and truncating labels into `Gro` or `Min...`.

All compact telemetry cards in 2-column mobile or constrained grid layouts MUST adhere to the **Canonical 4-Tier Internal Structure**:
1. **Tier 1 (Anchor & Status Row)**: Icon on the left (`w-7 h-7 sm:w-8 sm:h-8`), status or percentage badge on the right (`ml-auto shrink-0`). Only TWO small elements on this line, guaranteeing zero collision and zero border overflow.
2. **Tier 2 (Category Label)**: Category label sits on its OWN full-width line (`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate`).
3. **Tier 3 (Primary Metric)**: Monospace tabular numeral with responsive font sizing (`text-sm sm:text-xl lg:text-2xl font-bold font-mono text-slate-900 tracking-tight tabular-nums truncate`), guaranteeing long currencies (`Rp 113.500.000`) never truncate with ellipsis (`Rp 113.500.0...`).
4. **Tier 4 (Context Sublabel)**: Concise subtext on its own line (`text-[10px] sm:text-[11px] text-slate-400 font-medium truncate`).

### 4.3 Refined Typography Scale & Lighter Weights (Anti-Brutalist Mandate)

* **Banish `font-black` (900 Weight) Overuse**: Avoid heavy brutalist `font-black` typography inside small and medium cards. Chunky weights consume excessive horizontal width, shout at the user, and cause early truncation on narrow screens.
* **Standardize on `font-semibold` (600) & `font-bold` (700)**: Primary metrics and headers should feel confident yet refined, leaving generous optical breathing room.
* **Muted Secondary Hierarchy**: Use `font-normal` (400) or `font-medium` (500) for secondary labels and units (`text-slate-500`), creating distinct contrast without visual clutter.
* **Frameless Summary Highlights over Bulky Colored Alert Boxes**: Banish thick-bordered fluorescent alert boxes (e.g. bright pink `bg-rose-50 border border-rose-200/80` or neon green boxes). Use pure white card containers or subtle tinted card surfaces (`bg-emerald-50/50 border border-emerald-100`) with restrained typography.

### 4.4 Zero Truncation Standard for Trading Parameters & Execution Playbooks

In financial and algorithmic trading interfaces (such as `/admin/running-trade` and `/utils/stock-explorer`), **truncating trade parameters or execution rules with ellipsis (`...` or `truncate`) is strictly forbidden**. Truncation destroys critical risk parameters:
* **Never Truncate Entry & Invalidation Levels**: Trigger conditions, breakout thresholds, tick-level stop losses, trailing stop offsets, and scale-out rules must always be displayed in full using natural multiline text wrapping (`break-words`, `whitespace-normal`, and `leading-relaxed`).
* **Dedicated Milestone Target Cards over Compressed Rows**: Dual-target playbooks (e.g., TP1 vs TP2) must never be crammed into a single truncated row. Render each target in its own dedicated milestone card with its exact price, target percentage, and execution notes clearly visible.
* **Unabridged Checklist Diagnostics**: Conditions for trade setups (both Met and Pending) must render full diagnostic reasons (e.g. `RVOL 1.8x > 1.5x threshold` or `Price 3,080 within 1 tick of VWAP 3,078`) without clipping.

---

## 5. Floating Bottom Navigation (`FloatingNavDock` / `CompactBottomBar`)

The primary application navigation utilizes an Apple-grade **Liquid Glass** floating dock positioned at the bottom of the viewport:

* **Liquid Glass Dock Shell:** `bg-white/75 backdrop-blur-2xl backdrop-saturate-180 border border-white/60 rounded-full` continuous capsule geometry with multi-tier specular rim lighting (`inset 0 1.5px 1.5px 0 rgba(255,255,255,0.9)`, `inset 0 -1.5px 1.5px 0 rgba(15,23,42,0.04)`, `0 20px 40px -6px rgba(15,23,42,0.14)`, `0 2px 8px -2px rgba(15,23,42,0.06)`, and `0 0 0 1px rgba(255,255,255,0.3)`). Fixed position accounts for device safe-area insets: `bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] sm:bottom-4`.
* **Size & Footprint:** Continuous capsule padding (`p-1 sm:p-1.5`), `w-9 h-9 sm:w-10 sm:h-10 rounded-full` touch targets per button, `17–18px` icons, and sleek gap spacing (`gap-1 sm:gap-1.5`).
* **Active State (Elongated Capsule Pill):** When active, the selected tab dynamically expands into an elongated capsule (`rounded-full px-4 sm:px-5 w-auto min-w-[50px] sm:min-w-[56px] h-9 sm:h-10`) with dark obsidian glass depth (`bg-slate-900/95 rounded-full z-0 shadow-sm`, inset highlight `inset 0 1px 1px 0 rgba(255,255,255,0.22)`, and icon color `text-white`). The active indicator uses `layoutId="nav-active-pill"` to slide and spring-morph smoothly between items.
* **Inactive State & Tactile Physics:** Inactive items render as compact circular touch targets (`w-9 h-9 sm:w-10 sm:h-10 rounded-full`) with `text-slate-400`. Enhanced with compositor-driven tactile micro-lift and spring feedback (`transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 active:scale-95 ease-out`), lifting to `text-slate-700` with subtle hover background (`bg-slate-900/5 rounded-full`).
* **Item Layout (Icon-Only Dock Standard & Dot-Free Surface):** Main dock buttons are strictly icon-only capsules with **zero text labels** underneath the icons. Submenu indicators preserve a clean, dot-free minimalist surface (all bottom indicator pips/dots are removed to ensure an uncompromised liquid glass aesthetic). Every item MUST declare an accessible `aria-label` and `title` tooltip. Full descriptive text labels, descriptions, and subtitles are cleanly preserved inside expanded submenus.
* **Dynamic Authenticated Avatar with Google Accent Ring:** When authenticated, the right-hand account/admin trigger displays the circular user profile avatar surrounded by the signature multi-color Google accent ring (`conic-gradient(from 45deg, #EA4335, #FBBC05, #34A853, #4285F4, #EA4335)`), with graceful fallback to Polma's avatar or Lucide icons (`LayoutDashboard` / `LogIn`) when unauthenticated or on image load failure.
* **Section Divider:** A sleek vertical translucent line (`w-px h-5 bg-slate-300/60 mx-0.5 sm:mx-1 shrink-0`) cleanly separates the public navigation group from the admin section.
* **Solid White Submenu Pop-over & Pure White Container Standard:** Expanded submenus (Work, Insights, Adventures, Admin) adhere strictly to the **Pure White Container Standard** using solid white card surfaces (`bg-white rounded-2xl border border-slate-200/80 shadow-xl w-52 p-1.5 max-h-[calc(100dvh-5.5rem)] overflow-y-auto overscroll-contain` with clean elevation `boxShadow: 0 20px 45px -10px rgba(15,23,42,0.18), 0 4px 16px -2px rgba(15,23,42,0.06)`). Translucent or semi-transparent submenu card backgrounds are strictly forbidden to permanently eliminate text collision and ghosting/bleed-through from underlying page layers, dark buttons, or widgets.
* **Soft Background Dimming Backdrop:** Whenever a submenu is expanded, an animated touch-dismissal backdrop renders at `fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[2px]` (with 0.15s Framer Motion opacity easing), gently settling the page in the background to provide a focused, distraction-free reading layer while supporting 1-tap outside dismissal and keyboard <kbd>Escape</kbd>.
* **Submenu Active Rows:** Active sub-items use a unified `bg-slate-900 text-white rounded-xl shadow-xs` row. Inactive rows use `hover:bg-slate-100/80 rounded-xl`. Badge pills in submenus use `bg-slate-900 text-white` (inactive) or `bg-white/20 text-white` (active) with `font-bold`.
* **Admin Badge Pip:** High-contrast `rose-500` dot (`h-[15px] min-w-[15px] rounded-full ring-2 ring-white shadow-xs`) at `absolute -top-1 -right-1` on the icon container with `font-bold` text. Displays the aggregate total of pending tasks, active reminders, and undone movement snacks, disappearing when the Admin submenu is open.
* **Unified Telemetry RPC & In-Memory SWR Throttling Standard:** Navigation telemetry (`tasks`, `reminders`, `movement`) is fetched via a unified single round-trip RPC (`getNavTelemetrySummary()` in `features/shared/actions/telemetry.ts`), completely eliminating sequential/waterfall server action calls. To prevent network waterfalls and lag on client-side route transitions, dock telemetry utilizes a 60-second in-memory SWR cache (`lastTelemetryFetchRef`). Route navigations within 60 seconds are served instantly from memory with zero server roundtrips, while immediate cache invalidation is triggered on window focus (`window.addEventListener("focus")`), authentication status changes (`auth:state:updated`), and local movement updates (`movement:state:updated`).

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

* **Metric Typography & Restrained Scale:** Primary values use large font sizes and extra-bold weights (`text-xl sm:text-3xl font-extrabold text-slate-900`, or `text-5xl sm:text-6xl font-black font-mono` for hero times/records) for immediate legibility. Avoid over-scaled, brutalist typography (such as `text-7xl` or `text-8xl` giants) inside standard cards — typography must remain confident, well-proportioned, and leave generous breathing room.
* **High Contrast Hierarchy:** Primary labels use `text-slate-700 font-bold`, while secondary units and sublabels use `text-slate-500 font-semibold`.
* **Dark Mode & Dark Panels Restriction:** Standard content cards MUST NOT use full-card dark slate backgrounds (`bg-slate-900`). Dark containers are strictly limited to code blocks, high-priority backlog counters, or specialized transparent sticker canvas exports. When using dark containers, text MUST be set to pure white or vibrant glowing accents (`text-indigo-400`, `text-emerald-400`, `text-cyan-400`, `text-red-400`) with sufficient contrast.
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
* **Clean Header Standard & Telemetry Badge:** Contextual breadcrumbs (`Admin Dashboard › Quick Reminders`), amber domain squircle anchor (`w-11 h-11 sm:w-12 sm:h-12 bg-amber-50 border border-amber-200/70 text-amber-600 shadow-2xs`) with `Bell`, bold `h1` headline, concise lede description, right-aligned Admin Hub return link, and a clean active count pill with optional overdue sub-badge.
* **Inline Quick-Add Composer:** Compact floating card (`rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-3 sm:p-4`) featuring a single-line task input, character counter, solid dark submit button, and due date presets (`Today`, `Tomorrow`, `In 1 Week`, and inline native `Pick Date` picker).
* **Linear Checklist Layout (Item & Due Date Focus):** Single-column clean checklist (`rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden`) with zero decorative bloat. Each row focuses strictly on item text and target due date.
* **1-Click Complete & 3.5s Undo Toast:** Circular checkbox trigger on each row optimistically removes the item immediately and triggers a 3.5-second bottom Undo toast. Clicking "Undo" restores the item instantly; otherwise deletion commits after the toast expires.
* **Color-Coded Due Date Tags:** Status pills categorizing due dates into `Overdue` (`rose-50 border-rose-200 text-rose-700`), `Due Today` (`amber-50 border-amber-200 text-amber-700`), or `Upcoming` (`slate-100/80 text-slate-600`).
* **URL Linkification & Clipboard Copy:** Detected URLs are rendered as discrete pill links; 1-click clipboard copy provides instant in-place checkmark confirmation.
* **Localized Skeleton Loader (`loading.tsx`):** Route skeleton in `app/admin/reminders/loading.tsx` backed by `RemindersSkeleton.tsx` mirroring the header, inline composer, search bar, and linear rows to eliminate global fallback flashes.

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

Hub and aggregator pages (e.g., `/insights`, `/adventures`, `/admin`) provide curated entry points into the platform's analytical subsystems.

* **Global Intelligence Telemetry Strip:** Top 4-stat telemetry strip previewing core platform domains with solid icon squircles and high-contrast numbers.
* **Module Cards — Direct Icon-Beside-Title Standard:** Cards MUST use the **Direct Icon-Beside-Title** layout: the domain icon squircle (`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-<domain>-50 border border-<domain>-200/70 text-<domain>-600`) is placed **inline and directly to the left of the card title** in a single `flex items-start gap-3` row. Metric pills (e.g. telemetry counts) are right-aligned via `ml-auto`. **Do NOT** float the icon above the title or surround it with a separate `rounded-full` category badge. The icon-and-title form a single, cohesive visual unit. Card body below the header contains a concise description and a row of topic/tag pills.
* **Spring Hover Physics:** Cards lift organically on hover (`whileHover={{ y: -4 }}`) with subtle shadow expansion (`shadow-md`).
* **Thematic Accents:** Use distinct badge color pairings to reinforce domain boundaries (Indigo for Architecture/Blog, Emerald for Financial/Investments, Rose for Liverpool FC, Cyan for Developer Utilities).
* **Encapsulation:** `rounded-[2rem]` or `rounded-3xl` floating cards with `border border-slate-200/80 shadow-xs` resting on the signature dot-pattern canvas.
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
* **Top Clearance Hygiene:** Main content containers must declare sufficient top clearance (`pt-20 sm:pt-24` or `pt-24 sm:pt-28`) to ensure headers maintain comfortable breathing room beneath fixed floating navigation elements.
* **Single Canonical Floating Card Architecture:** Parent admin views (e.g., `/admin/blog`) must NEVER wrap already-contained card components in nested card containers with duplicate borders. Lists, tables, and consoles maintain a single canonical `rounded-3xl border border-slate-200/80 shadow-xs` surface.
* **Tasks Modern Floating Card & Active Agenda Standard (`/tasks`):**
  - **Clean Header Standard & 4-Tile Executive Telemetry Strip:** Encapsulates the hero header within a floating card (`bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs`) resting on the signature textured canvas (`bg-slate-50/80`, dot-free). Features breadcrumbs (`Admin Dashboard > Tasks & Execution`), bold `h1` headline, concise lede description, and a 4-tile executive telemetry strip (`Today's Progress` with percentage badge, `Next 7 Days`, `Next 30 Days`, and `Total Active`).
  - **In-Flow Frameless Tab Navigation:** Replaces floating bottom pills with an in-flow tab switcher (`Agenda` / `Analytics` / `Weekly Review`) directly embedded in the header card, featuring a sliding underline (`layoutId="tasks-tab-underline"`) to eliminate collisions with the mobile FAB and global navigation dock.
  - **Single Unified Agenda Toolbar:** Eliminates redundant per-section filter bars in favor of a single top-level `TaskFilters` toolbar at the head of Active Agenda, controlling keyword search (`search`), priority (`priority`), category (`category`), and workflow status (`status`) across both List and Kanban views.
  - **Inline Date Horizon Controls:** Section headers maintain compact, non-intrusive date selectors: Upcoming section features an inline `7 Days | 1 Month | All` selector, while Completed features a compact `Prev Week | Current Week | Next Week` date navigator.
  - **Cross-Section Optimistic Synchronization:** Re-buckets tasks across `overdue`, `today`, `upcoming`, and `completed` inside `useOptimistic` in `TaskList.tsx` upon status toggle or date modification, eliminating temporary disappearances.
  - **Start Date Routing:** Tasks with future start dates (`start_date > today`) route into `upcomingTasks` until actionable, preventing start-date black holes.
  - **Multi-Task Archiving & Deletion with 5s Undo Toast:** 0ms optimistic removal with 5-second multi-task Undo Toast and automatic unmount timer flushing across both List and Kanban views.
  - **Pure White Container Standard for Analytics:** Efficiency cards in `GeneralReport` strictly adhere to the pure white container aesthetic (`bg-white rounded-3xl border border-slate-200/80 shadow-xs`) matching Reliability, synchronized with parent period filter down to `VelocityBurndownCharts`.
  - **Localized Route Streaming Skeleton:** `app/tasks/loading.tsx` backed by `TasksPageSkeleton` replicating the header, 4-tile telemetry strip, and agenda list geometries for zero-CLS transitions.
* **Quick Reminders Modern Floating Card Standard (`/admin/reminders`):**
  - **Clean Header Standard:** Contextual breadcrumbs (`Admin Dashboard › Quick Reminders`), amber domain squircle anchor (`w-11 h-11 sm:w-12 sm:h-12 bg-amber-50 border border-amber-200/70 text-amber-600 shadow-2xs`) with `Bell`, bold `h1` headline, concise lede description, right-aligned Admin Hub return link, and a clean telemetry badge.
  - **Inline Quick-Add Composer:** Compact floating card (`rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-3 sm:p-4`) with single-line input, character counter, solid dark submit button, and due date presets (`Today`, `Tomorrow`, `In 1 Week`, `Pick Date`).
  - **Linear Checklist (Focus on Item & Due Date):** Single-column checklist (`rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden`) with 1-click complete checkbox trigger and 3.5s Undo toast.
  - **Color-Coded Due Date Tags:** Status pills categorizing due dates into `Overdue` (`rose-50 border-rose-200 text-rose-700`), `Due Today` (`amber-50 border-amber-200 text-amber-700`), or `Upcoming` (`slate-100/80 text-slate-600`).
  - **URL Linkification & Clipboard Copy:** Linkified URL pill tags and 1-click clipboard copy with in-place checkmark confirmation.
  - **Localized Skeleton Loader:** `RemindersSkeleton.tsx` mirrors the full header, inline composer, search bar, and linear rows for zero CLS route transitions.

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
* **Shared UI Consolidation:** Reusable global primitives (such as `CustomModal`, `CompactBottomBar`, `Skeleton`, `JsonValue`, `InfoTooltip`) reside exclusively in `features/shared/components/`.
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
- [ ] Standard dashboard/telemetry cards use pure white containers (`bg-white rounded-3xl`) — no monolithic dark-slate content cards
- [ ] Typography inside cards is restrained and well-proportioned (e.g. `text-5xl/6xl`, no disproportionate `7xl/8xl` giant text)
- [ ] No raw unicode emojis in UI surfaces
- [ ] No more than 3 accent colors in a single card

### Pattern Discipline
- [ ] Clean Header Standard followed: contextual breadcrumbs at top, bold title `h1`, straight-to-the-point description, and right-aligned buttons or telemetry stats
- [ ] No repetitive decorative category section pills or squircles (`Market Guideline`, `Engineering Journal`, `Performance Hub`, `Utility Registry`) above page titles
- [ ] No redundant action triggers in cards (never declare both a top-right arrow button `↗` and a bottom `Launch Console ↗` / `Launch →` action in the same card)
- [ ] No redundant metrics in telemetry trays (never pair duplicate physical dimensions like Pace and Speed in the same card)
- [ ] Zero marketing fluff, decorative benchmark slogans, or AI taglines in data cards (no "Tempo Benchmark", "Pinnacle Achievement")
- [ ] Interactive milestone/timeline switchers favor the frameless underline track with Framer Motion `layoutId` over bulky enclosed pill boxes
- [ ] No generic `rounded-full` category pills in card corners (reserve badges strictly for real-time telemetry metrics with discrete `rounded-lg`/`rounded-md` borders)
- [ ] Decision Engine factor weights (`ihsg.ts`, `crypto.ts`, `global.ts`) MUST ALWAYS sum up to exactly 100
- [ ] Market Asymmetry Zone alert callouts use organic pulsing liveness beacons (`animate-ping`) and domain SVG icons with zero emojis
- [ ] Macro Scenario Sandbox simulator controls use pure white container architecture, signed score delta badges, and zero-emoji stress presets
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

### Loading & Transition States
- [ ] No explicit "Loading" text label rendered during page transitions
- [ ] Global `loading.tsx` uses brand-monogram mark (`PT`) with ambient breathing ring and emerald liveness dot — no spinner wheel, no text
- [ ] In-component skeleton placeholders match the exact shape/dimensions of incoming content

### Hub & Aggregator Card Layout
- [ ] Module cards use Direct Icon-Beside-Title layout (icon squircle inline-left of title in `flex gap-3` row)
- [ ] No icon floating above the title in a separate decorative zone
- [ ] No `rounded-full` category badge stacked above or beside the title as a separate element
- [ ] Telemetry metric pills right-aligned in the same header row via `ml-auto`

### Code Structure
- [ ] Component lives in the correct `features/<domain>/` directory
- [ ] No orphaned files in root-level `components/` directory
- [ ] Icon imports come exclusively from `lucide-react` or `react-icons/fa`
- [ ] `gray-*` or `zinc-*` Tailwind classes are NOT used (use `slate-*` only)
- [ ] Numeric and currency formatting uses explicit locale strings (`.toLocaleString("id-ID")` for IDR/IDX, `.toLocaleString("en-US")` for USD/Crypto/percentages) to prevent SSR/CSR hydration mismatches

### Data & Cloud Persistence
- [ ] Paper trading ledgers and user portfolios persist to Supabase (`public.stock_picks`), never browser `localStorage`
- [ ] Database mapping functions (`mapPickToDb` / `mapDbToStockPick`) maintain strict 1:1 parity with PostgreSQL schema and satisfy all `NOT NULL` constraints (`shares`, `high_watermark`, `low_watermark`)
- [ ] Primary keys destined for PostgreSQL `uuid` columns conform strictly to RFC4122 v4 format (`crypto.randomUUID()`)
- [ ] Next.js Server Actions are NEVER called inside React render phases or `setState` updater functions; cloud sync uses out-of-band debounced macrotasks (`setTimeout`)
- [ ] Background or request-independent server actions avoid request-scoped `cookies()` and use `SupabaseConn` from `@/lib/core/supabase`

---

## 24. Global Page Transition Loading Standard (`app/loading.tsx`)

The root-level `app/loading.tsx` is the Next.js App Router Suspense fallback rendered during all page-level navigations. It MUST follow the **Brand-Monogram Loading Standard**:

### Architecture
* **Overlay Layer:** `fixed inset-0 z-40 pointer-events-none select-none` — full viewport coverage, invisible to interactions, non-blocking.
* **Canvas:** `bg-slate-50/75 backdrop-blur-xs bg-dot-pattern` — signature textured canvas with a light frost, creating continuity with destination routes.
* **Brand Mark Floating Card:** `w-16 h-16 sm:w-[4.25rem] sm:h-[4.25rem] rounded-[1.25rem] bg-white border border-slate-200/80 shadow-xl shadow-slate-900/5` — elevated floating card with confident proportions, centered in the viewport.
* **Monogram:** `text-base sm:text-lg font-black tracking-widest text-slate-900 font-mono select-none` — initials (`PT`) in high-contrast monospace weight. No text label, no subtitle.
* **Ambient Breathing Ring:** `absolute -inset-2.5 rounded-3xl bg-indigo-500/10 animate-ping opacity-35 motion-reduce:hidden` — barely-visible breathing halo that signals activity without agitation.
* **Emerald Liveness Beacon:** `absolute -top-1 -right-1 flex h-3 w-3` corner pip with outer `animate-ping bg-emerald-400 opacity-75` and inner `bg-emerald-500 border-2 border-white shadow-2xs` — communicates "alive and responding."
* **Precision Micro-Activity Track:** `w-7 h-[2px] rounded-full bg-slate-100 mt-1.5 overflow-hidden relative` containing an indeterminate micro-indicator pill (`w-3 bg-slate-900 animate-scan-glide motion-reduce:animate-none`) driven by GPU-composited CSS keyframes.
* **Bottom Bar Clearance:** `pb-24 sm:pb-28` optical clearance so the centered mark doesn't overlap `CompactBottomBar`.
* **Zero Client JS Overhead:** Pure Server Component with 0 client JS bundle cost and 0 hydration delay.
* **Accessibility:** `role="status"`, `aria-live="polite"`, and `aria-label="Loading page"` on the root wrapper.

### Strict Prohibitions
- NEVER add the text "Loading" or any loading copy to this component.
- NEVER use a traditional CSS spinner wheel or third-party loader.
- NEVER make this component interactive (keep `pointer-events-none` on the overlay).
- NEVER use gradient backgrounds or gradient text in this component.
- Animated elements MUST respect `motion-reduce:hidden` or `motion-reduce:animate-none` for accessibility.

### Implementation Reference
```tsx
// app/loading.tsx
export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-40 bg-slate-50/75 backdrop-blur-xs bg-dot-pattern flex items-center justify-center p-4 pb-24 sm:pb-28 select-none pointer-events-none"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="relative flex items-center justify-center">
        {/* Soft ambient breathing halo */}
        <div className="absolute -inset-2.5 rounded-3xl bg-indigo-500/10 animate-ping opacity-35 motion-reduce:hidden" />

        {/* Elevated Floating Brand Mark Card */}
        <div className="relative w-16 h-16 sm:w-[4.25rem] sm:h-[4.25rem] rounded-[1.25rem] bg-white border border-slate-200/80 shadow-xl shadow-slate-900/5 flex flex-col items-center justify-center">
          {/* Brand Monogram */}
          <span className="text-base sm:text-lg font-black tracking-widest text-slate-900 font-mono select-none">
            PT
          </span>

          {/* Precision Micro-Activity Scanning Track */}
          <div className="w-7 h-[2px] rounded-full bg-slate-100 mt-1.5 overflow-hidden relative">
            <span className="absolute inset-y-0 w-3 rounded-full bg-slate-900 animate-scan-glide motion-reduce:animate-none" />
          </div>

          {/* Emerald Liveness Beacon */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-reduce:hidden" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white shadow-2xs" />
          </span>
        </div>
      </div>
    </div>
  );
}
```

---

## 25. Minimalist Milestone & Timeline Selector Standard (Frameless Underline Pattern)

Interactive timeframe, milestone, or record selectors (such as the distance benchmark switcher in `PersonalBestsSwipeCard.tsx`) must avoid heavy, boxed-in segmented pill containers that clutter the card surface. Instead, they must follow the **Minimalist Frameless Underline Track Standard**:

### Visual & Interaction Architecture
* **Frameless Open Layout:** No heavy background enclosure box (e.g. avoid nested `bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60`). The milestones sit directly on the card canvas, creating an airy and uncluttered interface.
* **Continuous Background Track Line:** A subtle, hairline guide spanning the selector row:
  ```tsx
  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100 rounded-full" />
  ```
* **Milestone Triggers:** Clean, lightweight interactive buttons with domain iconography, compact typography, and responsive touch feedback:
  ```tsx
  <button
    type="button"
    onClick={() => goToIndex(idx)}
    className={`group relative pb-2 sm:pb-3 px-2 sm:px-4 flex flex-col items-center justify-center transition-[color,transform] duration-300 cursor-pointer active:scale-90 touch-manipulation z-10 ${
      isActive ? "text-slate-900 font-black" : "text-slate-400 hover:text-slate-600 font-bold"
    }`}
  >
  ```
* **Sliding Underline Indicator:** When active, a razor-thin sliding indicator line animated via Framer Motion `layoutId` sits directly atop the track line:
  ```tsx
  {isActive && (
    <motion.div
      layoutId="activeMilestoneIndicatorLight"
      className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 rounded-full z-20"
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    />
  )}
  ```
* **Multi-Modal Navigation:**
  - **Keyboard Support:** Listen to keyboard arrow keys (`ArrowLeft` / `ArrowRight`) to cycle records smoothly.
  - **Touch Swipe Gestures:** Combine with horizontal swipe gesture handling on the display stage (`drag="x"` with threshold checks `offset.x < -40` or `velocity.x < -250`).
  - **1-Click Copy Ergonomics:** Provide a header or footer copy trigger (`handleCopyRecord`) to copy structured telemetry to the clipboard with visual checkmark confirmation.

### Prohibitions
- NEVER encase simple benchmark / milestone switchers in chunky nested pill-box frames that fight with card borders.
- NEVER use generic `'•'` or middot characters between milestone buttons.
- NEVER animate full bounding boxes when a clean underline indicator communicates selection with far higher sophistication.

---

## 26. Faceless Social Canvas & Social Media Visual Studio Standards (`/utils/social-canvas`)

To provide content creators and developers with a high-fidelity visual generation engine tailored for faceless channels, quotes, threads, and editorial statements:

### 26.1 Categorized Template Taxonomy & Grouping Standard
* **Anti-Flat-List Mandate**: NEVER dump extensive template options (10+ designs) into an unorganized, monolithic list or unindexed dropdown. Templates must be categorized into clear, purpose-driven groups to streamline workflow discovery.
* **4-Tier Functional Groups (`TEMPLATE_GROUPS`)**:
  1. *Editorial & Social (`editorial-social`)*: High-impact media layouts, Cable Breaking News (`breaking-news`), Now Playing Vinyl Player (`vinyl-now-playing`), Thread Starters (`thread-starter` with avatar support), Floating Cards (`floating-card`), and Hero Overlays (`hero-overlay`).
  2. *Modern & Structural (`modern-structural`)*: Asymmetric Bento Grids (`flat-bento`), Optical Frosted Glass (`premium-glass`), Code Terminal (`terminal-window`), Swiss Typography (`swiss-grid`), and Neo-Brutalist cards (`neo-brutalist`, `polaroid-brutalist`).
  3. *Narrative & Text (`narrative-text`)*: High-conviction message cards, Cinematic Subtitles (`cinematic-subtitles`), Typographic Posters (`typography-poster`), The Manifesto (`manifesto-block`), Narrative Focus (`narrative-focus`), and Minimal Chapters (`minimal-chapter`).
  4. *Minimal & Focus (`minimal-focus`)*: Minimalist Split (`minimalist-split`), Minimal Quotes (`quote-minimal`), Duotone Overlays (`duotone-overlay`), Split Monochrome (`split-monochrome`), and Classy Offset (`classy-offset`).
* **Interactive Category Filter Bar**: Provide an ergonomic category switcher (`All` + group buttons with domain icons) utilizing `touch-manipulation` and smooth layout transitions (`framer-motion`).

### 26.2 Broadcast, Media & Optical Standards
* **Cable News Lower-Third Pattern (`breaking-news`)**:
  - Recreates a clean, high-urgency television news lower-third banner across standard social ratios.
  - Features a bold red breaking banner band (`#DC2626`), high-contrast monospace time/ticker elements (`font-mono tracking-wider`), and an extra-bold all-caps headline banner.
  - Proportional image scaling with optional vignette gradients guaranteeing headline readability regardless of photo complexity.
* **Classy Offset & High-Contrast Left-Align Standard (`classy-offset`)**:
  - **Dual Text Theme Switcher (`theme?: "light" | "dark"`)**: Provides an explicit theme toggle for templates designed over dynamic photo backgrounds, allowing users to switch typography between crisp light (`#FFFFFF` with `#94A3B8` accents) and sleek dark (`#0F172A` with `#475569` accents).
  - **Consistent Left-Aligned Optical Flow**: Both the small lead-in text and the primary headline statement MUST align to a single, consistent left margin origin (`textAlign = "left"`). NEVER set lead-in text to `textAlign = "right"` when the headline is left-aligned — this causes awkward edge displacement and breaks visual reading cadence.
* **Optical Frosted Glass Pattern (`premium-glass`)**:
  - Simulates native CSS `backdrop-filter: blur()` in 2D Canvas via clipping paths, background re-rendering with intense canvas blur and saturation filters, theme tints (dark/light), and subtle rim-light strokes.
* **Authentic Cinematic Subtitle Pattern (`cinematic-subtitles`)**:
  - 4K/24FPS camera telemetry strip (`● REC`, scene timecode metadata), vignette bottom gradient, and dual-theme high-contrast subtitles (classic film yellow or crisp white with black outer outline stroke) guaranteeing 100% legibility over any photography.
* **Audio Player & Vinyl Record Pattern (`vinyl-now-playing`)**:
  - Ambient blurred album backdrop, album art sleeve with concentric-grooved vinyl disc peeking from behind, scrubbed audio timeline, and minimalist vector playback controls (`|◀`, `▶`, `▶|`).
* **Technical Code Terminal Pattern (`terminal-window`)**:
  - macOS window chrome with authentic traffic light controls (`Red`, `Yellow`, `Green`), tab title bar, prompt line (`➜ ~/workspace`), line-numbered log output with contextual badge coloring (`[SUCCESS]`, `[ERROR]`, `[INFO]`), and an emerald terminal cursor block.

### 26.3 Client-Side Canvas 2D Engine Architecture
* **Pure In-Browser Rendering**: 100% client-side HTML5 Canvas API execution. Zero external rendering microservices, zero Puppeteer serverless bottlenecks, zero cloud storage bandwidth costs.
* **Standard Aspect Ratios**:
  - `1:1` Square (1080 × 1080 px) — Instagram Grid, LinkedIn Posts.
  - `4:5` Portrait (1080 × 1350 px) — Instagram Feed optimal vertical size.
  - `9:16` Story / Reel (1080 × 1920 px) — TikTok, Instagram Stories, YouTube Shorts.
  - `16:9` Landscape (1920 × 1080 px) — X (Twitter) Cards, YouTube Thumbnails.
* **Defensive Typography & Wrapping (`wrapText`)**:
  - Intelligent word wrapping respecting dynamic `maxWidth` constraints.
  - Preservation of explicit newlines (`\n`) and double paragraph breaks without collapsing whitespace.
  - Unbroken word protection: Words exceeding `maxWidth` (such as long URLs, hashes, or technical terms) are split gracefully across lines rather than overflowing outside card bounds.
* **Focal Point Object-Position Controls**:
  - Provides intuitive position offset controls (`imageOffsetX`, `imageOffsetY`, `avatarOffsetX`, `avatarOffsetY` from `0.0` to `1.0`, centered at `0.5`) allowing users to adjust photo focus when adapting across wildly different aspect ratios (e.g. 16:9 landscape to 9:16 story).

---

## 27. Market Intelligence & Decision Engine UI/UX Standards (`/investment`)

The Investment Compass is an executive-level, risk-first capital preservation hub designed for disciplined portfolio recovery (~80% drawdown recovery) and high-conviction market understanding. It adheres to strict financial telemetry accuracy, mobile-first responsive mechanics, and pure white container standards.

### 27.1 High-Precision Financial Telemetry & Parser Hygiene
* **2-Decimal Financial Precision**:
  - Major index quotes (such as the IDX Composite `^JKSE`) and cross-asset levels MUST display exact 2-decimal financial precision (e.g. `6,146.72`).
  - Nominal index point changes must always be paired with exact percentage deltas in high-contrast monospace (e.g. `-46.2 (-0.75%)`).
* **Deterministic Locale Formatting**:
  - Never call bare `.toLocaleString()`.
  - Indonesian domestic currency amounts and share volumes use `.toLocaleString("id-ID")`.
  - Financial index levels with fractional decimals (IHSG), USD values, and crypto prices MUST use `.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })` — never round index prices into integers (e.g., `6,146.72` must NOT be rounded to `6.147`).
* **Yahoo Finance Quote & Delta Normalization**:
  - In `services/market-data/yahoo.ts`, Yahoo chart metadata frequently contains stale `chartPreviousClose` baselines that drift from official closing prices.
  - Parsers MUST prioritize Yahoo's explicit delta fields (`regularMarketChange`, `fulldayChange`, `regularMarketChangePercent`, `fulldayChangePercent`) over calculating `price - chartPreviousClose`.

### 27.2 Mobile-Responsive Matrix & Operational Layouts
* **Executive Stacked Action Cards (`PermissionsMatrix.tsx`)**:
  - Multi-column tables or 3-column rows severely degenerate on screens `< lg` (< 1024px), causing horizontal text truncation or awkward single-word wrapping.
  - On mobile, convert rows to a 2-tier stacked card:
    - *Top Row*: Action type label on the left (e.g., `Scalping`, `Swing Trading`, `Core DCA`) paired with a high-contrast status badge on the right (`Allowed`, `Selective`, `Not Allowed`, `Paused`).
    - *Bottom Block*: Full-width, un-truncated descriptive narrative explaining current execution conditions and thesis parameters.
    - *Header Metrics*: Discrete pill tags for Exposure Cap (e.g. `Max 5% Portfolio`) and `riskPerTrade` (e.g. `0.5% max risk`).
* **Contextual Inline Drawer Pattern (`OverviewRegimes.tsx`)**:
  - In complex regime cards with contributing diagnostic factor pills, NEVER trigger distant page-bottom banners or separate viewport-jumping summary views.
  - Tapping a factor pill highlights the active button and expands an animated inline drawer directly inside that active card container (via `AnimatePresence`).
  - Provide a dedicated close button (`X` icon with `"Close"`) to collapse the drawer.
* **Viewport-Centered Modal Fallback for Popovers (`View.tsx`)**:
  - When header action buttons or connection status badges sit near the right or left viewport edges, traditional absolute popovers (`absolute right-0 top-full`) cause severe clipping off-screen on handheld screens (< 640px).
  - On mobile, adapt popovers into a viewport-centered modal card with a soft backdrop overlay:
    ```tsx
    <div className="fixed inset-x-4 top-28 sm:absolute sm:inset-auto sm:right-0 sm:top-full z-50 ...">
    ```
  - Backed by a full-viewport transparent backdrop (`fixed inset-0 z-40`) for natural click-outside dismissal.
* **Defensive Scrollbar Suppression for Swipeable Containers**:
  - Horizontal swipe containers (such as 5-tab terminal headers in `MarketDataHub.tsx` and macro calendar filters in `EventCalendar.tsx`) must suppress browser-default scrollbar tracks to prevent clunky gray bars on mobile touch screens:
    ```tsx
    className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x"
    ```

### 27.3 Pure White Container Standard for Operational Cards
* **Anti-Monolithic Dark Mode Mandate**:
  - In accordance with §1.3, operational dashboard cards and capital anchors (such as the Safe Yield & Preservation 40% Anchor in `MarketPlaybook.tsx`) MUST use pure white containers (`bg-white rounded-[2rem] border border-slate-200/80 shadow-xs`).
  - Dark slate monoliths (`bg-slate-900`) are strictly forbidden as full cards in dashboard flows — they create oppressive visual dead zones and clash with the signature light textured canvas (`bg-slate-50/80 bg-dot-pattern`).
  - Accentuate high-priority safe anchors using high-contrast warm amber badge squircles, clean slate sub-cards (`bg-slate-50 border border-slate-100/80 rounded-2xl`), and confident typographic contrast.

* **Hard Circuit Breaker Lockdown Standard**:
  - When the macro-environment deteriorates below acceptable thresholds (e.g., `Composite Score < 40`), the UI MUST visually intercept standard workflows.
  - Tactical idea lists ("Tactical Dos") MUST be entirely hidden from the DOM to prevent fatal execution errors.
  - Replace operational lists with a **No Trade Zone** banner: a prominent, full-width high-contrast container (`bg-rose-600 border border-rose-700 shadow-inner`) centered with a `ShieldAlert` icon and strict white/rose text indicating "Circuit breaker active. All tactical trading locked."
  - Never use passive `opacity-50` fading for a hard lockdown; make the denial of service explicitly visible.

* **Sizing Mandate & Telemetry Strip Standard**:
  - Functional sizing mandates (e.g., Risk per Trade, Max Exposure limits) MUST be injected via isolated horizontal telemetry strips (`bg-indigo-50/50 border border-indigo-100`) directly beneath the Tactical Stance.
  - Critical numerical caps must utilize heavy monospace typography (`font-mono font-extrabold`) for absolute clarity.

### 27.4 Asymmetry Zone Alert Banner Standard (`OverviewRegimes.tsx`)
* **Extreme Valuation & Flow Asymmetry Surfacing**:
  - When the market reaches historic extremes in on-chain valuation (Crypto MVRV Z-Score) or institutional foreign capital flow (IDX Net Foreign Flow), the engine populates `asymmetryZone` (`accumulation` or `distribution`).
  - Regime cards MUST render a high-contrast alert callout banner directly beneath the diagnostic health bars to immediately focus the user's attention on non-linear risk/reward setups.
* **Semantic Tints & Liveness Beacons**:
  - *Generational Accumulation (`accumulation`)*: Encased in a soft emerald container (`bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 rounded-2xl p-4 sm:p-4.5`). Features an emerald pulsing beacon dot (`animate-ping bg-emerald-400` + solid `bg-emerald-500`), a domain `TrendingUp` icon, an extra-bold monospace zone label (`ZONE: GENERATIONAL ACCUMULATION`), and high-clarity historical context copy (e.g. "MVRV Z-Score in deep value territory. Historically asymmetric accumulation zone.").
  - *Cycle Distribution (`distribution`)*: Encased in a soft rose container (`bg-rose-500/10 border border-rose-500/20 text-rose-950 rounded-2xl p-4 sm:p-4.5`). Features a rose pulsing beacon dot (`animate-ping bg-rose-400` + solid `bg-rose-500`), a domain `AlertTriangle` icon, an extra-bold monospace zone label (`ZONE: CYCLE DISTRIBUTION / BLOWOFF TOP`), and defensive capital preservation directives.
* **Strict Anti-Emoji Mandate**:
  - Never use fire or rocket emojis (🔥, 🚀, 💎) in asymmetry banners. Let verified on-chain metrics, domain SVG icons, and clean monospace typography convey market realities.

### 27.5 Macro Scenario Sandbox Standard (`ScenarioSandbox.tsx`)
* **Real-Time Client-Side Simulator**:
  - Provides a forward-looking stress-testing sandbox mounted directly beneath the regime overview, allowing users to simulate portfolio and macro regime shifts under hypothetical external shocks.
  - Client-side deterministic recomputation: Sliders immediately recompute composite scores and derive new states without server roundtrips.
* **Pure White Floating Card Architecture**:
  - Encapsulated within a pure white floating card (`bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs`).
  - Anchored by a domain squircle icon (`w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200/80 text-slate-700`) with `Sliders`, bold title `h3` (`Macro Scenario Sandbox`), and an actionable reset button (`Reset to Baseline` with `RotateCcw`) that appears when parameters drift from live baseline.
* **3-Parameter Stress Sliders**:
  - 1. *US Fed Funds Rate* (0.00% to 10.00%, step 0.25%): Controls monetary tightening/easing pressure and real yields.
  - 2. *USD / IDR Exchange Rate* (Rp 14,000 to Rp 18,500, step Rp 50): Simulates Rupiah currency depreciation/appreciation.
  - 3. *Bitcoin Spot Price* ($20,000 to $200,000, step $1,000): Simulates crypto liquidity shocks across moving averages.
  - Sliders feature touch-friendly tracks (`accent-slate-900 cursor-pointer`), min/max boundary labels, and extra-bold monospace values (`font-mono font-black`).
* **Live Score Deltas & Transition State Chips**:
  - Simulated regime cards display the baseline score, the simulated score, and a signed point delta pill:
    - Positive delta (`Δ +14`): `bg-emerald-50 text-emerald-700 border-emerald-200/80`.
    - Negative delta (`Δ -10`): `bg-rose-50 text-rose-700 border-rose-200/80`.
    - Neutral delta (`No change`): `bg-slate-50 text-slate-500 border-slate-200/80`.
  - State transition pill displays `Previous State → Simulated State` when a regime threshold is crossed.
* **Curated Stress-Test Presets (Strict Anti-Emoji)**:
  - Provide 4 quick scenario buttons:
    - *Baseline (Live Data)* (`RotateCcw` icon).
    - *Aggressive Fed Cut (-150 bps)* (`TrendingDown` icon).
    - *IDR Currency Shock (Rp 17,200)* (`DollarSign` icon).
    - *Crypto Liquidity Winter ($45,000)* (`Flame` icon).
  - Strictly prohibits emojis or `Sparkles` icon in preset pills.

---

## 28. Indonesian Stock Explorer & Microstructure Telemetry Standards (`/utils/stock-explorer`)

The Indonesian Stock Explorer provides algorithmic screening, institutional foreign flow tracking, and market microstructure analysis calibrated specifically for IDX (Indonesia Stock Exchange) trading dynamics.

### 28.1 Symmetrical Auto-Rejection (ARA/ARB) & Board Price Limits
* **Symmetrical Percentage Boundaries**:
  - IDX enforces symmetrical price limit tiers:
    - **Price < Rp 200**: ±35% limit.
    - **Price Rp 200 – Rp 5,000**: ±25% limit.
    - **Price > Rp 5,000**: ±20% limit.
* **Acceleration Board & Special Monitoring Board (PPK) Tolerance**:
  - Stocks listed on the Acceleration Board or Special Monitoring Board trade below the traditional Rp 50 floor down to Rp 1.
  - Auto-rejection calculation logic MUST NEVER enforce a hardcoded `Math.max(50, ...)` floor. Hardcoding Rp 50 creates critical misclassification bugs (e.g., mislabeling ASMI at Rp 44 as `ARB` when it is actually surging +35% at `ARA`). The mathematical lower bound is `Math.max(1, ...)`.
* **Directional Safeguards & Order Book Highs**:
  - A stock with positive momentum (`ChangePct > 0`), trading at its intraday high (`High === Close`), with 0 remaining ask orders (`OfferVolume === 0`), is locked at Auto-Rejection Upper Limit (**ARA**).
  - Classification algorithms must enforce strict directional guards: positive returns must NEVER trigger `ARB`, and negative returns must NEVER trigger `ARA`.
  - Display near-limit proximity badges (`Near ARA` when within 2 ticks / 1.5% of upper limit, `Near ARB` when within 2 ticks / 1.5% of lower limit) to highlight immediate volatility risk.

### 28.2 6-Factor Telemetry Strip & Constrained Drawer Layout Standard (`AIInsights.tsx`)
* **Constrained Container Anti-Truncation Mandate**:
  - In constrained containers such as side sheets, detail drawers (`StockDetailDrawer` with `max-w-xl` ~576px), or mobile viewports (~320–380px usable width), **NEVER force 6 telemetry cards into a single horizontal row (`grid-cols-6`)**.
  - A 6-column grid inside a ~480px inner container yields barely ~70px per card, causing severe ellipsis truncation (`Forei...`, `Meg...`, `29.7x...`), overlapping text, and unreadable labels.
* **Responsive 2x3 Matrix Standard**:
  - Telemetry strips inside constrained containers MUST use a responsive `grid-cols-2 sm:grid-cols-3 gap-3` layout.
  - Each factor is housed in an elevated pure white container (`bg-white rounded-2xl border border-slate-200/80 shadow-2xs min-h-[72px] p-3.5`).
  - Factor titles use domain-specific SVG icons paired with compact uppercase tracking labels (`text-[10px] font-extrabold uppercase text-slate-400`).
  - Primary values use bold, tabular numerals with restrained sizing (`text-xs sm:text-sm font-black`) to guarantee zero text truncation.
  - Secondary descriptions (`/ trade`, `> 100T`, `Growth Premium`, `Ask %`) must sit cleanly on a sub-baseline or discrete right slot without overlapping the primary metric.

### 28.3 Indonesian Market Microstructure & Bandarmology Telemetry
* **Turnover Value & Frequency Over Raw Lots**:
  - Ambiguous raw share lot counts without nominal context obscure liquidity reality. Replace raw volume columns with **Turnover Value in IDR** (`Rp Billions` / `Rp Millions`) paired with **Transaction Frequency** (`X tx`).
* **Bid/Offer Order Book Pressure Micro-Bar**:
  - Provide a visual microstructure ratio bar (`h-1.5` or `h-2` rounded track with `bg-emerald-500` Bid vs `bg-rose-500` Offer) displaying real-time supply/demand absorption (`Bid X%` vs `Y% Ask`).
* **Whale Ticket Proxy (Average Value per Transaction)**:
  - Calculate `AvgValuePerTx = TotalTurnoverIDR / Frequency`.
  - Highlights institutional block-trade presence (elevated ticket > Rp 35M/tx) versus fragmented retail participation (< Rp 10M/tx).
* **Non-Regular (Nego) Crossing Share**:
  - Track off-market crossing transactions via `NegoRatio = (NegoValue / TotalTurnover) * 100` to alert traders when volume is dominated by pre-negotiated wholesale transfers rather than regular board demand.
* **Turnover Liquidity Floor Tiers**:
  - Classify stocks into actionable liquidity tiers:
    - **Mega Liquidity**: > Rp 25B daily turnover (Blue chips, high capacity).
    - **High Liquidity**: Rp 5B – Rp 25B (Institutional swing candidates).
    - **Mid Liquidity**: Rp 1B – Rp 5B (Active mid-caps, retail momentum).
    - **Low Liquidity**: Rp 100M – Rp 1B (Caution: slippage risk).
    - **Illiquid**: < Rp 100M (Hard warning: high liquidity risk).

### 28.4 Stockpick Simulator, Paper Trading Ledger & Trade Journal Architecture Standards (`/utils/stock-explorer?tab=simulator`)
* **Zero-LocalStorage Single Source of Truth Mandate**:
  - Paper trading ledgers and trade journal entries MUST NEVER rely on `localStorage` as a primary persistence mechanism. Browser storage causes data fragmentation, fails to synchronize across devices, and loses auditability on cache purges.
  - All position creations, edits, closes, and deletions MUST persist directly to Supabase (`public.stock_picks`) with instant optimistic client UI feedback and localized error recovery pills.
* **Physical Schema Parity & Explicit Column Mapping**:
  - Database persistence mapping (`mapPickToDb` and `mapDbToStockPick` in `actions/stockpicks.ts`) MUST align 1:1 with PostgreSQL column definitions (`ticker`, `company_name`, `buy_price`, `lots`, `shares`, `high_watermark`, `low_watermark`, `high_watermark_date`, `low_watermark_date`, `target_price`, `stop_loss`, `entry_date`, `exit_price`, `exit_date`, `exit_reason`, `realized_pnl_idr`, `realized_pnl_pct`, `peak_gain_pct`, `max_drawdown_pct`, `holding_days`, `thesis`, `notes`).
  - Never alias or substitute column names (e.g. attempting to send `stock_code` or `highest_price_traced` when the database expects `ticker` or `high_watermark`).
  - Always enforce `NOT NULL` constraints proactively on the application side (e.g., ensuring `shares = lots * 100`, initializing `high_watermark = buyPrice`, `low_watermark = buyPrice`).
* **RFC4122 v4 UUID Validation Guard**:
  - PostgreSQL `UUID` primary key columns strictly reject arbitrary random strings (e.g., `pick_${Date.now()}`). All new records generated on the client or server MUST validate or generate canonical RFC4122 v4 UUIDs via `crypto.randomUUID()` before insertion.
* **Out-of-Band Watermark Synchronization & React Render Hygiene**:
  - Live market data watermarks (`highWatermark`, `lowWatermark`) update continuously as new quotes stream in.
  - **CRITICAL REACT RENDER HYGIENE**: Next.js Server Actions (`syncCloudWatermarksAction`) MUST NEVER be invoked synchronously inside React render methods, `useMemo` hooks, or `setState` updater functions (`setStockPicks((prev) => ...)`). Doing so triggers React's internal dispatcher error: `"Cannot update a component ('Router') while rendering a different component"`.
  - Watermark batch synchronization to Supabase MUST be evaluated against a stable ref (`stockPicksRef`), updated in local state cleanly, and synced to the cloud via a debounced (1200ms) macrotask timer (`setTimeout`) in a `useEffect` or dedicated handler.
* **Database Client Context & Serverless Isolation (`SupabaseConn`)**:
  - Asynchronous background server actions that execute outside the active request lifecycle must NOT call `cookies()` from `@/lib/core/supabase-server`, which throws `"cookies was called outside a request scope"`.
  - Public or anon database operations must instantiate `SupabaseConn` directly from `@/lib/core/supabase` using the standard project URL and anon public key.
* **Closed Trade Journal Alpha Attribution & Risk Metrics**:
  - Closing a simulated position transforms it into an immutable journal entry calculating:
    - `realized_pnl_idr`: `(exitPrice - buyPrice) * lots * 100`
    - `realized_pnl_pct`: `((exitPrice - buyPrice) / buyPrice) * 100`
    - `peak_gain_pct`: `((highWatermark - buyPrice) / buyPrice) * 100` (measuring execution efficiency vs top of move)
    - `max_drawdown_pct`: `((lowWatermark - buyPrice) / buyPrice) * 100` (measuring adverse excursion and risk endured)
    - `holding_days`: elapsed calendar days between `entry_date` and `exit_date`
  - Position exits capture mandatory structured attribution metadata: `exit_reason` (`Target Hit`, `Stop Loss`, `Thesis Invalidation`, `Rebalance`, `Time Stop`), and optional reflective `notes`.
  - Journal analytics cards present Win Rate %, Profit Factor, Net Realized IDR, Average Hold Time, and a filterable visual ledger.

---

## 29. Route Not Found & Error Recovery Standard (`app/not-found.tsx`)

The application's 404 page MUST adhere to the **Strict Zero-Redundancy Floating Card Standard**:

### Visual & Architectural Structure
* **Floating Card Unit:** `bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs sm:shadow-md max-w-md w-full` centered over the signature textured canvas (`bg-slate-50/80 bg-dot-pattern`).
* **Strict Anti-Redundancy Mandate:** Every data point appears strictly ONCE.
  - **No Triple Duplication:** NEVER combine an `"Error 404: Page Not Found"` pill, a giant brutalist `"404"`, and a `"Page Not Found"` headline in the same view.
  - **Single Status Placement:** HTTP status is declared strictly ONCE via a discrete top-right monospace telemetry pill:
    ```tsx
    <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 rounded-lg">
      HTTP 404
    </span>
    ```
  - **Clean Contextual Breadcrumbs:** `Home / 404` left-aligned in the top header divider row (`flex items-center justify-between pb-4 border-b border-slate-100`).
  - **Singular Title:** Bold headline stated once as `Route Not Found` (`text-xl sm:text-2xl font-black text-slate-900 tracking-tight`).
* **Domain Icon Squircle Anchor:** Elevated squircle with domain-accurate `RouteOff` icon (`w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100/80 text-rose-600 flex items-center justify-center mx-auto shadow-2xs`). Never use generic `FileQuestion` pills or emojis.
* **Restrained Typographic Scale:** Strictly prohibits oversized brutalist typography (`text-7xl` or `text-8xl` giants). Keeps primary typography balanced and legible within the card frame.
* **Actionable Path Telemetry:** Includes dynamic pathname resolution (`usePathname()`) displaying the exact requested URL (`Path: /requested-path`) inside a clean monospace telemetry tray, converting generic errors into concrete system diagnosis.
* **Action Hygiene (Single Primary Trigger):**
  - Provides exactly ONE unambiguous primary recovery action:
    ```tsx
    <Link
      href="/"
      className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-slate-900 hover:bg-slate-800 !text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xs active:scale-95 transition-all !no-underline"
    >
      <ArrowLeft className="w-4 h-4 !text-white" />
      <span className="!text-white">Return to Home</span>
    </Link>
    ```
  - Strictly prohibits duplicate stacked buttons (`Go to Home` + `Go Back`), which clutter the card and duplicate the persistent bottom dock.
* **Calibrated Bottom Clearance:** `pb-28 sm:pb-36` optical clearance ensuring the floating card rests at the true optical focal center without colliding with or crowding `CompactBottomBar` on desktop and mobile viewports.

---

## 30. Asset Averaging & Position Sizing Workstation Standards (`/utils/stock-crypto-calculator`)

The Asset Averaging Calculator provides high-conviction cost basis consolidation, reverse target optimization (Reverse DCA), fixed-budget tranche deployment, and profit realization ladder planning tailored for Indonesian stocks (IDX lots), US equities (shares), and crypto.

### 30.1 Full-Width Stacked Stages Financial Architecture (Strategy A Standard)
* **Anti-Forced-Side-by-Side & Anti-Fragmented-Card Mandates**:
  - NEVER force complex financial calculators into side-by-side split columns (< 600px width per column) or fragment them into 4–5 disconnected, arbitrary cards with artificial bar charts. Side-by-side columns crowd milestone button rows, cause numerical truncations, and degrade mobile responsiveness.
  - Standardize on **Strategy A: Full-Width Stacked Stages** (Header → 4-Card Telemetry Strip → Full-Width Position Blotter → Full-Width Financial Intelligence Workstation):
    1. **Stage 1: Hero Header (`UtilHeader.tsx`)**: Canonical 3-tier floating card header with breadcrumbs, domain icon squircle (`Calculator`), full-width title, and descriptive subtitle.
    2. **Stage 2: Global 4-Card Telemetry Strip (`TelemetryStrip.tsx`)**:
       - 4 essential position KPIs: *Consolidated Average Price*, *Net Breakeven Threshold* (factoring sell broker fee), *Total Outlay Capital*, and *Total Volume & Lots*.
       - Employs the **Canonical 4-Tier Internal Vertical Hierarchy** (§4.2): Tier 1 (Icon left + Badge right), Tier 2 (Category label full-width), Tier 3 (Monospace tabular numeral), Tier 4 (Descriptive subtext). Guarantees zero text clipping and zero badge border overflow down to 320px viewports.
    3. **Stage 3: Full-Width Accumulation Blotter (`PositionBlotter.tsx`)**:
       - Instrument ribbon: Frameless asset toggle (`Stock` vs `Crypto`) with responsive mobile text fallbacks (`hidden sm:inline` / `sm:hidden truncate`), lot/share unit switcher, currency toggle (IDR/USD), and an expandable fee drawer.
       - Desktop table + Mobile card ledger: Clean order rows with execution price, volume, subtotal outlay, capital weight %, and deletion triggers.
       - Proportional Capital Allocation Bar: Clean visual weight distribution across entries with an interactive order breakdown legend.
    4. **Stage 4: Full-Width Financial Intelligence Workstation (`PositionIntelligence.tsx`)**:
       - Unified workstation card (`bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-7`).
       - Features an open, **Frameless Tab Switcher** driven by Framer Motion `layoutId` with spring physics across 4 dedicated financial planning modules:
         - **Tab 1: Realization & Risk (`RealizationTab.tsx`)**: Full-width segmented mode switcher (`[ Take-Profit Target ] [ Capital Protection Floor ]`), single-row milestone pill track (+5% to +50% or -3% to -15%), dynamic Risk:Reward ratio (RRR), and pure white/tinted outcome callouts (§30.5).
         - **Tab 2: Target Solver (`TargetSolverTab.tsx`)**: Reverse DCA optimizer (`calculateTargetOptimizer`) calculating exact tranches required to achieve a desired blended cost basis.
         - **Tab 3: Budget Planner (`BudgetPlannerTab.tsx`)**: Fixed-budget capital allocator (`calculateBudgetOptimizer`) computing maximum executable volume, residual cash buffer, and blended cost reduction.
         - **Tab 4: Stress Matrix (`StressMatrixTab.tsx`)**: Full-width sensitivity matrix simulating asset price shocks (-30% to +50% via `calculateScenarioPoints`) with color-coded P&L deltas and total position value.

### 30.2 Zero Ellipsis & Number Anti-Truncation Mandate
* **Absolute Precision Requirement**:
  - NEVER apply `truncate` (`text-overflow: ellipsis`) to financial numbers, lot quantities, currency values, or telemetry labels in calculators and trading tools.
  - Ellipsis cutoffs (e.g. `Rp 11.1...`, `69 L...`, `CAPITAL NE...`) destroy financial accuracy and leave users uncertain whether figures represent thousands, millions, or billions.
  - All numerical outputs must render with 100% full fidelity using `font-mono tabular-nums break-words` inside spacious grid cells (`grid-cols-1 sm:grid-cols-2` rather than cramped `grid-cols-4`).

### 30.3 Refined Typography & Anti-Brutalist Hierarchy
* **Lighter Weights & Readable Proportions (§4.3)**:
  - Banish overuse of `font-black` (900 weight) inside numbers and card labels. Use `font-semibold` (600) and `font-bold` (700) for primary metrics (`text-2xl sm:text-3xl font-bold font-mono text-slate-900`), and `font-medium` (500) for secondary details.
  - Keeps financial interfaces calm, professional, and visually uncluttered while saving horizontal space on mobile.

### 30.4 Floating-Point Currency Formatting Hygiene
* **Float Epsilon Elimination**:
  - When formatting domestic currencies (such as IDR in `formatCurrency`), floating-point residue (e.g. `46575000.00000001`) can falsely trigger fractional decimals, resulting in bloated numbers with awkward `,00` cents.
  - Parsers MUST check `Math.abs(value - Math.round(value)) < 0.01` so whole currency amounts format cleanly (e.g. `Rp 46.575.000` rather than `Rp 46.575.000,00`).

### 30.5 Indonesian Market Microstructure Parity
* **Native Lot Multiplier (1 Lot = 100 Shares)**:
  - In Stock mode with `stockUnit === "lots"`, all volume inputs and required lot outputs represent Indonesian Stock Exchange (IDX) lots ($1\text{ lot} = 100\text{ shares}$).
  - Automatically display the underlying normalized share count beneath lot totals to eliminate manual lot-to-share conversion friction.
* **Broker & Exchange Fee Accounting**:
  - Provide an optional fee inclusion toggle with standard defaults (0.15% Buy / 0.25% Sell for IDX stocks; 0.1% Buy / 0.1% Sell for crypto).
  - Calculate true net breakeven: $P_{be} = \frac{C_{net}}{U \times (1 - f_{sell})}$, ensuring investors know the exact exit price required to recover capital after broker commissions and exchange levies.

### 30.6 Dedicated Profit Realization & Downside Risk Blocks
* **Frameless Non-Squeezed Metric Callouts**:
  - NEVER force long target calculations and labels into single cramped text rows that squeeze labels into abbreviations (e.g. shortening "Capital at Risk" to "C.").
  - Encapsulate bottom-line financial outcomes in dedicated, non-squeezed stat containers:
    - *Projected Net Profit*: Highlighted soft emerald container (`bg-emerald-50/60 border border-emerald-100`) with bold net currency profit and return %.
    - *Capital at Risk*: Highlighted soft rose container (`bg-rose-50/60 border border-rose-100`) with bold downside risk amount and drawdown %.

### 30.7 Mobile-First Touch & Layout Standard
* **Input Font Sizing (iOS Preflight)**: All numeric inputs declare `text-base sm:text-sm` to strictly prevent iOS Safari from automatically zooming into the page on focus.
* **Touch Target Sizing**: All preset chips, tabs, and action buttons maintain $\ge 36\text{px}-44\text{px}$ touch targets with `touch-manipulation` and active tactile feedback (`active:scale-95`).
* **Calibrated Bottom Clearance**: `pb-32 sm:pb-36` ensuring zero overlap with `CompactBottomBar`.

---

## 31. Spinner Wheel & Decision Randomizer Standards (`/utils/spinner-wheel`)

The Decision Spinner Wheel (`/utils/spinner-wheel`) provides high-engagement, customizable randomized decision-making with authentic physical deceleration physics and sensory feedback.

### 31.1 Modular Architecture
* **Clean Component Decomposition**:
  - `WheelStage.tsx`: Pure HTML5 Canvas rendering of the multi-slice color-coded wheel, dynamic pointer indicator, and Framer Motion spring pop-in.
  - `WheelControls.tsx`: Pure white floating card (`bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs`) with entry input management, quick preset chips (`presets.ts`), spin triggers, sound toggles, and item removal switches.
  - `WinnerModal.tsx`: Frameless winning celebration modal with confetti explosion and domain action buttons.
  - `Skeleton.tsx`: Layout-perfect localized skeleton loader eliminating global fallback flashes.
* **Sensory Feedback**: Employs Web Audio API synthesized mechanical clicks during slice traversals and victory fanfare on selection.

---

## 32. Faceless Social Media Card Studio Standards (`/utils/social-canvas`)

The Social Canvas Studio (`/utils/social-canvas`) generates high-resolution, exportable social media card graphics without third-party dependencies.

### 32.1 Modular Architecture & Template Diversity
* **Clean Studio Separation**:
  - `CanvasRenderer.tsx`: High-DPI HTML5 Canvas rasterization engine with text auto-wrapping, custom aspect ratios (1:1, 4:5, 9:16, 16:9), and client-side PNG/WebP exports.
  - `TemplateGallery.tsx`: Interactive template showcase organized across 4 distinct categories: News & Headlines, Offset & Minimalist, Frosted Glass & Optical, and Cinematic & Subtitle.
  - 21 bespoke designs featuring high-contrast typography, code terminals, vinyl audio players, and dynamic light/dark theme toggles.

---

## 33. Device, Speed & Diagnostics Inspector Standards (`/utils/device-inspector`)

The Device, Speed & Diagnostics Inspector (`/utils/device-inspector`) provides real-time client hardware telemetry, multi-stream bandwidth benchmarks, audio/video peripheral verification, and platform capability audits.

### 33.1 Modular Workstation Architecture & Subsystem Isolation
* **Clean Component Decomposition**:
  - `View.tsx`: Main page orchestrator integrating the canonical 3-tier `UtilHeader.tsx` (`Copy Markdown`, `Copy JSON`, `Export JSON`), `TopTelemetryStrip`, and a frameless 5-mode workstation tab switcher with spring indicator (`layoutId="activeInspectorTab"`).
  - `TopTelemetryStrip.tsx`: Instantaneous 4-card KPI strip adhering strictly to the **Canonical 4-Tier Internal Structure** across Display System, Compute Architecture, Edge Network, and System Memory & Power.
  - `SpeedTestStudio.tsx`: Bandwidth & Latency testing suite with 4-tier metric cards (Download, Upload, Ping RTT, Jitter variance), real-time phase progress bar, throughput stream sparkline, and real-world Workload Suitability Matrix (Grade A+ to F).
  - `HardwareDisplayStudio.tsx`: Deep hardware architecture inspection (unmasked GPU vendor/renderer, logical CPU threads, memory, battery power source) paired with an **Interactive Live RAF Frame Stability Benchmark** measuring live FPS, frame delta jitter (`±ms`), dropped frames count, and synchronized hardware fluidity rails.
  - `PeripheralsStudio.tsx`: Web Audio API stereo separation acoustic player (440Hz Left, 880Hz Right, Center, 200–2000Hz Sweep), **Anti-Gradient Segmented LED VU Meter** (24 discrete LED blocks), 16-band audio spectrum visualizer, and webcam sensor stream inspection.
  - `CompatibilityMatrixStudio.tsx`: Searchable/filterable media codec support matrix (11 formats with MIME tooltips) and modern Web Platform APIs capability audit (12 APIs across compute, multimedia, storage, security, concurrency).
  - `Skeleton.tsx` & `loading.tsx`: Localized route skeleton loader complying with the Anti-Global-Fallback Mandate.

### 33.2 Anti-Gradient & Pro-Audio Segmented LED Meter Mandate
* **Strict Prohibition of Continuous Gradients**: In audio monitoring and telemetry meters, continuous CSS gradients (such as `bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500`) are strictly forbidden under the Anti-Gradient Mandate.
* **Pro-Audio Segmented LED Meter Pattern**: Meters must use discrete, state-driven LED blocks (e.g. 24 segmented blocks where $0\%-65\%$ light up in solid `bg-emerald-500`, $65\%-85\%$ in solid `bg-amber-500`, and $>85\%$ in solid `bg-rose-500`, with inactive segments in solid `bg-slate-200`). This mirrors physical broadcast audio gear and maintains clean UI surfaces.

### 33.3 Developer Bug Reporting & Telemetry Export Standard
* **Markdown GitHub Issue Export**: Telemetry export functions must provide a 1-click **Copy Markdown** action via `generateMarkdownReport()` in `diagnostics.ts`, compiling client specs into a clean Markdown table (`| Specification | Telemetry Value |`) suitable for immediate pasting into GitHub bug reports and technical issue tickets.

---

## 34. Access Control & Authorization Recovery Standards (`/unauthorized`)

The Access Control & Unauthorized route (`/unauthorized`) handles restricted resource access attempts, authentication challenges, and privilege validation failures across the application with zero ambiguity and strict diagnostic clarity.

### 34.1 Decoupled Server Component & Client Presentation Architecture
* **Server-Side Route Boundary (`app/unauthorized/page.tsx`)**:
  - Implemented as an async Server Component to declare route-level SEO metadata (`Access Denied | Polma Tambunan`) via `createMetadata` in `lib/shared/metadata.ts`.
  - Directly awaits Next.js 16 `searchParams` (`Promise<{ code?: string; target?: string; reason?: string }>`), preventing runtime hydration mismatches and client boundary de-optimizations.
  - Passes parsed query parameters (`code`, `targetPath`, `reason`) as clean props into the client interactive presentation component.
* **Client Presentation Layer (`features/auth/components/UnauthorizedView.tsx`)**:
  - Handles client-side routing, query string generation for login redirect flows (`?next=`), and user recovery interactions.

### 34.2 Zero-Redundancy Floating Card Standard (Anti-Duplication Mandate)
* **Single Canonical Elevated Card**:
  - Encapsulates the entire error interface within an elevated floating card (`bg-white rounded-3xl border border-slate-200/80 shadow-xs sm:shadow-md p-6 sm:p-8 max-w-md w-full`) centered over the signature textured canvas (`bg-slate-50/80 bg-dot-pattern`).
* **Status Code & Title Hygiene**:
  - Mirroring the Zero-Redundancy Route Not Found Standard (§29), the HTTP status code is declared **strictly ONCE** via a discrete top-right monospace telemetry pill (`HTTP 401` for unauthenticated or `HTTP 403` for forbidden/restricted).
  - Strictly bans triple duplication of status codes and error labels (never combine an `"Error 401: Unauthorized"` pill, brutalist `text-7xl/8xl` giant numbers, and an `"Unauthorized"` headline).
  - Contextual breadcrumbs sit at the top (`Home › Security › Access Denied`).
  - Domain visual anchor squircle uses Amber `ShieldAlert` (`w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100/80 text-amber-600 shadow-2xs`).
  - Confident, clean headline stated once as `Restricted Resource` with a concise explanation.

### 34.3 Security Incident Diagnostics Tray
* **Monospace Incident Telemetry**:
  - Renders a discrete diagnostics tray (`bg-slate-50 border border-slate-200/80 rounded-2xl p-4 font-mono text-xs text-slate-600 space-y-1.5`) exposing technical context without exposing private system secrets:
    - *Incident Code*: Canonical machine identifier (`ERR_AUTH_FORBIDDEN` or `ERR_AUTH_EXPIRED`).
    - *Target Resource*: Requested protected route path (`targetPath`, e.g., `/admin/reminders` or `/tasks`).
    - *Access Level*: Required privilege scope (`Administrator / Authenticated Session`).
    - *Timestamp*: ISO 8601 UTC timestamp of the denial event.

### 34.4 Unambiguous Recovery Trajectory & Destination Preservation
* **Destination Query Preservation (`?next=`)**:
  - The primary recovery action (`Sign In to Authenticate`) dynamically links to the login gateway while forwarding the requested target via query parameter (`/login?next=${encodeURIComponent(targetPath)}`).
  - Upon successful authentication, the user is seamlessly redirected back to their intended destination rather than being dumped at the home screen.
* **Single Fallback Navigation**:
  - Provides a clean, secondary return button (`Return to Safety` with `<ArrowLeft className="w-4 h-4" />`) routing back to the public homepage (`/`).
  - Strictly prohibits duplicate or redundant stacked buttons (`Go to Home` + `Go Back` + `Dismiss`).
* **Calibrated Bottom Clearance**:
  - Enforces `pb-28 sm:pb-36` bottom padding to guarantee comfortable clearance above `CompactBottomBar`.

---

## 35. Authentication Infrastructure & Interactive Session Ergonomics (`features/auth/`)

The authentication layer provides session management, administrative TOTP verification, and frictionless user identity transitions across the application.

### 35.1 Session Synchronization & Quiet Log Hygiene (`AuthProvider.tsx`)
* **Production Log Hygiene**:
  - Background session refresh synchronizers must strictly eliminate noisy `console.log` statements in both production and development environments.
  - Session verification logs (e.g. `"Token refresh triggered"`, `"Auth state checked"`) pollute developer tools and browser consoles during standard browsing.
* **Debounced Session Refresh Guard**:
  - Proactive session synchronizers (`/api/auth/refresh-session`) enforce a minimum 10-second debounce window (`lastSyncRef.current`) to prevent redundant network bursts during rapid route transitions or multi-tab re-renders.
* **Tab Focus & Visibility Synchronization**:
  - Listens to native browser `visibilitychange` and `window.focus` events to detect when a user returns to an inactive or hibernated tab.
  - Proactively triggers background token validation so returning users never encounter stale session failures.
* **Safe Unmount Teardown**:
  - All active `setTimeout` timers and event listeners must be safely cleared in `useEffect` cleanup handlers to prevent unmounted component state updates and memory leaks.

### 35.2 Contextual Target Preservation (`LoginButton.tsx`)
* **Dynamic Target Query Forwarding (`?next=` / `?redirectTo=`)**:
  - The login trigger reads the active browser location or incoming `searchParams` (`next` or `redirectTo`) and appends it to the login link: `/login?next=${encodeURIComponent(destination)}`.
  - Preserves deep-link destinations across the entire authentication lifecycle.
* **Avatar Loading Resilience & Privacy Hygiene**:
  - Profile avatar images rendered via Next.js `<Image />` or `<img>` MUST include `referrerPolicy="no-referrer"` to protect user privacy and prevent third-party OAuth providers (Google, GitHub) from blocking cross-origin image requests.
  - Implements an `onError` fallback state: if an external avatar URL fails to load or is blocked by privacy extensions, it gracefully switches to a stylized initial-letter monogram squircle (`w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center`) without displaying broken image placeholders.
* **Tactile Button Ergonomics**:
  - Interactive auth buttons feature `touch-manipulation`, active compression (`active:scale-95`), crisp domain icons (`LogIn`, `LogOut`, `User`), and high-contrast typography conforming to the application design system.