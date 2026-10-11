import { describe, it, expect } from "vitest";
import {
	fmtIDRPrice,
	fmtSignedPct,
	calculatePickMetrics,
	traceAndUpdateWatermarks,
	calculatePortfolioSummary,
	calculateClosedTradesSummary,
	filterClosedTrades,
	getExitReasonBadge,
} from "../stockpicks";
import type { StockPick, ProcessedStock } from "../types";

describe("Stockpick Simulator Calculations & Watermark Engine", () => {
	const samplePick: StockPick = {
		id: "pick-1",
		stockCode: "BBCA",
		stockName: "Bank Central Asia Tbk",
		sector: "Banking",
		buyPrice: 10000,
		quantityLots: 10, // 1,000 shares
		entryDate: "2026-10-01",
		targetPrice: 11000,
		stopLossPrice: 9500,
		thesis: "Compass Core Tranche",
		highestPriceTraced: 10500,
		highestPriceDate: "2026-10-05",
		lowestPriceTraced: 9800,
		lowestPriceDate: "2026-10-02",
		status: "active",
		createdAt: 1727740800000,
		updatedAt: 1727740800000,
	};

	describe("Formatting Utilities", () => {
		it("formats IDR prices cleanly without decimal cents", () => {
			expect(fmtIDRPrice(9800)).toBe("Rp 9.800");
			expect(fmtIDRPrice(10500000)).toBe("Rp 10.500.000");
			expect(fmtIDRPrice(0)).toBe("Rp 0");
		});

		it("formats signed percentages with 2 decimals", () => {
			expect(fmtSignedPct(5)).toBe("+5.00%");
			expect(fmtSignedPct(-3.25)).toBe("-3.25%");
			expect(fmtSignedPct(0)).toBe("0.00%");
		});
	});

	describe("calculatePickMetrics()", () => {
		it("calculates accurate P/L %, nominal return, and capital outlay", () => {
			const mockStock: ProcessedStock = {
				No: 1,
				IDStockSummary: 1,
				Date: "2026-10-11",
				StockCode: "BBCA",
				StockName: "Bank Central Asia Tbk",
				Remarks: "",
				Previous: 10200,
				OpenPrice: 10250,
				FirstTrade: 10250,
				High: 10600,
				Low: 10200,
				Close: 10500,
				Change: 300,
				Volume: 50000000,
				Value: 500000000000,
				Frequency: 15000,
				IndexIndividual: 1,
				Offer: 10525,
				OfferVolume: 1000,
				Bid: 10500,
				BidVolume: 2000,
				ListedShares: 100000000,
				TradebleShares: 100000000,
				WeightForIndex: 1,
				ForeignSell: 10000000,
				ForeignBuy: 30000000,
				DelistingDate: "",
				NonRegularVolume: 0,
				NonRegularValue: 0,
				NonRegularFrequency: 0,
				persen: 2.94,
				percentage: 2.94,
				ForeignNet: 20000000000,
				ForeignNetVol: 20000000,
				ChangePct: 2.94,
				MarketCap: 1000000000000000,
				IsHighVolume: true,
				Sector: "Banking",
				CompositeScore: 82,
				Opportunity: "Strong Buy",
				Fundamentals: {
					Revenue: 100,
					NetIncome: 50,
					EPS: 500,
					ROE: 20,
					ROA: 3,
					DER: 4,
					PE: 20,
					PBV: 4,
				},
				Trend: "Up",
				TurnoverTier: "Mega",
				BidOfferPressure: 66,
				AvgValuePerTx: 33000000,
				NegoRatio: 0,
				ARALimitPrice: 12500,
				ARBLimitPrice: 8000,
				ARARisk: "Normal",
			};

			const metrics = calculatePickMetrics(samplePick, mockStock);

			// Buy at 10,000, Close at 10,500 -> +5.00%
			expect(metrics.unrealizedPlPct).toBeCloseTo(5.0);
			// 10 lots = 1,000 shares. 1,000 * 500 = Rp 500.000
			expect(metrics.unrealizedPlNominal).toBe(500000);
			// Outlay = 10,000 * 1,000 = Rp 10.000.000
			expect(metrics.simulatedOutlay).toBe(10000000);
			// Market value = 10,500 * 1,000 = Rp 10.500.000
			expect(metrics.currentMarketValue).toBe(10500000);

			// Peak price is 10,500 -> Peak gain is +5.00%
			expect(metrics.peakGainPct).toBeCloseTo(5.0);
			// Lowest price is 9,800 -> Max drawdown is -2.00%
			expect(metrics.maxDrawdownPct).toBeCloseTo(-2.0);

			// Risk:Reward Ratio:
			// Reward = 11,000 - 10,000 = 1,000
			// Risk = 10,000 - 9,500 = 500
			// RRR = 1,000 / 500 = 2.0
			expect(metrics.riskRewardRatio).toBe(2.0);
			expect(metrics.isCompassAligned).toBe(true);
		});

		it("falls back gracefully when live stock is null", () => {
			const metrics = calculatePickMetrics(samplePick, null);
			expect(metrics.currentPrice).toBe(10000);
			expect(metrics.unrealizedPlPct).toBe(0);
			expect(metrics.unrealizedPlNominal).toBe(0);
		});
	});

	describe("traceAndUpdateWatermarks()", () => {
		it("updates highest price when session High exceeds existing peak", () => {
			const liveStocks = [
				{
					StockCode: "BBCA",
					Close: 10700,
					High: 10850, // Exceeds 10,500
					Low: 10300,
					Date: "2026-10-11",
				} as ProcessedStock,
			];

			const result = traceAndUpdateWatermarks([samplePick], liveStocks);
			expect(result.hasChanges).toBe(true);
			expect(result.updatedPicks[0].highestPriceTraced).toBe(10850);
			expect(result.updatedPicks[0].highestPriceDate).toBe("2026-10-11");
			// Lowest price should remain 9,800 because Low 10,300 is higher
			expect(result.updatedPicks[0].lowestPriceTraced).toBe(9800);
		});

		it("updates lowest price when session Low drops below existing trough", () => {
			const liveStocks = [
				{
					StockCode: "BBCA",
					Close: 9600,
					High: 9900,
					Low: 9450, // Drops below 9,800
					Date: "2026-10-11",
				} as ProcessedStock,
			];

			const result = traceAndUpdateWatermarks([samplePick], liveStocks);
			expect(result.hasChanges).toBe(true);
			expect(result.updatedPicks[0].lowestPriceTraced).toBe(9450);
			expect(result.updatedPicks[0].lowestPriceDate).toBe("2026-10-11");
			expect(result.updatedPicks[0].highestPriceTraced).toBe(10500);
		});

		it("does not mutate watermarks when session stays inside historical channel", () => {
			const liveStocks = [
				{
					StockCode: "BBCA",
					Close: 10100,
					High: 10200, // < 10,500
					Low: 10000, // > 9,800
					Date: "2026-10-11",
				} as ProcessedStock,
			];

			const result = traceAndUpdateWatermarks([samplePick], liveStocks);
			expect(result.hasChanges).toBe(false);
			expect(result.updatedPicks[0].highestPriceTraced).toBe(10500);
			expect(result.updatedPicks[0].lowestPriceTraced).toBe(9800);
		});

		it("ignores closed picks", () => {
			const closedPick: StockPick = {
				...samplePick,
				status: "closed",
				closedPrice: 10400,
			};
			const liveStocks = [
				{
					StockCode: "BBCA",
					Close: 11000,
					High: 11200,
					Low: 10900,
				} as ProcessedStock,
			];

			const result = traceAndUpdateWatermarks([closedPick], liveStocks);
			expect(result.hasChanges).toBe(false);
			expect(result.updatedPicks[0].highestPriceTraced).toBe(10500);
		});
	});

	describe("calculatePortfolioSummary()", () => {
		it("aggregates capital outlay, current value, win rate, and performers", () => {
			const pick1 = calculatePickMetrics(samplePick, {
				StockCode: "BBCA",
				Close: 10500, // +5%
			} as ProcessedStock);

			const pick2 = calculatePickMetrics(
				{
					...samplePick,
					id: "pick-2",
					stockCode: "TLKM",
					buyPrice: 3000,
					quantityLots: 20, // 2,000 shares -> 6M outlay
					highestPriceTraced: 3100,
					lowestPriceTraced: 2850,
				},
				{
					StockCode: "TLKM",
					Close: 2850, // -5%
				} as ProcessedStock,
			);

			const summary = calculatePortfolioSummary([pick1, pick2]);

			expect(summary.totalPicks).toBe(2);
			expect(summary.activePicks).toBe(2);
			expect(summary.winningPicks).toBe(1);
			expect(summary.losingPicks).toBe(1);
			expect(summary.winRatePct).toBe(50);

			// Outlay: 10M + 6M = 16M
			expect(summary.totalSimulatedCapital).toBe(16000000);
			// Current Value: 10.5M + 5.7M = 16.2M
			expect(summary.totalCurrentValue).toBe(16200000);
			// Net P/L = +200.000
			expect(summary.totalUnrealizedPlNominal).toBe(200000);
			expect(summary.totalUnrealizedPlPct).toBeCloseTo(1.25);

			expect(summary.bestPerformer?.stockCode).toBe("BBCA");
			expect(summary.worstPerformer?.stockCode).toBe("TLKM");
		});
	});

	describe("Closed Trades Analytics & Filtering Engine", () => {
		const closedPick1 = calculatePickMetrics({
			...samplePick,
			id: "closed-1",
			stockCode: "ASII",
			status: "closed",
			buyPrice: 5000,
			closedPrice: 5400,
			closedDate: "2026-09-28",
			quantityLots: 10, // 1000 shares -> 5M outlay, +400k profit (+8%)
			realizedPlPct: 8.0,
			realizedPlNominal: 400000,
			exitReason: "target_hit",
			thesis: "Compass Core Tranche",
		});

		const closedPick2 = calculatePickMetrics({
			...samplePick,
			id: "closed-2",
			stockCode: "TLKM",
			status: "closed",
			buyPrice: 3200,
			closedPrice: 3040,
			closedDate: "2026-09-20",
			quantityLots: 10, // 1000 shares -> 3.2M outlay, -160k loss (-5%)
			realizedPlPct: -5.0,
			realizedPlNominal: -160000,
			exitReason: "stop_loss_hit",
			thesis: "Value Accumulation",
		});

		it("calculates accurate closed trades summary (Win Rate, Profit Factor, Realized P/L)", () => {
			const summary = calculateClosedTradesSummary([closedPick1, closedPick2]);

			expect(summary.totalClosed).toBe(2);
			expect(summary.winningTrades).toBe(1);
			expect(summary.losingTrades).toBe(1);
			expect(summary.winRatePct).toBe(50);
			// Net Realized P/L = 400.000 - 160.000 = 240.000
			expect(summary.totalRealizedPlNominal).toBe(240000);
			// Total capital = 5.000.000 + 3.200.000 = 8.200.000
			expect(summary.totalRealizedPlPct).toBeCloseTo(2.92, 1);
			// Profit factor = 400.000 / 160.000 = 2.5
			expect(summary.profitFactor).toBe(2.5);

			expect(summary.bestTrade?.stockCode).toBe("ASII");
			expect(summary.worstTrade?.stockCode).toBe("TLKM");

			// Attribution
			expect(summary.thesisBreakdown.length).toBe(2);
			expect(summary.exitReasonBreakdown.length).toBe(2);
		});

		it("filters closed trades by search, thesis, outcome, and exit reason", () => {
			const filteredByThesis = filterClosedTrades([closedPick1, closedPick2], {
				search: "",
				thesis: "Compass Core Tranche",
				exitReason: "all",
				horizon: "all",
				outcome: "all",
				sortBy: "exit_date_desc",
			});
			expect(filteredByThesis.length).toBe(1);
			expect(filteredByThesis[0].stockCode).toBe("ASII");

			const filteredByWins = filterClosedTrades([closedPick1, closedPick2], {
				search: "",
				thesis: "all",
				exitReason: "all",
				horizon: "all",
				outcome: "win",
				sortBy: "exit_date_desc",
			});
			expect(filteredByWins.length).toBe(1);
			expect(filteredByWins[0].stockCode).toBe("ASII");

			const filteredBySearch = filterClosedTrades([closedPick1, closedPick2], {
				search: "tlk",
				thesis: "all",
				exitReason: "all",
				horizon: "all",
				outcome: "all",
				sortBy: "exit_date_desc",
			});
			expect(filteredBySearch.length).toBe(1);
			expect(filteredBySearch[0].stockCode).toBe("TLKM");
		});

		it("returns correct badges and tones for exit reasons", () => {
			expect(getExitReasonBadge("target_hit")).toEqual({
				label: "Target Hit",
				tone: "emerald",
			});
			expect(getExitReasonBadge("stop_loss_hit")).toEqual({
				label: "Stop Loss Hit",
				tone: "rose",
			});
			expect(getExitReasonBadge("trailing_stop")).toEqual({
				label: "Trailing Stop",
				tone: "blue",
			});
		});
	});
});
