"use client";

import { useState } from "react";
import { CalendarDays, AlertTriangle, Compass } from "lucide-react";
import { getUpcomingEvents, type MarketTarget } from "../data/events";
import { getActiveSeasonality } from "../data/seasonality";

export default function EventCalendar() {
	const [selectedMarket, setSelectedMarket] = useState<MarketTarget | "All">(
		"All",
	);

	const activeEvents = getUpcomingEvents(
		6,
		selectedMarket === "All" ? undefined : selectedMarket,
	);
	const activeSeasons = getActiveSeasonality();

	const filters: Array<{ id: MarketTarget | "All"; label: string }> = [
		{ id: "All", label: "All Catalysts" },
		{ id: "ID", label: "Indonesia (IDX)" },
		{ id: "Crypto", label: "Crypto" },
		{ id: "US", label: "US & Fed" },
	];

	return (
		<div className="space-y-5 sm:space-y-6">
			{/* Active Seasonality Banner */}
			{activeSeasons.length > 0 && (
				<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-3">
					<div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
						<Compass className="w-4 h-4 text-emerald-600" />
						<h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800">
							Active Seasonal Market Tendencies
						</h3>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
						{activeSeasons.map((season) => (
							<div
								key={season.id}
								className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/80 space-y-1.5"
							>
								<div className="flex items-center justify-between gap-1">
									<h4 className="text-xs sm:text-sm font-black text-slate-900">
										{season.title}
									</h4>
									<span className="text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
										{season.status}
									</span>
								</div>
								<p className="text-xs text-slate-600 font-medium leading-relaxed">
									{season.description}
								</p>
								<div className="pt-2 border-t border-emerald-100/80">
									<span className="text-[10px] font-black uppercase text-emerald-700 block mb-0.5">
										Tactical Edge
									</span>
									<p className="text-[11px] font-semibold text-slate-800 leading-snug">
										{season.tacticalPlay}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Macro Calendar Card */}
			<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 space-y-5">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
							<CalendarDays className="w-5 h-5" />
						</div>
						<div>
							<h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
								Upcoming Catalysts &amp; Risk Events
							</h3>
							<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
								High-impact macroeconomic and market dates
							</p>
						</div>
					</div>

					{/* Filter Pills */}
					<div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
						{filters.map((f) => (
							<button
								type="button"
								key={f.id}
								onClick={() => setSelectedMarket(f.id)}
								className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 touch-manipulation ${
									selectedMarket === f.id
										? "bg-slate-900 text-white shadow-2xs"
										: "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
								}`}
							>
								{f.label}
							</button>
						))}
					</div>
				</div>

				{/* Events List */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
					{activeEvents.map((ev) => {
						const dateObj = new Date(ev.date);
						const monthStr = dateObj.toLocaleString("en-US", {
							month: "short",
						});
						const dayStr = dateObj.getDate();

						return (
							<div
								key={ev.id}
								className="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
							>
								<div className="flex flex-col items-center justify-center bg-white border border-slate-200/80 rounded-xl w-12 h-12 sm:w-14 sm:h-14 shrink-0 shadow-2xs">
									<span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
										{monthStr}
									</span>
									<span className="text-base sm:text-lg font-black text-slate-800 leading-none mt-0.5">
										{dayStr}
									</span>
								</div>

								<div className="flex-1 min-w-0">
									<div className="flex items-start justify-between gap-1.5 mb-1">
										<h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
											{ev.title}
										</h4>
										{ev.impact === "Critical" ? (
											<span className="shrink-0 flex items-center gap-1 text-[9px] font-black uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
												<AlertTriangle className="w-3 h-3 text-rose-600" />
												Critical
											</span>
										) : (
											<span className="shrink-0 text-[9px] font-extrabold uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
												{ev.impact}
											</span>
										)}
									</div>
									<p className="text-[11px] sm:text-xs font-medium text-slate-500 leading-snug break-words">
										{ev.notes}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
