import { describe, expect, it } from "vitest";
import { generatePlaybook } from "../engine";
import type { InvestmentCompassData } from "../../types";

function createMockCompassData(
	overrides: Partial<InvestmentCompassData> = {},
): InvestmentCompassData {
	return {
		sentiment: {
			traditional: {
				fear_and_greed: {
					score: 50,
					rating: "neutral",
					timestamp: "2026-10-03T12:00:00Z",
					previous_close: 50,
					previous_1_week: 50,
					previous_1_month: 50,
					previous_1_year: 50,
				},
				fear_and_greed_historical: {
					timestamp: 1727956800,
					score: 50,
					rating: "neutral",
					data: [],
				},
				market_momentum_sp500: {
					timestamp: 1727956800,
					score: 50,
					rating: "neutral",
					data: [],
				},
				market_momentum_sp125: {
					timestamp: 1727956800,
					score: 50,
					rating: "neutral",
					data: [],
				},
				stock_price_strength: {
					timestamp: 1727956800,
					score: 50,
					rating: "neutral",
					data: [],
				},
				stock_price_breadth: {
					timestamp: 1727956800,
					score: 50,
					rating: "neutral",
					data: [],
				},
				put_call_options: {
					timestamp: 1727956800,
					score: 50,
					rating: "neutral",
					data: [],
				},
				market_volatility_vix: {
					timestamp: 1727956800,
					score: 50,
					rating: "neutral",
					data: [],
				},
				market_volatility_vix_50: {
					timestamp: 1727956800,
					score: 50,
					rating: "neutral",
					data: [],
				},
				junk_bond_demand: {
					timestamp: 1727956800,
					score: 50,
					rating: "neutral",
					data: [],
				},
				safe_haven_demand: {
					timestamp: 1727956800,
					score: 50,
					rating: "neutral",
					data: [],
				},
			},
			crypto: {
				name: "Fear and Greed Index",
				data: [
					{
						value: "50",
						value_classification: "Neutral",
						timestamp: "1727956800",
					},
				],
			},
		},
		markets: {
			quotes: {
				DXY: {
					symbol: "DXY",
					name: "US Dollar Index",
					last: 100,
					change: 0,
					changePct: 0,
					open: 100,
					high: 100,
					low: 100,
					previousClose: 100,
					high52w: null,
					low52w: null,
					currency: "USD",
					lastTime: "2026-10-03",
					marketStatus: "OPEN",
					source: "cnbc",
				},
				SPX: {
					symbol: ".SPX",
					name: "S&P 500",
					last: 5800,
					change: 0,
					changePct: 0,
					open: 5800,
					high: 5800,
					low: 5800,
					previousClose: 5800,
					high52w: null,
					low52w: null,
					currency: "USD",
					lastTime: "2026-10-03",
					marketStatus: "OPEN",
					source: "cnbc",
				},
				IHSG: {
					symbol: "^JKSE",
					name: "Jakarta Composite Index",
					last: 7500,
					change: 0,
					changePct: 0,
					open: 7500,
					high: 7500,
					low: 7500,
					previousClose: 7500,
					high52w: null,
					low52w: null,
					currency: "IDR",
					lastTime: "2026-10-03",
					marketStatus: "OPEN",
					source: "cnbc",
				},
			},
			cryptoGlobal: {
				totalMarketCapUsd: 2500000000000,
				totalVolumeUsd: 60000000000,
				btcDominance: 52,
				ethDominance: 14,
				marketCapChange24hPct: 1.5,
				updatedAt: 1727956800,
			},
			macro: {
				FEDFUNDS: {
					id: "FEDFUNDS",
					name: "Federal Funds Effective Rate",
					frequency: "Monthly",
					units: "Percent",
					data: [{ date: "2026-09-01", value: 4.83 }],
				},
				DGS10: {
					id: "DGS10",
					name: "Market Yield on U.S. Treasury Securities at 10-Year Constant Maturity",
					frequency: "Daily",
					units: "Percent",
					data: [{ date: "2026-10-01", value: 4.2 }],
				},
				T10Y2Y: {
					id: "T10Y2Y",
					name: "10-Year Treasury Minus 2-Year Treasury Constant Maturity",
					frequency: "Daily",
					units: "Percent",
					data: [{ date: "2026-10-01", value: 0.15 }],
				},
				BAMLH0A0HYM2: {
					id: "BAMLH0A0HYM2",
					name: "ICE BofA US High Yield Index Option-Adjusted Spread",
					frequency: "Daily",
					units: "Percent",
					data: [{ date: "2026-10-01", value: 3.4 }],
				},
				UNRATE: {
					id: "UNRATE",
					name: "Unemployment Rate",
					frequency: "Monthly",
					units: "Percent",
					data: [{ date: "2026-09-01", value: 4.1 }],
				},
			},
		},
		sources: {
			cnn: { ok: true, label: "CNN Fear & Greed" },
			cryptoFng: { ok: true, label: "Crypto Fear & Greed" },
			quotes: { ok: true, label: "Market Quotes" },
			coingecko: { ok: true, label: "CoinGecko Global" },
			fred: { ok: true, label: "St. Louis Fed FRED" },
		},
		fetchedAt: "2026-10-03T12:00:00Z",
		...overrides,
	};
}

describe("Investment Compass Engine (generatePlaybook)", () => {
	describe("Macro Regime Classification", () => {
		it("identifies 'capitulation' when CNN score < 35 and High Yield Spread > 5.0", () => {
			const data = createMockCompassData();
			if (data.sentiment.traditional?.fear_and_greed) {
				data.sentiment.traditional.fear_and_greed.score = 25;
			}
			if (data.markets.macro.BAMLH0A0HYM2) {
				data.markets.macro.BAMLH0A0HYM2.data = [
					{ date: "2026-10-01", value: 5.8 },
				];
			}

			const output = generatePlaybook(data);

			expect(output.regime.key).toBe("capitulation");
			expect(output.regime.title).toBe("Risk-Off Capitulation");
			expect(output.regime.stance).toBe("Defensive");
			expect(output.regime.tone).toBe("negative");
			expect(output.regime.riskAppetite).toBe(1);
			expect(output.regime.playbook.favored).toContain("Cash");
			expect(output.regime.playbook.favored).toContain("Bonds");

			// Allocation in capitulation: capital preservation posture
			expect(output.allocation).toEqual({
				equities: 30,
				crypto: 5,
				gold: 15,
				cashBonds: 50,
			});

			// Sector rotation: defensive flight to utilities/staples/healthcare
			expect(output.sectorRotation.overweight).toEqual(["XLU", "XLP", "XLV"]);
			expect(output.sectorRotation.underweight).toContain("XLK");
			expect(output.sectorRotation.narrative).toContain(
				"Defensive flight to safety",
			);
		});

		it("identifies 'expansion' when CNN score > 65 and 10Y Yield < 4.5%", () => {
			const data = createMockCompassData();
			if (data.sentiment.traditional?.fear_and_greed) {
				data.sentiment.traditional.fear_and_greed.score = 72;
			}
			if (data.markets.macro.DGS10) {
				data.markets.macro.DGS10.data = [{ date: "2026-10-01", value: 3.9 }];
			}

			const output = generatePlaybook(data);

			expect(output.regime.key).toBe("expansion");
			expect(output.regime.title).toBe("Goldilocks Expansion");
			expect(output.regime.stance).toBe("Risk-On");
			expect(output.regime.tone).toBe("positive");
			expect(output.regime.riskAppetite).toBe(9);

			// Allocation in expansion
			expect(output.allocation).toEqual({
				equities: 65,
				crypto: 10,
				gold: 5,
				cashBonds: 20,
			});

			// Sector rotation: pro-cyclical growth rotation
			expect(output.sectorRotation.overweight).toEqual([
				"XLK",
				"XLY",
				"XLC",
				"XLI",
			]);
			expect(output.sectorRotation.underweight).toEqual(["XLU", "XLP", "XLRE"]);
			expect(output.sectorRotation.narrative).toContain(
				"Pro-cyclical growth rotation",
			);
		});

		it("identifies 'speculative_decoupling' when CNN score > 65 and 10Y Yield >= 4.5%", () => {
			const data = createMockCompassData();
			if (data.sentiment.traditional?.fear_and_greed) {
				data.sentiment.traditional.fear_and_greed.score = 78;
			}
			if (data.markets.macro.DGS10) {
				data.markets.macro.DGS10.data = [{ date: "2026-10-01", value: 4.65 }];
			}

			const output = generatePlaybook(data);

			expect(output.regime.key).toBe("speculative_decoupling");
			expect(output.regime.title).toBe("Speculative Decoupling");
			expect(output.regime.stance).toBe("Cautious Bull");
			expect(output.regime.tone).toBe("caution");
			expect(output.regime.divergence).toBe(1);

			// Allocation: take profit, raise cash & gold
			expect(output.allocation).toEqual({
				equities: 50,
				crypto: 5,
				gold: 10,
				cashBonds: 35,
			});

			// Sector rotation: inflation & rate beneficiaries
			expect(output.sectorRotation.overweight).toEqual([
				"XLE",
				"XLB",
				"XLV",
				"XLF",
			]);
			expect(output.sectorRotation.narrative).toContain(
				"Inflation and rates are sticky",
			);
		});

		it("defaults to 'defensive_rotation' in mixed or neutral conditions", () => {
			const data = createMockCompassData();
			if (data.sentiment.traditional?.fear_and_greed) {
				data.sentiment.traditional.fear_and_greed.score = 52;
			}

			const output = generatePlaybook(data);

			expect(output.regime.key).toBe("defensive_rotation");
			expect(output.regime.title).toBe("Range-Bound Rotation");
			expect(output.regime.stance).toBe("Neutral");
			expect(output.regime.tone).toBe("neutral");

			// Allocation
			expect(output.allocation).toEqual({
				equities: 60,
				crypto: 10,
				gold: 5,
				cashBonds: 25,
			});

			// Sector rotation
			expect(output.sectorRotation.overweight).toEqual(["XLV", "XLP", "XLU"]);
		});
	});

	describe("Tactical Asset Recommendations", () => {
		it("recommends Overweight on US Equities when sentiment is in Extreme Fear (<35)", () => {
			const data = createMockCompassData();
			if (data.sentiment.traditional?.fear_and_greed) {
				data.sentiment.traditional.fear_and_greed.score = 22;
			}

			const output = generatePlaybook(data);
			const usRec = output.recommendations.find(
				(r) => r.assetClass === "US Equities",
			);

			expect(usRec).toBeDefined();
			expect(usRec?.stance).toBe("Overweight");
			expect(usRec?.action).toContain("Aggressively DCA into SPY/QQQ");
		});

		it("recommends Underweight on US Equities when sentiment is in Extreme Greed (>75)", () => {
			const data = createMockCompassData();
			if (data.sentiment.traditional?.fear_and_greed) {
				data.sentiment.traditional.fear_and_greed.score = 82;
			}

			const output = generatePlaybook(data);
			const usRec = output.recommendations.find(
				(r) => r.assetClass === "US Equities",
			);

			expect(usRec?.stance).toBe("Underweight");
			expect(usRec?.action).toContain("Trim extended winners");
		});

		it("evaluates Asia / IHSG stance based on US Dollar Index (DXY)", () => {
			// Case 1: DXY > 104 -> Underweight (headwind)
			const highDxyData = createMockCompassData();
			highDxyData.markets.quotes.DXY.last = 105.8;

			const outputHigh = generatePlaybook(highDxyData);
			const ihsgHigh = outputHigh.recommendations.find(
				(r) => r.assetClass === "Asia / IHSG",
			);
			expect(ihsgHigh?.stance).toBe("Underweight");
			expect(ihsgHigh?.summary).toContain("Strong USD pressuring");

			// Case 2: DXY <= 104 -> Neutral
			const normalDxyData = createMockCompassData();
			normalDxyData.markets.quotes.DXY.last = 101.5;

			const outputNormal = generatePlaybook(normalDxyData);
			const ihsgNormal = outputNormal.recommendations.find(
				(r) => r.assetClass === "Asia / IHSG",
			);
			expect(ihsgNormal?.stance).toBe("Neutral");
		});

		it("evaluates Crypto stance based on Crypto Fear & Greed Index", () => {
			// Extreme fear in crypto (< 30) -> Overweight
			const fearCryptoData = createMockCompassData();
			if (fearCryptoData.sentiment.crypto?.data?.[0]) {
				fearCryptoData.sentiment.crypto.data[0].value = "18";
			}

			const outputFear = generatePlaybook(fearCryptoData);
			const cryptoFear = outputFear.recommendations.find(
				(r) => r.assetClass === "Crypto",
			);
			expect(cryptoFear?.stance).toBe("Overweight");
			expect(cryptoFear?.action).toContain("DCA into BTC/ETH majors");

			// Extreme greed in crypto (> 75) -> Underweight
			const greedCryptoData = createMockCompassData();
			if (greedCryptoData.sentiment.crypto?.data?.[0]) {
				greedCryptoData.sentiment.crypto.data[0].value = "88";
			}

			const outputGreed = generatePlaybook(greedCryptoData);
			const cryptoGreed = outputGreed.recommendations.find(
				(r) => r.assetClass === "Crypto",
			);
			expect(cryptoGreed?.stance).toBe("Underweight");
			expect(cryptoGreed?.action).toContain("Take 20-30% profits");
		});

		it("evaluates Gold stance based on 10Y Yield hurdle (4.5%)", () => {
			const highYieldData = createMockCompassData();
			if (highYieldData.markets.macro.DGS10) {
				highYieldData.markets.macro.DGS10.data = [
					{ date: "2026-10-01", value: 4.8 },
				];
			}
			expect(
				generatePlaybook(highYieldData).recommendations.find(
					(r) => r.assetClass === "Gold",
				)?.stance,
			).toBe("Underweight");

			const lowYieldData = createMockCompassData();
			if (lowYieldData.markets.macro.DGS10) {
				lowYieldData.markets.macro.DGS10.data = [
					{ date: "2026-10-01", value: 3.8 },
				];
			}
			expect(
				generatePlaybook(lowYieldData).recommendations.find(
					(r) => r.assetClass === "Gold",
				)?.stance,
			).toBe("Overweight");
		});

		it("evaluates Bonds / Cash stance based on Fed Funds Rate (5.0%)", () => {
			const highFedFundsData = createMockCompassData();
			if (highFedFundsData.markets.macro.FEDFUNDS) {
				highFedFundsData.markets.macro.FEDFUNDS.data = [
					{ date: "2026-09-01", value: 5.33 },
				];
			}
			expect(
				generatePlaybook(highFedFundsData).recommendations.find(
					(r) => r.assetClass === "Bonds / Cash",
				)?.stance,
			).toBe("Overweight");

			const lowFedFundsData = createMockCompassData();
			if (lowFedFundsData.markets.macro.FEDFUNDS) {
				lowFedFundsData.markets.macro.FEDFUNDS.data = [
					{ date: "2026-09-01", value: 4.25 },
				];
			}
			expect(
				generatePlaybook(lowFedFundsData).recommendations.find(
					(r) => r.assetClass === "Bonds / Cash",
				)?.stance,
			).toBe("Neutral");
		});
	});

	describe("Timeframe Guidelines", () => {
		it("recommends Scalping Favorable when VIX score > 60 or crypto volume > 80B", () => {
			const highVolData = createMockCompassData();
			if (highVolData.markets.cryptoGlobal) {
				highVolData.markets.cryptoGlobal.totalVolumeUsd = 95000000000;
			}

			const output = generatePlaybook(highVolData);
			const scalping = output.timeframes.find((t) => t.id === "scalping");
			expect(scalping?.status).toBe("Favorable");
		});

		it("recommends Scalping Avoid in low volatility environments", () => {
			const lowVolData = createMockCompassData();
			if (lowVolData.sentiment.traditional?.market_volatility_vix) {
				lowVolData.sentiment.traditional.market_volatility_vix.score = 75;
			}
			if (lowVolData.markets.cryptoGlobal) {
				lowVolData.markets.cryptoGlobal.totalVolumeUsd = 30000000000;
			}

			const output = generatePlaybook(lowVolData);
			const scalping = output.timeframes.find((t) => t.id === "scalping");
			expect(scalping?.status).toBe("Avoid");
		});

		it("recommends Swing Trade Favorable in expansion, Avoid in capitulation, Selective otherwise", () => {
			// Expansion
			const expData = createMockCompassData();
			if (expData.sentiment.traditional?.fear_and_greed) {
				expData.sentiment.traditional.fear_and_greed.score = 75;
			}
			if (expData.markets.macro.DGS10) {
				expData.markets.macro.DGS10.data = [{ date: "2026-10-01", value: 4.1 }];
			}
			expect(
				generatePlaybook(expData).timeframes.find((t) => t.id === "swing")
					?.status,
			).toBe("Favorable");

			// Capitulation
			const capData = createMockCompassData();
			if (capData.sentiment.traditional?.fear_and_greed) {
				capData.sentiment.traditional.fear_and_greed.score = 20;
			}
			if (capData.markets.macro.BAMLH0A0HYM2) {
				capData.markets.macro.BAMLH0A0HYM2.data = [
					{ date: "2026-10-01", value: 6.2 },
				];
			}
			expect(
				generatePlaybook(capData).timeframes.find((t) => t.id === "swing")
					?.status,
			).toBe("Avoid");
		});

		it("recommends Investment Hold in peak greed and Favorable during fear/consolidation", () => {
			const greedData = createMockCompassData();
			if (greedData.sentiment.traditional?.fear_and_greed) {
				greedData.sentiment.traditional.fear_and_greed.score = 80;
			}
			expect(
				generatePlaybook(greedData).timeframes.find(
					(t) => t.id === "investment",
				)?.status,
			).toBe("Hold");

			const neutralData = createMockCompassData();
			expect(
				generatePlaybook(neutralData).timeframes.find(
					(t) => t.id === "investment",
				)?.status,
			).toBe("Favorable");
		});
	});

	describe("Economy Backdrop Summary (Macro & Micro)", () => {
		it("synthesizes restrictive macro policy and inversion risks", () => {
			const data = createMockCompassData();
			if (data.markets.macro.FEDFUNDS) {
				data.markets.macro.FEDFUNDS.data = [
					{ date: "2026-09-01", value: 5.25 },
				];
			}
			if (data.markets.macro.T10Y2Y) {
				data.markets.macro.T10Y2Y.data = [{ date: "2026-10-01", value: -0.22 }];
			}
			data.markets.quotes.DXY.last = 106.2;

			const output = generatePlaybook(data);
			expect(output.economySummary.macro.tone).toBe("caution");
			expect(output.economySummary.macro.headline).toBe(
				"Restrictive Policy & Recession Risks",
			);
			expect(
				output.economySummary.macro.keynotes.some((k) =>
					k.includes("Restrictive Monetary Policy"),
				),
			).toBe(true);
			expect(
				output.economySummary.macro.keynotes.some((k) =>
					k.includes("Yield Curve Inversion"),
				),
			).toBe(true);
			expect(
				output.economySummary.macro.keynotes.some((k) =>
					k.includes("Strong US Dollar"),
				),
			).toBe(true);
		});

		it("synthesizes corporate credit health and broad market breadth in micro summary", () => {
			const data = createMockCompassData();
			if (data.markets.macro.BAMLH0A0HYM2) {
				data.markets.macro.BAMLH0A0HYM2.data = [
					{ date: "2026-10-01", value: 3.1 },
				];
			}
			if (data.sentiment.traditional?.stock_price_breadth) {
				data.sentiment.traditional.stock_price_breadth.score = 72;
			}

			const output = generatePlaybook(data);
			expect(output.economySummary.micro.tone).toBe("positive");
			expect(output.economySummary.micro.headline).toBe(
				"Strong Corporate Health & Participation",
			);
			expect(
				output.economySummary.micro.keynotes.some((k) =>
					k.includes("Healthy Corporate Credit"),
				),
			).toBe(true);
			expect(
				output.economySummary.micro.keynotes.some((k) =>
					k.includes("Broad Market Participation"),
				),
			).toBe(true);
		});
	});

	describe("Defensive Edge Case Resilience", () => {
		it("handles missing macro series and partial quote dictionaries without throwing", () => {
			const emptyData: InvestmentCompassData = {
				sentiment: {
					traditional: null,
					crypto: null,
				},
				markets: {
					quotes: {},
					cryptoGlobal: null,
					macro: {},
				},
				sources: {
					cnn: { ok: false, label: "CNN" },
					cryptoFng: { ok: false, label: "Crypto" },
					quotes: { ok: false, label: "Quotes" },
					coingecko: { ok: false, label: "CoinGecko" },
					fred: { ok: false, label: "FRED" },
				},
				fetchedAt: "2026-10-03T00:00:00Z",
			};

			expect(() => generatePlaybook(emptyData)).not.toThrow();

			const output = generatePlaybook(emptyData);
			expect(output.regime.key).toBe("defensive_rotation");
			expect(output.recommendations.length).toBe(6);
			expect(output.timeframes.length).toBe(3);
			expect(output.sectorRotation.overweight.length).toBeGreaterThan(0);
		});
	});
});
