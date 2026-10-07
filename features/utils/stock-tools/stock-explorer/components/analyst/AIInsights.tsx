"use client";

import type { ProcessedStock } from "../../types";
import { fmtIDRNet, fmtIDRValue } from "../../utils";
import {
	Activity,
	Globe,
	Building2,
	Coins,
	Scale,
	BadgeDollarSign,
} from "lucide-react";

interface AIInsightsProps {
	stock: ProcessedStock;
}

export default function AIInsights({ stock }: AIInsightsProps) {
	const buildThesis = () => {
		const parts: string[] = [];

		// 1. Momentum & Technicals
		if (stock.ChangePct > 0) {
			if (stock.High === stock.Close && stock.ChangePct >= 2) {
				parts.push(
					`${stock.StockCode} printed a strong session closing at day high (+${stock.ChangePct.toFixed(2)}%), indicating aggressive buyers clearing overhead resistance.`,
				);
			} else {
				parts.push(
					`${stock.StockCode} advanced +${stock.ChangePct.toFixed(2)}% with an intraday range between ${stock.Low.toLocaleString()} and ${stock.High.toLocaleString()} IDR.`,
				);
			}
		} else if (stock.ChangePct < 0) {
			if (stock.Low === stock.Close && stock.ChangePct <= -2) {
				parts.push(
					`${stock.StockCode} closed at day low (${stock.ChangePct.toFixed(2)}%), signaling persistent supply pressure into the closing cross.`,
				);
			} else {
				parts.push(
					`${stock.StockCode} retreated ${stock.ChangePct.toFixed(2)}% in active trading, oscillating between ${stock.Low.toLocaleString()} and ${stock.High.toLocaleString()} IDR.`,
				);
			}
		} else {
			parts.push(
				`${stock.StockCode} closed flat at ${stock.Close.toLocaleString()} IDR with balanced order book flow.`,
			);
		}

		// 2. Institutional & Foreign Capital Footprint
		const absNetIDR = Math.abs(stock.ForeignNet);
		const participationPct =
			stock.Volume > 0
				? Math.min(
						Math.round(
							((stock.ForeignBuy + stock.ForeignSell) / stock.Volume) * 100,
						),
						100,
					)
				: 0;

		if (absNetIDR >= 20000000000) {
			if (stock.ForeignNet > 0) {
				parts.push(
					`Foreign institutions led accumulation with ${fmtIDRNet(stock.ForeignNet)} net inflow (${participationPct}% foreign market participation), confirming robust institutional support.`,
				);
			} else {
				parts.push(
					`Substantial foreign distribution was recorded at ${fmtIDRNet(stock.ForeignNet)} net outflow (${participationPct}% foreign participation), creating near-term supply overhang.`,
				);
			}
		} else if (absNetIDR >= 5000000000) {
			parts.push(
				`Moderate foreign flow registered ${fmtIDRNet(stock.ForeignNet)} net across regular trading (${participationPct}% foreign participation).`,
			);
		} else {
			parts.push(
				`Institutional foreign flow remained balanced (${fmtIDRNet(stock.ForeignNet)} net) with price discovery largely driven by domestic market participants.`,
			);
		}

		// 3. Order Book Depth & Whale Footprint (Microstructure)
		if (stock.BidOfferPressure >= 60) {
			parts.push(
				`Order book exhibits strong bid dominance (${stock.BidOfferPressure}% bids), signaling aggressive buy-side absorption.`,
			);
		} else if (stock.BidOfferPressure <= 40) {
			parts.push(
				`Offer side dominates the order book (${100 - stock.BidOfferPressure}% offers), indicating persistent overhead liquidity pressure.`,
			);
		}

		if (stock.AvgValuePerTx >= 35000000) {
			parts.push(
				`Average transaction ticket size is elevated at ${fmtIDRValue(stock.AvgValuePerTx)}/tx, indicating significant institutional block-order footprint.`,
			);
		}

		// 4. Valuation & Capitalization Tier
		const capTier =
			stock.MarketCap >= 100000000000000
				? "Tier-1 Mega Cap"
				: stock.MarketCap >= 40000000000000
					? "Big Cap Blue Chip"
					: stock.MarketCap >= 5000000000000
						? "Mid-Cap Growth"
						: "Small-Cap";

		parts.push(
			`Classified as a ${capTier} trading at ${stock.Fundamentals.PE.toFixed(1)}x P/E and ${stock.Fundamentals.PBV.toFixed(1)}x PBV with a ${stock.Fundamentals.ROE.toFixed(1)}% ROE profile.`,
		);

		return parts.join(" ");
	};

	// Calibrated Actionable Stance
	let rating = "NEUTRAL";
	let ratingColor = "bg-slate-100 text-slate-700 border-slate-200";

	if (stock.CompositeScore >= 75 && stock.ForeignNet > 0) {
		rating = "OVERWEIGHT";
		ratingColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
	} else if (
		stock.CompositeScore >= 65 ||
		stock.Opportunity === "Breakout" ||
		stock.Opportunity === "Momentum"
	) {
		rating = "TACTICAL BUY";
		ratingColor = "bg-indigo-50 text-indigo-700 border-indigo-200";
	} else if (
		stock.CompositeScore < 40 ||
		(stock.ForeignNet < -20000000000 && stock.ChangePct < -1.5)
	) {
		rating = "UNDERWEIGHT";
		ratingColor = "bg-rose-50 text-rose-700 border-rose-200";
	}

	const capTierTitle =
		stock.MarketCap >= 100000000000000
			? "Mega Cap"
			: stock.MarketCap >= 40000000000000
				? "Big Cap"
				: stock.MarketCap >= 5000000000000
					? "Mid Cap"
					: "Small Cap";

	const capTierThreshold =
		stock.MarketCap >= 100000000000000
			? "> 100T"
			: stock.MarketCap >= 40000000000000
				? "> 40T"
				: stock.MarketCap >= 5000000000000
					? "> 5T"
					: "< 5T";

	const valStance =
		stock.Fundamentals.PE < 10
			? "Undervalued"
			: stock.Fundamentals.PE > 25
				? "Growth Premium"
				: "Fair Value";

	return (
		<div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
				<div className="flex items-center gap-2.5">
					<div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
						<Activity className="w-4 h-4" />
					</div>
					<div>
						<h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
							Quantitative Signal Synthesis
						</h3>
						<p className="text-[10px] font-medium text-slate-500">
							Multi-factor algorithmic thesis
						</p>
					</div>
				</div>
				<span
					className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider border ${ratingColor}`}
				>
					{rating}
				</span>
			</div>

			{/* Institutional Narrative */}
			<p className="text-xs text-slate-700 leading-relaxed font-medium">
				{buildThesis()}
			</p>

			{/* 6-Factor Telemetry Strip - Responsive 2x3 Grid */}
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
				{/* Opportunity */}
				<div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between min-h-[72px]">
					<div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
						<Activity className="w-3.5 h-3.5 text-slate-400 shrink-0" />
						<span className="truncate">Opportunity</span>
					</div>
					<p
						className="text-xs sm:text-sm font-black text-indigo-600 truncate mt-1.5"
						title={stock.Opportunity}
					>
						{stock.Opportunity}
					</p>
				</div>

				{/* Foreign Net */}
				<div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between min-h-[72px]">
					<div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
						<Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
						<span className="truncate">Foreign Flow</span>
					</div>
					<p
						className={`text-xs sm:text-sm font-black mt-1.5 tabular-nums ${
							stock.ForeignNet > 0
								? "text-emerald-600"
								: stock.ForeignNet < 0
									? "text-rose-600"
									: "text-slate-600"
						}`}
					>
						{fmtIDRNet(stock.ForeignNet)}
					</p>
				</div>

				{/* Order Book */}
				<div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between min-h-[72px]">
					<div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
						<Scale className="w-3.5 h-3.5 text-slate-400 shrink-0" />
						<span className="truncate">Order Book</span>
					</div>
					<div className="flex items-baseline justify-between gap-1 mt-1.5">
						<span className="text-xs sm:text-sm font-black text-slate-900 tabular-nums">
							Bid {stock.BidOfferPressure}%
						</span>
						<span className="text-[10px] font-bold text-slate-400 tabular-nums">
							{100 - stock.BidOfferPressure}% Ask
						</span>
					</div>
				</div>

				{/* Whale Ticket (Avg/Tx) */}
				<div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between min-h-[72px]">
					<div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
						<BadgeDollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
						<span className="truncate">Whale Ticket</span>
					</div>
					<div className="flex items-baseline gap-1 mt-1.5">
						<span
							className={`text-xs sm:text-sm tabular-nums ${
								stock.AvgValuePerTx >= 35000000
									? "font-black text-indigo-600"
									: "font-black text-slate-900"
							}`}
						>
							{fmtIDRValue(stock.AvgValuePerTx)}
						</span>
						<span className="text-[10px] font-bold text-slate-400">
							/ trade
						</span>
					</div>
				</div>

				{/* Cap Tier */}
				<div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between min-h-[72px]">
					<div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
						<Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
						<span className="truncate">Cap Tier</span>
					</div>
					<div className="flex items-baseline justify-between gap-1 mt-1.5">
						<span className="text-xs sm:text-sm font-black text-slate-900 truncate">
							{capTierTitle}
						</span>
						<span className="text-[10px] font-bold text-slate-400 shrink-0 tabular-nums">
							{capTierThreshold}
						</span>
					</div>
				</div>

				{/* Valuation */}
				<div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between min-h-[72px]">
					<div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
						<Coins className="w-3.5 h-3.5 text-slate-400 shrink-0" />
						<span className="truncate">Valuation</span>
					</div>
					<div className="flex items-baseline justify-between gap-1 mt-1.5">
						<span className="text-xs sm:text-sm font-black text-slate-900 tabular-nums">
							{stock.Fundamentals.PE.toFixed(1)}x
						</span>
						<span className="text-[10px] font-bold text-slate-500 truncate">
							{valStance}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
