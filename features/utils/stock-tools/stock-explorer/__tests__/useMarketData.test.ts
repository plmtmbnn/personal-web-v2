import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMarketData } from "../hooks/useMarketData";
import type { IDXStock, ScoreWeights } from "../types";

const mockWeights: ScoreWeights = {
	price: 25,
	volume: 25,
	foreign: 20,
	liquidity: 15,
	volatility: 15,
};

describe("useMarketData Hook", () => {
	it("calculates market-cap weighted IHSG return and dual foreign net flow", () => {
		// Mock 2 stocks with realistic IDX proportions
		const rawStocks: IDXStock[] = [
			{
				No: 1,
				IDStockSummary: 1,
				Date: "2026-10-07",
				StockCode: "BBCA",
				StockName: "Bank Central Asia",
				Remarks: "",
				Previous: 6100,
				OpenPrice: 6100,
				FirstTrade: 6100,
				High: 6150,
				Low: 6025,
				Close: 6050,
				Change: -50, // -0.8197%
				Volume: 162690800,
				Value: 982525082500, // ~6039 VWAP
				Frequency: 24500,
				IndexIndividual: 100,
				Offer: 6050,
				OfferVolume: 1000,
				Bid: 6025,
				BidVolume: 1000,
				ListedShares: 123275000000, // Cap = ~745.8T
				TradebleShares: 123275000000,
				WeightForIndex: 1,
				ForeignBuy: 93011500,
				ForeignSell: 142705300, // NetVol = -49,693,800
				DelistingDate: "",
				NonRegularVolume: 0,
				NonRegularValue: 0,
				NonRegularFrequency: 0,
				persen: null,
				percentage: null,
			},
			{
				No: 2,
				IDStockSummary: 2,
				Date: "2026-10-07",
				StockCode: "BBRI",
				StockName: "Bank Rakyat Indonesia",
				Remarks: "",
				Previous: 3160,
				OpenPrice: 3160,
				FirstTrade: 3160,
				High: 3180,
				Low: 3120,
				Close: 3140,
				Change: -20, // -0.6329%
				Volume: 88629800,
				Value: 277951508000, // ~3136 VWAP
				Frequency: 18200,
				IndexIndividual: 100,
				Offer: 3140,
				OfferVolume: 1000,
				Bid: 3120,
				BidVolume: 1000,
				ListedShares: 151559000000, // Cap = ~475.9T
				TradebleShares: 151559000000,
				WeightForIndex: 1,
				ForeignBuy: 72559000,
				ForeignSell: 31259700, // NetVol = +41,299,300
				DelistingDate: "",
				NonRegularVolume: 0,
				NonRegularValue: 0,
				NonRegularFrequency: 0,
				persen: null,
				percentage: null,
			},
		];

		const { result } = renderHook(() => useMarketData(rawStocks, mockWeights));
		const { marketHealth, processed } = result.current;

		// Cap-weighted return should be negative around -0.75%
		expect(marketHealth.marketReturn).toBeLessThan(0);
		expect(marketHealth.marketReturn.toFixed(2)).toBe("-0.75");

		// Foreign Net Volume in shares
		expect(marketHealth.netForeignVolume).toBe(
			rawStocks[0].ForeignBuy -
				rawStocks[0].ForeignSell +
				(rawStocks[1].ForeignBuy - rawStocks[1].ForeignSell),
		);

		// Foreign Net Value should be computed in IDR using VWAP
		expect(marketHealth.netForeignValue).toBeLessThan(0);
		expect(processed[0].ForeignNet).toBeLessThan(0);
		expect(processed[1].ForeignNet).toBeGreaterThan(0);

		// Microstructure & Bandarmology Telemetry assertions
		expect(processed[0].TurnoverTier).toBe("Mega");
		expect(processed[0].BidOfferPressure).toBe(50); // 1000 bid / (1000 bid + 1000 offer) = 50%
		expect(processed[0].AvgValuePerTx).toBeGreaterThan(0);
		expect(processed[0].AvgValuePerTx).toBe(
			Math.round(rawStocks[0].Value / rawStocks[0].Frequency),
		);
		// BBCA previous 6100 (>5000 -> 20% limit)
		expect(processed[0].ARALimitPrice).toBeGreaterThan(6100);
		expect(processed[0].ARBLimitPrice).toBeLessThan(6100);
		expect(processed[0].ARARisk).toBe("Normal");
	});

	it("correctly identifies ASMI (Previous 33 -> Close 44, +35%) as ARA with zero offers", () => {
		const asmiStock: IDXStock[] = [
			{
				No: 69,
				IDStockSummary: 4108744,
				Date: "2026-10-07",
				StockCode: "ASMI",
				StockName: "Asuransi Maximus Graha Persada Tbk.",
				Remarks: "",
				Previous: 33,
				OpenPrice: 34,
				FirstTrade: 34,
				High: 44,
				Low: 32,
				Close: 44,
				Change: 11,
				Volume: 631168400,
				Value: 25400397800,
				Frequency: 13021,
				IndexIndividual: 81.5,
				Offer: 0,
				OfferVolume: 0,
				Bid: 44,
				BidVolume: 95216900,
				ListedShares: 8958380460,
				TradebleShares: 8958380460,
				WeightForIndex: 4828567068,
				ForeignSell: 40942400,
				ForeignBuy: 31537700,
				DelistingDate: "",
				NonRegularVolume: 0,
				NonRegularValue: 0,
				NonRegularFrequency: 0,
				persen: null,
				percentage: null,
			},
		];

		const { result } = renderHook(() => useMarketData(asmiStock, mockWeights));
		const asmi = result.current.processed[0];

		expect(asmi.ARALimitPrice).toBe(44);
		expect(asmi.ARBLimitPrice).toBe(22);
		expect(asmi.ARARisk).toBe("ARA");
		expect(asmi.BidOfferPressure).toBe(100); // 100% Bids, 0% Offers
	});
});
