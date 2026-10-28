<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AI Agent Instructions for Personal Web V2

This repository contains the personal web portfolio, adventures hub, investment compass, and productivity utilities for Polma Tambunan built with Next.js (App Router), React, TypeScript, Tailwind CSS, and Upstash Redis.

The comprehensive project context, architectural invariants, design systems, and agent mandates are defined in:
- **[`.agents/AGENTS.md`](file:///.agents/AGENTS.md)** (Full architectural context, tech stack, feature inventory, and mandates)
- **[`.agents/ui-ux-guideline.md`](file:///.agents/ui-ux-guideline.md)** (Strict UI/UX guidelines and Modern Floating Card standard)

All AI coding assistants (Antigravity, Claude Code, Cursor, Codex, Gemini) must follow the canonical mandates defined in those files.

---

## ⚡ Core Operational Mandates

1. **Strict UI/UX Guideline Compliance**:
   - Modern Floating Card dashboard aesthetic (`bg-white`, `border border-slate-200/80`, `rounded-2xl` / `rounded-3xl` / `rounded-[2rem]`, `shadow-xs` to `shadow-xl`).
   - Clean textured canvas (`bg-slate-50/80`, dot-free) with airy hero layout.
   - Strict Anti-Gradient, Anti-Emoji, Anti-Sparkles, Anti-AI-Slop, Clean Header, Card Action Hygiene, and Metric Anti-Redundancy standards. Zero `Sparkles` icon sitewide forever.
   - Admin Operations Console Standard (`/admin`): 2-group minimalist taxonomy (*Operations & Productivity* and *Market Systems*), clean header breadcrumbs, top-right live telemetry pills, zero redundant capability tags, single primary trigger hygiene, and synchronized structural `AdminSkeleton`.
2. **Mandatory CodeGraph First-Touch**:
   - In repositories indexed by CodeGraph (`.codegraph/`), reach for CodeGraph (`codegraph explore`, `codegraph node`, `codegraph callers`, `codegraph impact`) BEFORE grepping or modifying code.
3. **Mandatory Antislop Skill Suite**:
   - Strictly adhere to antislop filters: zero em dashes in copy or comments, zero decorative box-drawing banners (`// ───`), no obvious element narration.
4. **Mandatory Ponytail Lazy Senior Developer Standard**:
   - Shortest working diff wins. Inspect blast radius before editing: callers, tests, fixtures, config. End responses with 1 to 2 lines on what was skipped or not checked, and any risk.
5. **Turbopack Server Action Hygiene Standard**:
   - Non-action helper functions declared inside `"use server"` action files must be extracted into dedicated domain `utils.ts` modules to permanently prevent Next.js Turbopack compiler crashes.
6. **Strict Git Commit & Push Policy**:
   - NEVER stage, commit, or push changes unless explicitly requested by the user for each occurrence.
7. **Mandatory Test Verification**:
   - Always run and verify all tests before completing any task:
     ```powershell
     pnpm test
     ```
8. **Unified Market API Credentials Standard**:
   - Centralize upstream market provider Base URL and Bearer token in Redis (`admin:market:credentials`).
   - All admin market proxy endpoints (`/api/admin/*`) must resolve credentials via `resolveMarketCredentials` with Redis fallback when omitted in request bodies.
   - Client views must synchronize via `useMarketCredentials()` hook and `MarketCredentialsModal`.
9. **Swing Trade Hub & Market Microstructure Engine (`/admin/swing-trade`)**:
   - 6-tab segmented mode container: Swing Screener, Historical Trade, Market Detector, Trade Book 5M, Running Trade Chart, Broker Distribution.
   - 5-Layer Composite Scoring (0–100) integrated with the FastAPI backend (`POST /api/v1/analyze-swing`).
   - Executive Action Plan Banner with entry/invalidation/targets, Net RRR deducting 0.40% round-trip broker fees, and Deep Dive Workstation.


<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read `skills/antislop/SKILL.md` (core) and then the skill for the task:
- UI / visual: `skills/antislop-ui/SKILL.md`
- Copy & text: `skills/antislop-copywriting/SKILL.md`
- People: `skills/antislop-human/SKILL.md`
- Mobile / responsive: `skills/antislop-layoutmobile/SKILL.md`
- Code comments: `skills/antislop-code/SKILL.md`
<!-- antislop:end -->


