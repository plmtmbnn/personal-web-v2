# UI/UX Engineering Guidelines

This document outlines the core UI/UX patterns, design principles, and interaction paradigms extracted from the `personal-web-v2` codebase (specifically analyzing `RunningPage`, `TravelPage`, `BlogPage`, `BlogView`, `WeeklyReview`, and `CompactBottomBar`).

## 1. Core Design Philosophy
The application blends two distinct visual languages:
*   **Glassmorphism for Public/Aesthetic Pages:** Utilizes translucent backgrounds, backdrop blurs, and ambient glow effects (e.g., `glass-strong`, `backdrop-blur-xl`, `bg-white/5`) to create a premium, immersive experience for public-facing content like the Blog and Adventures.
*   **Solid Productivity Pattern for Utilities:** Internal tools and dashboards (like `WeeklyReview`) rely on high-contrast, structured grid layouts with crisp borders (`bg-white border border-slate-200 shadow-sm`) to maximize readability and focus.

## 2. Mobile-First & Responsive Approach
A mobile-first mindset is strictly enforced across the codebase. Layouts gracefully scale up rather than gracefully degrading.

*   **Responsive Grids:** Complex layouts are stacked on mobile (`grid-cols-1`) and expand to multi-column grids on larger screens (`md:grid-cols-2`, `lg:grid-cols-5`, `lg:grid-cols-12`).
*   **Fluid Spacing & Typography:** Margins, padding, and font sizes scale based on breakpoints (e.g., `pt-24 sm:pt-32`, `text-4xl sm:text-5xl lg:text-6xl`, `px-3 sm:px-4`).
*   **Smart Real Estate Management:** Components intelligently hide non-critical information on small screens. For instance, `CompactBottomBar` hides text labels (`hidden sm:block`) on mobile, displaying only icons to conserve horizontal space.
*   **Dynamic Touch/Hover Adaptation:** The UI dynamically adapts to the user's input mechanism. Using `window.matchMedia("(hover: hover)")`, components (like navigation menus) determine whether to trigger actions on hover (desktop) or tap (mobile/touch), ensuring sub-menus remain accessible without frustrating touch-screen users.
*   **Touch Targets:** Interactive elements feature generous padding and active feedback (`active:scale-95`, `active:scale-[0.98]`) to provide tactile confirmation on mobile devices.

## 3. Motion, Animation, & Feedback
Animations are used purposefully to guide attention and provide feedback, never just for decoration.

*   **Framer Motion integration:** Complex page transitions, list re-ordering, and popovers utilize `framer-motion` for fluid state changes.
*   **Spring Physics:** Animations favor spring physics (`type: "spring", stiffness: 350, damping: 30`) over linear easing for a snappy, organic feel.
*   **Accessibility (Reduced Motion):** All animations respect user accessibility settings via the `useReducedMotion()` hook. If a user prefers reduced motion, animations instantly snap to their final state (`initial={reduceMotion ? false : { opacity: 0 }}`).
*   **Loading States (Skeletons):** The UI avoids jarring layout shifts (CLS) by deploying high-fidelity skeleton screens (e.g., `Skeleton` in `BlogView`, or custom skeleton blocks in `WeeklyReview`) before async data resolves.
*   **Micro-interactions:** Hover states are enriched with slight translations (`group-hover:-translate-y-1`), scale boosts (`hover:scale-105`), and color transitions to make the interface feel alive.

## 4. Typography & Micro-copy
Typography plays a massive role in the visual hierarchy.

*   **Bold Hero Text:** Headlines use extremely heavy font weights and tight tracking (`font-black tracking-tighter leading-none`) to create impactful headers.
*   **Micro-copy Badges:** Small metadata labels, tags, and table headers utilize tiny font sizes paired with wide letter-spacing (`text-[9px] font-black uppercase tracking-widest` or `tracking-[0.4em]`). This creates a technical, sophisticated, "dashboard-like" aesthetic.
*   **Contrast:** Body text leans on `slate-500` for readability, while primary metrics or titles use high-contrast `slate-900` or `white` (in dark modes).

## 5. Color System & Theming
The color palette relies on neutral slates with semantic, vibrant accents.

*   **Base:** `slate-50` (backgrounds), `slate-100/200` (borders), `slate-900/950` (primary text/dark panels).
*   **Semantic Accents:** 
    *   **Emerald/Teal:** Success, Finance, "A" Grades.
    *   **Blue/Indigo:** Technology, Active States, Nav Highlights.
    *   **Rose:** High Priority, Warnings, "D" Grades, Running.
    *   **Amber/Orange:** Medium Priority, Awards/Wins, "C" Grades.
    *   **Violet/Purple:** Focus, Activity, Specific Domains.
*   **Rich Gradients & Glows:** The UI leverages subtle background blurs and box-shadow glows (`shadow-[0_0_8px_rgba(...)]`, `bg-indigo-400/5 blur-md`) to draw attention to active or important elements (e.g., the active tab in `CompactBottomBar`).

## 6. Component Architecture Patterns
*   **Sticky & Fixed Utilities:** Tools like filters (`BlogView` sidebar) and navigation (`CompactBottomBar`) use `sticky` or `fixed` positioning to remain accessible regardless of scroll depth.
*   **Data Visualization:** Complex data is broken down into digestible, icon-paired metrics (e.g., `WeeklyReview` cards). Custom SVG elements (`RingProgress`) are used for highly specific, animated data representations.
*   **Contextual Empty States:** Empty states (e.g., "No journeys completed yet" in `TravelPage` or "No stories found" in `BlogView`) are designed with care, featuring subdued icons and encouraging copy rather than blank spaces.
