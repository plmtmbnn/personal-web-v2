"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ShieldAlert, Scale, CheckCircle2 } from "lucide-react";
import type { ConsolidatedStats, CurrencyCode, FeeConfig } from "../../types";
import {
	calculateExitLadder,
	calculateStopLossLadder,
	formatCurrency,
	formatPercent,
} from "../../utils";

interface RealizationTabProps {
	stats: ConsolidatedStats;
	currency: CurrencyCode;
	feeConfig: FeeConfig;
}

export default function RealizationTab({
	stats,
	currency,
	feeConfig,
}: RealizationTabProps) {
	const [activeMode, setActiveMode] = useState<"take-profit" | "stop-loss">(
		"take-profit",
	);
	const [selectedTargetPct, setSelectedTargetPct] = useState<number>(15);
	const [selectedStopPct, setSelectedStopPct] = useState<number>(5);

	const hasHoldings = stats.totalUnits > 0 && stats.netAverage > 0;

	const exitLevels = calculateExitLadder(stats, feeConfig, selectedTargetPct);
	const stopLevels = calculateStopLossLadder(stats, feeConfig, selectedStopPct);

	const activeExit = exitLevels.find((l) => l.percent === selectedTargetPct);
	const activeStop = stopLevels.find((l) => l.percent === selectedStopPct);

	const riskRewardRatio =
		activeExit && activeStop && activeStop.capitalAtRisk > 0
			? activeExit.netProfit / activeStop.capitalAtRisk
			: 0;

	if (!hasHoldings) {
		return (
			<div className="py-12 px-4 text-center space-y-3">
				<div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center mx-auto text-slate-400">
					<Scale className="w-6 h-6" />
				</div>
				<h4 className="text-sm font-bold text-slate-800">
					No Active Holdings to Evaluate
				</h4>
				<p className="text-xs text-slate-500 max-w-sm mx-auto">
					Enter orders in the accumulation blotter above to simulate profit
					targets, exit ladders, and capital protection thresholds.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Top Bar: Mode Switcher & R:R Ratio */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
				{/* Responsive Segmented Mode Switcher */}
				<div className="grid grid-cols-2 w-full sm:w-auto sm:inline-flex items-center p-1 bg-slate-100 rounded-xl">
					<button
						type="button"
						onClick={() => setActiveMode("take-profit")}
						className={`relative px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
							activeMode === "take-profit"
								? "text-slate-900"
								: "text-slate-500 hover:text-slate-900"
						}`}
					>
						{activeMode === "take-profit" && (
							<motion.div
								layoutId="realization-mode-pill"
								className="absolute inset-0 bg-white rounded-lg shadow-2xs -z-10"
								transition={{ type: "spring", stiffness: 450, damping: 35 }}
							/>
						)}
						<ArrowUpRight
							className={`w-3.5 h-3.5 shrink-0 ${activeMode === "take-profit" ? "text-emerald-600" : "text-slate-400"}`}
						/>
						<span className="hidden sm:inline">
							Take-Profit Target (+{selectedTargetPct}%)
						</span>
						<span className="sm:hidden truncate">
							Profit (+{selectedTargetPct}%)
						</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveMode("stop-loss")}
						className={`relative px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
							activeMode === "stop-loss"
								? "text-slate-900"
								: "text-slate-500 hover:text-slate-900"
						}`}
					>
						{activeMode === "stop-loss" && (
							<motion.div
								layoutId="realization-mode-pill"
								className="absolute inset-0 bg-white rounded-lg shadow-2xs -z-10"
								transition={{ type: "spring", stiffness: 450, damping: 35 }}
							/>
						)}
						<ShieldAlert
							className={`w-3.5 h-3.5 shrink-0 ${activeMode === "stop-loss" ? "text-rose-600" : "text-slate-400"}`}
						/>
						<span className="hidden sm:inline">
							Capital Floor (-{selectedStopPct}%)
						</span>
						<span className="sm:hidden truncate">
							Stop (-{selectedStopPct}%)
						</span>
					</button>
				</div>

				{/* Risk to Reward Ratio */}
				{riskRewardRatio > 0 && (
					<div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 self-start sm:self-auto">
						<span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
							Risk / Reward:
						</span>
						<span className="font-mono font-bold text-slate-900 tabular-nums">
							1 : {riskRewardRatio.toFixed(2)}
						</span>
					</div>
				)}
			</div>

			{/* Mode Content: 100% Full-Width Layout (Zero Squeezed Columns) */}
			{activeMode === "take-profit" && activeExit && (
				<div className="space-y-5">
					{/* Percentage Milestones Track */}
					<div className="space-y-2">
						<span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
							Select Profit Milestone
						</span>
						<div className="flex flex-wrap items-center gap-2">
							{[5, 10, 15, 20, 25, 30, 40, 50].map((pct) => (
								<button
									key={pct}
									type="button"
									onClick={() => setSelectedTargetPct(pct)}
									className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
										selectedTargetPct === pct
											? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs font-bold"
											: "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
									}`}
								>
									+{pct}%
								</button>
							))}
						</div>
					</div>

					{/* Vertical Key-Value Breakdown */}
					<div className="bg-slate-50/60 rounded-2xl border border-slate-100 p-4 sm:p-5 space-y-3">
						<div className="flex items-center justify-between py-2 border-b border-slate-200/60 text-xs">
							<span className="text-slate-500 font-medium">
								Target Execution Price
							</span>
							<span className="font-mono font-semibold text-slate-900 tabular-nums text-sm">
								{formatCurrency(activeExit.targetPrice, currency)}
							</span>
						</div>

						<div className="flex items-center justify-between py-2 border-b border-slate-200/60 text-xs">
							<span className="text-slate-500 font-medium">
								Gross Liquidation Value
							</span>
							<span className="font-mono font-semibold text-slate-900 tabular-nums text-sm">
								{formatCurrency(activeExit.grossProceeds, currency)}
							</span>
						</div>

						{feeConfig.enabled && (
							<div className="flex items-center justify-between py-2 border-b border-slate-200/60 text-xs">
								<span className="text-slate-500 font-medium">
									Broker & Exchange Fees ({feeConfig.sellFeePercent}%)
								</span>
								<span className="font-mono font-semibold text-slate-500 tabular-nums text-sm">
									-{formatCurrency(activeExit.sellFee, currency)}
								</span>
							</div>
						)}

						<div className="flex items-center justify-between py-2 text-xs">
							<span className="text-slate-500 font-medium">
								Net Realized Proceeds
							</span>
							<span className="font-mono font-semibold text-slate-900 tabular-nums text-sm">
								{formatCurrency(activeExit.netProceeds, currency)}
							</span>
						</div>
					</div>

					{/* Net Profit Summary Box (Lighter, Frameless Standard) */}
					<div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
						<div className="flex items-center gap-2">
							<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
							<div>
								<p className="text-xs font-bold text-emerald-900">
									Projected Net Gain
								</p>
								<p className="text-[11px] text-emerald-700/80">
									Net of initial outlay and transaction fees
								</p>
							</div>
						</div>
						<div className="text-left sm:text-right">
							<p className="font-mono text-base sm:text-lg font-bold text-emerald-700 tabular-nums">
								+{formatCurrency(activeExit.netProfit, currency)}
							</p>
							<p className="text-[11px] font-semibold text-emerald-600/90 font-mono tabular-nums">
								{formatPercent(activeExit.netRoiPercent)} Net ROI
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Stop-Loss Floor Mode */}
			{activeMode === "stop-loss" && activeStop && (
				<div className="space-y-5">
					{/* Percentage Milestones Track */}
					<div className="space-y-2">
						<span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
							Select Downside Risk Cap
						</span>
						<div className="flex flex-wrap items-center gap-2">
							{[2, 3, 5, 7, 8, 10, 12, 15].map((pct) => (
								<button
									key={pct}
									type="button"
									onClick={() => setSelectedStopPct(pct)}
									className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
										selectedStopPct === pct
											? "bg-rose-50 text-rose-700 border-rose-300 shadow-2xs font-bold"
											: "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
									}`}
								>
									-{pct}%
								</button>
							))}
						</div>
					</div>

					{/* Vertical Key-Value Breakdown */}
					<div className="bg-slate-50/60 rounded-2xl border border-slate-100 p-4 sm:p-5 space-y-3">
						<div className="flex items-center justify-between py-2 border-b border-slate-200/60 text-xs">
							<span className="text-slate-500 font-medium">
								Stop-Loss Trigger Price
							</span>
							<span className="font-mono font-semibold text-slate-900 tabular-nums text-sm">
								{formatCurrency(activeStop.stopPrice, currency)}
							</span>
						</div>

						<div className="flex items-center justify-between py-2 border-b border-slate-200/60 text-xs">
							<span className="text-slate-500 font-medium">
								Recovered Net Capital
							</span>
							<span className="font-mono font-semibold text-slate-900 tabular-nums text-sm">
								{formatCurrency(activeStop.netProceeds, currency)}
							</span>
						</div>

						<div className="flex items-center justify-between py-2 text-xs">
							<span className="text-slate-500 font-medium">
								Capital Preservation Floor
							</span>
							<span className="font-mono font-semibold text-slate-900 tabular-nums text-sm">
								{(100 - activeStop.riskPercent).toFixed(2)}% of Principal
							</span>
						</div>
					</div>

					{/* Capital At Risk Summary Box (Lighter, Frameless Standard) */}
					<div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
						<div className="flex items-center gap-2">
							<ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
							<div>
								<p className="text-xs font-bold text-rose-900">
									Maximum Principal at Risk
								</p>
								<p className="text-[11px] text-rose-700/80">
									Downside loss limit if stop price is triggered
								</p>
							</div>
						</div>
						<div className="text-left sm:text-right">
							<p className="font-mono text-base sm:text-lg font-bold text-rose-700 tabular-nums">
								-{formatCurrency(activeStop.capitalAtRisk, currency)}
							</p>
							<p className="text-[11px] font-semibold text-rose-600/90 font-mono tabular-nums">
								-{activeStop.riskPercent.toFixed(2)}% of Portfolio Outlay
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
