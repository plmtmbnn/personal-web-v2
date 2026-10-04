"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
	Compass,
	Search,
	SearchX,
	X,
	ChevronRight,
	CheckCircle2,
} from "lucide-react";
import { destinations } from "@/features/travel/data";
import dynamic from "next/dynamic";
import useDestinations from "@/features/travel/hooks/useDestinations";
import DestinationCard from "@/features/travel/components/DestinationCard";

const PostcardModal = dynamic(
	() => import("@/features/travel/components/PostcardModal"),
	{ ssr: false },
);
import type { Destination } from "@/features/travel/types";

type FilterTab =
	| "all"
	| "completed"
	| "wishlist"
	| "domestic"
	| "international";

const FILTER_ACCENTS: Record<FilterTab, string> = {
	all: "bg-slate-900 text-white",
	completed: "bg-emerald-600 text-white",
	wishlist: "bg-amber-500 text-white",
	domestic: "bg-indigo-600 text-white",
	international: "bg-cyan-600 text-white",
};

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

	// Counts
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

	// Filter Tabs
	const filterTabs: { id: FilterTab; label: string; count: number }[] = [
		{ id: "all", label: "All", count: totalDestinations },
		{ id: "completed", label: "Visited", count: visitedDestinations.length },
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
				if (a.isVisited && !b.isVisited) return -1;
				if (!a.isVisited && b.isVisited) return 1;
				if (a.isVisited && b.isVisited) {
					return (b.visitedDate || "").localeCompare(a.visitedDate || "");
				}
				return 0;
			});
	}, [searchQuery, activeFilter]);

	const filteredVisited = useMemo(
		() => filteredDestinations.filter((d) => d.isVisited),
		[filteredDestinations],
	);

	const filteredWishlist = useMemo(
		() => filteredDestinations.filter((d) => !d.isVisited),
		[filteredDestinations],
	);

	const handleResetFilters = () => {
		setActiveFilter("all");
		setSearchQuery("");
	};

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative pb-32 sm:pb-36 overflow-x-hidden">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 relative z-10 space-y-4 sm:space-y-5">
				{/* ── Floating Card Header ─────────────────────────────────── */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, ease: "easeOut" }}
					className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs"
				>
					{/* Breadcrumb */}
					<nav className="flex items-center gap-1.5 mb-5 text-xs font-semibold text-slate-400">
						<Link
							href="/adventures"
							className="hover:text-slate-700 transition-colors !no-underline"
						>
							Adventures
						</Link>
						<ChevronRight className="w-3.5 h-3.5 shrink-0" />
						<span className="text-slate-700">Travel</span>
					</nav>

					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
						{/* Title block */}
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2.5 mb-3">
								<div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/70 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
									<Compass className="w-5 h-5" />
								</div>
								<div>
									<p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400 whitespace-nowrap">
										EXPEDITION LOG · GLOBAL TRAVEL &amp; POSTCARD STUDIO
									</p>
									<p className="text-[10px] font-medium text-slate-400 mt-0.5">
										Bucket list tracker
									</p>
								</div>
							</div>
							<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
								Travel Bucket List
							</h1>
							<p className="text-sm text-slate-500 font-medium mt-1.5 max-w-lg leading-relaxed">
								Curating a life of exploration — journeys completed, wishlist
								destinations, and vintage 3D airmail postcards.
							</p>
						</div>

						{/* Stat strip */}
						<div className="flex items-center gap-5 shrink-0 sm:pl-5 sm:border-l sm:border-slate-100">
							{[
								{
									value: totalCountries,
									label: "Countries",
									color: "text-slate-900",
								},
								{
									value: visitedDestinations.length,
									label: "Explored",
									color: "text-emerald-600",
								},
								{
									value: wishlistDestinations.length,
									label: "Wishlist",
									color: "text-amber-500",
								},
								{
									value: `${completionRate}%`,
									label: "Progress",
									color: "text-indigo-600",
								},
							].map((stat, i, arr) => (
								<div key={stat.label} className="flex items-center gap-5">
									<div className="text-center">
										<p
											className={`text-xl sm:text-2xl font-extrabold tabular-nums ${stat.color}`}
										>
											{stat.value}
										</p>
										<p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
											{stat.label}
										</p>
									</div>
									{i < arr.length - 1 && (
										<div className="w-px h-8 bg-slate-100" />
									)}
								</div>
							))}
						</div>
					</div>

					{/* Progress bar */}
					<div className="mt-5 pt-4 border-t border-slate-100">
						<div className="flex items-center justify-between mb-2">
							<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
								Bucket list progress
							</span>
							<span className="text-[10px] font-extrabold text-emerald-600">
								{visitedDestinations.length} / {totalDestinations} destinations
							</span>
						</div>
						<div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
							<motion.div
								className="h-full bg-emerald-500 rounded-full"
								initial={{ width: 0 }}
								animate={{ width: `${completionRate}%` }}
								transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
							/>
						</div>
					</div>
				</motion.div>

				{/* ── Filter & Search Toolbar ─────────────────────────────── */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.07, ease: "easeOut" }}
					className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5"
				>
					<div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
						{/* Filter pills */}
						<div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
							{filterTabs.map((tab) => {
								const isActive = activeFilter === tab.id;
								const activeClass = FILTER_ACCENTS[tab.id];
								return (
									<button
										key={tab.id}
										type="button"
										onClick={() => setActiveFilter(tab.id)}
										className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
											isActive
												? `${activeClass} shadow-xs`
												: "bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-100"
										}`}
									>
										<span>{tab.label}</span>
										<span
											className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
												isActive
													? "bg-black/15 text-white"
													: "bg-slate-200/70 text-slate-600"
											}`}
										>
											{tab.count}
										</span>
									</button>
								);
							})}
						</div>

						{/* Search */}
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

					{/* Active filter summary */}
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
								<span>Clear</span>
							</button>
						</div>
					)}
				</motion.div>

				{/* ── Destination Cards Content ─────────────────────────────── */}
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
								No destinations match your current search or filter. Try
								broadening your search.
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
					) : searchQuery ? (
						/* Search results: unified grid */
						<motion.div
							key="search-results"
							initial={reduceMotion ? false : { opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.25 }}
							className="space-y-4"
						>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
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
					) : (
						/* Structured editorial flow with Explored Journeys & On the Radar */
						<motion.div
							key={activeFilter}
							initial={reduceMotion ? false : { opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.25 }}
							className="space-y-8"
						>
							{/* Section 1: Explored Journeys (visited) */}
							{filteredVisited.length > 0 && activeFilter !== "wishlist" && (
								<section className="space-y-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-600 flex items-center justify-center shrink-0">
												<CheckCircle2 className="w-3.5 h-3.5" />
											</div>
											<h2 className="text-sm font-extrabold text-slate-900">
												Explored Journeys
											</h2>
											<span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-wider">
												{filteredVisited.length} completed
											</span>
										</div>
										<span className="text-xs text-slate-400 font-medium hidden sm:inline">
											Click card to generate 3D Postcard
										</span>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
										{filteredVisited.map((dest, i) => (
											<DestinationCard
												key={dest.id}
												destination={dest}
												index={i}
												onSelect={handleSelectDestination}
											/>
										))}
									</div>
								</section>
							)}

							{/* Section 2: On the Radar (Wishlist) */}
							{filteredWishlist.length > 0 && activeFilter !== "completed" && (
								<section className="space-y-4 pt-2">
									{/* Wishlist Header */}
									<div className="flex items-center justify-between pb-1 border-t border-slate-200/60 pt-6">
										<div className="flex items-center gap-2">
											<div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-600 flex items-center justify-center shrink-0">
												<Compass className="w-3.5 h-3.5" />
											</div>
											<h2 className="text-sm font-extrabold text-slate-900">
												On the Radar
											</h2>
											<span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full uppercase tracking-wider">
												{filteredWishlist.length} planned
											</span>
										</div>
										<span className="text-xs text-slate-400 font-medium hidden sm:inline">
											Future destinations &amp; bucket list expeditions
										</span>
									</div>

									{/* Wishlist Cards Grid */}
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
										{filteredWishlist.map((dest, i) => (
											<DestinationCard
												key={dest.id}
												destination={dest}
												index={i}
											/>
										))}
									</div>
								</section>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* ── Postcard & Sticker Modal ──────────────────────────────── */}
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
