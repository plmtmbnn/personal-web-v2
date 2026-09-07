"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
	Compass,
	Globe,
	CheckCircle2,
	Star,
	Search,
	X,
	Sparkles,
} from "lucide-react";
import { destinations } from "@/features/travel/data";
import useDestinations from "@/features/travel/hooks/useDestinations";
import DestinationCard from "@/features/travel/components/DestinationCard";
import PostcardModal from "@/features/travel/components/PostcardModal";
import type { Destination } from "@/features/travel/types";

type FilterTab =
	| "all"
	| "completed"
	| "wishlist"
	| "domestic"
	| "international";

function TravelContent() {
	const reduceMotion = useReducedMotion();
	const searchParams = useSearchParams();
	const { visitedDestinations, wishlistDestinations } = useDestinations();
	const [selectedDestination, setSelectedDestination] =
		useState<Destination | null>(null);
	const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
	const [searchQuery, setSearchQuery] = useState("");

	// Automatically open postcard modal when ?postcard=<id> or ?destination=<id> is present
	useEffect(() => {
		const postcardId =
			searchParams.get("postcard") || searchParams.get("destination");
		if (postcardId) {
			const matched = destinations.find(
				(d) =>
					d.id.toLowerCase() === postcardId.toLowerCase() ||
					d.name.toLowerCase() === postcardId.toLowerCase(),
			);
			if (matched) {
				setSelectedDestination(matched);
			}
		}
	}, [searchParams]);

	const handleSelectDestination = (dest: Destination) => {
		setSelectedDestination(dest);
		if (typeof window !== "undefined") {
			const url = new URL(window.location.href);
			url.searchParams.set("postcard", dest.id);
			window.history.replaceState({}, "", url.pathname + url.search);
		}
	};

	const handleCloseModal = () => {
		setSelectedDestination(null);
		if (typeof window !== "undefined") {
			const url = new URL(window.location.href);
			if (
				url.searchParams.has("postcard") ||
				url.searchParams.has("destination")
			) {
				url.searchParams.delete("postcard");
				url.searchParams.delete("destination");
				window.history.replaceState(
					{},
					"",
					url.pathname + (url.search ? url.search : ""),
				);
			}
		}
	};

	// Counts calculation
	const totalDestinations = destinations.length;
	const totalCountries = new Set(destinations.map((d) => d.country)).size;
	const domesticCount = destinations.filter(
		(d) => d.type === "domestic",
	).length;
	const intlCount = destinations.filter(
		(d) => d.type === "international",
	).length;
	const completionRate = Math.round(
		(visitedDestinations.length / totalDestinations) * 100,
	);

	// 4 Telemetry Stats
	const telemetryStats = [
		{
			label: "Countries",
			value: `${totalCountries} Countries`,
			sublabel: "Domestic & Global",
			icon: Globe,
			color: "text-emerald-600 bg-emerald-50 border-emerald-100",
		},
		{
			label: "Completed",
			value: `${visitedDestinations.length} Explored`,
			sublabel: `${completionRate}% of Bucket List`,
			icon: CheckCircle2,
			color: "text-indigo-600 bg-indigo-50 border-indigo-100",
		},
		{
			label: "Wishlist",
			value: `${wishlistDestinations.length} Planned`,
			sublabel: "On Future Radar",
			icon: Star,
			color: "text-amber-600 bg-amber-50 border-amber-100",
		},
		{
			label: "Postcards",
			value: "3D Flip Canvas",
			sublabel: "Vintage Polaroid PNG",
			icon: Compass,
			color: "text-cyan-600 bg-cyan-50 border-cyan-100",
		},
	];

	// Filter Tabs configuration
	const filterTabs: { id: FilterTab; label: string; count: number }[] = [
		{ id: "all", label: "All", count: totalDestinations },
		{ id: "completed", label: "Completed", count: visitedDestinations.length },
		{ id: "wishlist", label: "Wishlist", count: wishlistDestinations.length },
		{ id: "domestic", label: "Domestic", count: domesticCount },
		{ id: "international", label: "International", count: intlCount },
	];

	const hasActiveFilter = activeFilter !== "all" || searchQuery !== "";

	// Filtered destinations
	const filteredDestinations = useMemo(() => {
		const q = searchQuery.toLowerCase().trim();
		return destinations
			.filter((dest) => {
				const matchesSearch =
					!q ||
					dest.name.toLowerCase().includes(q) ||
					dest.location.toLowerCase().includes(q) ||
					dest.country.toLowerCase().includes(q);

				let matchesTab = true;
				if (activeFilter === "completed") matchesTab = dest.isVisited;
				else if (activeFilter === "wishlist") matchesTab = !dest.isVisited;
				else if (activeFilter === "domestic")
					matchesTab = dest.type === "domestic";
				else if (activeFilter === "international")
					matchesTab = dest.type === "international";

				return matchesSearch && matchesTab;
			})
			.sort((a, b) => {
				// Completed items first (by visitedDate desc), then wishlist
				if (a.isVisited && !b.isVisited) return -1;
				if (!a.isVisited && b.isVisited) return 1;
				if (a.isVisited && b.isVisited) {
					return (b.visitedDate || "").localeCompare(a.visitedDate || "");
				}
				return 0;
			});
	}, [searchQuery, activeFilter]);

	const handleResetFilters = () => {
		setActiveFilter("all");
		setSearchQuery("");
	};

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pt-24 sm:pt-32 pb-36 sm:pb-44 px-4 sm:px-6 lg:px-8">
			<div className="max-w-5xl mx-auto space-y-10 sm:space-y-14">
				{/* ═══════════════════════════════════════
				    HERO HEADER: Centered, Minimalist, Classy
				═══════════════════════════════════════ */}
				<motion.header
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="text-center max-w-3xl mx-auto space-y-4 pt-2 sm:pt-4"
				>
					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
						Travel
						<br />
						<span>bucket list & tracker</span>
					</h1>

					<p className="text-slate-500 text-sm sm:text-base font-normal max-w-xl mx-auto leading-relaxed">
						Curating a life of exploration. Mapping the journeys completed and
						the adventures yet to come across domestic and global expeditions.
					</p>
				</motion.header>

				{/* ═══════════════════════════════════════
				    TELEMETRY STATS ROW: 4 Core Milestones
				═══════════════════════════════════════ */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4"
				>
					{telemetryStats.map((stat) => (
						<div
							key={stat.label}
							className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3"
						>
							<div
								className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${stat.color}`}
							>
								<stat.icon className="w-4 h-4" />
							</div>
							<div className="min-w-0">
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
									{stat.label}
								</p>
								<p className="text-sm sm:text-base font-bold text-slate-900 truncate">
									{stat.value}
								</p>
								<p className="text-[10px] text-slate-500 font-normal truncate">
									{stat.sublabel}
								</p>
							</div>
						</div>
					))}
				</motion.div>

				{/* ═══════════════════════════════════════
				    CONTROLS TOOLBAR: Filter Tabs & Search
				═══════════════════════════════════════ */}
				<div className="space-y-4">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
						{/* Category / Status Pills */}
						<div className="flex items-center gap-1.5 overflow-x-auto max-w-full no-scrollbar py-1">
							{filterTabs.map((tab) => {
								const isActive = activeFilter === tab.id;
								return (
									<button
										key={tab.id}
										type="button"
										onClick={() => setActiveFilter(tab.id)}
										className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer active:scale-95 ${
											isActive
												? "bg-slate-900 text-white shadow-xs"
												: "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80"
										}`}
									>
										<span>{tab.label}</span>
										<span
											className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
												isActive
													? "bg-slate-800 text-slate-200"
													: "bg-slate-100 text-slate-500"
											}`}
										>
											{tab.count}
										</span>
									</button>
								);
							})}
						</div>

						{/* Search Input */}
						<div className="relative w-full sm:w-60 group">
							<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none z-10" />
							<input
								type="text"
								placeholder="Search destinations..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-200/80 focus:border-emerald-500 rounded-full text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-xs"
							/>
							{searchQuery && (
								<button
									type="button"
									onClick={() => setSearchQuery("")}
									className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full bg-slate-200/60 hover:bg-slate-200 transition-colors text-slate-600 cursor-pointer z-10"
									aria-label="Clear search"
								>
									<X className="w-2.5 h-2.5" />
								</button>
							)}
						</div>
					</div>

					{/* Active Filter Summary */}
					{hasActiveFilter && (
						<div className="flex items-center justify-between text-xs text-slate-500 pt-1">
							<span>
								Showing{" "}
								<strong className="text-slate-900">
									{filteredDestinations.length}
								</strong>{" "}
								{filteredDestinations.length === 1
									? "destination"
									: "destinations"}
								{activeFilter !== "all" &&
									` in ${filterTabs.find((t) => t.id === activeFilter)?.label}`}
								{searchQuery && ` matching "${searchQuery}"`}
							</span>
							<button
								type="button"
								onClick={handleResetFilters}
								className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
							>
								<X className="w-3.5 h-3.5" />
								<span>Clear all</span>
							</button>
						</div>
					)}
				</div>

				{/* ═══════════════════════════════════════
				    DESTINATION CARDS GRID (3-Column)
				═══════════════════════════════════════ */}
				<AnimatePresence mode="wait">
					{filteredDestinations.length === 0 ? (
						<motion.div
							key="empty"
							initial={reduceMotion ? false : { opacity: 0, y: 15 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -15 }}
							className="flex flex-col items-center justify-center text-center py-20 bg-white border border-slate-200/80 rounded-[2rem] p-8 shadow-xs max-w-lg mx-auto"
						>
							<div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-700">
								<Sparkles className="w-5 h-5" />
							</div>
							<h3 className="text-lg font-bold text-slate-900 tracking-tight mb-1">
								No Destinations Found
							</h3>
							<p className="text-slate-500 text-xs font-normal max-w-xs leading-relaxed">
								We couldn't find any destinations matching your search query or
								selected category filter.
							</p>
							{hasActiveFilter && (
								<button
									type="button"
									onClick={handleResetFilters}
									className="mt-6 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
								>
									Clear Filters
								</button>
							)}
						</motion.div>
					) : (
						<motion.div
							key={`${activeFilter}-${searchQuery}`}
							initial={reduceMotion ? false : { opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.25 }}
						>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
								{filteredDestinations.map((dest, i) => (
									<DestinationCard
										key={dest.id}
										destination={dest}
										index={i}
										onSelect={handleSelectDestination}
									/>
								))}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* ── Postcard & Sticker Modal ──────────────────────────── */}
			<PostcardModal
				destination={selectedDestination}
				onClose={handleCloseModal}
			/>
		</main>
	);
}

export default function TravelPage() {
	return (
		<Suspense fallback={null}>
			<TravelContent />
		</Suspense>
	);
}
