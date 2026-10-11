"use client";

import { Wallet, TrendingUp, Target, Activity } from "lucide-react";
import type { SimulatorPortfolioSummary } from "../../types";
import { fmtIDRPrice, fmtSignedPct } from "../../stockpicks";

interface SimulatorTelemetryStripProps {
	summary: SimulatorPortfolioSummary;
}

export default function SimulatorTelemetryStrip({
	summary,
}: SimulatorTelemetryStripProps) {
	const isProfit = summary.totalUnrealizedPlNominal >= 0;

	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
			{/* 1. Total Simulated Capital */}
			<div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
				{/* Tier 1: Icon Left + Badge Right */}
				<div className="flex items-center justify-between mb-2">
					<div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
						<Wallet className="w-4 h-4" />
					</div>
					<span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/70 text-slate-600 font-mono">
						{summary.activePicks} Active
					</span>
				</div>
				{/* Tier 2: Category Label */}
				<span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
					Simulated Outlay
				</span>
				{/* Tier 3: Primary Metric */}
				<div className="text-sm sm:text-xl lg:text-2xl font-bold font-mono text-slate-900 tracking-tight tabular-nums truncate mt-1">
					{fmtIDRPrice(summary.totalSimulatedCapital)}
				</div>
				{/* Tier 4: Context Sublabel */}
				<span className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate mt-1">
					Valued at {fmtIDRPrice(summary.totalCurrentValue)}
				</span>
			</div>

			{/* 2. Net Unrealized P/L */}
			<div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
				{/* Tier 1: Icon Left + Badge Right */}
				<div className="flex items-center justify-between mb-2">
					<div
						className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
							isProfit
								? "bg-emerald-50 border-emerald-100/80 text-emerald-600"
								: "bg-rose-50 border-rose-100/80 text-rose-600"
						}`}
					>
						<TrendingUp className="w-4 h-4" />
					</div>
					<span
						className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border font-mono ${
							isProfit
								? "bg-emerald-50 text-emerald-700 border-emerald-200"
								: "bg-rose-50 text-rose-700 border-rose-200"
						}`}
					>
						{fmtSignedPct(summary.totalUnrealizedPlPct)}
					</span>
				</div>
				{/* Tier 2: Category Label */}
				<span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
					Net Paper P/L
				</span>
				{/* Tier 3: Primary Metric */}
				<div
					className={`text-sm sm:text-xl lg:text-2xl font-bold font-mono tracking-tight tabular-nums truncate mt-1 ${
						isProfit ? "text-emerald-600" : "text-rose-600"
					}`}
				>
					{isProfit ? "+" : ""}
					{fmtIDRPrice(summary.totalUnrealizedPlNominal)}
				</div>
				{/* Tier 4: Context Sublabel */}
				<span className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate mt-1">
					{summary.winningPicks} up, {summary.losingPicks} down
				</span>
			</div>

			{/* 3. Win Rate & Accuracy */}
			<div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
				{/* Tier 1: Icon Left + Badge Right */}
				<div className="flex items-center justify-between mb-2">
					<div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
						<Target className="w-4 h-4" />
					</div>
					<span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/70 text-slate-600 font-mono">
						Accuracy
					</span>
				</div>
				{/* Tier 2: Category Label */}
				<span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
					Stockpick Win Rate
				</span>
				{/* Tier 3: Primary Metric */}
				<div className="text-sm sm:text-xl lg:text-2xl font-bold font-mono text-slate-900 tracking-tight tabular-nums truncate mt-1">
					{summary.winRatePct}%
				</div>
				{/* Tier 4: Context Sublabel */}
				<span className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate mt-1">
					{summary.winningPicks} of {summary.activePicks} picks in profit
				</span>
			</div>

			{/* 4. Best Performer vs Drawdown */}
			<div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
				{/* Tier 1: Icon Left + Badge Right */}
				<div className="flex items-center justify-between mb-2">
					<div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100/80 text-purple-600 flex items-center justify-center shrink-0">
						<Activity className="w-4 h-4" />
					</div>
					<span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-700 font-mono">
						Telemetry
					</span>
				</div>
				{/* Tier 2: Category Label */}
				<span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
					Best vs Worst Pick
				</span>
				{/* Tier 3: Primary Metric */}
				<div className="text-sm sm:text-base lg:text-lg font-bold font-mono text-slate-900 tracking-tight tabular-nums truncate mt-1 flex items-center gap-2">
					{summary.bestPerformer ? (
						<span className="text-emerald-600">
							{summary.bestPerformer.stockCode} (
							{fmtSignedPct(summary.bestPerformer.plPct)})
						</span>
					) : (
						<span className="text-slate-400">—</span>
					)}
				</div>
				{/* Tier 4: Context Sublabel */}
				<span className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate mt-1">
					{summary.worstPerformer && summary.worstPerformer.plPct < 0
						? `Lowest: ${summary.worstPerformer.stockCode} (${fmtSignedPct(summary.worstPerformer.plPct)})`
						: "All active positions profitable"}
				</span>
			</div>
		</div>
	);
}
