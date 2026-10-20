import type {
	OpportunityCategory,
	ProcessedStock,
	StockTradePlan,
} from "../types";
import { fmtIDRNet, getIdxPriceTick, roundToIdxTick } from "../utils";

/**
 * Calculates intraday price spread / range percentage relative to day Low.
 * (High - Low) / Low * 100
 */
export function getIntradayRangePct(stock: ProcessedStock): number {
	if (!stock || stock.Low <= 0 || stock.High <= 0) return 0;
	return ((stock.High - stock.Low) / stock.Low) * 100;
}

/**
 * Calculates percentage distance to upper auto-rejection limit price (ARA).
 * Distance (%) = (ARALimitPrice - Close) / ARALimitPrice * 100
 */
export function getDistanceToAraPct(stock: ProcessedStock): number {
	if (!stock?.ARALimitPrice || stock.ARALimitPrice <= 0) return 999;
	return Math.max(
		0,
		((stock.ARALimitPrice - stock.Close) / stock.ARALimitPrice) * 100,
	);
}

/**
 * Calculates percentage bounce from day low.
 * Bounce (%) = (Close - Low) / Low * 100
 */
export function getBounceFromLowPct(stock: ProcessedStock): number {
	if (!stock || stock.Low <= 0) return 0;
	return ((stock.Close - stock.Low) / stock.Low) * 100;
}

/**
 * High Volatile (Scalp):
 * - Intraday price range >= 6.0% (plenty of room to capture 2-3% spread after broker fee/tax)
 * - Liquid: Value >= 5B IDR
 * - High trade velocity: Frequency >= 2,500 trades
 * - Safe from locked ARB: Close > Low and ARARisk !== "ARB"
 */
export function isHighVolatile(stock: ProcessedStock): boolean {
	if (!stock) return false;
	const rangePct = getIntradayRangePct(stock);
	return (
		rangePct >= 6.0 &&
		(stock.Value || 0) >= 5_000_000_000 &&
		(stock.Frequency || 0) >= 2_500 &&
		stock.Close > stock.Low &&
		stock.ARARisk !== "ARB"
	);
}

/**
 * Near ARA Hunter:
 * - Close is within 2.5% of ARA limit price OR intraday High touched/near ARA
 * - Strong upward momentum: ChangePct >= 8.0%
 * - Strong bid book support: BidOfferPressure >= 60%
 * - Not yet locked at ARA so trader can still execute
 */
export function isNearAra(stock: ProcessedStock): boolean {
	if (!stock?.ARALimitPrice || stock.ARALimitPrice <= 0) return false;
	if (stock.ARARisk === "ARA") return false;

	const isProximityMet =
		stock.Close >= stock.ARALimitPrice * 0.975 ||
		stock.High >= stock.ARALimitPrice;

	return (
		isProximityMet && stock.ChangePct >= 8.0 && stock.BidOfferPressure >= 60
	);
}

/**
 * Bandar Surge (Whale Haka):
 * - Large average ticket size (Whale block trade proxy): AvgValuePerTx >= 35M IDR
 * - Strong bid absorption dominance: BidOfferPressure >= 58%
 * - Minimum turnover: Value >= 3B IDR
 */
export function isBandarSurge(stock: ProcessedStock): boolean {
	if (!stock) return false;
	return (
		(stock.AvgValuePerTx || 0) >= 35_000_000 &&
		(stock.BidOfferPressure || 0) >= 58 &&
		(stock.Value || 0) >= 3_000_000_000
	);
}

/**
 * ARB Reversal (Floor Bounce):
 * - Tested auto-rejection floor: Low <= ARBLimitPrice
 * - Rebounded off day low: Close > Low
 * - Heavy absorption volume: Frequency >= 3,000 trades
 * - Substantial market interest: Value >= 3B IDR
 */
export function isArbReversal(stock: ProcessedStock): boolean {
	if (!stock?.ARBLimitPrice || stock.ARBLimitPrice <= 0) return false;
	return (
		stock.Low <= stock.ARBLimitPrice &&
		stock.Close > stock.Low &&
		(stock.Frequency || 0) >= 3_000 &&
		(stock.Value || 0) >= 3_000_000_000
	);
}

/**
 * Heavy Foreign / Stealth Accumulation:
 * - Net Foreign Buy >= 20B IDR OR (Multi-Day Foreign Inflow Streak >= 2D with ForeignNet >= 5B IDR and ForeignParticipation >= 15%)
 * - Quiet accumulation without excessive price spike: -1.5% <= ChangePct <= 4.0%
 */
export function isForeignAccumulation(stock: ProcessedStock): boolean {
	if (!stock) return false;
	const isControlledRange = stock.ChangePct >= -1.5 && stock.ChangePct <= 4.0;
	if (!isControlledRange) return false;

	const isDirectBlockInflow = (stock.ForeignNet || 0) >= 20_000_000_000;
	const isMultiDayStealthInflow =
		(stock.ForeignStreakDays || 0) >= 2 &&
		(stock.ForeignNet || 0) >= 5_000_000_000 &&
		(stock.ForeignParticipationPct || 0) >= 15;

	return isDirectBlockInflow || isMultiDayStealthInflow;
}

/**
 * 10D RVOL / Intraday High Breakout:
 * - Closing at day high OR breaking 10-day high with RVOL >= 1.5x
 * - Solid momentum: ChangePct >= 2.0%
 * - Volume expansion: Volume >= 10M shares (or Value >= 5B IDR)
 */
export function isBreakout(stock: ProcessedStock): boolean {
	if (!stock) return false;
	const isAtDayHigh = stock.High === stock.Close;
	const is10dBreakout =
		stock.High10D != null &&
		stock.High10D > 0 &&
		stock.Close >= stock.High10D * 0.995 &&
		(stock.RVOL ?? 1) >= 1.5 &&
		(stock.Value || 0) >= 5_000_000_000;

	return (
		(isAtDayHigh || is10dBreakout) &&
		stock.ChangePct >= 2.0 &&
		((stock.Volume || 0) >= 10_000_000 || (stock.Value || 0) >= 5_000_000_000)
	);
}

/**
 * Momentum:
 * - High percentage gain: ChangePct >= 4.0%
 * - High liquidity volume: Volume >= 50M shares
 */
export function isMomentum(stock: ProcessedStock): boolean {
	if (!stock) return false;
	return stock.ChangePct >= 4.0 && (stock.Volume || 0) >= 50_000_000;
}

/**
 * Blue Chip / Core Leader:
 * - Market Cap >= 40T IDR OR (Market Cap >= 20T and Value >= 25B IDR)
 */
export function isBlueChip(stock: ProcessedStock): boolean {
	if (!stock) return false;
	const cap = stock.MarketCap || 0;
	return (
		cap >= 40_000_000_000_000 ||
		(cap >= 20_000_000_000_000 && (stock.Value || 0) >= 25_000_000_000)
	);
}

/**
 * Value / Quality Leader:
 * - CompositeScore >= 60
 */
export function isValue(stock: ProcessedStock): boolean {
	if (!stock) return false;
	return (stock.CompositeScore || 0) >= 60;
}

/**
 * Strong Buy:
 * - CompositeScore > 80, ChangePct > 1.5%, ForeignNet > 20B IDR
 */
export function isStrongBuy(stock: ProcessedStock): boolean {
	if (!stock) return false;
	return (
		(stock.CompositeScore || 0) > 80 &&
		stock.ChangePct > 1.5 &&
		(stock.ForeignNet || 0) > 20_000_000_000
	);
}

/**
 * Weak Trend:
 * - CompositeScore < 40 and ChangePct < -2%
 */
export function isWeakTrend(stock: ProcessedStock): boolean {
	if (!stock) return false;
	return (stock.CompositeScore || 0) < 40 && stock.ChangePct < -2.0;
}

/**
 * Evaluates whether a stock matches a specific Opportunity category filter.
 */
export function matchesOpportunity(
	stock: ProcessedStock,
	category: OpportunityCategory,
): boolean {
	switch (category) {
		case "High Volatile":
			return isHighVolatile(stock);
		case "Near ARA":
			return isNearAra(stock);
		case "Bandar Accumulation":
			return isBandarSurge(stock);
		case "ARB Reversal":
			return isArbReversal(stock);
		case "Foreign Accumulation":
			return isForeignAccumulation(stock);
		case "Breakout":
			return isBreakout(stock);
		case "Momentum":
			return isMomentum(stock);
		case "Strong Buy":
			return isStrongBuy(stock);
		case "Blue Chip":
			return isBlueChip(stock);
		case "Value":
			return isValue(stock);
		case "Weak Trend":
			return isWeakTrend(stock);
		case "Watchlist":
			return true;
		default:
			return false;
	}
}

/**
 * Resolves a prioritized single Opportunity tag for the stock's primary badge in tables.
 */
export function resolvePrimaryOpportunity(
	stock: ProcessedStock,
): OpportunityCategory {
	if (isNearAra(stock)) return "Near ARA";
	if (isHighVolatile(stock)) return "High Volatile";
	if (isStrongBuy(stock)) return "Strong Buy";
	if (isForeignAccumulation(stock)) return "Foreign Accumulation";
	if (isBandarSurge(stock)) return "Bandar Accumulation";
	if (isArbReversal(stock)) return "ARB Reversal";
	if (isBreakout(stock)) return "Breakout";
	if (isMomentum(stock)) return "Momentum";
	if (isBlueChip(stock)) return "Blue Chip";
	if (isWeakTrend(stock)) return "Weak Trend";
	if (isValue(stock)) return "Value";
	return "Watchlist";
}

/**
 * Sorts stocks within an active category tab according to the most actionable metric.
 */
export function sortStocksForCategory(
	stocks: ProcessedStock[],
	category: OpportunityCategory,
): ProcessedStock[] {
	const list = [...stocks];
	switch (category) {
		case "High Volatile":
			return list.sort(
				(a, b) => getIntradayRangePct(b) - getIntradayRangePct(a),
			);
		case "Near ARA":
			return list.sort(
				(a, b) => getDistanceToAraPct(a) - getDistanceToAraPct(b),
			);
		case "Bandar Accumulation":
			return list.sort(
				(a, b) => (b.AvgValuePerTx || 0) - (a.AvgValuePerTx || 0),
			);
		case "ARB Reversal":
			return list.sort(
				(a, b) => getBounceFromLowPct(b) - getBounceFromLowPct(a),
			);
		case "Foreign Accumulation":
			return list.sort((a, b) => (b.ForeignNet || 0) - (a.ForeignNet || 0));
		case "Breakout":
			return list.sort(
				(a, b) =>
					(b.RVOL || 1) * (b.CompositeScore || 50) -
					(a.RVOL || 1) * (a.CompositeScore || 50),
			);
		default:
			return list.sort(
				(a, b) => (b.CompositeScore || 0) - (a.CompositeScore || 0),
			);
	}
}

/**
 * Returns contextual telemetry details to display in the scanner card's right column.
 */
export function getCategoryPrimaryMetric(
	stock: ProcessedStock,
	category: OpportunityCategory,
): { label: string; value: string; colorClass?: string } {
	switch (category) {
		case "High Volatile": {
			const range = getIntradayRangePct(stock);
			return {
				label: "Range",
				value: `+${range.toFixed(1)}%`,
				colorClass: "text-amber-700 bg-amber-50 border-amber-200",
			};
		}
		case "Near ARA": {
			const dist = getDistanceToAraPct(stock);
			return {
				label: "To ARA",
				value: dist <= 0.05 ? "At ARA" : `-${dist.toFixed(1)}%`,
				colorClass: "text-rose-700 bg-rose-50 border-rose-200",
			};
		}
		case "Bandar Accumulation": {
			const ticket = stock.AvgValuePerTx || 0;
			return {
				label: "Avg Tx",
				value: `Rp ${(ticket / 1e6).toFixed(1)}M`,
				colorClass: "text-purple-700 bg-purple-50 border-purple-200",
			};
		}
		case "ARB Reversal": {
			const bounce = getBounceFromLowPct(stock);
			return {
				label: "Bounce",
				value: `+${bounce.toFixed(1)}%`,
				colorClass: "text-orange-700 bg-orange-50 border-orange-200",
			};
		}
		case "Foreign Accumulation": {
			const streak = stock.ForeignStreakDays || 0;
			return {
				label: streak >= 2 ? `${streak}D Streak` : "Net Foreign",
				value: fmtIDRNet(stock.ForeignNet || 0),
				colorClass:
					stock.ForeignNet >= 0
						? "text-emerald-700 bg-emerald-50 border-emerald-200"
						: "text-rose-700 bg-rose-50 border-rose-200",
			};
		}
		case "Breakout": {
			const rvol = stock.RVOL ?? 1.0;
			return {
				label: rvol > 1.05 ? "RVOL" : "Score",
				value:
					rvol > 1.05
						? `${rvol.toFixed(1)}x`
						: String(stock.CompositeScore || 0),
				colorClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
			};
		}
		default: {
			return {
				label: "Score",
				value: String(stock.CompositeScore || 0),
				colorClass:
					stock.CompositeScore >= 80
						? "text-indigo-700 bg-indigo-50 border-indigo-200"
						: stock.CompositeScore >= 60
							? "text-emerald-700 bg-emerald-50 border-emerald-200"
							: "text-slate-700 bg-slate-100 border-slate-200",
			};
		}
	}
}

/**
 * Generates a tick-valid IDX mechanical trade setup blueprint (Entry Zone, Structural Stop-Loss,
 * 2R / 3R Targets, and Bucket Classification) anchored to session VWAP and support lows.
 */
export function calculateStockTradePlan(stock: ProcessedStock): StockTradePlan {
	const close = stock.Close || stock.Previous || 1000;
	const tick = getIdxPriceTick(close);
	const vwapRaw =
		stock.VWAP ||
		(stock.Volume > 0 ? stock.Value / stock.Volume : close) ||
		close;

	const entryLow = roundToIdxTick(Math.min(close, vwapRaw), "down");
	const entryHigh = roundToIdxTick(Math.max(close, vwapRaw), "up");

	const opp = stock.Opportunity;
	const isScalp =
		opp === "High Volatile" || opp === "Near ARA" || opp === "ARB Reversal";
	const isCore = opp === "Blue Chip" || opp === "Value";
	const setupBucket: "core" | "swing" | "scalp" = isCore
		? "core"
		: isScalp
			? "scalp"
			: "swing";

	// Determine structural stop-loss anchored to session Low / 10D Low, clamped to sensible risk band
	const sessionLow = stock.Low && stock.Low > 0 ? stock.Low : close;
	const structuralFloor = Math.max(1, sessionLow - tick);
	const minStopDistPct = isScalp ? 0.018 : 0.025; // 1.8% min for scalp, 2.5% for swing/core
	const maxStopDistPct = isScalp ? 0.035 : 0.055; // 3.5% max for scalp, 5.5% for swing/core

	const minStopPrice = roundToIdxTick(close * (1 - maxStopDistPct), "up");
	const maxStopPrice = roundToIdxTick(close * (1 - minStopDistPct), "down");

	let stopLoss = roundToIdxTick(
		Math.min(Math.max(structuralFloor, minStopPrice), maxStopPrice),
		"down",
	);
	if (stopLoss >= close) {
		stopLoss = Math.max(1, close - tick);
	}

	const riskPerShare = Math.max(tick, close - stopLoss);
	const rMult1 = isScalp ? 1.8 : 2.0;
	const rMult2 = isScalp ? 2.5 : 3.0;

	let target1 = roundToIdxTick(close + riskPerShare * rMult1, "up");
	let target2 = roundToIdxTick(close + riskPerShare * rMult2, "up");

	if (isScalp && stock.ARALimitPrice && stock.ARALimitPrice > close) {
		target1 = Math.min(target1, stock.ARALimitPrice);
		target2 = Math.min(target2, stock.ARALimitPrice);
	}

	if (target1 <= close) target1 = close + tick * 2;
	if (target2 <= target1) target2 = target1 + tick * 2;

	const stopLossPct =
		close > 0 ? Number((((stopLoss - close) / close) * 100).toFixed(2)) : 0;
	const target1Pct =
		close > 0 ? Number((((target1 - close) / close) * 100).toFixed(2)) : 0;
	const target2Pct =
		close > 0 ? Number((((target2 - close) / close) * 100).toFixed(2)) : 0;
	const riskRewardRatio =
		riskPerShare > 0
			? Number(((target1 - close) / riskPerShare).toFixed(2))
			: 2.0;

	let setupNote =
		"Accumulate near session VWAP; invalidate below structural session low.";
	if (opp === "Foreign Accumulation") {
		setupNote =
			"Institutional foreign accumulation active; bid pullbacks toward VWAP.";
	} else if (opp === "Breakout") {
		setupNote =
			"Momentum breakout on expanding turnover; trail stop below session VWAP.";
	} else if (opp === "Bandar Accumulation") {
		setupNote =
			"Elevated whale ticket size with bid absorption; hold above intraday low.";
	} else if (opp === "Blue Chip") {
		setupNote =
			"Core institutional leader; scale in via disciplined tranche sizing.";
	} else if (isScalp) {
		setupNote =
			"High-velocity tactical setup; enforce strict hard stop and lock partial gains at Target 1.";
	}

	return {
		entryLow,
		entryHigh,
		stopLoss,
		stopLossPct,
		target1,
		target1Pct,
		target2,
		target2Pct,
		riskRewardRatio,
		setupBucket,
		setupNote,
	};
}
