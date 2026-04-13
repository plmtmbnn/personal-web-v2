# Mobile-First Task Dashboard Design

**Goal:** Transform the Task management experience into a high-performance, thumb-friendly execution hub while fixing critical date-comparison logic.

## Architecture

### 1. Unified Interaction System
- **TaskList Engine**:
  - **Sticky Headers**: Section headers (`Today`, `Upcoming`) will use `sticky top-0` positioning with a backdrop-blur effect.
  - **Gestural Actions**: Integrated `framer-motion` drag gestures for individual TaskItems.
    - **Swipe Left**: Reveals a high-contrast Red "Delete" zone.
    - **Swipe Right**: Reveals a Blue "Edit" zone.
- **TaskForm Drawer**:
  - A bottom-anchored sheet that slides up from the viewport base.
  - Controls the creation lifecycle with immediate validation.

### 2. Temporal Logic (The "Future Fix")
- **Normalization**: All task date comparisons will utilize the `date-fns` `startOfDay` utility.
- **Filtering Rule**: 
  - `isToday`: `isSameDay(parseISO(task.due_date), startOfDay(new Date()))`
  - `isUpcoming`: `isAfter(parseISO(task.due_date), startOfDay(new Date()))`
- This ensures that time-component discrepancies in ISO strings do not push tasks into the wrong visibility buckets.

## UI/UX Specifications

### TaskItem (Mobile)
- **Touch Targets**: Minimum `44px` height for all interactive elements (Checkbox, Kebab Menu).
- **Typography**: `text-sm` for details, but `text-base` for active inputs to prevent iOS viewport zooming.
- **Spacing**: Tighter vertical rhythm (`py-3`) to maximize information density.

### TaskForm (The Drawer)
- **Visuals**: Solid white container with `rounded-t-[3rem]`, triggered by a persistent FAB.
- **Date Chips**: Pre-configured buttons for `Today` (default), `Tomorrow`, and `Next Week`.
- **Input Design**: Bottom-aligned for easy reachability.

## Risk Management
- **Gesture Collisions**: Vertical scrolling must remain smooth while horizontal swiping is active. We will use `drag="x"` constraints with a dedicated resistance threshold.
- **Hydration Safety**: Date calculations will use a consistent server-client timezone offset or UTC-0 default to prevent flicker.
