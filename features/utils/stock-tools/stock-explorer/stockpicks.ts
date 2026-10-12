"use client";

import type {
	ProcessedStock,
	StockPick,
	StockPickWithMetrics,
	SimulatorPortfolioSummary,
	StockPickExitReason,
	ClosedTradesFilter,
	ClosedTradesSummary,
	StockPickThesis,
} from "./types";

/**
 * Deterministic Indonesian Rupiah formatting with standard id-ID locale.
 * Never outputs fractional cents for clean readability (e.g., "Rp 9.800").
 */
export function fmtIDRPrice(val: number): string {
	if (val === undefined || val === null || Number.isNaN(val)) return "Rp 0";
	return `Rp ${Math.round(val).toLocaleString("id-ID")}`;
}

/**
 * Deterministic Signed Percentage formatting using en-US locale to prevent hydration drift.
 * (e.g., "+4.25%" or "-2.10%").
 */
export function fmtSignedPct(pct: number): string {
	if (pct === undefined || pct === null || Number.isNaN(pct)) return "0.00%";
	const prefix = pct > 0 ? "+" : "";
	return `${prefix}${pct.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}%`;
}

/**
 * Computes live metrics, running or realized P/L, watermark deltas, and risk telemetry for a simulated stock pick.
 */
export function calculatePickMetrics(
	pick: StockPick,
	liveStock?: ProcessedStock | null,
): StockPickWithMetrics {
	const isClosed = pick.status === "closed";
	const effectivePrice =
		isClosed && pick.closedPrice && pick.closedPrice > 0
			? pick.closedPrice
			: liveStock && liveStock.Close > 0
				? liveStock.Close
				: pick.buyPrice;

	const currentPrice = effectivePrice;
	const dayChange = liveStock?.Change ?? 0;
	const dayChangePct = liveStock?.ChangePct ?? 0;
	const dayHigh =
		liveStock && liveStock.High > 0 ? liveStock.High : currentPrice;
	const dayLow = liveStock && liveStock.Low > 0 ? liveStock.Low : currentPrice;

	const quantityLots = Math.max(1, pick.quantityLots || 1);
	const totalShares = quantityLots * 100;

	// Unrealized or Realized P/L
	const pnlPct =
		pick.buyPrice > 0
			? ((currentPrice - pick.buyPrice) / pick.buyPrice) * 100
			: 0;
	const pnlNominal = (currentPrice - pick.buyPrice) * totalShares;
	const simulatedOutlay = pick.buyPrice * totalShares;
	const currentMarketValue = currentPrice * totalShares;

	// Peak & Drawdown relative to Buy Price
	const peakPrice = Math.max(
		pick.highestPriceTraced || pick.buyPrice,
		pick.buyPrice,
	);
	const troughPrice =
		pick.lowestPriceTraced && pick.lowestPriceTraced > 0
			? Math.min(pick.lowestPriceTraced, pick.buyPrice)
			: pick.buyPrice;

	const peakGainPct =
		pick.buyPrice > 0 ? ((peakPrice - pick.buyPrice) / pick.buyPrice) * 100 : 0;
	const maxDrawdownPct =
		pick.buyPrice > 0
			? ((troughPrice - pick.buyPrice) / pick.buyPrice) * 100
			: 0;

	// Risk:Reward Ratio calculation
	let riskRewardRatio: number | undefined;
	if (
		pick.targetPrice &&
		pick.stopLossPrice &&
		pick.targetPrice > pick.buyPrice &&
		pick.buyPrice > pick.stopLossPrice
	) {
		const reward = pick.targetPrice - pick.buyPrice;
		const risk = pick.buyPrice - pick.stopLossPrice;
		if (risk > 0) {
			riskRewardRatio = Number((reward / risk).toFixed(2));
		}
	}

	// Calculate holding duration in elapsed calendar days
	const entryTs = pick.entryDate
		? new Date(pick.entryDate).getTime()
		: pick.createdAt;
	const endTs =
		isClosed && pick.closedDate
			? new Date(pick.closedDate).getTime()
			: Date.now();
	const holdingDays = Math.max(
		0,
		Math.floor((endTs - entryTs) / (1000 * 60 * 60 * 24)),
	);

	// Compass alignment: Score >= 60 or net foreign institutional accumulation
	const isCompassAligned =
		(liveStock?.CompositeScore ?? 0) >= 60 || (liveStock?.ForeignNet ?? 0) > 0;

	return {
		...pick,
		currentPrice,
		dayChange,
		dayChangePct,
		dayHigh,
		dayLow,
		unrealizedPlPct: isClosed ? (pick.realizedPlPct ?? pnlPct) : pnlPct,
		unrealizedPlNominal: isClosed
			? (pick.realizedPlNominal ?? pnlNominal)
			: pnlNominal,
		simulatedOutlay,
		currentMarketValue,
		peakGainPct,
		maxDrawdownPct,
		riskRewardRatio,
		holdingDays,
		compositeScore: liveStock?.CompositeScore,
		opportunity: liveStock?.Opportunity,
		isCompassAligned,
	};
}

/**
 * Traces live market quotes and continuously updates highest and lowest watermarks for open picks.
 */
export function traceAndUpdateWatermarks(
	picks: StockPick[],
	marketQuotes: ProcessedStock[] | Map<string, ProcessedStock>,
): {
	updatedPicks: StockPick[];
	hasChanges: boolean;
} {
	let hasChanges = false;
	const todayStr = new Date().toISOString().split("T")[0];
	const quotesMap =
		marketQuotes instanceof Map
			? marketQuotes
			: new Map(marketQuotes.map((s) => [s.StockCode, s]));

	const updatedPicks = picks.map((pick) => {
		if (pick.status === "closed") return pick;

		const live = quotesMap.get(pick.stockCode);
		if (!live || live.Close <= 0) return pick;

		const currentPrice = live.Close;
		const currentSessionHigh = live.High > 0 ? live.High : currentPrice;
		const currentSessionLow = live.Low > 0 ? live.Low : currentPrice;

		let newHighest = pick.highestPriceTraced || pick.buyPrice;
		let highestDate = pick.highestPriceDate;
		let newLowest =
			pick.lowestPriceTraced && pick.lowestPriceTraced > 0
				? pick.lowestPriceTraced
				: pick.buyPrice;
		let lowestDate = pick.lowestPriceDate;
		let pickChanged = false;

		const sessionDate = live.Date || todayStr;

		// Check if new peak was set
		if (currentSessionHigh > newHighest) {
			newHighest = currentSessionHigh;
			highestDate = sessionDate;
			pickChanged = true;
		}

		// Check if new trough was reached
		if (currentSessionLow < newLowest) {
			newLowest = currentSessionLow;
			lowestDate = sessionDate;
			pickChanged = true;
		}

		if (pickChanged) {
			hasChanges = true;
			return {
				...pick,
				highestPriceTraced: newHighest,
				highestPriceDate: highestDate,
				lowestPriceTraced: newLowest,
				lowestPriceDate: lowestDate,
				updatedAt: Date.now(),
			};
		}

		return pick;
	});

	return { updatedPicks, hasChanges };
}

/**
 * Aggregates overall portfolio summary across active open positions.
 */
export function calculatePortfolioSummary(
	picksWithMetrics: StockPickWithMetrics[],
): SimulatorPortfolioSummary {
	const activePicksList = picksWithMetrics.filter((p) => p.status === "active");
	const closedPicksList = picksWithMetrics.filter((p) => p.status === "closed");

	let totalSimulatedCapital = 0;
	let totalCurrentValue = 0;
	let totalUnrealizedPlNominal = 0;
	let winningPicks = 0;
	let losingPicks = 0;

	let bestPerformer: { stockCode: string; plPct: number } | undefined;
	let worstPerformer: { stockCode: string; plPct: number } | undefined;

	for (const pick of activePicksList) {
		totalSimulatedCapital += pick.simulatedOutlay;
		totalCurrentValue += pick.currentMarketValue;
		totalUnrealizedPlNominal += pick.unrealizedPlNominal;

		if (pick.unrealizedPlPct > 0) {
			winningPicks++;
		} else if (pick.unrealizedPlPct < 0) {
			losingPicks++;
		}

		if (!bestPerformer || pick.unrealizedPlPct > bestPerformer.plPct) {
			bestPerformer = {
				stockCode: pick.stockCode,
				plPct: pick.unrealizedPlPct,
			};
		}
		if (!worstPerformer || pick.unrealizedPlPct < worstPerformer.plPct) {
			worstPerformer = {
				stockCode: pick.stockCode,
				plPct: pick.unrealizedPlPct,
			};
		}
	}

	const activeCount = activePicksList.length;
	const winRatePct =
		activeCount > 0 ? Math.round((winningPicks / activeCount) * 100) : 0;
	const totalUnrealizedPlPct =
		totalSimulatedCapital > 0
			? (totalUnrealizedPlNominal / totalSimulatedCapital) * 100
			: 0;

	return {
		totalPicks: picksWithMetrics.length,
		activePicks: activeCount,
		closedPicks: closedPicksList.length,
		winningPicks,
		losingPicks,
		winRatePct,
		totalSimulatedCapital,
		totalCurrentValue,
		totalUnrealizedPlNominal,
		totalUnrealizedPlPct,
		bestPerformer,
		worstPerformer,
	};
}

/**
 * Filter closed trades list based on user selections.
 */
export function filterClosedTrades(
	closedPicks: StockPickWithMetrics[],
	filter: ClosedTradesFilter,
): StockPickWithMetrics[] {
	const now = Date.now();
	const dayMs = 1000 * 60 * 60 * 24;

	return closedPicks
		.filter((p) => {
			if (p.status !== "closed") return false;

			// Search query (ticker or company name)
			if (filter.search.trim()) {
				const q = filter.search.toLowerCase().trim();
				const matchesTicker = p.stockCode.toLowerCase().includes(q);
				const matchesName = p.stockName.toLowerCase().includes(q);
				if (!matchesTicker && !matchesName) return false;
			}

			// Thesis
			if (filter.thesis !== "all" && p.thesis !== filter.thesis) {
				return false;
			}

			// Exit Reason
			if (filter.exitReason !== "all" && p.exitReason !== filter.exitReason) {
				return false;
			}

			// Outcome (win vs loss)
			const pnl = p.realizedPlPct ?? p.unrealizedPlPct;
			if (filter.outcome === "win" && pnl <= 0) return false;
			if (filter.outcome === "loss" && pnl >= 0) return false;

			// Time horizon relative to closedDate
			if (filter.horizon !== "all" && p.closedDate) {
				const closedTs = new Date(p.closedDate).getTime();
				const elapsedDays = (now - closedTs) / dayMs;

				if (filter.horizon === "30d" && elapsedDays > 30) return false;
				if (filter.horizon === "90d" && elapsedDays > 90) return false;
				if (filter.horizon === "ytd") {
					const closedYear = new Date(p.closedDate).getFullYear();
					const currentYear = new Date().getFullYear();
					if (closedYear !== currentYear) return false;
				}
			}

			return true;
		})
		.sort((a, b) => {
			if (filter.sortBy === "exit_date_desc") {
				return (
					(b.closedDate ? new Date(b.closedDate).getTime() : b.updatedAt) -
					(a.closedDate ? new Date(a.closedDate).getTime() : a.updatedAt)
				);
			}
			if (filter.sortBy === "exit_date_asc") {
				return (
					(a.closedDate ? new Date(a.closedDate).getTime() : a.updatedAt) -
					(b.closedDate ? new Date(b.closedDate).getTime() : b.updatedAt)
				);
			}
			if (filter.sortBy === "pnl_desc") {
				const pnlA = a.realizedPlPct ?? a.unrealizedPlPct;
				const pnlB = b.realizedPlPct ?? b.unrealizedPlPct;
				return pnlB - pnlA;
			}
			if (filter.sortBy === "pnl_asc") {
				const pnlA = a.realizedPlPct ?? a.unrealizedPlPct;
				const pnlB = b.realizedPlPct ?? b.unrealizedPlPct;
				return pnlA - pnlB;
			}
			if (filter.sortBy === "duration_desc") {
				return b.holdingDays - a.holdingDays;
			}
			return 0;
		});
}

/**
 * Calculates historical performance summary and attribution metrics for closed trades.
 */
export function calculateClosedTradesSummary(
	filteredClosedTrades: StockPickWithMetrics[],
): ClosedTradesSummary {
	const totalClosed = filteredClosedTrades.length;
	let winningTrades = 0;
	let losingTrades = 0;
	let totalRealizedPlNominal = 0;
	let totalCapital = 0;
	let grossGains = 0;
	let grossLosses = 0;
	let sumWinPct = 0;
	let sumLossPct = 0;
	let totalHoldingDays = 0;

	let bestTrade:
		| { stockCode: string; plPct: number; nominal: number }
		| undefined;
	let worstTrade:
		| { stockCode: string; plPct: number; nominal: number }
		| undefined;

	// Attribution dictionaries
	const thesisMap = new Map<
		StockPickThesis,
		{ count: number; wins: number; nominal: number }
	>();
	const exitReasonMap = new Map<
		StockPickExitReason,
		{ count: number; wins: number; nominal: number }
	>();

	for (const trade of filteredClosedTrades) {
		const pnlPct = trade.realizedPlPct ?? trade.unrealizedPlPct;
		const pnlNominal = trade.realizedPlNominal ?? trade.unrealizedPlNominal;
		totalRealizedPlNominal += pnlNominal;
		totalCapital += trade.simulatedOutlay;
		totalHoldingDays += trade.holdingDays;

		if (pnlPct > 0) {
			winningTrades++;
			grossGains += pnlNominal;
			sumWinPct += pnlPct;
		} else if (pnlPct < 0) {
			losingTrades++;
			grossLosses += Math.abs(pnlNominal);
			sumLossPct += pnlPct;
		}

		if (!bestTrade || pnlPct > bestTrade.plPct) {
			bestTrade = {
				stockCode: trade.stockCode,
				plPct: pnlPct,
				nominal: pnlNominal,
			};
		}
		if (!worstTrade || pnlPct < worstTrade.plPct) {
			worstTrade = {
				stockCode: trade.stockCode,
				plPct: pnlPct,
				nominal: pnlNominal,
			};
		}

		// Thesis mapping
		const th = trade.thesis || "Custom";
		const thData = thesisMap.get(th) || { count: 0, wins: 0, nominal: 0 };
		thData.count++;
		if (pnlPct > 0) thData.wins++;
		thData.nominal += pnlNominal;
		thesisMap.set(th, thData);

		// Exit Reason mapping
		if (trade.exitReason) {
			const erData = exitReasonMap.get(trade.exitReason) || {
				count: 0,
				wins: 0,
				nominal: 0,
			};
			erData.count++;
			if (pnlPct > 0) erData.wins++;
			erData.nominal += pnlNominal;
			exitReasonMap.set(trade.exitReason, erData);
		}
	}

	const winRatePct =
		totalClosed > 0 ? Math.round((winningTrades / totalClosed) * 100) : 0;
	const totalRealizedPlPct =
		totalCapital > 0 ? (totalRealizedPlNominal / totalCapital) * 100 : 0;
	const profitFactor =
		grossLosses > 0
			? Number((grossGains / grossLosses).toFixed(2))
			: grossGains > 0
				? 99.99
				: 0;
	const avgHoldingDays =
		totalClosed > 0 ? Math.round(totalHoldingDays / totalClosed) : 0;
	const avgWinPct = winningTrades > 0 ? sumWinPct / winningTrades : 0;
	const avgLossPct = losingTrades > 0 ? sumLossPct / losingTrades : 0;

	// Sort thesis breakdown by count desc
	const thesisBreakdown = Array.from(thesisMap.entries())
		.map(([thesis, data]) => ({
			thesis,
			count: data.count,
			winRate: data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0,
			totalPlNominal: data.nominal,
		}))
		.sort((a, b) => b.count - a.count);

	// Sort exit reason breakdown by count desc
	const exitReasonBreakdown = Array.from(exitReasonMap.entries())
		.map(([reason, data]) => ({
			reason,
			count: data.count,
			winRate: data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0,
			totalPlNominal: data.nominal,
		}))
		.sort((a, b) => b.count - a.count);

	return {
		totalClosed,
		winningTrades,
		losingTrades,
		winRatePct,
		totalRealizedPlNominal,
		totalRealizedPlPct,
		profitFactor,
		avgHoldingDays,
		avgWinPct,
		avgLossPct,
		bestTrade,
		worstTrade,
		thesisBreakdown,
		exitReasonBreakdown,
	};
}

/**
 * Returns formatted label and tone for each exit reason.
 */
export function getExitReasonBadge(reason?: StockPickExitReason): {
	label: string;
	tone: "emerald" | "rose" | "blue" | "amber" | "slate";
} {
	switch (reason) {
		case "target_hit":
			return { label: "Target Hit", tone: "emerald" };
		case "trailing_stop":
			return { label: "Trailing Stop", tone: "blue" };
		case "manual_profit":
			return { label: "Discretionary Profit", tone: "emerald" };
		case "stop_loss_hit":
			return { label: "Stop Loss Hit", tone: "rose" };
		case "thesis_invalidated":
			return { label: "Thesis Invalidated", tone: "amber" };
		case "manual_cut":
			return { label: "Discretionary Cut", tone: "slate" };
		default:
			return { label: "Closed", tone: "slate" };
	}
}

/**
 * Pre-calibrated demo picks including active positions and historical closed positions.
 */
export const DEFAULT_DEMO_PICKS: StockPick[] = [
	{
		id: "11111111-1111-4111-8111-111111111111",
		stockCode: "BBCA",
		stockName: "Bank Central Asia Tbk",
		sector: "Banking",
		buyPrice: 9800,
		quantityLots: 10,
		entryDate: "2026-09-15",
		targetPrice: 11000,
		stopLossPrice: 9400,
		thesis: "Compass Core Tranche",
		notes:
			"High-conviction Tier-1 private bank institutional accumulation tranche.",
		highestPriceTraced: 10450,
		highestPriceDate: "2026-10-02",
		lowestPriceTraced: 9650,
		lowestPriceDate: "2026-09-20",
		status: "active",
		createdAt: 1726358400000,
		updatedAt: 1727827200000,
	},
	{
		id: "22222222-2222-4222-8222-222222222222",
		stockCode: "ADRO",
		stockName: "Alamtri Resources Indonesia Tbk",
		sector: "Energy",
		buyPrice: 3650,
		quantityLots: 25,
		entryDate: "2026-09-22",
		targetPrice: 4200,
		stopLossPrice: 3400,
		thesis: "Value Accumulation",
		notes:
			"Energy sector bellwether with strong cash dividend yield and spin-off catalyst.",
		highestPriceTraced: 3980,
		highestPriceDate: "2026-10-05",
		lowestPriceTraced: 3580,
		lowestPriceDate: "2026-09-25",
		status: "active",
		createdAt: 1726963200000,
		updatedAt: 1728086400000,
	},
	{
		id: "33333333-3333-4333-8333-333333333333",
		stockCode: "ICBP",
		stockName: "Indofood CBP Sukses Makmur Tbk",
		sector: "Consumer",
		buyPrice: 11200,
		quantityLots: 10,
		entryDate: "2026-09-28",
		targetPrice: 12500,
		stopLossPrice: 10600,
		thesis: "Compass Core Tranche",
		notes:
			"Consumer defensive hedge during macro volatility expansion and USD/IDR stress.",
		highestPriceTraced: 11650,
		highestPriceDate: "2026-10-08",
		lowestPriceTraced: 11050,
		lowestPriceDate: "2026-09-30",
		status: "active",
		createdAt: 1727481600000,
		updatedAt: 1728345600000,
	},
	{
		id: "44444444-4444-4444-8444-444444444444",
		stockCode: "ASII",
		stockName: "Astra International Tbk",
		sector: "Industrials",
		buyPrice: 5000,
		quantityLots: 20,
		entryDate: "2026-09-01",
		targetPrice: 5400,
		stopLossPrice: 4800,
		thesis: "Compass Core Tranche",
		notes: "Target reached as automotive market volume rebounded.",
		highestPriceTraced: 5450,
		highestPriceDate: "2026-09-28",
		lowestPriceTraced: 4920,
		lowestPriceDate: "2026-09-05",
		status: "closed",
		closedPrice: 5400,
		closedDate: "2026-09-28",
		realizedPlPct: 8.0,
		realizedPlNominal: 800000,
		exitReason: "target_hit",
		exitNotes: "Executed planned take-profit right at the resistance zone.",
		createdAt: 1725148800000,
		updatedAt: 1727481600000,
	},
	{
		id: "55555555-5555-4555-8555-555555555555",
		stockCode: "TLKM",
		stockName: "Telkom Indonesia Tbk",
		sector: "Infrastructure",
		buyPrice: 3200,
		quantityLots: 30,
		entryDate: "2026-09-05",
		targetPrice: 3550,
		stopLossPrice: 3080,
		thesis: "Value Accumulation",
		notes:
			"Stopped out as mobile data price competition pressured quarterly margins.",
		highestPriceTraced: 3280,
		highestPriceDate: "2026-09-12",
		lowestPriceTraced: 3060,
		lowestPriceDate: "2026-09-22",
		status: "closed",
		closedPrice: 3080,
		closedDate: "2026-09-22",
		realizedPlPct: -3.75,
		realizedPlNominal: -360000,
		exitReason: "stop_loss_hit",
		exitNotes: "Strictly executed stop loss floor to protect capital.",
		createdAt: 1725494400000,
		updatedAt: 1726963200000,
	},
];
