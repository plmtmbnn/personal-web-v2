"use client";

import { useMemo } from "react";
import { fmtIDRPrice, fmtSignedPct } from "../../stockpicks";

interface WatermarkChannelBarProps {
	buyPrice: number;
	currentPrice: number;
	highestPrice: number;
	lowestPrice: number;
	highestDate?: string;
	lowestDate?: string;
}

export default function WatermarkChannelBar({
	buyPrice,
	currentPrice,
	highestPrice,
	lowestPrice,
	highestDate,
	lowestDate,
}: WatermarkChannelBarProps) {
	// Guard invalid or empty prices
	const safeBuy = buyPrice > 0 ? buyPrice : 1;
	const safeCurrent = currentPrice > 0 ? currentPrice : safeBuy;
	const safeHigh = Math.max(highestPrice || safeBuy, safeBuy, safeCurrent);
	const safeLow =
		lowestPrice > 0
			? Math.min(lowestPrice, safeBuy, safeCurrent)
			: Math.min(safeBuy, safeCurrent);

	// Compute percentage distance relative to entry baseline
	const peakGainPct = ((safeHigh - safeBuy) / safeBuy) * 100;
	const maxDrawdownPct = ((safeLow - safeBuy) / safeBuy) * 100;
	const currentPlPct = ((safeCurrent - safeBuy) / safeBuy) * 100;

	// Total channel span from lowest trough to highest peak
	const channelSpan = safeHigh - safeLow;

	// Position of buy baseline and current price inside the channel (0% to 100%)
	const buyPositionPct = useMemo(() => {
		if (channelSpan <= 0) return 50;
		return Math.min(
			100,
			Math.max(0, ((safeBuy - safeLow) / channelSpan) * 100),
		);
	}, [safeBuy, safeLow, channelSpan]);

	const currentPositionPct = useMemo(() => {
		if (channelSpan <= 0) return 50;
		return Math.min(
			100,
			Math.max(0, ((safeCurrent - safeLow) / channelSpan) * 100),
		);
	}, [safeCurrent, safeLow, channelSpan]);

	return (
		<div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-3.5 sm:p-4 space-y-3">
			{/* Header Strip with Label and Current Range Status */}
			<div className="flex items-center justify-between text-[11px] font-bold">
				<span className="text-slate-500 uppercase tracking-wider">
					Tracing Channel
				</span>
				<div className="flex items-center gap-2">
					<span className="text-rose-600 font-mono">
						Min {fmtSignedPct(maxDrawdownPct)}
					</span>
					<span className="text-slate-300">/</span>
					<span className="text-emerald-600 font-mono">
						Max {fmtSignedPct(peakGainPct)}
					</span>
				</div>
			</div>

			{/* Continuous Watermark Visual Track */}
			<div className="relative pt-3 pb-2">
				{/* Track background */}
				<div className="h-2 w-full bg-slate-200 rounded-full relative overflow-hidden">
					{/* Drawdown zone (from Low to Buy) */}
					<div
						className="absolute top-0 bottom-0 bg-rose-200/90 rounded-l-full"
						style={{
							left: "0%",
							width: `${buyPositionPct}%`,
						}}
					/>
					{/* Profit zone (from Buy to High) */}
					<div
						className="absolute top-0 bottom-0 bg-emerald-200/90 rounded-r-full"
						style={{
							left: `${buyPositionPct}%`,
							width: `${100 - buyPositionPct}%`,
						}}
					/>
				</div>

				{/* Entry Price Marker Pin (Buy baseline) */}
				<div
					className="absolute top-1 -translate-x-1/2 flex flex-col items-center pointer-events-none"
					style={{ left: `${buyPositionPct}%` }}
					title={`Entry Price: ${fmtIDRPrice(safeBuy)}`}
				>
					<div className="w-1.5 h-4 bg-slate-800 rounded-full shadow-xs" />
				</div>

				{/* Current Price Marker Pin */}
				<div
					className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10"
					style={{ left: `${currentPositionPct}%` }}
					title={`Current Price: ${fmtIDRPrice(safeCurrent)} (${fmtSignedPct(currentPlPct)})`}
				>
					<div
						className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${
							currentPlPct >= 0 ? "bg-emerald-600" : "bg-rose-600"
						}`}
					/>
				</div>
			</div>

			{/* Numeric Watermark Footers */}
			<div className="grid grid-cols-3 text-[10px] sm:text-[11px] pt-1 border-t border-slate-200/50">
				{/* Low Watermark */}
				<div className="text-left">
					<p className="text-slate-400 font-semibold uppercase tracking-wider">
						Trough
					</p>
					<p className="font-mono font-bold text-slate-800">
						{fmtIDRPrice(safeLow)}
					</p>
					{lowestDate && (
						<p className="text-[9px] text-slate-400 truncate">{lowestDate}</p>
					)}
				</div>

				{/* Entry Price Baseline */}
				<div className="text-center">
					<p className="text-slate-400 font-semibold uppercase tracking-wider">
						Entry Baseline
					</p>
					<p className="font-mono font-bold text-slate-900">
						{fmtIDRPrice(safeBuy)}
					</p>
					<p className="text-[9px] text-slate-400">Baseline (0%)</p>
				</div>

				{/* High Watermark */}
				<div className="text-right">
					<p className="text-slate-400 font-semibold uppercase tracking-wider">
						Peak
					</p>
					<p className="font-mono font-bold text-slate-800">
						{fmtIDRPrice(safeHigh)}
					</p>
					{highestDate && (
						<p className="text-[9px] text-slate-400 truncate">{highestDate}</p>
					)}
				</div>
			</div>
		</div>
	);
}
