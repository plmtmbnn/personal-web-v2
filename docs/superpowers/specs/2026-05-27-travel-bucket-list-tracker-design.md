# Design Spec: Interactive Travel Bucket List Tracker

**Date:** 2026-05-27
**Status:** Draft
**Topic:** Enhance travel page into an interactive tracker with stats and categorized journeys.

## 1. Overview
Transform the existing static `app/adventures/travel/page.tsx` into a dynamic "Bucket List" tracker. The page will display visited destinations vs. wishlist spots, providing a visual summary of travel progress using a light-themed, high-fidelity design.

## 2. Goals & Success Criteria
- **Categorization:** Clearly separate "Completed Journeys" and "Future Adventures".
- **Progress Tracking:** Provide a header summary of total visits vs. total goals.
- **Performance:** Maintain fast load times with optimized images and efficient sorting.
- **Aesthetics:** Align with the project's "Solid Productivity" pattern (light theme, slate-50 background).

## 3. Architecture & Data
### 3.1 Data Schema
```typescript
type Destination = {
  id: string;
  name: string;
  location: string;
  country: string;
  type: 'domestic' | 'international';
  isVisited: boolean;
  visitedDate?: string; // ISO 8601 or YYYY-MM
  imageUrl: string;
  description: string;
};
```

### 3.2 Logic
- **Filtering:** Use `useMemo` to split the `destinations` array into `visited` and `wishlist`.
- **Sorting:**
  - `visited`: Sorted by `visitedDate` (descending).
  - `wishlist`: Sorted by insertion order (fixed).

## 4. UI/UX Design
### 4.1 Layout
- **Container:** `bg-slate-50` with a max-width center-aligned grid.
- **Stats Card:**
  - Background: `bg-white` with `border-slate-200`.
  - Metrics: "Explored" vs. "Wishlist".
  - Progress Bar: Framer Motion animated emerald green bar.
- **Grids:**
  - Visited section comes first.
  - Wishlist section follows.

### 4.2 Card Design
- **Common:** Rounded corners (`rounded-2xl`), subtle shadows, hover lift effect.
- **Visited Badge:** Emerald green text/bg (`bg-emerald-50 text-emerald-700`).
- **Wishlist Badge:** Slate/Blue text/bg (`bg-slate-100 text-slate-600`).
- **Metadata:** Show month/year for visited spots.

## 5. Animation & Interactions
- **Page Load:** Staggered entrance animation for all cards using `framer-motion`.
- **Hover:** `whileHover={{ y: -5, transition: { duration: 0.2 } }}`.
- **Icons:** `MapPin`, `Calendar`, `CheckCircle2`, `Compass` from `lucide-react`.

## 6. Implementation Plan (High Level)
1. Define Mock Data with real destinations (Lake Toba, Bangkok, Kyoto, etc.).
2. Build `StatsCard` component.
3. Build `DestinationCard` component with variants for visited/wishlist.
4. Refactor `app/adventures/travel/page.tsx` to use these components and logic.
