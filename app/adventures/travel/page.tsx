"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Compass, MapPin, Globe, CheckCircle2, Star } from "lucide-react";
import { destinations } from "@/features/travel/data";
import useDestinations from "@/features/travel/hooks/useDestinations";
import StatsCard from "@/features/travel/components/StatsCard";
import DestinationCard from "@/features/travel/components/DestinationCard";
import PostcardModal from "@/features/travel/components/PostcardModal";
import type { Destination } from "@/features/travel/types";

function TravelContent() {
	const reduceMotion = useReducedMotion();
	const searchParams = useSearchParams();
	const { visitedDestinations, wishlistDestinations } = useDestinations();
	const [selectedDestination, setSelectedDestination] =
		useState<Destination | null>(null);

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

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32">
				{/* ── Hero Section ─────────────────────────────────────── */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="mb-14 text-center max-w-3xl mx-auto space-y-4"
				>
					<div>
						<span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-xs">
							<Compass className="w-4 h-4 text-emerald-600 animate-spin-slow" />
							Adventure Log & World Explorer
						</span>
					</div>

					<h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
						Travel <span className="text-emerald-600">Tracker</span>
					</h1>

					<p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
						Curating a life of exploration. Mapping the journeys completed and
						the adventures yet to come. Every step is a story waiting to be
						told.
					</p>
				</motion.div>

				{/* ── Quick Stats Pills ──────────────────────────────────── */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="flex flex-wrap justify-center gap-3 mb-12"
				>
					<div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/80 rounded-full shadow-xs">
						<Globe className="w-4 h-4 text-emerald-600" />
						<span className="text-xs font-bold text-slate-900">
							{
								new Set(
									[...visitedDestinations, ...wishlistDestinations].map(
										(d) => d.country,
									),
								).size
							}{" "}
							Countries
						</span>
					</div>
					<div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/80 rounded-full shadow-xs">
						<CheckCircle2 className="w-4 h-4 text-emerald-600" />
						<span className="text-xs font-bold text-slate-900">
							{visitedDestinations.length} Visited
						</span>
					</div>
					<div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/80 rounded-full shadow-xs">
						<Star className="w-4 h-4 text-amber-500" />
						<span className="text-xs font-bold text-slate-900">
							{wishlistDestinations.length} On Wishlist
						</span>
					</div>
					{visitedDestinations.some((d) => d.type === "domestic") && (
						<div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-full">
							<MapPin className="w-4 h-4 text-emerald-600" />
							<span className="text-xs font-bold text-emerald-900">
								{
									visitedDestinations.filter((d) => d.type === "domestic")
										.length
								}{" "}
								Domestic
							</span>
						</div>
					)}
					{visitedDestinations.some((d) => d.type === "international") && (
						<div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-full">
							<Globe className="w-4 h-4 text-blue-600" />
							<span className="text-xs font-bold text-blue-900">
								{
									visitedDestinations.filter((d) => d.type === "international")
										.length
								}{" "}
								International
							</span>
						</div>
					)}
				</motion.div>

				{/* ── Stats Card ───────────────────────────────────────── */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.3 }}
					className="mb-16"
				>
					<StatsCard
						visited={visitedDestinations.length}
						total={destinations.length}
					/>
				</motion.div>

				{/* ── Completed Journeys Section ───────────────────────── */}
				<section className="mb-20">
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.4 }}
						className="flex items-center gap-4 mb-8"
					>
						<div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
							<CheckCircle2 className="w-5 h-5 text-emerald-600" />
						</div>
						<div>
							<h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
								Completed Journeys
							</h2>
							<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
								{visitedDestinations.length} places explored
							</p>
						</div>
						<div className="h-px flex-1 bg-slate-200/80" />
					</motion.div>

					{visitedDestinations.length === 0 ? (
						<div className="text-center py-16 bg-white border border-slate-200/80 rounded-3xl shadow-xs">
							<div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<Compass className="w-8 h-8 text-slate-400" />
							</div>
							<p className="text-sm font-bold text-slate-800 mb-2">
								No journeys completed yet
							</p>
							<p className="text-xs text-slate-500 font-medium">
								Start exploring and mark your adventures!
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
							{visitedDestinations.map((dest, i) => (
								<DestinationCard
									key={dest.id}
									destination={dest}
									index={i}
									variant="visited"
									onSelect={handleSelectDestination}
								/>
							))}
						</div>
					)}
				</section>

				{/* ── Future Adventures Section ────────────────────────── */}
				<section>
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.5 }}
						className="flex items-center gap-4 mb-8"
					>
						<div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
							<Star className="w-5 h-5 text-amber-600" />
						</div>
						<div>
							<h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
								Future Adventures
							</h2>
							<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
								{wishlistDestinations.length} destinations on your radar
							</p>
						</div>
						<div className="h-px flex-1 bg-slate-200/80" />
					</motion.div>

					{wishlistDestinations.length === 0 ? (
						<div className="text-center py-16 bg-white border border-slate-200/80 rounded-3xl shadow-xs">
							<div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<Globe className="w-8 h-8 text-slate-400" />
							</div>
							<p className="text-sm font-bold text-slate-800 mb-2">
								No future adventures planned
							</p>
							<p className="text-xs text-slate-500 font-medium">
								Add destinations to your wishlist and start planning!
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
							{wishlistDestinations.map((dest, i) => (
								<DestinationCard
									key={dest.id}
									destination={dest}
									index={i}
									variant="wishlist"
									onSelect={handleSelectDestination}
								/>
							))}
						</div>
					)}
				</section>
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
