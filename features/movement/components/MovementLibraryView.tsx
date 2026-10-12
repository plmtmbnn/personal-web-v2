"use client";

import { useState, useMemo } from "react";
import { Search, ExternalLink, BookOpen, Check } from "lucide-react";
import type { Movement } from "../types";

interface MovementLibraryViewProps {
	movements: Movement[];
	onStartMovement: (movement: Movement) => void;
	onQuickLogMovement: (movement: Movement) => void;
}

export default function MovementLibraryView({
	movements,
	onStartMovement,
	onQuickLogMovement,
}: MovementLibraryViewProps) {
	const [activeCategory, setActiveCategory] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState<string>("");

	const categories: Array<{ id: string; label: string }> = [
		{ id: "all", label: "All Movements" },
		{ id: "lower-body", label: "Lower Body" },
		{ id: "upper-body", label: "Upper Body" },
		{ id: "core", label: "Core & Posterior" },
		{ id: "mobility", label: "Mobility" },
		{ id: "walking", label: "Walking" },
	];

	const filteredMovements = useMemo(() => {
		return movements.filter((m) => {
			const matchesCategory =
				activeCategory === "all" || m.category === activeCategory;
			const matchesSearch =
				m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				m.primaryMuscles.toLowerCase().includes(searchQuery.toLowerCase()) ||
				m.instructions.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesCategory && matchesSearch;
		});
	}, [movements, activeCategory, searchQuery]);

	return (
		<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
			{/* Library Header & Filters */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
				<div>
					<h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
						Movement Library
					</h2>
					<p className="text-xs text-slate-500 font-normal">
						Curated, desk-friendly exercises requiring minimal to no equipment.
					</p>
				</div>

				{/* Search Bar */}
				<div className="relative w-full md:w-64">
					<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search exercises or muscles..."
						className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
					/>
				</div>
			</div>

			{/* Category Filter Pills */}
			<div className="flex flex-wrap gap-2">
				{categories.map((c) => {
					const isActive = activeCategory === c.id;
					return (
						<button
							key={c.id}
							type="button"
							onClick={() => setActiveCategory(c.id)}
							className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
								isActive
									? "bg-slate-900 text-white shadow-2xs"
									: "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
							}`}
						>
							{c.label}
						</button>
					);
				})}
			</div>

			{/* Movement Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{filteredMovements.map((movement) => (
					<div
						key={movement.id}
						className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all shadow-2xs flex flex-col justify-between space-y-4"
					>
						<div className="space-y-3">
							{/* Card Title & Meta */}
							<div className="flex items-start justify-between gap-3">
								<div>
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
										{movement.category}
									</span>
									<h3 className="text-base font-bold text-slate-900">
										{movement.name}
									</h3>
								</div>

								{/* Duration Badge */}
								<span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 border border-slate-200/70 px-2 py-0.5 rounded-lg shrink-0">
									{movement.estimatedDuration}
								</span>
							</div>

							{/* Muscles & Target Info */}
							<div className="flex flex-wrap gap-1.5 text-xs">
								<span className="bg-emerald-50 text-emerald-700 border border-emerald-200/70 px-2 py-0.5 rounded-md font-semibold">
									{movement.targetReps
										? `${movement.targetReps} reps`
										: `${movement.targetSeconds || 60}s duration`}
								</span>
								<span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
									{movement.primaryMuscles}
								</span>
								{movement.tempo && (
									<span className="bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded-md">
										Tempo: {movement.tempo}
									</span>
								)}
							</div>

							{/* Instructions */}
							<p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
								{movement.instructions}
							</p>
						</div>

						{/* Footer Actions */}
						<div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
							<a
								href={movement.referenceUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs text-slate-500 hover:text-emerald-600 flex items-center gap-1 font-semibold transition-colors"
							>
								<span>Google Video Demo</span>
								<ExternalLink className="w-3.5 h-3.5" />
							</a>

							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={() => onStartMovement(movement)}
									className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
								>
									<BookOpen className="w-3.5 h-3.5" />
									<span>Guide</span>
								</button>

								<button
									type="button"
									onClick={() => onQuickLogMovement(movement)}
									className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs active:scale-95 cursor-pointer"
								>
									<Check className="w-3 h-3" />
									<span>Log</span>
								</button>
							</div>
						</div>
					</div>
				))}

				{filteredMovements.length === 0 && (
					<div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
						<p className="text-sm font-bold text-slate-700">
							No matching movements found
						</p>
						<p className="text-xs text-slate-500">
							Try adjusting your filter or search keywords.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
