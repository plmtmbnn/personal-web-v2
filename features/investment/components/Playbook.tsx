"use client";

import { useMemo } from "react";
import {
	Briefcase,
	AlertCircle,
	CheckCircle2,
	ListChecks,
	PieChart,
	ShieldAlert,
} from "lucide-react";
import type { InvestmentCompassData } from "@/features/investment/types";
import { generatePlaybook } from "@/features/investment/lib/engine";

export default function Playbook({ data }: { data: InvestmentCompassData }) {
	const { regime, recommendations, allocation } = useMemo(
		() => generatePlaybook(data),
		[data],
	);

	const getStanceColor = (stance: string) => {
		if (stance === "Overweight")
			return "bg-emerald-50 text-emerald-700 border-emerald-200";
		if (stance === "Underweight")
			return "bg-rose-50 text-rose-700 border-rose-200";
		return "bg-slate-100 text-slate-700 border-slate-200";
	};

	return (
		<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 space-y-6 sm:space-y-8">
			{/* Header */}
			<div className="flex items-center gap-3 border-b border-slate-100 pb-4">
				<div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
					<Briefcase className="w-5 h-5" />
				</div>
				<div>
					<h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
						Actionable Playbook
					</h2>
					<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
						Engine Diagnosis &amp; Strategic Allocations
					</p>
				</div>
			</div>

			{/* Regime Diagnosis Card */}
			<div className="bg-slate-50/50 rounded-2xl p-4 sm:p-5 border border-slate-200/70 space-y-2">
				<div className="flex items-center justify-between gap-2">
					<span className="text-xs font-extrabold text-indigo-700 uppercase tracking-wider truncate">
						Regime: {regime.title}
					</span>
					<span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold shrink-0">
						{regime.stance}
					</span>
				</div>
				<h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
					{regime.headline}
				</h3>
				<p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
					{regime.diagnosis}
				</p>
			</div>

			{/* Target Allocation Bar */}
			<div className="space-y-3">
				<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
					<PieChart className="w-4 h-4 text-sky-500 shrink-0" />
					Target Allocation Posture
				</h3>
				<div className="h-4 sm:h-5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner border border-slate-200/50">
					<div
						className="h-full bg-emerald-500 transition-all duration-1000"
						style={{ width: `${allocation.equities}%` }}
						title={`Equities: ${allocation.equities}%`}
					/>
					<div
						className="h-full bg-indigo-500 transition-all duration-1000 border-l border-white/20"
						style={{ width: `${allocation.crypto}%` }}
						title={`Crypto: ${allocation.crypto}%`}
					/>
					<div
						className="h-full bg-amber-400 transition-all duration-1000 border-l border-white/20"
						style={{ width: `${allocation.gold}%` }}
						title={`Gold: ${allocation.gold}%`}
					/>
					<div
						className="h-full bg-slate-400 transition-all duration-1000 border-l border-white/20"
						style={{ width: `${allocation.cashBonds}%` }}
						title={`Cash & Bonds: ${allocation.cashBonds}%`}
					/>
				</div>
				<div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-[11px] sm:text-xs font-bold text-slate-600">
					<div className="flex items-center gap-1.5">
						<span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shrink-0" />{" "}
						Equities ({allocation.equities}%)
					</div>
					<div className="flex items-center gap-1.5">
						<span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 shrink-0" />{" "}
						Crypto ({allocation.crypto}%)
					</div>
					<div className="flex items-center gap-1.5">
						<span className="w-2.5 h-2.5 rounded-sm bg-amber-400 shrink-0" />{" "}
						Gold ({allocation.gold}%)
					</div>
					<div className="flex items-center gap-1.5">
						<span className="w-2.5 h-2.5 rounded-sm bg-slate-400 shrink-0" />{" "}
						Cash/Bonds ({allocation.cashBonds}%)
					</div>
				</div>
			</div>

			{/* Individual Recommendations */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-slate-100">
				{recommendations.map((rec) => (
					<div
						key={rec.assetClass}
						className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col space-y-4"
					>
						{/* Header */}
						<div className="flex justify-between items-start gap-2">
							<div className="min-w-0 flex-1">
								<h4 className="text-sm sm:text-base font-black text-slate-900 truncate">
									{rec.assetClass}
								</h4>
								<span
									className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getStanceColor(rec.stance)}`}
								>
									{rec.stance}
								</span>
							</div>
							<div className="text-right shrink-0">
								<span className="text-[10px] font-bold text-slate-400 uppercase">
									Confidence
								</span>
								<div className="text-xs font-extrabold text-slate-700">
									{rec.confidence}
								</div>
							</div>
						</div>

						{/* Summary */}
						<p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
							{rec.summary}
						</p>

						{/* Pros / Cons Matrix */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 border-t border-slate-100/60 mt-auto">
							<ul className="space-y-1.5">
								<li className="text-[10px] font-extrabold uppercase text-emerald-600 mb-1">
									Tailwinds
								</li>
								{rec.pros.map((pro, i) => (
									<li
										key={i}
										className="text-xs font-semibold text-slate-600 flex items-start gap-1.5"
									>
										<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
										<span className="leading-tight">{pro}</span>
									</li>
								))}
							</ul>
							<ul className="space-y-1.5">
								<li className="text-[10px] font-extrabold uppercase text-rose-600 mb-1">
									Headwinds
								</li>
								{rec.cons.map((con, i) => (
									<li
										key={i}
										className="text-xs font-semibold text-slate-600 flex items-start gap-1.5"
									>
										<AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
										<span className="leading-tight">{con}</span>
									</li>
								))}
							</ul>
						</div>

						{/* Action & Invalidation */}
						<div className="pt-3 border-t border-slate-100 space-y-2">
							<div className="flex items-start gap-2">
								<ListChecks className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
								<div>
									<span className="text-[10px] font-extrabold uppercase text-slate-400 block">
										Action
									</span>
									<span className="text-xs font-bold text-slate-800 leading-snug">
										{rec.action}
									</span>
								</div>
							</div>
							<div className="flex items-start gap-2">
								<ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
								<div>
									<span className="text-[10px] font-extrabold uppercase text-slate-400 block">
										Invalidation
									</span>
									<span className="text-xs font-bold text-slate-800 leading-snug">
										{rec.invalidation}
									</span>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="text-center pt-6 border-t border-slate-100">
				<p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
					Personal Guideline (Not Financial Advice)
				</p>
			</div>
		</div>
	);
}
