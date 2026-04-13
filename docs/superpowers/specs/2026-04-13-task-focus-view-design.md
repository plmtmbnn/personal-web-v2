# Task Focus View Design

**Goal:** Refactor the Task Dashboard to separate today's priorities from upcoming awareness, improving mental focus and organizational clarity.

## Architecture

### 1. Sectioned Orchestration
The dashboard will transition from a single list to a dual-zone interface managed by a single `DragDropContext`.

- **🔥 Focus (Today)**
  - Logic: `due_date == today && is_completed == false`.
  - Also includes: `is_completed == true && completed_at == today` (when "Show Completed" is active).
- **📅 Upcoming Awareness**
  - Logic: `due_date > today && due_date <= today + 7 && is_completed == false`.

### 2. Smart Data Layer
- **Server Action Updates**: `getTasks` will be updated to accept a `dateRange` parameter (`start` and `end`) to fetch both sections in one efficient query.
- **Inter-section Movement**: When a task is dragged from "Upcoming" to "Today", the system will trigger a `due_date` update to the current server timestamp alongside the positional reorder.

### 3. Dynamic Filtering System
- **Category Filter**: A dynamic pill-based selector populated by the unique set of `category` values found in the fetched task list.
- **Completion Toggle**: A persistence-aware toggle to reveal what was accomplished today.

## UI/UX Specifications

- **Layout**: Two distinct `glass-strong` or `solid white` containers (depending on project pattern) with clear header iconography.
- **Empty States**: If "Today" is empty, a motivating placeholder replaces the list to reduce clutter.
- **Responsiveness**: Stacks vertically on mobile, side-by-side or sequential on desktop.

## Risk Management
- **Order Integrity**: Positional updates (`order_index`) must be unique within their specific date-gated sections to prevent collision.
- **Timezone Safety**: All "Today" calculations will use the user's local ISO date string to ensure consistency.
