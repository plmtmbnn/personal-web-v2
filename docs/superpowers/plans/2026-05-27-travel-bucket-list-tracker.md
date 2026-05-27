# Travel Bucket List Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the travel page into an interactive tracker with stats, categorization, and high-fidelity animations.

**Architecture:** Use a centralized mock data array with `useMemo` for filtering/sorting. Implement reusable `StatsCard` and `DestinationCard` components within the page for a clean, modular structure.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, Lucide React.

---

### Task 1: Define Types and Mock Data

**Files:**
- Modify: `app/adventures/travel/page.tsx`

- [ ] **Step 1: Define the `Destination` type and expanded mock data.**

```typescript
type Destination = {
  id: string;
  name: string;
  location: string;
  country: string;
  type: 'domestic' | 'international';
  isVisited: boolean;
  visitedDate?: string; // Format: "YYYY-MM"
  imageUrl: string;
  description: string;
};

const destinations: Destination[] = [
  {
    id: "1",
    name: "Lake Toba",
    location: "North Sumatra",
    country: "Indonesia",
    type: "domestic",
    isVisited: true,
    visitedDate: "2024-03",
    imageUrl: "https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?q=80&w=2072&auto=format&fit=crop",
    description: "The largest volcanic lake in the world, a serene escape with rich Batak culture."
  },
  {
    id: "2",
    name: "Wat Arun",
    location: "Bangkok",
    country: "Thailand",
    type: "international",
    isVisited: true,
    visitedDate: "2023-11",
    imageUrl: "https://images.unsplash.com/photo-1528181304800-2f1738b24a60?q=80&w=2070&auto=format&fit=crop",
    description: "The Temple of Dawn, an architectural masterpiece on the west bank of Chao Phraya."
  },
  {
    id: "3",
    name: "Kyoto Temples",
    location: "Kyoto",
    country: "Japan",
    type: "international",
    isVisited: false,
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop",
    description: "Dreaming of the peaceful Zen gardens and historic shrines during autumn."
  },
  {
    id: "4",
    name: "Labuan Bajo",
    location: "East Nusa Tenggara",
    country: "Indonesia",
    type: "domestic",
    isVisited: false,
    imageUrl: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?q=80&w=2070&auto=format&fit=crop",
    description: "Gate to Komodo National Park, featuring pink beaches and prehistoric lizards."
  }
];
```

- [ ] **Step 2: Commit.**

```bash
git add app/adventures/travel/page.tsx
git commit -m "docs(travel): define Destination type and mock data"
```

### Task 2: Implement StatsCard Component

**Files:**
- Modify: `app/adventures/travel/page.tsx`

- [ ] **Step 1: Create the `StatsCard` component.**

```tsx
const StatsCard = ({ visited, total }: { visited: number; total: number }) => {
  const percentage = Math.round((visited / total) * 100);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-3xl p-8 mb-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8"
    >
      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-slate-500 text-sm font-bold uppercase tracking-widest">Adventure Progress</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black text-slate-900">{visited}</span>
          <span className="text-slate-400 font-bold">/ {total} Places Explored</span>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 space-y-3">
        <div className="flex justify-between text-sm font-bold">
          <span className="text-slate-600">Completion</span>
          <span className="text-emerald-600">{percentage}%</span>
        </div>
        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-emerald-500 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
};
```

- [ ] **Step 2: Commit.**

```bash
git add app/adventures/travel/page.tsx
git commit -m "feat(travel): add StatsCard component"
```

### Task 3: Implement DestinationCard Component

**Files:**
- Modify: `app/adventures/travel/page.tsx`

- [ ] **Step 1: Create the `DestinationCard` component using `lucide-react` icons.**

```tsx
import { MapPin, Calendar, CheckCircle2, Compass } from "lucide-react";

const DestinationCard = ({ destination, index }: { destination: Destination; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="aspect-[16/10] relative overflow-hidden">
        <Image
          src={destination.imageUrl}
          alt={destination.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          {destination.isVisited ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-emerald-100 backdrop-blur-md">
              <CheckCircle2 size={12} />
              Visited
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-full border border-slate-200 backdrop-blur-md">
              <Compass size={12} />
              Wishlist
            </span>
          )}
        </div>
      </div>
      
      <div className="p-6 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-black text-slate-900">{destination.name}</h3>
            <div className="flex items-center gap-1 text-slate-500 text-xs font-bold mt-1">
              <MapPin size={12} />
              {destination.location}, {destination.country}
            </div>
          </div>
          {destination.isVisited && destination.visitedDate && (
            <div className="flex items-center gap-1 text-emerald-600/70 text-[10px] font-black uppercase">
              <Calendar size={12} />
              {new Date(destination.visitedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          )}
        </div>
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
          {destination.description}
        </p>
      </div>
    </motion.div>
  );
};
```

- [ ] **Step 2: Commit.**

```bash
git add app/adventures/travel/page.tsx
git commit -m "feat(travel): add DestinationCard component"
```

### Task 4: Refactor Page Main Component

**Files:**
- Modify: `app/adventures/travel/page.tsx`

- [ ] **Step 1: Implement the logic to split and sort data, then render sections.**

```tsx
export default function TravelPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const visitedDestinations = useMemo(() => 
    destinations
      .filter(d => d.isVisited)
      .sort((a, b) => (b.visitedDate || "").localeCompare(a.visitedDate || ""))
  , []);

  const wishlistDestinations = useMemo(() => 
    destinations.filter(d => !d.isVisited)
  , []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-slate-50 pb-32">
      <div className="max-w-6xl mx-auto px-6 pt-24 sm:pt-32">
        {/* Header Section */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 text-emerald-600 mb-2">
              <Compass className="w-6 h-6 animate-spin-slow" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Adventure Log</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-slate-900">
              Travel <span className="text-emerald-500">Tracker</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-lg font-medium leading-relaxed">
              Curating a life of exploration. Mapping the journeys completed and the adventures yet to come.
            </p>
          </motion.div>
        </div>

        <StatsCard visited={visitedDestinations.length} total={destinations.length} />

        {/* Sections */}
        <div className="space-y-24">
          <section>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-3xl font-black text-slate-900">Completed Journeys</h2>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {visitedDestinations.map((dest, i) => (
                <DestinationCard key={dest.id} destination={dest} index={i} />
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-3xl font-black text-slate-900">Future Adventures</h2>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {wishlistDestinations.map((dest, i) => (
                <DestinationCard key={dest.id} destination={dest} index={i} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit.**

```bash
git add app/adventures/travel/page.tsx
git commit -m "feat(travel): refactor page with categorized sections and stats"
```

### Task 5: Final Validation and Cleanup

**Files:**
- Modify: `app/adventures/travel/page.tsx`

- [ ] **Step 1: Ensure all imports are correct and unused code is removed.**
- [ ] **Step 2: Verify responsive grid layouts.**
- [ ] **Step 3: Commit.**

```bash
git add app/adventures/travel/page.tsx
git commit -m "style(travel): final cleanup and responsive tuning"
```
