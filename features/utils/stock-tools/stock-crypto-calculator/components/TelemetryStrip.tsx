"use client";

import {
	TrendingDown,
	TrendingUp,
	ShieldCheck,
	DollarSign,
	Layers,
} from "lucide-react";
import type {
	AssetType,
	ConsolidatedStats,
	CurrencyCode,
	StockUnit,
} from "../types";
import { formatCurrency, formatPercent, formatQuantity } from "../utils";

interface TelemetryStripProps {
	stats: ConsolidatedStats;
	assetType: AssetType;
	stockUnit: StockUnit;
	currency: CurrencyCode;
	feeEnabled: boolean;
}

export default function TelemetryStrip({
	stats,
	assetType,
	stockUnit,
	currency,
	feeEnabled,
}: TelemetryStripProps) {
	const hasHoldings = stats.totalUnits > 0 && stats.netAverage > 0;
	const isCostLowered = stats.avgDeltaAmount < 0;

	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
			{/* 1. Consolidated Average Cost */}
			<div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-2 sm:gap-3">
				{/* Top Row: Icon + Badge (only 2 compact elements) */}
				<div className="flex items-center justify-between w-full">
					<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
						<DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
					</div>
					{hasHoldings && stats.avgDeltaAmount !== 0 && (
						<span
							className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold shrink-0 tabular-nums ${
								isCostLowered
									? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
									: "bg-blue-50 text-blue-700 border border-blue-200/70"
							}`}
						>
							{isCostLowered ? (
								<TrendingDown className="w-3 h-3" />
							) : (
								<TrendingUp className="w-3 h-3" />
							)}
							{formatPercent(stats.avgDeltaPercent)}
						</span>
					)}
				</div>

				{/* Middle & Bottom: Label, Value, Subtext */}
				<div className="min-w-0">
					<span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
						Consolidated Cost
					</span>
					<p className="text-sm sm:text-xl lg:text-2xl font-bold font-mono text-slate-900 tracking-tight tabular-nums mt-0.5 truncate">
						{hasHoldings ? formatCurrency(stats.netAverage, currency) : "—"}
					</p>
					<p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate mt-0.5">
						{hasHoldings
							? `vs entry ${formatCurrency(stats.initialTrancheAvg, currency)}`
							: "Awaiting orders"}
					</p>
				</div>
			</div>

			{/* 2. Breakeven Threshold */}
			<div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-2 sm:gap-3">
				{/* Top Row: Icon + Badge */}
				<div className="flex items-center justify-between w-full">
					<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
						<ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
					</div>
					<span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200/70 shrink-0">
						{feeEnabled ? "Net of fees" : "Gross"}
					</span>
				</div>

				{/* Middle & Bottom: Label, Value, Subtext */}
				<div className="min-w-0">
					<span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
						Breakeven Price
					</span>
					<p className="text-sm sm:text-xl lg:text-2xl font-bold font-mono text-slate-900 tracking-tight tabular-nums mt-0.5 truncate">
						{hasHoldings ? formatCurrency(stats.breakevenPrice, currency) : "—"}
					</p>
					<p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate mt-0.5">
						Minimum exit recovery target
					</p>
				</div>
			</div>

			{/* 3. Total Net Capital Outlay */}
			<div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-2 sm:gap-3">
				{/* Top Row: Icon + Badge */}
				<div className="flex items-center justify-between w-full">
					<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
						<Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
					</div>
					<span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 font-mono tabular-nums px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200/70 shrink-0">
						{stats.tranches.length} orders
					</span>
				</div>

				{/* Middle & Bottom: Label, Value, Subtext */}
				<div className="min-w-0">
					<span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
						Total Outlay
					</span>
					<p className="text-sm sm:text-xl lg:text-2xl font-bold font-mono text-slate-900 tracking-tight tabular-nums mt-0.5 truncate">
						{hasHoldings
							? formatCurrency(stats.totalNetCapital, currency)
							: "—"}
					</p>
					<p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate mt-0.5">
						{feeEnabled && stats.totalBuyFees > 0
							? `Incl. ${formatCurrency(stats.totalBuyFees, currency)} fees`
							: "Gross execution capital"}
					</p>
				</div>
			</div>

			{/* 4. Position Volume */}
			<div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-2 sm:gap-3">
				{/* Top Row: Icon + Badge */}
				<div className="flex items-center justify-between w-full">
					<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
						<TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
					</div>
					<span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200/70 shrink-0">
						{assetType === "stock"
							? stockUnit === "lots"
								? "Lots"
								: "Shares"
							: "Units"}
					</span>
				</div>

				{/* Middle & Bottom: Label, Value, Subtext */}
				<div className="min-w-0">
					<span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
						Total Volume
					</span>
					<p className="text-sm sm:text-xl lg:text-2xl font-bold font-mono text-slate-900 tracking-tight tabular-nums mt-0.5 truncate">
						{hasHoldings
							? assetType === "stock" && stockUnit === "lots"
								? `${formatQuantity(stats.totalLots, "stock", "lots")} Lots`
								: formatQuantity(stats.totalUnits, assetType)
							: "—"}
					</p>
					<p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate mt-0.5">
						{hasHoldings && assetType === "stock" && stockUnit === "lots"
							? `${formatQuantity(stats.totalUnits, "stock", "shares")} individual shares`
							: "Accumulated position size"}
					</p>
				</div>
			</div>
		</div>
	);
}
