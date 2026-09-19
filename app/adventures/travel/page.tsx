"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
	Compass,
	Map as MapIcon,
	CheckCircle2,
	Star,
	Search,
	SearchX,
	X,
	ArrowLeft,
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
			icon: MapIcon,
			badgeColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
		},
		{
			label: "Completed",
			value: `${visitedDestinations.length} Explored`,
			sublabel: `${completionRate}% of Bucket List`,
			icon: CheckCircle2,
			badgeColor: "text-indigo-600 bg-indigo-50 border-indigo-100",
		},
		{
			label: "Wishlist",
			value: `${wishlistDestinations.length} Planned`,
			sublabel: "On Future Radar",
			icon: Star,
			badgeColor: "text-amber-600 bg-amber-50 border-amber-100",
		},
		{
			label: "Postcards",
			value: "3D Flip Canvas",
			sublabel: "Vintage Polaroid PNG",
			icon: Compass,
			badgeColor: "text-cyan-600 bg-cyan-50 border-cyan-100",
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
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative pb-32 sm:pb-36 overflow-x-hidden">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 relative z-10 space-y-6 sm:space-y-8">
				{/* ── Modern Floating Card Header Standard ── */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, ease: "easeOut" }}
					className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs"
				>
					{/* Contextual Breadcrumb */}
					<div className="flex items-center gap-2 mb-3">
						<Link
							href="/adventures"
							className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors gap-1.5 !no-underline"
						>
							<ArrowLeft className="w-3.5 h-3.5" />
							<span>Adventures</span>
						</Link>
						<span className="text-slate-300">/</span>
						<span className="text-xs font-bold text-slate-700">Travel</span>
					</div>

					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
						<div>
							<div className="flex items-center gap-2 mb-2">
								<div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
									<Compass className="w-3.5 h-3.5 text-emerald-600" />
								</div>
								<span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
									EXPEDITION LOG · GLOBAL TRAVEL & POSTCARD STUDIO
								</span>
							</div>
							<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
								Travel Bucket List
							</h1>
							<p className="text-sm text-slate-500 font-medium mt-1 max-w-xl">
								Curating a life of exploration. Mapping journeys completed,
								wishlist destinations, and generating vintage 3D airmail
								postcards.
							</p>
						</div>

						{/* Telemetry Quick Strip */}
						<div className="flex items-center gap-4 sm:gap-5 shrink-0">
							<div className="text-center">
								<p className="text-xl font-extrabold text-slate-900 tabular-nums">
									{totalCountries}
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Countries
								</p>
							</div>
							<div className="w-px h-8 bg-slate-100" />
							<div className="text-center">
								<p className="text-xl font-extrabold text-emerald-600 tabular-nums">
									{visitedDestinations.length}
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Explored
								</p>
							</div>
							<div className="w-px h-8 bg-slate-100" />
							<div className="text-center">
								<p className="text-xl font-extrabold text-amber-600 tabular-nums">
									{wishlistDestinations.length}
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Wishlist
								</p>
							</div>
							<div className="w-px h-8 bg-slate-100" />
							<div className="text-center">
								<p className="text-xl font-extrabold text-indigo-600 tabular-nums">
									{completionRate}%
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Done
								</p>
							</div>
						</div>
					</div>
				</motion.div>

				{/* ── Telemetry Summary Strip (4-Col Grid) ── */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
					className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
				>
					{telemetryStats.map((stat) => (
						<div
							key={stat.label}
							className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5"
						>
							<div
								className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${stat.badgeColor}`}
							>
								<stat.icon className="w-5 h-5" />
							</div>
							<div className="min-w-0">
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">
									{stat.label}
								</p>
								<p className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
									{stat.value}
								</p>
								<p className="text-[11px] text-slate-500 font-medium truncate">
									{stat.sublabel}
								</p>
							</div>
						</div>
					))}
				</motion.div>

				{/* ── Filter & Search Toolbar ── */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.12, ease: "easeOut" }}
					className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5"
				>
					<div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
						{/* Category / Status Pills */}
						<div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
							{filterTabs.map((tab) => {
								const isActive = activeFilter === tab.id;
								return (
									<button
										key={tab.id}
										type="button"
										onClick={() => setActiveFilter(tab.id)}
										className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
											isActive
												? "bg-slate-900 text-white shadow-xs"
												: "bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-100"
										}`}
									>
										<span>{tab.label}</span>
										<span
											className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
												isActive
													? "bg-slate-800 text-slate-200"
													: "bg-slate-200/70 text-slate-600"
											}`}
										>
											{tab.count}
										</span>
									</button>
								);
							})}
						</div>

						{/* Search Input with explicit icon layering */}
						<div className="relative w-full sm:w-64">
							<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
							<input
								type="text"
								placeholder="Search destinations..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-10 pr-9 py-2 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
							/>
							{searchQuery && (
								<button
									type="button"
									onClick={() => setSearchQuery("")}
									className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer"
									aria-label="Clear search"
								>
									<X className="w-3.5 h-3.5" />
								</button>
							)}
						</div>
					</div>

					{/* Active Filter Summary */}
					{hasActiveFilter && (
						<div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
							<span>
								Showing{" "}
								<strong className="text-slate-900 font-bold">
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
								className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
							>
								<X className="w-3.5 h-3.5" />
								<span>Clear filters</span>
							</button>
						</div>
					)}
				</motion.div>

				{/* ── Destination Cards Grid (3-Column) ── */}
				<AnimatePresence mode="wait">
					{filteredDestinations.length === 0 ? (
						<motion.div
							key="empty"
							initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.96 }}
							className="max-w-md mx-auto text-center py-16 px-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs"
						>
							<div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
								<SearchX className="w-6 h-6" />
							</div>
							<h3 className="text-base font-extrabold text-slate-900 mb-1">
								No Destinations Found
							</h3>
							<p className="text-xs text-slate-500 mb-6 leading-relaxed">
								We couldn't find any destinations matching your search query or
								selected category filter.
							</p>
							{hasActiveFilter && (
								<button
									type="button"
									onClick={handleResetFilters}
									className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
								>
									Reset Filters
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
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
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
