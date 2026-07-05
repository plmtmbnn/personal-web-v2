"use client";

import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import { destinations } from "@/features/travel/data";
import useDestinations from "@/features/travel/hooks/useDestinations";
import StatsCard from "@/features/travel/components/StatsCard";
import DestinationCard from "@/features/travel/components/DestinationCard";

export default function TravelPage() {
	const { visitedDestinations, wishlistDestinations } = useDestinations();

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
							<span className="text-[10px] font-black uppercase tracking-[0.4em]">
								Adventure Log
							</span>
						</div>
						<h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-slate-900">
							Travel <span className="text-emerald-500">Tracker</span>
						</h1>
						<p className="text-slate-500 text-lg max-w-lg font-medium leading-relaxed">
							Curating a life of exploration. Mapping the journeys completed and
							the adventures yet to come.
						</p>
					</motion.div>
				</div>

				<StatsCard
					visited={visitedDestinations.length}
					total={destinations.length}
				/>

				{/* Sections */}
				<div className="space-y-24">
					<section>
						<div className="flex items-center gap-4 mb-8">
							<h2 className="text-3xl font-black text-slate-900">
								Completed Journeys
							</h2>
							<div className="h-px flex-1 bg-slate-200" />
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							{visitedDestinations.length === 0 ? (
								<p className="text-slate-500 text-center col-span-3">
									No journeys completed yet. Start exploring!
								</p>
							) : (
								visitedDestinations.map((dest, i) => (
									<DestinationCard key={dest.id} destination={dest} index={i} />
								))
							)}
						</div>
					</section>

					<section>
						<div className="flex items-center gap-4 mb-8">
							<h2 className="text-3xl font-black text-slate-900">
								Future Adventures
							</h2>
							<div className="h-px flex-1 bg-slate-200" />
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							{wishlistDestinations.length === 0 ? (
								<p className="text-slate-500 text-center col-span-3">
									No future adventures yet. Add some to your wishlist!
								</p>
							) : (
								wishlistDestinations.map((dest, i) => (
									<DestinationCard key={dest.id} destination={dest} index={i} />
								))
							)}
						</div>
					</section>
				</div>
			</div>
		</main>
	);
}
