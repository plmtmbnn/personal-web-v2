"use client";

import { useState, useMemo } from "react";
import { Wallet, CheckCircle2, TrendingDown } from "lucide-react";
import type {
	AssetType,
	ConsolidatedStats,
	CurrencyCode,
	FeeConfig,
	StockUnit,
} from "../../types";
import {
	calculateBudgetOptimizer,
	formatCurrency,
	formatPercent,
	formatQuantity,
} from "../../utils";

interface BudgetPlannerTabProps {
	stats: ConsolidatedStats;
	assetType: AssetType;
	stockUnit: StockUnit;
	currency: CurrencyCode;
	feeConfig: FeeConfig;
	initialBudget?: string;
	initialBuyPrice?: string;
}

export default function BudgetPlannerTab({
	stats,
	assetType,
	stockUnit,
	currency,
	feeConfig,
	initialBudget = "",
	initialBuyPrice = "",
}: BudgetPlannerTabProps) {
	const [budgetAmount, setBudgetAmount] = useState(initialBudget);
	const [expectedBuyPrice, setExpectedBuyPrice] = useState(initialBuyPrice);

	const hasHoldings = stats.totalUnits > 0 && stats.netAverage > 0;
	const currencySuffix = currency === "IDR" ? "Rp" : "$";
	const unitLabel =
		assetType === "stock"
			? stockUnit === "lots"
				? "Lots"
				: "Shares"
			: "Units";

	const budgetNum = Math.max(0, Number.parseFloat(budgetAmount) || 0);
	const buyPriceNum = Math.max(0, Number.parseFloat(expectedBuyPrice) || 0);

	const result = useMemo(() => {
		if (!hasHoldings || budgetNum <= 0 || buyPriceNum <= 0) return null;
		return calculateBudgetOptimizer(
			stats,
			budgetNum,
			buyPriceNum,
			assetType,
			stockUnit,
			feeConfig,
		);
	}, [
		stats,
		budgetNum,
		buyPriceNum,
		assetType,
		stockUnit,
		feeConfig,
		hasHoldings,
	]);

	if (!hasHoldings) {
		return (
			<div className="py-12 px-4 text-center space-y-3">
				<div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center mx-auto text-slate-400">
					<Wallet className="w-6 h-6" />
				</div>
				<h4 className="text-sm font-bold text-slate-800">
					No Current Position
				</h4>
				<p className="text-xs text-slate-500 max-w-sm mx-auto">
					Enter your current holdings in the accumulation blotter above to
					simulate how much a specific cash budget will reduce your average
					cost.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Explanation Header */}
			<div className="pb-4 border-b border-slate-100">
				<h4 className="text-sm font-bold text-slate-900">
					Budget Deployment Planner
				</h4>
				<p className="text-xs text-slate-500 mt-0.5">
					Determine the exact volume you can acquire with a fixed cash budget
					and examine the resulting average cost reduction.
				</p>
			</div>

			{/* Inputs (Stacked / Spacious Grid) */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{/* Available Budget Amount */}
				<div className="space-y-1.5">
					<div className="flex items-center justify-between">
						<label
							htmlFor="budget-planner-amount"
							className="text-xs font-semibold text-slate-700 cursor-pointer"
						>
							Available Cash Budget ({currencySuffix})
						</label>
						<span className="text-[10px] text-slate-400 font-medium">
							Capital to deploy
						</span>
					</div>
					<div className="relative">
						<input
							id="budget-planner-amount"
							type="text"
							inputMode="decimal"
							value={budgetAmount}
							onChange={(e) => {
								const val = e.target.value.replace(/[^0-9.]/g, "");
								if (val === "" || /^\d*\.?\d*$/.test(val)) {
									setBudgetAmount(val);
								}
							}}
							placeholder={currency === "IDR" ? "50000000" : "5000"}
							className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-semibold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-sm tabular-nums"
						/>
					</div>
				</div>

				{/* Planned Buy Price */}
				<div className="space-y-1.5">
					<div className="flex items-center justify-between">
						<label
							htmlFor="budget-planner-buy-price"
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
							id="budget-planner-buy-price"
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
			</div>

			{/* Results Display */}
			{result && result.acquiredUnits > 0 && (
				<div className="space-y-4 pt-1">
					<div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
						<div className="flex items-center gap-2 pb-3 border-b border-slate-200/60">
							<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
							<span className="text-xs font-bold text-slate-900">
								Deployment Simulation Summary
							</span>
						</div>

						{/* 2-Column Spacious Metrics */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
							<div className="p-3.5 bg-white rounded-xl border border-slate-100 space-y-1">
								<span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
									Purchasable Volume
								</span>
								<p className="font-mono text-base font-bold text-slate-900 tabular-nums">
									{assetType === "stock" && stockUnit === "lots"
										? `${formatQuantity(result.acquiredLots, "stock", "lots")} Lots`
										: formatQuantity(result.acquiredUnits, assetType)}{" "}
									<span className="text-xs font-normal text-slate-500">
										({unitLabel})
									</span>
								</p>
								{assetType === "stock" && stockUnit === "lots" && (
									<span className="text-[11px] text-slate-400 font-medium block">
										{formatQuantity(result.acquiredUnits, "stock", "shares")}{" "}
										shares
									</span>
								)}
							</div>

							<div className="p-3.5 bg-white rounded-xl border border-slate-100 space-y-1">
								<span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
									Capital Deployed &amp; Residual
								</span>
								<p className="font-mono text-base font-bold text-slate-900 tabular-nums">
									{formatCurrency(result.capitalUsed, currency)}
								</p>
								<span className="text-[11px] text-slate-400 font-medium block">
									Residual Cash:{" "}
									{formatCurrency(result.residualBudget, currency)}
								</span>
							</div>
						</div>

						{/* New Average & Cost Impact Highlight */}
						<div className="p-4 rounded-xl bg-white border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
							<div className="space-y-0.5">
								<span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block">
									New Consolidated Cost Basis
								</span>
								<p className="font-mono text-xl font-bold text-slate-900 tabular-nums">
									{formatCurrency(result.newAverage, currency)}
								</p>
								<p className="text-[11px] text-slate-400">
									From previous {formatCurrency(stats.netAverage, currency)}
								</p>
							</div>

							{result.averageReductionAmount > 0 && (
								<div className="sm:text-right">
									<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-xs font-bold tabular-nums">
										<TrendingDown className="w-3.5 h-3.5" />
										<span>
											-{formatPercent(result.averageReductionPercent, false)}{" "}
											Cost Reduction
										</span>
									</span>
									<p className="text-[11px] text-slate-400 font-mono mt-1">
										-{formatCurrency(result.averageReductionAmount, currency)} /
										unit
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
