"use client";

import {
	TrendingUp,
	TrendingDown,
	Target,
	Scale,
	Clock,
	Award,
} from "lucide-react";
import type { ClosedTradesSummary } from "../../types";
import { fmtIDRPrice, fmtSignedPct } from "../../stockpicks";

interface ClosedTradesTelemetryStripProps {
	summary: ClosedTradesSummary;
}

export function ClosedTradesTelemetryStrip({
	summary,
}: ClosedTradesTelemetryStripProps) {
	const isProfit = summary.totalRealizedPlNominal >= 0;

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{/* Card 1: Cumulative Realized Return */}
			<div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
				<div className="flex items-center justify-between">
					<span className="text-xs font-bold text-slate-600">
						Realized Profit / Loss
					</span>
					<div
						className={`w-8 h-8 rounded-xl flex items-center justify-center ${
							isProfit
								? "bg-emerald-50 text-emerald-700 border border-emerald-100"
								: "bg-rose-50 text-rose-700 border border-rose-100"
						}`}
					>
						{isProfit ? (
							<TrendingUp className="w-4 h-4" />
						) : (
							<TrendingDown className="w-4 h-4" />
						)}
					</div>
				</div>

				<div className="mt-3">
					<div
						className={`text-2xl font-bold font-mono tracking-tight ${
							isProfit ? "text-emerald-700" : "text-rose-700"
						}`}
					>
						{summary.totalRealizedPlNominal >= 0 ? "+" : ""}
						{fmtIDRPrice(summary.totalRealizedPlNominal)}
					</div>
					<div className="flex items-center gap-1.5 mt-1">
						<span
							className={`text-xs font-semibold font-mono ${
								isProfit ? "text-emerald-700" : "text-rose-700"
							}`}
						>
							{fmtSignedPct(summary.totalRealizedPlPct)}
						</span>
						<span className="text-xs text-slate-600 font-medium">
							net realized ROI
						</span>
					</div>
				</div>

				<div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
					<span>Closed Trades</span>
					<span className="font-mono font-semibold text-slate-800">
						{summary.totalClosed} Total
					</span>
				</div>
			</div>

			{/* Card 2: Win Rate Accuracy */}
			<div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
				<div className="flex items-center justify-between">
					<span className="text-xs font-bold text-slate-600">
						Win Rate Accuracy
					</span>
					<div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center">
						<Target className="w-4 h-4" />
					</div>
				</div>

				<div className="mt-3">
					<div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
						{summary.winRatePct}%
					</div>
					<div className="flex items-center gap-2 mt-1">
						<span className="text-xs font-semibold text-emerald-700">
							{summary.winningTrades} Wins
						</span>
						<span className="text-xs text-slate-400">/</span>
						<span className="text-xs font-semibold text-rose-700">
							{summary.losingTrades} Losses
						</span>
					</div>
				</div>

				<div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
					<span>Target Edge</span>
					<span className="font-mono font-semibold text-slate-800">
						{summary.winRatePct >= 50 ? "Positive Expectancy" : "Refining Edge"}
					</span>
				</div>
			</div>

			{/* Card 3: Profit Factor & Payoff */}
			<div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
				<div className="flex items-center justify-between">
					<span className="text-xs font-bold text-slate-600">
						Profit Factor
					</span>
					<div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-700 border border-violet-100 flex items-center justify-center">
						<Scale className="w-4 h-4" />
					</div>
				</div>

				<div className="mt-3">
					<div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
						{summary.profitFactor.toFixed(2)}x
					</div>
					<div className="flex items-center gap-2 mt-1">
						<span className="text-xs font-semibold text-emerald-700 font-mono">
							Avg Win {fmtSignedPct(summary.avgWinPct)}
						</span>
						<span className="text-xs text-slate-400">/</span>
						<span className="text-xs font-semibold text-rose-700 font-mono">
							Avg Loss {fmtSignedPct(summary.avgLossPct)}
						</span>
					</div>
				</div>

				<div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
					<span>Benchmark Target</span>
					<span className="font-mono font-semibold text-slate-800">
						&gt; 1.50x Golden Standard
					</span>
				</div>
			</div>

			{/* Card 4: Holding Duration & Extremes */}
			<div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
				<div className="flex items-center justify-between">
					<span className="text-xs font-bold text-slate-600">
						Avg Holding Period
					</span>
					<div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center">
						<Clock className="w-4 h-4" />
					</div>
				</div>

				<div className="mt-3">
					<div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
						{summary.avgHoldingDays}{" "}
						<span className="text-sm font-sans font-medium text-slate-600">
							Days
						</span>
					</div>
					<div className="flex items-center gap-2 mt-1 text-xs">
						{summary.bestTrade && (
							<div className="flex items-center gap-1 text-emerald-700 font-medium">
								<Award className="w-3.5 h-3.5" />
								<span>
									{summary.bestTrade.stockCode} (
									{fmtSignedPct(summary.bestTrade.plPct)})
								</span>
							</div>
						)}
					</div>
				</div>

				<div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
					<span>Deepest Drawdown</span>
					<span className="font-mono font-semibold text-rose-700">
						{summary.worstTrade
							? `${summary.worstTrade.stockCode} (${fmtSignedPct(summary.worstTrade.plPct)})`
							: "None"}
					</span>
				</div>
			</div>
		</div>
	);
}
