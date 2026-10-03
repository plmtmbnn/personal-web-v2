"use client";

import { useMemo } from "react";
import { Globe2, Briefcase, Activity, Building2 } from "lucide-react";
import type { InvestmentCompassData, Tone } from "@/features/investment/types";
import { generatePlaybook } from "@/features/investment/lib/engine";

export default function EconomicBackdropSummary({
	data,
}: {
	data: InvestmentCompassData;
}) {
	const { economySummary } = useMemo(() => generatePlaybook(data), [data]);

	const getToneColor = (tone: Tone) => {
		switch (tone) {
			case "positive":
				return "bg-emerald-50 border-emerald-200/70 text-emerald-700";
			case "negative":
				return "bg-rose-50 border-rose-200/70 text-rose-700";
			case "caution":
				return "bg-amber-50 border-amber-200/70 text-amber-700";
			default:
				return "bg-slate-50 border-slate-200/70 text-slate-700";
		}
	};

	const getIconColor = (tone: Tone) => {
		switch (tone) {
			case "positive":
				return "text-emerald-600";
			case "negative":
				return "text-rose-600";
			case "caution":
				return "text-amber-600";
			default:
				return "text-slate-600";
		}
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{/* Macro Economy Summary */}
			<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 flex flex-col h-full">
				<div className="flex flex-wrap items-center justify-between gap-2 mb-5 sm:mb-6 border-b border-slate-100 pb-4">
					<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2.5">
						<Globe2 className="w-4 h-4 text-indigo-600 shrink-0" />
						<span>Macro Economy</span>
					</h3>
					<span
						className={`shrink-0 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase border ${getToneColor(economySummary.macro.tone)}`}
					>
						Global Top-Down
					</span>
				</div>

				<div className="flex-1 space-y-4">
					<div className="flex items-start gap-3">
						<Activity
							className={`w-5 h-5 shrink-0 mt-0.5 ${getIconColor(economySummary.macro.tone)}`}
						/>
						<h4 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
							{economySummary.macro.headline}
						</h4>
					</div>

					<ul className="space-y-3 mt-4">
						{economySummary.macro.keynotes.map((note, i) => (
							<li
								key={i}
								className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed"
							>
								<span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
								<span>{note}</span>
							</li>
						))}
					</ul>
				</div>
			</div>

			{/* Micro Economy Summary */}
			<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 flex flex-col h-full">
				<div className="flex flex-wrap items-center justify-between gap-2 mb-5 sm:mb-6 border-b border-slate-100 pb-4">
					<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2.5">
						<Building2 className="w-4 h-4 text-sky-600 shrink-0" />
						<span>Micro / Corporate Health</span>
					</h3>
					<span
						className={`shrink-0 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase border ${getToneColor(economySummary.micro.tone)}`}
					>
						Bottom-Up Fundamentals
					</span>
				</div>

				<div className="flex-1 space-y-4">
					<div className="flex items-start gap-3">
						<Briefcase
							className={`w-5 h-5 shrink-0 mt-0.5 ${getIconColor(economySummary.micro.tone)}`}
						/>
						<h4 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
							{economySummary.micro.headline}
						</h4>
					</div>

					<ul className="space-y-3 mt-4">
						{economySummary.micro.keynotes.map((note, i) => (
							<li
								key={i}
								className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed"
							>
								<span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
								<span>{note}</span>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}
