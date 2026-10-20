import { describe, it, expect } from "vitest";
import type { ProcessedStock } from "../types";
import {
	isHighVolatile,
	isNearAra,
	isBandarSurge,
	isArbReversal,
	isForeignAccumulation,
	isBreakout,
	isMomentum,
	isBlueChip,
	isValue,
	matchesOpportunity,
	sortStocksForCategory,
	getCategoryPrimaryMetric,
	resolvePrimaryOpportunity,
	getIntradayRangePct,
	getDistanceToAraPct,
	getBounceFromLowPct,
	calculateStockTradePlan,
} from "../utils/opportunityPredicates";

function createMockStock(
	overrides: Partial<ProcessedStock> = {},
): ProcessedStock {
	return {
		No: 1,
		IDStockSummary: 101,
		Date: "2026-10-20",
		StockCode: "TEST",
		StockName: "Test Company Tbk",
		Remarks: "",
		Previous: 1000,
		OpenPrice: 1000,
		FirstTrade: 1000,
		High: 1080,
		Low: 1000,
		Close: 1070,
		Change: 70,
		Volume: 15_000_000,
		Value: 6_000_000_000,
		Frequency: 3000,
		IndexIndividual: 100,
		Offer: 1075,
		OfferVolume: 1000,
		Bid: 1070,
		BidVolume: 2000,
		ListedShares: 1_000_000_000,
		TradebleShares: 1_000_000_000,
		WeightForIndex: 1,
		ForeignBuy: 50_000_000,
		ForeignSell: 20_000_000,
		DelistingDate: "",
		NonRegularVolume: 0,
		NonRegularValue: 0,
		NonRegularFrequency: 0,
		persen: null,
		percentage: null,
		ForeignNet: 30_000_000_000,
		ForeignNetVol: 30_000_000,
		ChangePct: 7.0,
		MarketCap: 1_070_000_000_000,
		IsHighVolume: true,
		Sector: "Technology",
		CompositeScore: 75,
		Opportunity: "Watchlist",
		Fundamentals: {
			Revenue: 1e12,
			NetIncome: 1e11,
			EPS: 50,
			ROE: 12,
			ROA: 8,
			DER: 0.5,
			PE: 15,
			PBV: 1.8,
		},
		Trend: "Up",
		TurnoverTier: "High",
		BidOfferPressure: 66,
		AvgValuePerTx: 2_000_000,
		NegoRatio: 0,
		ARALimitPrice: 1250,
		ARBLimitPrice: 750,
		ARARisk: "Normal",
		...overrides,
	};
}

describe("Opportunity Predicates Engine", () => {
	describe("High Volatile (Scalp)", () => {
		it("detects high volatile stock when range >= 6%, value >= 5B, freq >= 2500 and safe from ARB", () => {
			const stock = createMockStock({
				Low: 1000,
				High: 1080, // Range = 8%
				Close: 1060,
				Value: 8_000_000_000,
				Frequency: 3500,
				ARARisk: "Normal",
			});
			expect(getIntradayRangePct(stock)).toBe(8.0);
			expect(isHighVolatile(stock)).toBe(true);
		});

		it("rejects stock when intraday range < 6%", () => {
			const stock = createMockStock({
				Low: 1000,
				High: 1040, // Range = 4%
				Value: 10_000_000_000,
				Frequency: 5000,
			});
			expect(isHighVolatile(stock)).toBe(false);
		});

		it("rejects stock when turnover is below 5B IDR liquidity hurdle", () => {
			const stock = createMockStock({
				Low: 1000,
				High: 1100, // Range = 10%
				Value: 3_000_000_000, // Only 3B
				Frequency: 3000,
			});
			expect(isHighVolatile(stock)).toBe(false);
		});

		it("rejects stock when locked at ARB", () => {
			const stock = createMockStock({
				Low: 850,
				High: 1000,
				Close: 850,
				Value: 6_000_000_000,
				Frequency: 4000,
				ARARisk: "ARB",
			});
			expect(isHighVolatile(stock)).toBe(false);
		});
	});

	describe("Near ARA Hunter", () => {
		it("detects stock within 2.5% of ARA limit price with momentum and bid pressure", () => {
			const stock = createMockStock({
				ARALimitPrice: 1250,
				Close: 1230, // within 1.6% of ARA
				ChangePct: 23.0,
				BidOfferPressure: 72,
				ARARisk: "Near ARA",
			});
			expect(getDistanceToAraPct(stock)).toBeLessThan(2.5);
			expect(isNearAra(stock)).toBe(true);
		});

		it("rejects stock already locked at ARA ceiling", () => {
			const stock = createMockStock({
				ARALimitPrice: 1250,
				Close: 1250,
				ChangePct: 25.0,
				BidOfferPressure: 100,
				ARARisk: "ARA", // Already locked
			});
			expect(isNearAra(stock)).toBe(false);
		});

		it("rejects stock if bid pressure is weak (< 60%)", () => {
			const stock = createMockStock({
				ARALimitPrice: 1250,
				Close: 1230,
				ChangePct: 23.0,
				BidOfferPressure: 45,
				ARARisk: "Near ARA",
			});
			expect(isNearAra(stock)).toBe(false);
		});
	});

	describe("Bandar Surge (Whale Haka)", () => {
		it("detects large whale ticket size and bid dominance", () => {
			const stock = createMockStock({
				AvgValuePerTx: 45_000_000, // 45M / tx
				BidOfferPressure: 62,
				Value: 15_000_000_000,
			});
			expect(isBandarSurge(stock)).toBe(true);
		});

		it("rejects retail-dominated trade sizes", () => {
			const stock = createMockStock({
				AvgValuePerTx: 5_000_000, // 5M / tx
				BidOfferPressure: 65,
				Value: 10_000_000_000,
			});
			expect(isBandarSurge(stock)).toBe(false);
		});
	});

	describe("ARB Reversal (Floor Bounce)", () => {
		it("detects rebound from ARB floor with heavy absorption", () => {
			const stock = createMockStock({
				ARBLimitPrice: 750,
				Low: 750, // Touched floor
				Close: 790, // Rebounded
				Frequency: 4500,
				Value: 8_000_000_000,
			});
			expect(getBounceFromLowPct(stock)).toBeGreaterThan(5);
			expect(isArbReversal(stock)).toBe(true);
		});

		it("rejects stock still pinned at low with zero bounce", () => {
			const stock = createMockStock({
				ARBLimitPrice: 750,
				Low: 750,
				Close: 750, // No rebound
				Frequency: 4500,
				Value: 8_000_000_000,
			});
			expect(isArbReversal(stock)).toBe(false);
		});
	});

	describe("Foreign Accumulation", () => {
		it("detects large net foreign inflow with controlled price action", () => {
			const stock = createMockStock({
				ForeignNet: 45_000_000_000, // +45B IDR
				ChangePct: 1.5,
			});
			expect(isForeignAccumulation(stock)).toBe(true);
		});

		it("rejects overextended price chase (> 4%)", () => {
			const stock = createMockStock({
				ForeignNet: 45_000_000_000,
				ChangePct: 8.5,
			});
			expect(isForeignAccumulation(stock)).toBe(false);
		});
	});

	describe("Category Sorting & Contextual Telemetry", () => {
		it("sorts High Volatile by intraday range descending", () => {
			const a = createMockStock({ StockCode: "AAA", Low: 1000, High: 1070 }); // 7%
			const b = createMockStock({ StockCode: "BBB", Low: 1000, High: 1140 }); // 14%
			const sorted = sortStocksForCategory([a, b], "High Volatile");
			expect(sorted[0].StockCode).toBe("BBB");
			expect(sorted[1].StockCode).toBe("AAA");
		});

		it("sorts Near ARA by distance to ARA ascending (closest to ceiling first)", () => {
			const a = createMockStock({
				StockCode: "FAR",
				ARALimitPrice: 1000,
				Close: 975,
			}); // 2.5% away
			const b = createMockStock({
				StockCode: "CLOSE",
				ARALimitPrice: 1000,
				Close: 990,
			}); // 1.0% away
			const sorted = sortStocksForCategory([a, b], "Near ARA");
			expect(sorted[0].StockCode).toBe("CLOSE");
			expect(sorted[1].StockCode).toBe("FAR");
		});

		it("returns formatted Range pill for High Volatile", () => {
			const stock = createMockStock({ Low: 1000, High: 1085 });
			const metric = getCategoryPrimaryMetric(stock, "High Volatile");
			expect(metric.label).toBe("Range");
			expect(metric.value).toBe("+8.5%");
		});

		it("returns formatted Avg Tx pill for Bandar Surge", () => {
			const stock = createMockStock({ AvgValuePerTx: 42_500_000 });
			const metric = getCategoryPrimaryMetric(stock, "Bandar Accumulation");
			expect(metric.label).toBe("Avg Tx");
			expect(metric.value).toBe("Rp 42.5M");
		});

		it("returns formatted Net Foreign pill for Foreign Flow", () => {
			const stock = createMockStock({ ForeignNet: 24_500_000_000 });
			const metric = getCategoryPrimaryMetric(stock, "Foreign Accumulation");
			expect(metric.label).toBe("Net Foreign");
			expect(metric.value).toBe("+24.5B");
		});
	});

	describe("resolvePrimaryOpportunity Hierarchy", () => {
		it("prioritizes Near ARA above standard categories", () => {
			const stock = createMockStock({
				ARALimitPrice: 1000,
				Close: 980,
				ChangePct: 15,
				BidOfferPressure: 70,
				ARARisk: "Near ARA",
				CompositeScore: 90,
			});
			expect(resolvePrimaryOpportunity(stock)).toBe("Near ARA");
		});

		it("prioritizes High Volatile when qualifying for scalping", () => {
			const stock = createMockStock({
				Low: 1000,
				High: 1090, // Range 9%
				Close: 1050,
				Value: 10_000_000_000,
				Frequency: 4000,
				ARALimitPrice: 2000, // not near ARA
				ARARisk: "Normal",
			});
			expect(resolvePrimaryOpportunity(stock)).toBe("High Volatile");
		});
	});

	describe("Additional Predicates & Multi-Match Router", () => {
		it("evaluates isBreakout, isMomentum, isBlueChip, and isValue", () => {
			const breakoutStock = createMockStock({
				High: 1100,
				Close: 1100,
				ChangePct: 3.5,
				Volume: 20_000_000,
			});
			expect(isBreakout(breakoutStock)).toBe(true);
			expect(matchesOpportunity(breakoutStock, "Breakout")).toBe(true);

			const momentumStock = createMockStock({
				ChangePct: 6.0,
				Volume: 60_000_000,
			});
			expect(isMomentum(momentumStock)).toBe(true);
			expect(matchesOpportunity(momentumStock, "Momentum")).toBe(true);

			const blueChipStock = createMockStock({
				MarketCap: 50_000_000_000_000,
			});
			expect(isBlueChip(blueChipStock)).toBe(true);
			expect(matchesOpportunity(blueChipStock, "Blue Chip")).toBe(true);

			const valueStock = createMockStock({
				CompositeScore: 70,
			});
			expect(isValue(valueStock)).toBe(true);
			expect(matchesOpportunity(valueStock, "Value")).toBe(true);
		});

		it("detects multi-day Foreign Stealth Accumulation and generates BEI tick-valid TradePlan", () => {
			const stealthStock = createMockStock({
				Close: 3450, // Tick size for 2000-5000 is 10
				Low: 3400,
				High: 3460,
				Value: 18_000_000_000,
				ForeignNet: 6_000_000_000,
				ForeignStreakDays: 3,
				ForeignParticipationPct: 22.5,
				ChangePct: 1.2,
				Opportunity: "Foreign Accumulation",
			});

			expect(isForeignAccumulation(stealthStock)).toBe(true);
			const metric = getCategoryPrimaryMetric(
				stealthStock,
				"Foreign Accumulation",
			);
			expect(metric.label).toBe("3D Streak");

			const plan = calculateStockTradePlan(stealthStock);
			expect(plan.entryLow % 10).toBe(0);
			expect(plan.entryHigh % 10).toBe(0);
			expect(plan.stopLoss % 10).toBe(0);
			expect(plan.target1 % 10).toBe(0);
			expect(plan.target2 % 10).toBe(0);
			expect(plan.stopLoss).toBeLessThan(plan.entryHigh);
			expect(plan.target1).toBeGreaterThan(plan.entryHigh);
			expect(plan.riskRewardRatio).toBeGreaterThanOrEqual(1.5);
		});
	});
});
