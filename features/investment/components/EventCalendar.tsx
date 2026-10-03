"use client";

import { CalendarDays, AlertTriangle } from "lucide-react";

export default function EventCalendar() {
	// Static dates for Q4 2026 as placeholder
	// In the future this can be driven by a remote config or external API
	const events = [
		{
			date: "Oct 28, 2026",
			event: "Bank of Japan Interest Rate Decision",
			impact: "High",
			notes: "Potential for further normalization, impacting carry trade.",
		},
		{
			date: "Nov 4, 2026",
			event: "FOMC Rate Decision",
			impact: "Critical",
			notes: "Watch for dot plot updates regarding terminal rate.",
		},
		{
			date: "Nov 12, 2026",
			event: "US CPI Print",
			impact: "High",
			notes: "Core inflation gauge.",
		},
		{
			date: "Nov 19, 2026",
			event: "Bank Indonesia RDG",
			impact: "Medium",
			notes: "BI Rate decision impacting IHSG and IDR.",
		},
	];

	return (
		<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 space-y-6">
			<div className="flex items-center gap-3 border-b border-slate-100 pb-4">
				<div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
					<CalendarDays className="w-5 h-5" />
				</div>
				<div>
					<h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
						Macro Calendar
					</h2>
					<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
						Upcoming Catalysts &amp; Risk Events
					</p>
				</div>
			</div>

			<div className="space-y-3 sm:space-y-4">
				{events.map((ev, i) => (
					<div
						key={i}
						className="flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
					>
						<div className="flex flex-col items-center justify-center bg-white border border-slate-200/80 rounded-xl w-12 h-12 sm:w-14 sm:h-14 shrink-0 shadow-2xs">
							<span className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
								{ev.date.split(" ")[0]}
							</span>
							<span className="text-base sm:text-lg font-black text-slate-800 leading-none mt-0.5">
								{ev.date.split(" ")[1].replace(",", "")}
							</span>
						</div>

						<div className="flex-1 min-w-0">
							<div className="flex items-start justify-between gap-2 mb-1">
								<h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
									{ev.event}
								</h3>
								{ev.impact === "Critical" ? (
									<span className="shrink-0 flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold uppercase bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md">
										<AlertTriangle className="w-3 h-3" />
										Critical
									</span>
								) : (
									<span className="shrink-0 text-[9px] sm:text-[10px] font-extrabold uppercase bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
										{ev.impact}
									</span>
								)}
							</div>
							<p className="text-[11px] sm:text-xs font-medium text-slate-500 leading-snug break-words">
								{ev.notes}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
