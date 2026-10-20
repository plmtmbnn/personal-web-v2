"use client";

import { useState } from "react";
import {
	Pencil,
	Trash2,
	CheckCircle2,
	BarChart3,
	Compass,
	Target,
	ShieldAlert,
	RotateCcw,
	Calendar,
	Layers,
} from "lucide-react";
import type { StockPickWithMetrics } from "../../types";
import { fmtIDRPrice, fmtSignedPct } from "../../stockpicks";
import WatermarkChannelBar from "./WatermarkChannelBar";

interface StockpickCardProps {
	pick: StockPickWithMetrics;
	onEdit: (pick: StockPickWithMetrics) => void;
	onDelete: (id: string) => void;
	onClosePosition: (id: string, exitPrice?: number) => void;
	onOpenCloseModal?: (pick: StockPickWithMetrics) => void;
	onResetWatermarks: (id: string, currentPrice?: number) => void;
	onInspectStock?: (stockCode: string) => void;
}

export default function StockpickCard({
	pick,
	onEdit,
	onDelete,
	onClosePosition,
	onOpenCloseModal,
	onResetWatermarks,
	onInspectStock,
}: StockpickCardProps) {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const isProfit = pick.unrealizedPlNominal >= 0;

	return (
		<div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all p-5 sm:p-6 flex flex-col justify-between space-y-5">
			{/* 1. Header Row */}
			<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
				<div>
					<div className="flex flex-wrap items-center gap-2">
						<h4 className="text-xl font-bold font-mono text-slate-900 tracking-tight">
							{pick.stockCode}
						</h4>
						<span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
							{pick.sector}
						</span>
						{pick.thesis && (
							<span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700">
								<Compass className="w-3 h-3 text-indigo-500" />
								<span>{pick.thesis}</span>
							</span>
						)}
						{pick.bucket && (
							<span
								className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
									pick.bucket === "core"
										? "bg-blue-50 text-blue-700 border-blue-200/80"
										: "bg-amber-50 text-amber-700 border-amber-200/80"
								}`}
							>
								{pick.bucket === "core" ? "Core Bucket" : "Swing Bucket"}
							</span>
						)}
						{pick.alertStatus === "stop_breached" && (
							<span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-600 text-white shadow-2xs">
								<ShieldAlert className="w-3 h-3" />
								<span>Stop Breached</span>
							</span>
						)}
						{pick.alertStatus === "target_hit" && (
							<span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-2xs">
								<Target className="w-3 h-3" />
								<span>Target Hit</span>
							</span>
						)}
						{pick.alertStatus === "trailing_protect" && (
							<span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
								<span>Trailing Protect</span>
							</span>
						)}
						{pick.status === "closed" && (
							<span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
								Closed
							</span>
						)}
					</div>
					<p className="text-xs font-medium text-slate-500 mt-1 truncate max-w-sm">
						{pick.stockName}
					</p>
				</div>

				{/* Header Actions */}
				<div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
					{onInspectStock && (
						<button
							type="button"
							onClick={() => onInspectStock(pick.stockCode)}
							className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
							title="Inspect order book & analytics in Drawer"
						>
							<BarChart3 className="w-4 h-4" />
						</button>
					)}
					<button
						type="button"
						onClick={() => onEdit(pick)}
						className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
						title="Edit entry price & parameters"
					>
						<Pencil className="w-4 h-4" />
					</button>
					{pick.status === "active" && (
						<button
							type="button"
							onClick={() =>
								onOpenCloseModal
									? onOpenCloseModal(pick)
									: onClosePosition(pick.id, pick.currentPrice)
							}
							className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
							title="Close position & mark outcome"
						>
							<CheckCircle2 className="w-4 h-4" />
						</button>
					)}
					<button
						type="button"
						onClick={() => onResetWatermarks(pick.id, pick.currentPrice)}
						className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
						title="Reset watermarks to current price"
					>
						<RotateCcw className="w-4 h-4" />
					</button>
					{showDeleteConfirm ? (
						<div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg p-1">
							<button
								type="button"
								onClick={() => onDelete(pick.id)}
								className="text-[10px] font-bold text-rose-700 px-1.5 py-0.5 hover:bg-rose-100 rounded cursor-pointer"
							>
								Confirm
							</button>
							<button
								type="button"
								onClick={() => setShowDeleteConfirm(false)}
								className="text-[10px] text-slate-400 px-1 hover:text-slate-600 cursor-pointer"
							>
								✕
							</button>
						</div>
					) : (
						<button
							type="button"
							onClick={() => setShowDeleteConfirm(true)}
							className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
							title="Delete simulated pick"
						>
							<Trash2 className="w-4 h-4" />
						</button>
					)}
				</div>
			</div>

			{/* 2. Core Numerical Strip (Entry vs Live vs Running Return) */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50/70 border border-slate-100 rounded-2xl">
				{/* Entry Price */}
				<div>
					<div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
						<Layers className="w-3 h-3 text-slate-400" />
						<span>Entry Price</span>
					</div>
					<div className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5">
						{fmtIDRPrice(pick.buyPrice)}
					</div>
					<div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium mt-0.5">
						<Calendar className="w-3 h-3 text-slate-400" />
						<span>{pick.entryDate}</span>
						<span>({pick.holdingDays}d held)</span>
					</div>
				</div>

				{/* Current Live Price */}
				<div>
					<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
						Live Quote
					</span>
					<div className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-0.5">
						{fmtIDRPrice(pick.currentPrice)}
					</div>
					<div className="flex items-center gap-1 text-[10px] font-mono font-semibold mt-0.5">
						<span
							className={
								pick.dayChange >= 0 ? "text-emerald-600" : "text-rose-600"
							}
						>
							{pick.dayChange >= 0 ? "+" : ""}
							{fmtIDRPrice(pick.dayChange)} ({fmtSignedPct(pick.dayChangePct)})
						</span>
						<span className="text-slate-400">today</span>
					</div>
				</div>

				{/* Running Paper P/L */}
				<div>
					<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
						Running Paper P/L
					</span>
					<div
						className={`text-base sm:text-lg font-bold font-mono mt-0.5 ${
							isProfit ? "text-emerald-600" : "text-rose-600"
						}`}
					>
						{fmtSignedPct(pick.unrealizedPlPct)}
					</div>
					<div
						className={`text-[10px] font-mono font-semibold mt-0.5 ${
							isProfit ? "text-emerald-600" : "text-rose-600"
						}`}
					>
						{isProfit ? "+" : ""}
						{fmtIDRPrice(pick.unrealizedPlNominal)} ({pick.quantityLots} lots)
					</div>
				</div>
			</div>

			{/* 3. Continuous Watermark Channel Bar */}
			<WatermarkChannelBar
				buyPrice={pick.buyPrice}
				currentPrice={pick.currentPrice}
				highestPrice={pick.highestPriceTraced}
				lowestPrice={pick.lowestPriceTraced}
				highestDate={pick.highestPriceDate}
				lowestDate={pick.lowestPriceDate}
			/>

			{/* 4. Target, Stop Loss & Thesis Footers (if configured) */}
			{(pick.targetPrice || pick.stopLossPrice || pick.notes) && (
				<div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
					<div className="flex flex-wrap items-center gap-2">
						{pick.targetPrice && (
							<span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
								<Target className="w-3 h-3 text-emerald-600" />
								<span>TP: {fmtIDRPrice(pick.targetPrice)}</span>
							</span>
						)}
						{pick.stopLossPrice && (
							<span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-md">
								<ShieldAlert className="w-3 h-3 text-rose-600" />
								<span>SL: {fmtIDRPrice(pick.stopLossPrice)}</span>
							</span>
						)}
						{pick.riskRewardRatio && (
							<span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
								RRR {pick.riskRewardRatio}:1
							</span>
						)}
					</div>

					{pick.notes && (
						<p className="text-[11px] text-slate-500 italic max-w-md truncate">
							"{pick.notes}"
						</p>
					)}
				</div>
			)}
		</div>
	);
}
