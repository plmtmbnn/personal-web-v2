import { useMemo } from "react";
import type {
	IDXStock,
	ProcessedStock,
	OpportunityCategory,
	ScoreWeights,
	MarketHealth,
	AutoRejectionStatus,
} from "../types";
import { getMockSector, getMockFundamentals } from "../data/mockData";
import { getTurnoverTier, getIdxAutoRejectionLimits } from "../utils";

export function useMarketData(rawData: IDXStock[], weights: ScoreWeights) {
	return useMemo(() => {
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

			// Calculate composite score using dynamic weights
			const priceScore = Math.min(Math.max((ChangePct + 5) * 10, 0), 100); // Scale -5% to +5% into 0-100
			const volScore =
				stock.Volume > 100000000 ? 100 : (stock.Volume / 100000000) * 100;
			const foreignScore =
				ForeignNet > 0
					? 50 + Math.min((ForeignNet / 50000000000) * 50, 50)
					: 50 - Math.min((Math.abs(ForeignNet) / 50000000000) * 50, 50);
			const liqScore =
				stock.Frequency > 10000 ? 100 : (stock.Frequency / 10000) * 100;
			// Eased volatility multiplier from 1000 to 500 to account for IDX ARA/ARB limits
			let volaScore =
				100 - (Math.abs(stock.High - stock.Low) / (stock.Previous || 1)) * 500;
			volaScore = Math.min(Math.max(volaScore, 0), 100);

			const CompositeScore = Math.round(
				(priceScore * weights.price +
					volScore * weights.volume +
					foreignScore * weights.foreign +
					liqScore * weights.liquidity +
					volaScore * weights.volatility) /
					100,
			);

			// Microstructure & Bandarmology calculations
			const TurnoverTier = getTurnoverTier(stock.Value || 0);

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

			// IDX Opportunity Categorization calibrated to realistic institutional flows & setups
			let Opportunity: OpportunityCategory = "Watchlist";
			if (CompositeScore > 80 && ChangePct > 1.5 && ForeignNet > 20000000000) {
				// Institutional accumulation with positive momentum (>20B IDR net)
				Opportunity = "Strong Buy";
			} else if (ForeignNet > 50000000000 && ChangePct < 2) {
				// Heavy quiet institutional accumulation (>50B IDR net)
				Opportunity = "Foreign Accumulation";
			} else if (
				AvgValuePerTx >= 35000000 &&
				BidOfferPressure >= 58 &&
				stock.Value >= 3000000000
			) {
				// Institutional block size proxy + strong bid dominance
				Opportunity = "Bandar Accumulation";
			} else if (
				stock.Low <= arbPrice &&
				stock.Close > stock.Low &&
				stock.Frequency >= 3000 &&
				arbPrice > 0
			) {
				// Intraday bounce/reversal from Auto-Rejection Floor
				Opportunity = "ARB Reversal";
			} else if (
				stock.High === stock.Close &&
				ChangePct > 2 &&
				stock.Volume > 10000000
			) {
				// Closing at day high with solid volume
				Opportunity = "Breakout";
			} else if (ChangePct > 4 && stock.Volume > 50000000) {
				// High momentum with massive retail & institutional volume
				Opportunity = "Momentum";
			} else if (
				MarketCap >= 40000000000000 ||
				(MarketCap >= 20000000000000 && stock.Value > 25000000000)
			) {
				// Big Cap Blue Chip (>40T Market Cap or >20T with high turnover)
				Opportunity = "Blue Chip";
			} else if (CompositeScore < 40 && ChangePct < -2) {
				// Breakdown or deteriorating technicals
				Opportunity = "Weak Trend";
			} else if (CompositeScore > 60) {
				// Solid fundamentals and composite valuation
				Opportunity = "Value";
			}

			return {
				...stock,
				ForeignNet,
				ForeignNetVol,
				ChangePct,
				MarketCap,
				IsHighVolume: stock.Volume > 50000000,
				Sector: getMockSector(stock.StockCode),
				CompositeScore,
				Opportunity,
				Fundamentals: getMockFundamentals(stock.StockCode, stock.Close),
				Trend: ChangePct > 1 ? "Up" : ChangePct < -1 ? "Down" : "Sideways",
				TurnoverTier,
				BidOfferPressure,
				AvgValuePerTx,
				NegoRatio,
				ARALimitPrice: araPrice,
				ARBLimitPrice: arbPrice,
				ARARisk,
			};
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
	}, [rawData, weights]);
}
