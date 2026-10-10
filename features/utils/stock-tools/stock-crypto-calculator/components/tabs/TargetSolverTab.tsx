"use client";

import { useState, useMemo } from "react";
import { Calculator, AlertCircle, CheckCircle2, Layers } from "lucide-react";
import type {
	AssetType,
	ConsolidatedStats,
	CurrencyCode,
	FeeConfig,
	StockUnit,
} from "../../types";
import {
	calculateTargetOptimizer,
	formatCurrency,
	formatQuantity,
} from "../../utils";

interface TargetSolverTabProps {
	stats: ConsolidatedStats;
	assetType: AssetType;
	stockUnit: StockUnit;
	currency: CurrencyCode;
	feeConfig: FeeConfig;
	initialBuyPrice?: string;
	initialTargetAvg?: string;
}

export default function TargetSolverTab({
	stats,
	assetType,
	stockUnit,
	currency,
	feeConfig,
	initialBuyPrice = "",
	initialTargetAvg = "",
}: TargetSolverTabProps) {
	const [expectedBuyPrice, setExpectedBuyPrice] = useState(initialBuyPrice);
	const [targetAveragePrice, setTargetAveragePrice] =
		useState(initialTargetAvg);

	const hasHoldings = stats.totalUnits > 0 && stats.netAverage > 0;
	const currencySuffix = currency === "IDR" ? "Rp" : "$";
	const unitLabel =
		assetType === "stock"
			? stockUnit === "lots"
				? "Lots"
				: "Shares"
			: "Units";

	const buyPriceNum = Math.max(0, Number.parseFloat(expectedBuyPrice) || 0);
	const targetAvgNum = Math.max(0, Number.parseFloat(targetAveragePrice) || 0);

	const result = useMemo(() => {
		if (!hasHoldings || buyPriceNum <= 0 || targetAvgNum <= 0) return null;
		return calculateTargetOptimizer(
			stats,
			buyPriceNum,
			targetAvgNum,
			assetType,
			stockUnit,
			feeConfig,
		);
	}, [
		stats,
		buyPriceNum,
		targetAvgNum,
		assetType,
		stockUnit,
		feeConfig,
		hasHoldings,
	]);

	if (!hasHoldings) {
		return (
			<div className="py-12 px-4 text-center space-y-3">
				<div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center mx-auto text-slate-400">
					<Calculator className="w-6 h-6" />
				</div>
				<h4 className="text-sm font-bold text-slate-800">
					No Current Position
				</h4>
				<p className="text-xs text-slate-500 max-w-sm mx-auto">
					Enter your current holdings in the accumulation blotter above to
					calculate the exact volume required to reach your target average
					price.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Explanation Header */}
			<div className="pb-4 border-b border-slate-100">
				<h4 className="text-sm font-bold text-slate-900">
					Reverse Target Average Solver
				</h4>
				<p className="text-xs text-slate-500 mt-0.5">
					Calculate the exact volume and capital required at your planned entry
					price to pull your overall position cost down to your desired target.
				</p>
			</div>

			{/* Inputs (Stacked / Spacious Grid) */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{/* Planned Buy Price */}
				<div className="space-y-1.5">
					<div className="flex items-center justify-between">
						<label
							htmlFor="target-solver-buy-price"
							className="text-xs font-semibold text-slate-700 cursor-pointer"
						>
							Planned Execution Price ({currencySuffix})
						</label>
						<span className="text-[10px] text-slate-400 font-medium">
							New tranche price
						</span>
					</div>
					<div className="relative">
						<input
							id="target-solver-buy-price"
							type="text"
							inputMode="decimal"
							value={expectedBuyPrice}
							onChange={(e) => {
								const val = e.target.value.replace(/[^0-9.]/g, "");
								if (val === "" || /^\d*\.?\d*$/.test(val)) {
									setExpectedBuyPrice(val);
								}
							}}
							placeholder={
								stats.netAverage > 0 ? (stats.netAverage * 0.9).toFixed(0) : "0"
							}
							className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-semibold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-sm tabular-nums"
						/>
					</div>
				</div>

				{/* Desired Target Average */}
				<div className="space-y-1.5">
					<div className="flex items-center justify-between">
						<label
							htmlFor="target-solver-goal-avg"
							className="text-xs font-semibold text-slate-700 cursor-pointer"
						>
							Desired Target Average ({currencySuffix})
						</label>
						<span className="text-[10px] text-slate-400 font-medium">
							Goal position cost
						</span>
					</div>
					<div className="relative">
						<input
							id="target-solver-goal-avg"
							type="text"
							inputMode="decimal"
							value={targetAveragePrice}
							onChange={(e) => {
								const val = e.target.value.replace(/[^0-9.]/g, "");
								if (val === "" || /^\d*\.?\d*$/.test(val)) {
									setTargetAveragePrice(val);
								}
							}}
							placeholder={
								stats.netAverage > 0
									? (stats.netAverage * 0.95).toFixed(0)
									: "0"
							}
							className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-semibold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-sm tabular-nums"
						/>
					</div>
				</div>
			</div>

			{/* Quick Preset Helpers */}
			<div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
				<span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
					Quick Target Targets:
				</span>
				{[-3, -5, -8, -10].map((pct) => {
					const targetVal = stats.netAverage * (1 + pct / 100);
					return (
						<button
							key={pct}
							type="button"
							onClick={() => setTargetAveragePrice(targetVal.toFixed(0))}
							className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
						>
							{pct}% ({formatCurrency(targetVal, currency, 0)})
						</button>
					);
				})}
			</div>

			{/* Results Display */}
			{result && (
				<div className="pt-2">
					{result.feasible ? (
						<div className="space-y-4">
							{/* Solution Breakdown Box */}
							<div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-3.5">
								<div className="flex items-center gap-2 pb-3 border-b border-slate-200/60">
									<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
									<span className="text-xs font-bold text-slate-900">
										Required Execution Plan to Reach Target
									</span>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
									<div className="p-3.5 bg-white rounded-xl border border-slate-100 space-y-1">
										<span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
											Required Additional Volume
										</span>
										<p className="font-mono text-base font-bold text-slate-900 tabular-nums">
											{assetType === "stock" && stockUnit === "lots"
												? `${formatQuantity(result.requiredLots, "stock", "lots")} Lots`
												: formatQuantity(result.requiredUnits, assetType)}{" "}
											<span className="text-xs font-normal text-slate-500">
												({unitLabel})
											</span>
										</p>
										{assetType === "stock" && stockUnit === "lots" && (
											<span className="text-[11px] text-slate-400 font-medium block">
												{formatQuantity(
													result.requiredUnits,
													"stock",
													"shares",
												)}{" "}
												shares
											</span>
										)}
									</div>

									<div className="p-3.5 bg-white rounded-xl border border-slate-100 space-y-1">
										<span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
											Required Fresh Capital
										</span>
										<p className="font-mono text-base font-bold text-slate-900 tabular-nums">
											{formatCurrency(result.requiredCapital, currency)}
										</p>
										<span className="text-[11px] text-slate-400 font-medium block">
											{feeConfig.enabled
												? "Including transaction fees"
												: "At specified entry price"}
										</span>
									</div>
								</div>

								{/* Resulting Overall Position */}
								<div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
									<div className="flex items-center gap-2 text-slate-600">
										<Layers className="w-3.5 h-3.5 text-slate-400" />
										<span>Resulting Position:</span>
										<span className="font-mono font-semibold text-slate-800">
											{assetType === "stock" && stockUnit === "lots"
												? `${formatQuantity(result.resultingLots, "stock", "lots")} Lots`
												: formatQuantity(result.resultingUnits, assetType)}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-slate-500">
											New Consolidated Cost:
										</span>
										<span className="font-mono font-bold text-emerald-700">
											{formatCurrency(result.resultingAverage, currency)}
										</span>
									</div>
								</div>
							</div>
						</div>
					) : (
						<div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-3">
							<AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
							<div className="space-y-1 text-xs">
								<p className="font-bold text-amber-900">Unattainable Target</p>
								<p className="text-amber-800 leading-relaxed">
									{result.reason ||
										"The specified target average cannot be reached with the current parameters."}
								</p>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
