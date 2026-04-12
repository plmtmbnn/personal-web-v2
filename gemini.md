# Gemini CLI Project Context & Mandates

This document provides foundational context for the Gemini CLI agent to ensure architectural consistency, security, and efficiency.

## 🛠 Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (Auth, PostgreSQL)
- **Cache/Session:** Upstash Redis
- **Styling:** Tailwind CSS + Framer Motion
- **Icons:** Lucide-React + React-Icons/Fa
- **Linter/Formatter:** Biome
- **Workflow:** Semantic Release + Commitlint + Husky

## 🔑 Security & Authorization
- **Environment Variables:** Always use `ENV_GLOBAL` from `@/lib/core/env`.
- **Authorization:** 
  - Admin access is strictly gated by `profiles.is_admin = true`.
  - Sensitive data mutations (Server Actions) must perform server-side admin verification using `checkAdmin()`.
- **PIN Protection:** `PinGuard.tsx` is used for specific restricted sections (Investment, Tasks).

## 🎨 UI/UX Patterns
- **Solid Productivity Pattern**: For administrative and operational pages (Admin, Tasks, Investment), prioritize **functional clarity** over transparency. Use solid white containers, `slate-50` backgrounds, and defined borders (`slate-200`).
- **Glassmorphism**: Reserved for public-facing aesthetic pages (Home, Blog Index, Travel, Running) using `bg-white/5` and `backdrop-blur-xl`.
- **Interactive States**: Use `framer-motion` for staggered entrances, elastic hovers, and smooth layout transitions.

## 🗺 Navigation (`components/CompactBottomBar.tsx`)
- **Data-Driven:** Navigation is driven by the `NAV_ITEMS` constant. **Do not hardcode JSX links.**
- **Mobile Optimized**: Labels are hidden on mobile (`hidden sm:block`) to maintain a clean icon-only bar.
- **Access Grouping:**
  - **Public:** Home, Work (Portfolio/Experience), Adventures (Running/Travel), Blog, Contact.
  - **Auth-Only:** Investment.
  - **Admin-Only:** Admin Hub (Submenu: Dashboard, Manage Blog, Manage Tasks, Logout).

## 📝 Content Systems
### Blog System (CRUD)
- **Table:** `public.blogs` (id, title, slug, description, content, date, published).
- **Editor:** Optional catch-all route at `app/admin/blog/editor/[[...id]]/page.tsx` with high-fidelity Markdown preview.
- **Slugify**: Automatic URL-friendly slug generation from title if empty.

### Task System
- **Table:** `public.tasks` (id, title, priority, category, is_completed, due_date, position).
- **Interactions**: Double-click to edit in-line, auto-expanding textareas, and smart URL detection (clickable & shortened).

## 📏 Engineering Standards
- **Component Design:** Prefer clean abstractions. Use `use client` only when necessary for state or browser APIs.
- **Git Workflow**: 
  - Follow **Conventional Commits** (e.g., `feat:`, `fix:`, `chore:`, `refactor:`).
  - Commits are validated by `commitlint` via Husky.
  - Versioning and Changelogs are automated via `semantic-release`.
- **Package Manager**: Use `pnpm`.
