# Antislop Quality Standards (Workspace Rule)

This repository enforces **Antislop** (Anti Slop: Rules for AI Coding Agents) across all tasks. Antislop is an active filter stopping generic AI slop in generated UI, copy, accessibility, layout, and code comments, without prescribing aesthetics.

## Mandatory Skill Invocations

Before starting any design, copy, accessibility, mobile layout, or comment task, agents MUST load the matching antislop skill:
- **Core filter (always active)**: `antislop` (eliminate generic AI slop, tropes, ungrounded flourishes).
- **UI / visual**: `antislop-ui` (clean solid surfaces, domain-accurate icons, pure white dashboard containers, zero gradients, zero ambient blur orbs `blur-3xl`).
- **Copy & text**: `antislop-copywriting` (concise, grounded, technical prose; strictly ban em dashes `—` in copy/comments per Rule R-02; zero fake superlatives; zero marketing slogan pills).
- **People & accessibility**: `antislop-human` (WCAG AA/AAA contrast ratios $\ge 4.5:1$ for body text, visible keyboard focus rings, touch targets $\ge 44\times 44$px, and semantic WAI-ARIA states).
- **Mobile & responsive**: `antislop-layoutmobile` (mobile-first responsive grids, horizontal scroll mask containment, defensive overflow prevention `min-w-0`, `max-w-full`, and top-and-bottom flow in constrained spaces $< 600$px).
- **Code comments**: `antislop-code` (code comment hygiene: zero decorative box-drawing banners `// ───`, zero empty labels `// Render`, zero step narration `// Step 1:`, zero obvious JSX element restatements; preserve genuine architectural rationale, security boundaries, and non-obvious workarounds; never touch executable code).

## Usage Mode Announcement

Follow the antislop core usage mode resolution:
- Announce `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once at the start of work when resolved.
