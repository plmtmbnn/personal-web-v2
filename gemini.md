# Gemini CLI Project Context & Mandates

This document provides foundational context for the Gemini CLI agent to ensure architectural consistency, security, and efficiency.

## 🛠 Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Database:** Supabase (Auth, PostgreSQL)
- **Cache/Session:** Upstash Redis
- **Styling:** Tailwind CSS + Framer Motion
- **Icons:** Lucide-React
- **Linter/Formatter:** Biome

## 🔑 Security & Authorization
- **Environment Variables:** Always use `ENV_GLOBAL` from `@/lib/env`.
- **Authorization:** 
  - Admin access is strictly gated by `profiles.is_admin = true`.
  - Sensitive data mutations (Server Actions) must perform server-side admin verification.
- **PIN Protection:** `PinGuard.tsx` is used for specific restricted sections.

## 🗺 Navigation (`components/CompactBottomBar.tsx`)
- **Data-Driven:** Navigation is driven by the `NAV_ITEMS` constant. **Do not hardcode JSX links.**
- **Submenus:** Must open **upwards** and use `AnimatePresence` for micro-interactions.
- **Access Grouping:**
  - **Public:** Home (`/`), Blog (`/blog`), Contact (`/contact`).
  - **Auth-Only:** Investment (`/investment`).
  - **Admin-Only:** Dashboard (`/admin`), Manage Blog (`/admin/blog`), Manage Tasks (`/tasks`).

## 📝 Blog System (CRUD)
- **Table:** `public.blogs` (id, title, slug, description, content, date, published).
- **Server Actions:** `lib/actions/blog.ts` handles all mutations with path revalidation.
- **Editor:** Optional catch-all route at `app/admin/blog/editor/[[...id]]/page.tsx`.
- **Slugify:** Automatic URL-friendly slug generation from title if empty.

## 📏 Engineering Standards
- **Component Design:** Prefer clean abstractions and reusable logic. Use `use client` sparingly.
- **State Management:** Use `react-hook-form` for complex forms.
- **Data Fetching:** Use Server Components for initial data fetching where possible.
- **Git:** Follow conventional commits (e.g., `feat:`, `fix:`, `chore:`).
