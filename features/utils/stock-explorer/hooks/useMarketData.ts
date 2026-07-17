import { useMemo } from "react";
import type {
	IDXStock,
	ProcessedStock,
	OpportunityCategory,
	ScoreWeights,
} from "../types";
import { getMockSector, getMockFundamentals } from "../data/mockData";

export function useMarketData(rawData: IDXStock[], weights: ScoreWeights) {
	return useMemo(() => {
		let totalForeignBuy = 0;
		let totalForeignSell = 0;
		let totalVolume = 0;
		let totalValue = 0;
		let advancers = 0;
		let decliners = 0;
		let unchanged = 0;
		let totalReturn = 0;

		const processed: ProcessedStock[] = rawData.map((stock) => {
			const ForeignNet = stock.ForeignBuy - stock.ForeignSell;
			const ChangePct =
				stock.Previous > 0 ? (stock.Change / stock.Previous) * 100 : 0;

			// Basic aggregations
			totalForeignBuy += stock.ForeignBuy;
			totalForeignSell += stock.ForeignSell;
			totalVolume += stock.Volume;
			totalValue += stock.Value;
			totalReturn += ChangePct;

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
			let volaScore =
				100 - (Math.abs(stock.High - stock.Low) / (stock.Previous || 1)) * 1000; // Lower volatility = higher score
			volaScore = Math.min(Math.max(volaScore, 0), 100);

			const CompositeScore = Math.round(
				(priceScore * weights.price +
					volScore * weights.volume +
					foreignScore * weights.foreign +
					liqScore * weights.liquidity +
					volaScore * weights.volatility) /
					100,
			);

			// Categorization
			let Opportunity: OpportunityCategory = "⚠ Watchlist";
			if (CompositeScore > 85 && ChangePct > 2 && ForeignNet > 1000000000)
				Opportunity = "🔥 Strong Buy";
			else if (ChangePct > 4 && stock.Volume > 50000000)
				Opportunity = "🚀 Momentum";
			else if (stock.High === stock.Close && ChangePct > 2)
				Opportunity = "📈 Breakout";
			else if (ForeignNet > 5000000000 && ChangePct < 1)
				Opportunity = "🌍 Foreign Accumulation";
			else if (CompositeScore < 40 && ChangePct < -2)
				Opportunity = "❌ Weak Trend";
			else if (stock.Value > 100000000000)
				Opportunity = "🏦 Blue Chip"; // Proxy for blue chip
			else if (CompositeScore > 60) Opportunity = "💰 Value";

			return {
				...stock,
				ForeignNet,
				ChangePct,
				IsHighVolume: stock.Volume > 50000000,
				Sector: getMockSector(stock.StockCode),
				CompositeScore,
				Opportunity,
				Fundamentals: getMockFundamentals(stock.StockCode, stock.Close),
				Trend: ChangePct > 1 ? "Up" : ChangePct < -1 ? "Down" : "Sideways",
			};
		});

		const avgReturn = rawData.length > 0 ? totalReturn / rawData.length : 0;
		const netForeign = totalForeignBuy - totalForeignSell;

		// Sentiment 0-100
		const adRatio = advancers / (decliners || 1);
		let sentimentScore =
			50 + (adRatio - 1) * 10 + avgReturn * 10 + (netForeign > 0 ? 10 : -10);
		sentimentScore = Math.round(Math.min(Math.max(sentimentScore, 0), 100));

		let sentimentLabel = "Neutral";
		if (sentimentScore >= 80) sentimentLabel = "Strong Bullish";
		else if (sentimentScore >= 60) sentimentLabel = "Bullish";
		else if (sentimentScore <= 20) sentimentLabel = "Strong Bearish";
		else if (sentimentScore <= 40) sentimentLabel = "Bearish";

		return {
			processed,
			marketHealth: {
				totalForeignBuy,
				totalForeignSell,
				netForeign,
				totalVolume,
				totalValue,
				advancers,
				decliners,
				unchanged,
				avgReturn,
				sentimentScore,
				sentimentLabel,
			},
		};
	}, [rawData, weights]);
}
