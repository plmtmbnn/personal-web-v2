"use client";

import { useState } from "react";
import {
	CalendarDays,
	AlertTriangle,
	Compass,
	ShieldAlert,
} from "lucide-react";
import {
	getUpcomingEvents,
	getCriticalPreAlerts,
	getWeekdayDistance,
	type MarketTarget,
} from "../data/events";
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
	const criticalPreAlerts = getCriticalPreAlerts();

	const filters: Array<{ id: MarketTarget | "All"; label: string }> = [
		{ id: "All", label: "All events" },
		{ id: "ID", label: "Indonesia (IDX)" },
		{ id: "Crypto", label: "Crypto" },
		{ id: "US", label: "US & Fed" },
	];

	return (
		<div className="space-y-4">
			<div>
				<h2 className="text-xl font-bold text-slate-900 tracking-tight">
					Market calendar
				</h2>
				<p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
					High-impact macroeconomic dates, seasonal context and imminent
					catalysts.
				</p>
			</div>

			{/* Unified Calendar Card */}
			<div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-6">
				{/* Critical Catalyst Soft Pre-Alert Banner (H-3 Weekday Window) */}
				{criticalPreAlerts.length > 0 && (
					<div className="space-y-3.5 pb-5 border-b border-slate-100">
						<div className="flex min-w-0 items-start gap-2.5">
							<div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 flex items-center justify-center shrink-0">
								<ShieldAlert className="w-4 h-4" />
							</div>
							<div className="min-w-0">
								<div className="flex flex-wrap items-center gap-2">
									<h3 className="text-sm font-bold text-slate-900 tracking-tight">
										Events this week
									</h3>
									<span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/80">
										Next 3 business days
									</span>
								</div>
								<p className="text-xs text-slate-500 font-medium mt-0.5">
									High-impact catalysts approaching within 3 business days that
									historically drive major swings in IHSG and Crypto.
								</p>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
							{criticalPreAlerts.map((pa) => (
								<div
									key={pa.event.id}
									className={`p-4 rounded-2xl bg-white border space-y-2 transition-colors ${
										pa.urgency === "imminent"
											? "border-rose-200/90 border-l-4 border-l-rose-600"
											: "border-amber-200/90 border-l-4 border-l-amber-500"
									}`}
								>
									<div className="flex items-center justify-between gap-2">
										<span
											className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${
												pa.urgency === "imminent"
													? "bg-rose-50 text-rose-800 border-rose-200/80"
													: "bg-amber-50 text-amber-800 border-amber-200/80"
											}`}
										>
											{pa.badgeText}
										</span>
										<span className="text-xs font-bold text-slate-500 tabular-nums">
											{pa.event.date} / {pa.event.market}
										</span>
									</div>

									<div>
										<h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
											{pa.event.title}
										</h4>
										<p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
											{pa.marketImpact}
										</p>
									</div>

									<div className="pt-2 border-t border-slate-100 flex flex-col gap-1 min-[600px]:flex-row min-[600px]:items-center min-[600px]:justify-between text-xs">
										<span className="text-slate-500 font-bold">
											Position sizing:
										</span>
										<span className="font-bold text-slate-800">
											Size conservatively &amp; avoid excessive leverage
										</span>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Active Seasonality Strip */}
				{activeSeasons.length > 0 && (
					<div className="space-y-3 pb-5 border-b border-slate-100">
						<div className="flex items-center gap-2">
							<Compass className="w-4 h-4 text-emerald-700" />
							<h3 className="text-sm font-bold text-slate-900">
								Seasonal context
							</h3>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
							{activeSeasons.map((season) => (
								<div
									key={season.id}
									className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-1.5"
								>
									<div className="flex items-center justify-between gap-2">
										<h4 className="text-xs sm:text-sm font-bold text-slate-900">
											{season.title}
										</h4>
										<span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-lg">
											{season.status}
										</span>
									</div>
									<p className="text-xs text-slate-600 font-medium leading-relaxed">
										{season.description}
									</p>
									<div className="pt-2 border-t border-slate-200/60">
										<span className="text-xs font-bold text-emerald-800 block mb-0.5">
											Trading context
										</span>
										<p className="text-xs font-semibold text-slate-800 leading-snug">
											{season.tacticalPlay}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Macro Calendar Header & Filter Pills */}
				<div className="space-y-4">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
						<div className="flex items-center gap-2.5">
							<div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 flex items-center justify-center shrink-0">
								<CalendarDays className="w-4 h-4" />
							</div>
							<div>
								<h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
									Upcoming catalysts
								</h3>
								<p className="text-xs font-medium text-slate-500">
									Scheduled policy meetings and market milestones
								</p>
							</div>
						</div>

						{/* Filter Pills */}
						<fieldset
							aria-label="Filter catalysts by market"
							className="min-w-0 border-0 p-0 m-0 flex flex-wrap items-center gap-1.5"
						>
							{filters.map((f) => (
								<button
									type="button"
									key={f.id}
									onClick={() => setSelectedMarket(f.id)}
									aria-pressed={selectedMarket === f.id}
									className={`min-h-11 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer touch-manipulation ${
										selectedMarket === f.id
											? "bg-slate-900 text-white shadow-2xs"
											: "bg-slate-100 text-slate-700 hover:bg-slate-200/70"
									}`}
								>
									{f.label}
								</button>
							))}
						</fieldset>
					</div>

					{/* Events List */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
						{activeEvents.map((ev) => {
							const [y, m, d] = ev.date.split("-").map(Number);
							const dateObj = new Date(Date.UTC(y, m - 1, d));
							const monthStr = dateObj.toLocaleString("en-US", {
								month: "short",
								timeZone: "UTC",
							});
							const dayStr = d;
							const weekdayDist = getWeekdayDistance(ev.date);
							const isImminentCritical =
								ev.impact === "Critical" &&
								weekdayDist !== null &&
								weekdayDist <= 3;

							return (
								<div
									key={ev.id}
									className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border transition-colors ${
										isImminentCritical
											? "bg-white border-amber-200/90 border-l-4 border-l-amber-500"
											: "border-slate-200/70 bg-slate-50/50 hover:bg-slate-50"
									}`}
								>
									<div className="flex flex-col items-center justify-center bg-white border border-slate-200/80 rounded-xl w-12 h-12 sm:w-14 sm:h-14 shrink-0 shadow-2xs">
										<span className="text-xs font-bold text-slate-500">
											{monthStr}
										</span>
										<span className="text-base sm:text-lg font-bold text-slate-800 leading-none mt-0.5 tabular-nums">
											{dayStr}
										</span>
									</div>

									<div className="flex-1 min-w-0">
										<div className="flex flex-col min-[600px]:flex-row items-start justify-between gap-1.5 mb-1">
											<h4 className="min-w-0 text-xs sm:text-sm font-bold text-slate-900 break-words">
												{ev.title}
											</h4>
											{isImminentCritical ? (
												<span className="shrink-0 flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded-lg">
													<AlertTriangle className="w-3 h-3 text-amber-800" />
													{weekdayDist === 0
														? "H-0 (Today)"
														: `H-${weekdayDist}d Critical`}
												</span>
											) : ev.impact === "Critical" ? (
												<span className="shrink-0 flex items-center gap-1 text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200/80 px-2 py-0.5 rounded-lg">
													<AlertTriangle className="w-3 h-3 text-rose-700" />
													Critical
												</span>
											) : (
												<span className="shrink-0 text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/80 px-2 py-0.5 rounded-lg">
													{ev.impact}
												</span>
											)}
										</div>
										<p className="text-xs font-medium text-slate-500 leading-snug break-words">
											{ev.notes}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
