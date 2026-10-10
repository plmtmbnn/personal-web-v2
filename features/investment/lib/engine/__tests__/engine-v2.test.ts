import { describe, it, expect } from "vitest";
import { computeCompass } from "../index";
import { DEFAULT_THRESHOLDS } from "../../../config/thresholds";
import type { InvestmentCompassData } from "../../../types";

function createMockData(
	overrides: Partial<InvestmentCompassData> = {},
): InvestmentCompassData {
	return {
		sentiment: {
			traditional: {
				fear_and_greed: {
					score: 55,
					rating: "neutral",
					timestamp: new Date().toISOString(),
					previous_close: 54,
					previous_1_week: 50,
					previous_1_month: 45,
					previous_1_year: 40,
				},
				fear_and_greed_historical: {
					timestamp: 0,
					score: 55,
					rating: "neutral",
					data: [],
				},
				market_momentum_sp500: {
					timestamp: 0,
					score: 50,
					rating: "neutral",
					data: [],
				},
				market_momentum_sp125: {
					timestamp: 0,
					score: 50,
					rating: "neutral",
					data: [],
				},
				stock_price_strength: {
					timestamp: 0,
					score: 50,
					rating: "neutral",
					data: [],
				},
				stock_price_breadth: {
					timestamp: 0,
					score: 50,
					rating: "neutral",
					data: [],
				},
				put_call_options: {
					timestamp: 0,
					score: 50,
					rating: "neutral",
					data: [],
				},
				market_volatility_vix: {
					timestamp: 0,
					score: 60,
					rating: "neutral",
					data: [],
				},
				market_volatility_vix_50: {
					timestamp: 0,
					score: 50,
					rating: "neutral",
					data: [],
				},
				junk_bond_demand: {
					timestamp: 0,
					score: 50,
					rating: "neutral",
					data: [],
				},
				safe_haven_demand: {
					timestamp: 0,
					score: 50,
					rating: "neutral",
					data: [],
				},
			},
			crypto: {
				name: "Fear and Greed",
				data: [
					{
						value: "55",
						value_classification: "Neutral",
						timestamp: "1700000000",
					},
				],
			},
		},
		markets: {
			quotes: {
				JKSE: {
					symbol: "^JKSE",
					name: "IHSG",
					last: 7500,
					change: 15,
					changePct: 0.2,
					open: null,
					high: 7520,
					low: 7480,
					previousClose: 7485,
					high52w: 7800,
					low52w: 6800,
					currency: "IDR",
					lastTime: "2026-10-04",
					marketStatus: null,
					source: "yahoo",
				},
				USDIDR: {
					symbol: "IDR=X",
					name: "USD/IDR",
					last: 15600,
					change: -20,
					changePct: -0.13,
					open: null,
					high: 15650,
					low: 15580,
					previousClose: 15620,
					high52w: 16500,
					low52w: 15200,
					currency: "IDR",
					lastTime: "2026-10-04",
					marketStatus: null,
					source: "yahoo",
				},
				BTC: {
					symbol: "BTC-USD",
					name: "Bitcoin",
					last: 68000,
					change: 500,
					changePct: 0.74,
					open: null,
					high: 68500,
					low: 67200,
					previousClose: 67500,
					high52w: 74000,
					low52w: 40000,
					currency: "USD",
					lastTime: "2026-10-04",
					marketStatus: null,
					source: "yahoo",
				},
				DXY: {
					symbol: "DX-Y.NYB",
					name: "US Dollar Index",
					last: 101.2,
					change: -0.1,
					changePct: -0.1,
					open: null,
					high: 101.5,
					low: 101.0,
					previousClose: 101.3,
					high52w: 106.0,
					low52w: 99.5,
					currency: "USD",
					lastTime: "2026-10-04",
					marketStatus: null,
					source: "yahoo",
				},
				VIX: {
					symbol: "^VIX",
					name: "VIX",
					last: 15.2,
					change: -0.4,
					changePct: -2.5,
					open: null,
					high: 16.0,
					low: 15.0,
					previousClose: 15.6,
					high52w: 38.0,
					low52w: 12.0,
					currency: "USD",
					lastTime: "2026-10-04",
					marketStatus: null,
					source: "yahoo",
				},
			},
			cryptoGlobal: {
				totalMarketCapUsd: 2500000000000,
				totalVolumeUsd: 85000000000,
				marketCapChange24hPct: 1.2,
				btcDominance: 52.5,
				ethDominance: 16.0,
				updatedAt: 1700000000,
			},
			macro: {
				FEDFUNDS: {
					id: "FEDFUNDS",
					name: "Fed Funds Rate",
					frequency: "Monthly",
					units: "Percent",
					data: [{ date: "2026-09-01", value: 4.25 }],
				},
				BAMLH0A0HYM2: {
					id: "BAMLH0A0HYM2",
					name: "HY OAS Spread",
					frequency: "Daily",
					units: "Percent",
					data: [{ date: "2026-10-02", value: 3.4 }],
				},
				DGS10: {
					id: "DGS10",
					name: "10Y Yield",
					frequency: "Daily",
					units: "Percent",
					data: [{ date: "2026-10-02", value: 3.85 }],
				},
				M2SL: {
					id: "M2SL",
					name: "M2 Money Supply",
					frequency: "Monthly",
					units: "Percent Change from Year Ago",
					data: [{ date: "2026-09-01", value: 4.8 }],
				},
				CPIAUCSL: {
					id: "CPIAUCSL",
					name: "Consumer Price Index",
					frequency: "Monthly",
					units: "Percent Change from Year Ago",
					data: [{ date: "2026-09-01", value: 2.3 }],
				},
				PCEPILFE: {
					id: "PCEPILFE",
					name: "Core PCE Price Index",
					frequency: "Monthly",
					units: "Percent Change from Year Ago",
					data: [{ date: "2026-09-01", value: 2.1 }],
				},
				IRSTCB01IDM156N: {
					id: "IRSTCB01IDM156N",
					name: "Bank Indonesia Policy Rate",
					frequency: "Monthly",
					units: "Percent",
					data: [
						{ date: "2026-08-01", value: 6.0 },
						{ date: "2026-09-01", value: 5.75 },
					],
				},
			},
			history: {
				"^JKSE": {
					symbol: "^JKSE",
					interval: "1d",
					points: Array.from({ length: 220 }, (_, i) => ({
						t: 1700000000 + i * 86400,
						c: 7000 + i * 2.5,
					})),
				},
				"BTC-USD": {
					symbol: "BTC-USD",
					interval: "1d",
					points: Array.from({ length: 220 }, (_, i) => ({
						t: 1700000000 + i * 86400,
						c: 55000 + i * 60,
					})),
				},
				"IDR=X": {
					symbol: "IDR=X",
					interval: "1d",
					points: Array.from({ length: 60 }, (_, i) => ({
						t: 1700000000 + i * 86400,
						c: 15700 - i * 2,
					})),
				},
			},
			cryptoFlows: {
				totalStablecoinSupplyUsd: 165000000000,
				stablecoin30dChangePct: 3.2,
				btcFundingRate8hPct: 0.008,
				btcOpenInterestUsd: 18000000000,
				updatedAt: 1700000000,
			},
		},
		sources: {
			cnn: { ok: true, label: "CNN" },
			cryptoFng: { ok: true, label: "Alternative.me" },
			quotes: { ok: true, label: "Quotes" },
			coingecko: { ok: true, label: "CoinGecko" },
			fred: { ok: true, label: "FRED" },
		},
		fetchedAt: new Date().toISOString(),
		...overrides,
	};
}

describe("Engine v2 computeCompass", () => {
	it("evaluates healthy macro and uptrending assets as Risk-On", () => {
		const mockData = createMockData();
		const output = computeCompass(mockData, DEFAULT_THRESHOLDS);

		expect(output.regimes.global.state).toBe("risk_on");
		expect(output.regimes.ihsg.state).toBe("risk_on");
		expect(output.regimes.crypto.state).toBe("risk_on");

		// IHSG and Crypto should have active permissions
		expect(output.permissions.ihsg.swing.status).toBe("allowed");
		expect(output.permissions.crypto.swing.status).toBe("allowed");

		// Altcoin gate: passes because Crypto is risk_on, BTC > 200D MA, and BTC.D (52.5%) <= 54%
		expect(output.permissions.altcoins.swing.status).toBe("selective");
		expect(output.permissions.altcoins.maxExposure).toContain("3.0%");
	});

	it("strictly locks out altcoins when BTC dominance is above 54%", () => {
		const mockData = createMockData();
		mockData.markets.cryptoGlobal!.btcDominance = 58.0;

		const output = computeCompass(mockData, DEFAULT_THRESHOLDS);
		expect(output.permissions.altcoins.swing.status).toBe("not_allowed");
		expect(output.permissions.altcoins.swing.reason).toContain(
			"Dominance is high",
		);
	});

	it("caps permissions to defensive when global liquidity is in stress", () => {
		const mockData = createMockData();
		// High credit spread + soaring dollar + high VIX + contracting liquidity
		mockData.markets.macro.BAMLH0A0HYM2.data = [
			{ date: "2026-10-02", value: 6.2 },
		]; // Stress
		mockData.markets.macro.M2SL.data = [{ date: "2026-10-02", value: -2.5 }]; // Liquidity contraction
		mockData.markets.macro.PCEPILFE.data = [{ date: "2026-10-02", value: 4.2 }]; // Hot inflation
		mockData.markets.macro.DGS10.data = [{ date: "2026-10-02", value: 5.2 }]; // Yield stress
		mockData.markets.macro.FEDFUNDS.data = [{ date: "2026-10-02", value: 5.5 }]; // Peak restrictive
		mockData.markets.quotes.DXY.last = 106.5; // Severe headwind
		mockData.markets.quotes.VIX.last = 32.0; // Panic

		const output = computeCompass(mockData, DEFAULT_THRESHOLDS);
		expect(output.regimes.global.state).toBe("stress");
		expect(output.permissions.globalStressActive).toBe(true);

		// Even if asset had a good MA, global stress caps risk
		expect(output.permissions.ihsg.swing.status).not.toBe("allowed");
		expect(output.permissions.crypto.swing.status).not.toBe("allowed");
	});

	it("triggers IHSG sell-off alert using JKSE quote key", () => {
		const mockData = createMockData();
		mockData.markets.quotes.JKSE.changePct = -1.85;

		const output = computeCompass(mockData, DEFAULT_THRESHOLDS);
		const ihsgAlert = output.alerts.find((a) => a.id === "ihsg-selloff");
		expect(ihsgAlert).toBeDefined();
		expect(ihsgAlert?.type).toBe("danger");
	});

	it("never allows lump-sum or aggressive DCA during stress state", () => {
		const mockData = createMockData();
		// Simulate capitulation: broken MAs and high drawdown, plus USD/IDR spike
		mockData.markets.quotes.JKSE.last = 5800; // Deep down
		mockData.markets.quotes.JKSE.high52w = 7800; // > 25% drawdown
		mockData.markets.quotes.USDIDR.last = 16800; // Rupiah stress
		mockData.markets.history!["^JKSE"]!.points = Array.from(
			{ length: 220 },
			() => ({ t: 0, c: 7500 }),
		); // Below 200D MA
		mockData.markets.history!["IDR=X"]!.points = Array.from(
			{ length: 60 },
			() => ({ t: 0, c: 15600 }),
		); // Rupiah weakening
		mockData.markets.macro.BAMLH0A0HYM2.data = [
			{ date: "2026-10-02", value: 6.5 },
		]; // Global stress
		mockData.markets.macro.M2SL.data = [{ date: "2026-10-02", value: -2.5 }]; // Liquidity contraction
		mockData.markets.macro.CPIAUCSL.data = [{ date: "2026-10-02", value: 4.2 }];
		mockData.markets.macro.IRSTCB01IDM156N.data = [
			{ date: "2026-08-01", value: 6.0 },
			{ date: "2026-09-01", value: 6.5 },
		]; // BI hiking rate
		mockData.markets.quotes.DXY.last = 106.5;
		mockData.markets.quotes.VIX.last = 35.0;

		const output = computeCompass(mockData, DEFAULT_THRESHOLDS);
		// IHSG DCA must be paused / tranche plan only, NEVER "allowed" or "lump sum"
		expect(output.permissions.ihsg.dca.status).toBe("paused");
		expect(output.permissions.ihsg.swing.status).toBe("not_allowed");
	});

	it("evaluates M2 expansion and cooling Core PCE as bullish factors in global liquidity", () => {
		const mockData = createMockData();
		const output = computeCompass(mockData, DEFAULT_THRESHOLDS);

		const m2Factor = output.regimes.global.factors.find(
			(f) => f.key === "m2_growth",
		);
		const pceFactor = output.regimes.global.factors.find(
			(f) => f.key === "core_pce_yoy",
		);

		expect(m2Factor).toBeDefined();
		expect(m2Factor?.direction).toBe("bullish");
		expect(m2Factor?.weight).toBe(10);
		expect(m2Factor?.valueStr).toBe("+4.8%");

		expect(pceFactor).toBeDefined();
		expect(pceFactor?.direction).toBe("bullish");
		expect(pceFactor?.weight).toBe(15);
		expect(pceFactor?.valueStr).toBe("2.1%");
	});

	it("flags sticky inflation when US Core PCE exceeds thresholds", () => {
		const mockData = createMockData();
		mockData.markets.macro.PCEPILFE.data = [{ date: "2026-09-01", value: 3.2 }];

		const output = computeCompass(mockData, DEFAULT_THRESHOLDS);
		const pceFactor = output.regimes.global.factors.find(
			(f) => f.key === "core_pce_yoy",
		);

		expect(pceFactor?.direction).toBe("bearish");
		expect(output.regimes.global.contextFlags).toContain(
			"Sticky Core PCE (3.2%)",
		);
	});

	it("evaluates Bank Indonesia rate cuts as bullish for IHSG", () => {
		const mockData = createMockData();
		// Mock cutting: 6.0% -> 5.75%
		const output = computeCompass(mockData, DEFAULT_THRESHOLDS);

		const biFactor = output.regimes.ihsg.factors.find(
			(f) => f.key === "bi_rate",
		);
		expect(biFactor).toBeDefined();
		expect(biFactor?.direction).toBe("bullish");
		expect(biFactor?.weight).toBe(10);
		expect(biFactor?.note).toContain("cutting benchmark rate");
	});

	it("evaluates Bank Indonesia rate hikes and restrictive levels as bearish for IHSG", () => {
		const mockData = createMockData();
		// Mock hiking: 6.0% -> 6.25%
		mockData.markets.macro.IRSTCB01IDM156N.data = [
			{ date: "2026-08-01", value: 6.0 },
			{ date: "2026-09-01", value: 6.25 },
		];

		const output = computeCompass(mockData, DEFAULT_THRESHOLDS);
		const biFactor = output.regimes.ihsg.factors.find(
			(f) => f.key === "bi_rate",
		);

		expect(biFactor?.direction).toBe("bearish");
		expect(biFactor?.note).toContain("hiking benchmark rate");
		expect(output.regimes.ihsg.contextFlags).toContain(
			"Restrictive BI Rate (6.25%)",
		);
	});

	it("evaluates US 10Y Real Yield as a primary factor in global liquidity", () => {
		const mockData = createMockData();
		// DGS10 = 3.85, PCEPILFE = 2.1 => Real Yield = 1.75%
		const output = computeCompass(mockData, DEFAULT_THRESHOLDS);

		const realYieldFactor = output.regimes.global.factors.find(
			(f) => f.key === "us_real_yield",
		);
		expect(realYieldFactor).toBeDefined();
		expect(realYieldFactor?.weight).toBe(10);
		expect(realYieldFactor?.valueStr).toBe("1.75%");
		expect(realYieldFactor?.direction).toBe("neutral");
	});

	it("evaluates Foreign Institutional Flow streak as a primary factor in IHSG", () => {
		const baseMock = createMockData();
		const mockData = createMockData({
			markets: {
				...baseMock.markets,
				ihsgFlows: {
					netBuySell1dIdr: 450000000000,
					netBuySell5dIdr: 1200000000000,
					streakDays: 4,
					asOf: "2026-10-04",
				},
			},
		});

		const output = computeCompass(mockData, DEFAULT_THRESHOLDS);
		const flowFactor = output.regimes.ihsg.factors.find(
			(f) => f.key === "ihsg_foreign_flow",
		);

		expect(flowFactor).toBeDefined();
		expect(flowFactor?.weight).toBe(10);
		expect(flowFactor?.direction).toBe("bullish");
		expect(flowFactor?.valueStr).toBe("+4D Inflow");
		expect(output.regimes.ihsg.asymmetryZone?.type).toBe("accumulation");
	});

	it("evaluates Bitcoin MVRV Z-Score as a primary factor and triggers Generational Accumulation asymmetry", () => {
		const baseMock = createMockData();
		const mockData = createMockData({
			markets: {
				...baseMock.markets,
				cryptoOnChain: {
					mvrvZScore: 0.85,
					asOf: "2026-10-04",
				},
			},
		});

		const output = computeCompass(mockData, DEFAULT_THRESHOLDS);
		const mvrvFactor = output.regimes.crypto.factors.find(
			(f) => f.key === "crypto_mvrv",
		);

		expect(mvrvFactor).toBeDefined();
		expect(mvrvFactor?.direction).toBe("bullish");
		expect(mvrvFactor?.valueStr).toBe("0.85");
		expect(output.regimes.crypto.asymmetryZone?.type).toBe("accumulation");
		expect(output.regimes.crypto.asymmetryZone?.title).toContain(
			"Generational Asymmetry",
		);
	});

	it("triggers Cycle Distribution Alert when MVRV indicates market overheat", () => {
		const baseMock = createMockData();
		const mockData = createMockData({
			markets: {
				...baseMock.markets,
				cryptoOnChain: {
					mvrvZScore: 3.45,
					asOf: "2026-10-04",
				},
			},
		});

		const output = computeCompass(mockData, DEFAULT_THRESHOLDS);
		const mvrvFactor = output.regimes.crypto.factors.find(
			(f) => f.key === "crypto_mvrv",
		);

		expect(mvrvFactor?.direction).toBe("bearish");
		expect(output.regimes.crypto.asymmetryZone?.type).toBe("distribution");
	});

	it("strictly normalizes Crypto factor weights to exactly 100 when global macro carry is insufficient", () => {
		const baseMock = createMockData();
		const mockData = createMockData({
			markets: {
				...baseMock.markets,
				macro: {}, // Clear macro so global regime is insufficient
				cryptoFlows: {
					...baseMock.markets.cryptoFlows,
					stablecoin30dChangePct: 2.1,
					btcFundingRate8hPct: 0.01,
				} as any,
				cryptoOnChain: {
					mvrvZScore: 1.8,
				} as any,
			},
		});

		const output = computeCompass(mockData, DEFAULT_THRESHOLDS);
		// Verify global regime is insufficient
		expect(output.regimes.global.state).toBe("insufficient");
		// Total weight of crypto factors must equal exactly 100
		const totalCryptoWeight = output.regimes.crypto.factors.reduce(
			(sum, f) => sum + f.weight,
			0,
		);
		expect(totalCryptoWeight).toBe(100);
	});

	it("strictly normalizes IHSG factor weights to exactly 100 when global macro carry is insufficient", () => {
		const baseMock = createMockData();
		const mockData = createMockData({
			markets: {
				...baseMock.markets,
				macro: {
					IRSTCB01IDM156N: {
						id: "IRSTCB01IDM156N",
						name: "Bank Indonesia Policy Rate",
						frequency: "Monthly",
						units: "Percent",
						data: [{ date: "2026-09-01", value: 6.0 }],
					},
				},
				ihsgFlows: {
					streakDays: 3,
					netBuySell1dIdr: 500_000_000_000,
				},
			},
		});

		const output = computeCompass(mockData, DEFAULT_THRESHOLDS);
		expect(output.regimes.global.state).toBe("insufficient");
		const totalIhsgWeight = output.regimes.ihsg.factors.reduce(
			(sum, f) => sum + f.weight,
			0,
		);
		expect(totalIhsgWeight).toBe(100);
	});
});
