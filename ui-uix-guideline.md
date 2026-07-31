# UI/UX Engineering Guidelines

This document outlines the core UI/UX patterns, design principles, and architectural standards for the `personal-web-v2` codebase, standardized around a **Modern Floating Card** dashboard aesthetic.

---

## 1. Core Design Philosophy: Floating Cards & Subtle Neomorphism
The application utilizes a unified, modern dashboard aesthetic characterized by clean surfaces, distinct depth, and precise data visualization.

* **Floating Cards:** The core architectural unit is the "Floating Card." Components are encapsulated within panels featuring large border radii (e.g., `rounded-2xl` or `rounded-3xl`), subtle border rings (`border border-slate-200/80`), and soft drop shadows (`shadow-sm` up to `shadow-xl`) to create a distinct layering effect over the canvas.
* **Subtle Textures:** The global background utilizes an off-white or very light gray canvas (`bg-slate-50/80`) enhanced with a subtle dot-grid pattern (`bg-dot-pattern`), providing tactile depth without distracting from content.
* **Contrast Mastery:** Standard panels rely on pure white containers (`bg-white`), while high-priority metrics or visualizations may utilize dark slate panels (`bg-slate-900`) to create stark visual breaks and guide user attention.

---

## 2. CSS Hygiene & Preflight Standards
To prevent layout degradation, hardcoded specificity conflicts, and broken mobile variants:

* **No Aggressive Universal Resets:** Never define `* { margin: 0; padding: 0; }` in `globals.css`. Allow Tailwind CSS v4 Preflight to handle box resets naturally.
* **Scoped Document Typography (`.prose`):** Document typography spacing (`h1`-`h6`, `p`, `ul`, `ol`, `li` margins) MUST be scoped under `.prose` for markdown or editorial pages. Never force global bottom margins on raw `<p>` or `<h1-h6>` elements, as this corrupts UI components like cards, badges, and modals.
* **No Raw HTML Tag Overrides:** Never apply default padding or background colors to raw HTML elements (e.g., `button`, `input`). Utility classes (`.btn`, Tailwind classes) must be used explicitly.
* **Tailwind Utility First:** Component spacing must rely on Tailwind utility classes (`gap-4`, `p-4`, `mb-6`) rather than manual CSS rules in `globals.css`.

---

## 3. Mobile-First & Responsive Approach
A mobile-first mindset is strictly enforced across the codebase. Layouts gracefully scale up rather than gracefully degrading.

* **Responsive Grids:** Complex layouts start stacked on mobile (`grid-cols-1`) and expand to multi-column grid layouts on larger screens (`md:grid-cols-2`, `lg:grid-cols-3` or `lg:grid-cols-12`).
* **Desktop Entry Screen Standard:** Primary single-page entry points (e.g., `HomeView`, `ContactView`) utilize a compact 100vh entry screen layout on desktop (`lg:h-screen lg:max-h-[100dvh] lg:overflow-hidden lg:py-0 lg:pb-0`) to eliminate unnecessary vertical or horizontal scrollbars entirely.
* **Mobile-First Scrolling:** On handheld and tablet devices (`< lg`), views revert to fluid vertical scrolling (`min-h-screen overflow-y-auto py-20 pb-32 sm:py-24 sm:pb-36`) to accommodate the floating bottom navigation bar (`CompactBottomBar`).
* **Fluid Spacing & Typography:** Margins, padding, and font sizes scale smoothly based on breakpoints (e.g., `pt-24 sm:pt-32`, `text-3xl sm:text-5xl lg:text-6xl`, `px-3 sm:px-4`).
* **Touch Targets & Feedback:** Interactive elements feature generous touch target areas and active feedback (`active:scale-95`, `active:scale-[0.98]`) for tactile confirmation on mobile devices.

---

## 4. Floating Bottom Navigation (`CompactBottomBar`)
The primary application navigation utilizes a floating glassmorphic pill bar positioned at the bottom of the viewport:

* **Glassmorphic Surface:** Enclosed in `bg-white/90 backdrop-blur-2xl` with a subtle inner ring (`ring-1 ring-slate-900/5`) and soft ambient drop shadow (`shadow-[0_16px_48px_-12px_rgba(15,23,42,0.15)]`).
* **Active Tab Contrast:** Active tabs feature an animated dark slate spring pill background (`bg-slate-900`). Active text and icons MUST enforce explicit high contrast (`!text-white`) to prevent global `a` element styles from bleeding through.
* **Submenu Affordances:** Submenu popovers feature a `ChevronUp` indicator visible on both mobile and desktop to provide clear visual affordance for expandable navigation items.

---

## 5. Motion, Animation, & Feedback
Animations are used purposefully to guide attention and provide feedback.

* **Framer Motion Integration:** Page transitions, popovers, and animated tab pills utilize `framer-motion` for fluid state changes.
* **Spring Physics:** Animations favor spring physics (`type: "spring", stiffness: 380, damping: 30`) over linear easing for a snappy, organic feel.
* **Micro-interactions:** Hover states are enriched with slight translations (`hover:-translate-y-1.5`), scale boosts (`hover:scale-105`), and subtle shadow enhancements.
* **Accessibility (Reduced Motion):** All animations respect user accessibility settings via the `useReducedMotion()` hook.

---

## 6. Typography & Text Contrast
* **Metric Typography:** Primary values use large font sizes and extra-bold weights (`text-xl sm:text-3xl font-extrabold text-slate-900`) for immediate legibility.
* **High Contrast Hierarchy:** Primary labels use `text-slate-700 font-bold`, while secondary units and sublabels use `text-slate-500 font-semibold`.
* **Dark Mode & Dark Panels:** When using dark containers (`bg-slate-900`), text MUST be set to pure white or vibrant glowing accents (`text-indigo-400`, `text-emerald-400`, `text-cyan-400`) with sufficient contrast.

---

## 7. Color System & Semantic Accents
* **Base Palette:** Neutral slates for structure (`slate-50` to `slate-950`).
* **Semantic Accents:** 
  * **Indigo/Blue:** Engineering, systems architecture, primary actions.
  * **Emerald/Teal:** Active states, running/endurance logs, success metrics.
  * **Cyan:** Fintech systems, interactive data cards, chart indicators.
  * **Rose:** Alerts, notifications, pending task counters.
