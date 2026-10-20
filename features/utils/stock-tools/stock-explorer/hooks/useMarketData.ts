import { useMemo } from "react";
import type {
	IDXStock,
	ProcessedStock,
	ScoreWeights,
	MarketHealth,
	AutoRejectionStatus,
	TickerHistoryRingBuffer,
	TickerHistorySession,
} from "../types";
import { getIdxSector } from "../data/mockData";
import { getTurnoverTier, getIdxAutoRejectionLimits } from "../utils";
import {
	resolvePrimaryOpportunity,
	calculateStockTradePlan,
} from "../utils/opportunityPredicates";

export function processIdxMarketData(
	rawData: IDXStock[],
	weights: ScoreWeights,
	tickerHistory10d?: TickerHistoryRingBuffer | null,
) {
	let totalForeignBuyVol = 0;
	let totalForeignSellVol = 0;
	let totalForeignNetVal = 0;
	let totalVolume = 0;
	let totalValue = 0;
	let advancers = 0;
	let decliners = 0;
	let unchanged = 0;
	let totalReturn = 0;
	let totalMarketCap = 0;
	let totalWeightedReturn = 0;

	const sortedHistoryDates = tickerHistory10d
		? Object.keys(tickerHistory10d).sort((a, b) => (a > b ? -1 : 1))
		: [];

	const processed: ProcessedStock[] = rawData.map((stock) => {
		const ChangePct =
			stock.Previous > 0 ? (stock.Change / stock.Previous) * 100 : 0;
		const MarketCap = (stock.ListedShares || 0) * (stock.Close || 0);

		// In IDX live TradingSummary API, ForeignBuy and ForeignSell are in SHARES (volume).
		// VWAP is used to calculate exact institutional IDR turnover.
		const vwap =
			stock.Volume > 0
				? stock.Value / stock.Volume
				: stock.Close || stock.Previous || 0;

		// Handle live volume shares vs mock nominal value if encountered
		const isForeignNominalValue = stock.ForeignBuy > stock.Volume * 5;
		const ForeignNetVol = isForeignNominalValue
			? vwap > 0
				? Math.round((stock.ForeignBuy - stock.ForeignSell) / vwap)
				: 0
			: stock.ForeignBuy - stock.ForeignSell;

		const ForeignNet = isForeignNominalValue
			? stock.ForeignBuy - stock.ForeignSell
			: ForeignNetVol * vwap;

		// Basic aggregations
		const buyVol = isForeignNominalValue
			? vwap > 0
				? Math.round(stock.ForeignBuy / vwap)
				: 0
			: stock.ForeignBuy;
		const sellVol = isForeignNominalValue
			? vwap > 0
				? Math.round(stock.ForeignSell / vwap)
				: 0
			: stock.ForeignSell;

		totalForeignBuyVol += buyVol;
		totalForeignSellVol += sellVol;
		totalForeignNetVal += ForeignNet;

		totalVolume += stock.Volume;
		totalValue += stock.Value;
		totalReturn += ChangePct;

		if (MarketCap > 0) {
			totalMarketCap += MarketCap;
			totalWeightedReturn += ChangePct * MarketCap;
		}

		if (stock.Change > 0) advancers++;
		else if (stock.Change < 0) decliners++;
		else unchanged++;

		// Multi-day ring buffer extraction for this ticker
		const code = stock.StockCode;
		const historyDesc: TickerHistorySession[] = [];
		for (const d of sortedHistoryDates) {
			const pt = tickerHistory10d?.[d]?.[code];
			if (pt) {
				historyDesc.push({ d, ...pt });
			}
		}

		// Ensure today's live session is at index 0 of historyDesc for accurate streak/5D calculation
		const todayDateStr = (stock.Date || "").split("T")[0] || "live";
		if (historyDesc.length === 0 || historyDesc[0].d !== todayDateStr) {
			historyDesc.unshift({
				d: todayDateStr,
				c: stock.Close || 0,
				h: stock.High || stock.Close || 0,
				l: stock.Low || stock.Close || 0,
				v: stock.Volume || 0,
				val: stock.Value || 0,
				f: stock.Frequency || 0,
				fn: ForeignNet,
			});
		}

		let ForeignStreakDays = 0;
		if (historyDesc.length > 0 && historyDesc[0].fn !== 0) {
			const isPos = historyDesc[0].fn > 0;
			for (const sess of historyDesc) {
				if (isPos && sess.fn > 0) ForeignStreakDays++;
				else if (!isPos && sess.fn < 0) ForeignStreakDays--;
				else break;
			}
		}

		const recent5 = historyDesc.slice(0, 5);
		const ForeignNet5D = recent5.reduce((sum, s) => sum + s.fn, 0);

		const priorSessions = historyDesc.slice(1, 10);
		const avgPriorValue =
			priorSessions.length > 0
				? priorSessions.reduce((sum, s) => sum + s.val, 0) /
					priorSessions.length
				: stock.Value || 1;
		const RVOL =
			avgPriorValue > 0
				? Number(((stock.Value || 0) / avgPriorValue).toFixed(2))
				: 1.0;

		const High10D = Math.max(
			stock.High || 0,
			...historyDesc.slice(0, 10).map((s) => s.h || 0),
		);
		const validLows = [
			stock.Low || 0,
			...historyDesc.slice(0, 10).map((s) => s.l || 0),
		].filter((l) => l > 0);
		const Low10D =
			validLows.length > 0 ? Math.min(...validLows) : stock.Low || 0;

		const oldest5 = recent5[recent5.length - 1];
		const Return5D =
			recent5.length > 1 && oldest5 && oldest5.c > 0
				? Number((((stock.Close - oldest5.c) / oldest5.c) * 100).toFixed(2))
				: Number(ChangePct.toFixed(2));

		const History10D = [...historyDesc.slice(0, 10)].reverse();

		// Microstructure & VWAP calculations
		const TurnoverTier = getTurnoverTier(stock.Value || 0);
		const VWAP = Math.round(vwap);
		const CloseToVwapPct =
			vwap > 0 ? Number((((stock.Close - vwap) / vwap) * 100).toFixed(2)) : 0;
		const CloseRangePosition =
			stock.High > stock.Low
				? Math.round(
						((stock.Close - stock.Low) / (stock.High - stock.Low)) * 100,
					)
				: 50;
		const ForeignParticipationPct =
			stock.Value > 0
				? Number(((ForeignNet / stock.Value) * 100).toFixed(1))
				: 0;

		const totalOrderVol = (stock.BidVolume || 0) + (stock.OfferVolume || 0);
		const BidOfferPressure =
			totalOrderVol > 0
				? Math.round(((stock.BidVolume || 0) / totalOrderVol) * 100)
				: 50;

		const AvgValuePerTx =
			stock.Frequency > 0 ? Math.round(stock.Value / stock.Frequency) : 0;

		const totalRegNego = (stock.Value || 0) + (stock.NonRegularValue || 0);
		const NegoRatio =
			totalRegNego > 0
				? Math.round(((stock.NonRegularValue || 0) / totalRegNego) * 100)
				: 0;

		// Institutional Microstructure Composite Score (0-100)
		// 1. Price & Close Strength (VWAP + Range Position + Momentum)
		const baseMomentum = Math.min(Math.max((ChangePct + 5) * 8, 0), 75);
		const vwapBonus = stock.Close >= vwap ? 12 : -8;
		const rangeStrengthBonus = ((CloseRangePosition - 50) / 50) * 13;
		const priceScore = Math.min(
			Math.max(baseMomentum + vwapBonus + rangeStrengthBonus, 0),
			100,
		);

		// 2. Turnover IDR Scale & Relative Turnover Velocity (RVOL) — eliminates Rp 50 penny-stock share bias
		const valIdr = stock.Value || 0;
		let turnoverBase = 0;
		if (valIdr >= 50_000_000_000) turnoverBase = 85;
		else if (valIdr >= 20_000_000_000)
			turnoverBase = 72 + ((valIdr - 20e9) / 30e9) * 13;
		else if (valIdr >= 5_000_000_000)
			turnoverBase = 55 + ((valIdr - 5e9) / 15e9) * 17;
		else if (valIdr >= 1_000_000_000)
			turnoverBase = 35 + ((valIdr - 1e9) / 4e9) * 20;
		else turnoverBase = (valIdr / 1_000_000_000) * 35;

		const rvolBoost = Math.min(Math.max((RVOL - 1.0) * 15, -10), 15);
		const volScore = Math.min(Math.max(turnoverBase + rvolBoost, 0), 100);

		// 3. Normalized Foreign Participation (% of Turnover + Multi-Day Streak + Scale)
		const participationDelta = Math.min(
			Math.max(ForeignParticipationPct * 0.9, -25),
			25,
		);
		const scaleDelta =
			ForeignNet >= 0
				? Math.min((ForeignNet / 30_000_000_000) * 15, 15)
				: -Math.min((Math.abs(ForeignNet) / 30_000_000_000) * 15, 15);
		const streakDelta = Math.min(Math.max(ForeignStreakDays * 3.5, -10), 10);
		const foreignScore = Math.min(
			Math.max(50 + participationDelta + scaleDelta + streakDelta, 0),
			100,
		);

		// 4. Order Book, Whale Ticket Size & Frequency
		const freqScore = Math.min(((stock.Frequency || 0) / 8_000) * 45, 45);
		const whaleScore = Math.min((AvgValuePerTx / 35_000_000) * 30, 30);
		const bookScore = (BidOfferPressure / 100) * 25;
		const liqScore = Math.min(
			Math.max(freqScore + whaleScore + bookScore, 0),
			100,
		);

		// 5. Volatility & Structural Quality
		let volaScore =
			100 - (Math.abs(stock.High - stock.Low) / (stock.Previous || 1)) * 400;
		if (stock.Close >= vwap && CloseRangePosition >= 65) {
			volaScore += 12;
		}
		volaScore = Math.min(Math.max(volaScore, 0), 100);

		const CompositeScore = Math.round(
			(priceScore * weights.price +
				volScore * weights.volume +
				foreignScore * weights.foreign +
				liqScore * weights.liquidity +
				volaScore * weights.volatility) /
				100,
		);

		const { araPrice, arbPrice } = getIdxAutoRejectionLimits(stock.Previous);

		let ARARisk: AutoRejectionStatus = "Normal";
		if (stock.Previous > 0) {
			if (stock.Change > 0) {
				// Upside tests (ARA)
				const isLockedAra =
					(araPrice > 0 && stock.Close >= araPrice) ||
					((stock.OfferVolume === 0 || stock.Offer === 0) &&
						araPrice > 0 &&
						stock.High >= araPrice &&
						stock.Close === stock.High);

				if (isLockedAra) {
					ARARisk = "ARA";
				} else if (
					araPrice > 0 &&
					(stock.High >= araPrice || stock.Close >= araPrice * 0.98)
				) {
					ARARisk = "Near ARA";
				}
			} else if (stock.Change < 0) {
				// Downside tests (ARB)
				const isLockedArb =
					(arbPrice > 0 && stock.Close <= arbPrice) ||
					((stock.BidVolume === 0 || stock.Bid === 0) &&
						arbPrice > 0 &&
						stock.Low <= arbPrice &&
						stock.Close === stock.Low);

				if (isLockedArb) {
					ARARisk = "ARB";
				} else if (
					arbPrice > 0 &&
					(stock.Low <= arbPrice || stock.Close <= arbPrice * 1.02)
				) {
					ARARisk = "Near ARB";
				}
			}
		}

		const baseStock: Omit<ProcessedStock, "Opportunity" | "TradePlan"> = {
			...stock,
			ForeignNet,
			ForeignNetVol,
			ChangePct,
			MarketCap,
			IsHighVolume:
				stock.Volume > 50000000 || (stock.Value || 0) >= 20_000_000_000,
			Sector: getIdxSector(stock.StockCode, stock.StockName),
			CompositeScore,
			Trend: ChangePct > 1 ? "Up" : ChangePct < -1 ? "Down" : "Sideways",
			TurnoverTier,
			BidOfferPressure,
			AvgValuePerTx,
			NegoRatio,
			ARALimitPrice: araPrice,
			ARBLimitPrice: arbPrice,
			ARARisk,
			VWAP,
			CloseToVwapPct,
			CloseRangePosition,
			ForeignParticipationPct,
			ForeignStreakDays,
			ForeignNet5D,
			RVOL,
			High10D,
			Low10D,
			Return5D,
			History10D,
		};

		const Opportunity = resolvePrimaryOpportunity(
			baseStock as unknown as ProcessedStock,
		);

		const withOpportunity: ProcessedStock = {
			...baseStock,
			Opportunity,
		};

		withOpportunity.TradePlan = calculateStockTradePlan(withOpportunity);

		return withOpportunity;
	});

	// Market Return: Cap-weighted return matches actual IHSG benchmark index
	const marketReturn =
		totalMarketCap > 0 ? totalWeightedReturn / totalMarketCap : 0;
	const avgReturn = rawData.length > 0 ? totalReturn / rawData.length : 0;

	const netForeignVolume = totalForeignBuyVol - totalForeignSellVol;
	const netForeignValue = totalForeignNetVal;

	// Market Sentiment 0-100 using logarithmic breadth scaling to avoid linear skew
	const adRatio = advancers / (decliners || 1);
	const logBreadthDelta = Math.log(Math.max(adRatio, 0.05)) * 14;
	const returnDelta = Math.min(Math.max(marketReturn * 14, -20), 20);
	const foreignDelta =
		Math.min(Math.max(netForeignValue / 500000000000, -1), 1) * 14;

	let sentimentScore = Math.round(
		50 + logBreadthDelta + returnDelta + foreignDelta,
	);
	sentimentScore = Math.min(Math.max(sentimentScore, 0), 100);

	let sentimentLabel = "Neutral";
	if (sentimentScore >= 80) sentimentLabel = "Strong Bullish";
	else if (sentimentScore >= 60) sentimentLabel = "Bullish";
	else if (sentimentScore <= 20) sentimentLabel = "Strong Bearish";
	else if (sentimentScore <= 40) sentimentLabel = "Bearish";

	const marketHealth: MarketHealth = {
		marketReturn,
		avgReturn,
		sentimentScore,
		sentimentLabel,
		netForeign: netForeignValue,
		netForeignValue,
		netForeignVolume,
		totalForeignBuy: totalForeignBuyVol,
		totalForeignSell: totalForeignSellVol,
		totalVolume,
		totalValue,
		advancers,
		decliners,
		unchanged,
	};

	return {
		processed,
		marketHealth,
	};
}

export function useMarketData(
	rawData: IDXStock[],
	weights: ScoreWeights,
	tickerHistory10d?: TickerHistoryRingBuffer | null,
) {
	return useMemo(
		() => processIdxMarketData(rawData, weights, tickerHistory10d),
		[rawData, weights, tickerHistory10d],
	);
}
