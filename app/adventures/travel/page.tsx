"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Compass, Search, SearchX, X, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import { destinations } from "@/features/travel/data";
import DestinationCard from "@/features/travel/components/DestinationCard";
import type { Destination } from "@/features/travel/types";

const PostcardModal = dynamic(
	() => import("@/features/travel/components/PostcardModal"),
	{ ssr: false },
);

type FilterTab = "all" | "domestic" | "international";

function TravelContent() {
	const reduceMotion = useReducedMotion();
	const searchParams = useSearchParams();
	const [selectedDestination, setSelectedDestination] =
		useState<Destination | null>(null);
	const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const targetId =
			searchParams.get("postcard") || searchParams.get("destination");
		if (targetId) {
			const normalizedTarget = targetId.toLowerCase().replace(/[-_]/g, " ");
			const matched = destinations.find(
				(d) =>
					d.id.toLowerCase() === targetId.toLowerCase() ||
					d.name.toLowerCase() === normalizedTarget ||
					d.name.toLowerCase() === targetId.toLowerCase() ||
					d.country.toLowerCase() === normalizedTarget ||
					d.country.toLowerCase() === targetId.toLowerCase(),
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
			url.searchParams.delete("postcard");
			url.searchParams.delete("destination");
			window.history.replaceState(
				{},
				"",
				url.pathname + (url.search ? url.search : ""),
			);
		}
	};

	const totalDestinations = destinations.length;
	const totalCountries = new Set(destinations.map((d) => d.country)).size;
	const domesticCount = destinations.filter(
		(d) => d.type === "domestic",
	).length;
	const intlCount = destinations.filter(
		(d) => d.type === "international",
	).length;

	const filterTabs: { id: FilterTab; label: string; count: number }[] = [
		{ id: "all", label: "All", count: totalDestinations },
		{ id: "domestic", label: "Domestic", count: domesticCount },
		{ id: "international", label: "International", count: intlCount },
	];

	const hasActiveFilter = activeFilter !== "all" || searchQuery.trim() !== "";

	const filteredDestinations = useMemo(() => {
		const q = searchQuery.toLowerCase().trim();
		return destinations.filter((dest) => {
			const matchesSearch =
				!q ||
				dest.name.toLowerCase().includes(q) ||
				dest.location.toLowerCase().includes(q) ||
				dest.country.toLowerCase().includes(q) ||
				dest.description.toLowerCase().includes(q);

			const matchesTab = activeFilter === "all" || dest.type === activeFilter;

			return matchesSearch && matchesTab;
		});
	}, [searchQuery, activeFilter]);

	const handleResetFilters = () => {
		setActiveFilter("all");
		setSearchQuery("");
	};

	return (
		<main className="min-h-screen bg-slate-50/80 relative pb-32 sm:pb-36 overflow-x-hidden">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 relative z-10 space-y-4 sm:space-y-5">
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, ease: "easeOut" }}
					className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs"
				>
					<nav
						aria-label="Breadcrumb"
						className="flex items-center gap-1.5 mb-5 text-xs font-semibold text-slate-500"
					>
						<Link
							href="/"
							className="hover:text-slate-900 transition-colors !no-underline"
						>
							Home
						</Link>
						<ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
						<Link
							href="/adventures"
							className="hover:text-slate-900 transition-colors !no-underline"
						>
							Adventures
						</Link>
						<ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
						<span className="text-slate-900 font-bold">Travel</span>
					</nav>

					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
						<div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
							<div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 border border-indigo-200/70 text-indigo-600 shadow-2xs flex items-center justify-center shrink-0">
								<Compass className="w-6 h-6 sm:w-7 sm:h-7" />
							</div>
							<div className="min-w-0 flex-1">
								<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
									Travel Journeys
								</h1>
								<p className="text-sm text-slate-600 font-medium mt-1.5 max-w-xl leading-relaxed">
									Field dispatches from completed journeys across Indonesia and
									Southeast Asia. Select any destination to inspect and export
									its 3D airmail postcard.
								</p>
							</div>
						</div>

						<div className="grid grid-cols-4 sm:flex sm:items-center gap-3 sm:gap-5 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6">
							{[
								{
									value: totalDestinations,
									label: "Visited",
									color: "text-slate-900",
								},
								{
									value: totalCountries,
									label: "Countries",
									color: "text-indigo-600",
								},
								{
									value: domesticCount,
									label: "Domestic",
									color: "text-emerald-600",
								},
								{
									value: intlCount,
									label: "Intl",
									color: "text-slate-900",
								},
							].map((stat, i, arr) => (
								<div
									key={stat.label}
									className="flex items-center justify-center sm:justify-start gap-3 sm:gap-5"
								>
									<div className="text-center">
										<p
											className={`text-xl sm:text-2xl font-bold font-mono tabular-nums ${stat.color}`}
										>
											{stat.value}
										</p>
										<p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
											{stat.label}
										</p>
									</div>
									{i < arr.length - 1 && (
										<div className="hidden sm:block w-px h-8 bg-slate-100" />
									)}
								</div>
							))}
						</div>
					</div>
				</motion.div>

				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.06, ease: "easeOut" }}
					className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs space-y-3"
				>
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
						<div
							className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x"
							role="tablist"
							aria-label="Filter destinations by region"
						>
							{filterTabs.map((tab) => {
								const isActive = activeFilter === tab.id;
								return (
									<button
										key={tab.id}
										type="button"
										role="tab"
										aria-selected={isActive}
										onClick={() => setActiveFilter(tab.id)}
										className={`min-h-11 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
											isActive
												? "bg-slate-900 text-white shadow-xs"
												: "bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-100"
										}`}
									>
										<span>{tab.label}</span>
										<span
											className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
												isActive
													? "bg-white/20 text-white"
													: "bg-slate-200/80 text-slate-700"
											}`}
										>
											{tab.count}
										</span>
									</button>
								);
							})}
						</div>

						<div className="relative w-full sm:w-64">
							<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
							<input
								type="text"
								aria-label="Search visited destinations"
								placeholder="Search city or country..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full min-h-11 pl-10 pr-10 py-2 bg-slate-50/80 border border-slate-200/80 rounded-xl text-base sm:text-sm font-medium text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors"
							/>
							{searchQuery && (
								<button
									type="button"
									onClick={() => setSearchQuery("")}
									className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-9 min-h-9 flex items-center justify-center text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
									aria-label="Clear search"
								>
									<X className="w-4 h-4" />
								</button>
							)}
						</div>
					</div>

					{hasActiveFilter && (
						<div className="flex items-center justify-between text-xs text-slate-600 pt-2.5 border-t border-slate-100">
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
								{searchQuery.trim() && ` matching "${searchQuery.trim()}"`}
							</span>
							<button
								type="button"
								onClick={handleResetFilters}
								className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-md px-1.5 py-0.5"
							>
								<X className="w-3.5 h-3.5" />
								<span>Reset</span>
							</button>
						</div>
					)}
				</motion.div>

				<AnimatePresence mode="wait">
					{filteredDestinations.length === 0 ? (
						<motion.div
							key="empty"
							initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.96 }}
							className="max-w-md mx-auto text-center py-14 px-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs"
						>
							<div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
								<SearchX className="w-6 h-6" />
							</div>
							<h2 className="text-base font-extrabold text-slate-900 mb-1">
								No Matching Journeys
							</h2>
							<p className="text-xs text-slate-600 mb-6 leading-relaxed">
								No logged destinations match your current search or regional
								filter. Reset filters to view all {totalDestinations}{" "}
								dispatches.
							</p>
							{hasActiveFilter && (
								<button
									type="button"
									onClick={handleResetFilters}
									className="min-h-11 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
								>
									Reset Filters
								</button>
							)}
						</motion.div>
					) : (
						<motion.section
							key={`${activeFilter}-${searchQuery.trim()}`}
							initial={reduceMotion ? false : { opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.25 }}
							aria-label="Logged travel destinations"
							className="space-y-6"
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

							<p className="text-center text-xs text-slate-500 font-medium pt-2">
								All {totalDestinations} completed dispatches logged across{" "}
								{totalCountries} countries. Next coordinates stay offline until
								touchdown.
							</p>
						</motion.section>
					)}
				</AnimatePresence>
			</div>

			<PostcardModal
				destination={selectedDestination}
				onClose={handleCloseModal}
			/>
		</main>
	);
}

export function TravelSkeleton() {
	return (
		<main
			className="min-h-screen bg-slate-50/80 relative pb-32 sm:pb-36 overflow-x-hidden"
			role="status"
			aria-live="polite"
			aria-label="Loading travel destinations"
		>
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 relative z-10 space-y-4 sm:space-y-5">
				<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
					<div className="flex items-center gap-1.5 mb-5">
						<div className="h-3 w-12 bg-slate-200 rounded animate-pulse" />
						<div className="w-3.5 h-3.5 bg-slate-200 rounded animate-pulse" />
						<div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
						<div className="w-3.5 h-3.5 bg-slate-200 rounded animate-pulse" />
						<div className="h-3 w-12 bg-slate-200 rounded animate-pulse" />
					</div>

					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
						<div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
							<div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-200 animate-pulse shrink-0" />
							<div className="flex-1 min-w-0 space-y-2">
								<div className="h-8 sm:h-9 w-48 sm:w-60 bg-slate-200 rounded-xl animate-pulse" />
								<div className="h-4 w-full max-w-lg bg-slate-200 rounded animate-pulse" />
							</div>
						</div>

						<div className="grid grid-cols-4 sm:flex sm:items-center gap-3 sm:gap-5 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6">
							{[1, 2, 3, 4].map((stat) => (
								<div key={stat} className="flex flex-col items-center gap-1">
									<div className="h-6 w-8 bg-slate-200 rounded animate-pulse" />
									<div className="h-2.5 w-14 bg-slate-200 rounded animate-pulse" />
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-3">
						<div className="flex items-center gap-1.5 w-full sm:w-auto">
							{[1, 2, 3].map((tab) => (
								<div
									key={tab}
									className="h-11 w-24 rounded-xl bg-slate-100 border border-slate-200/60 animate-pulse shrink-0"
								/>
							))}
						</div>
						<div className="h-11 w-full sm:w-64 bg-slate-100 rounded-xl animate-pulse" />
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
					{[1, 2, 3, 4, 5, 6].map((card) => (
						<div
							key={card}
							className="bg-white border border-slate-200/80 rounded-[2rem] overflow-hidden shadow-xs flex flex-col justify-between h-[380px] animate-pulse"
						>
							<div className="p-2.5 pb-0">
								<div className="w-full aspect-4/3 bg-slate-200 rounded-[1.4rem] shrink-0" />
							</div>
							<div className="p-5 sm:p-6 pt-4 flex-1 flex flex-col justify-between">
								<div className="space-y-2">
									<div className="h-5 w-32 bg-slate-200 rounded" />
									<div className="h-3.5 w-24 bg-slate-200 rounded" />
									<div className="space-y-1 pt-1">
										<div className="h-3 w-full bg-slate-200 rounded" />
										<div className="h-3 w-4/5 bg-slate-200 rounded" />
									</div>
								</div>
								<div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
									<div className="h-3 w-20 bg-slate-200 rounded" />
									<div className="h-3 w-24 bg-slate-200 rounded" />
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}

export default function TravelPage() {
	return (
		<Suspense fallback={<TravelSkeleton />}>
			<TravelContent />
		</Suspense>
	);
}
