import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import TradersCheatsheet from "../TradersCheatsheet";
import type { InvestmentCompassData } from "../../types";

function createMockData(
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
			crypto: null,
		},
		markets: {
			quotes: {
				DXY: {
					symbol: "DXY",
					name: "US Dollar Index",
					last: 102,
					change: 0,
					changePct: 0,
					open: 102,
					high: 102,
					low: 102,
					previousClose: 102,
					high52w: null,
					low52w: null,
					currency: "USD",
					lastTime: "2026-10-03",
					marketStatus: "OPEN",
					source: "cnbc",
				},
			},
			cryptoGlobal: {
				totalMarketCapUsd: 2500000000000,
				totalVolumeUsd: 60000000000,
				btcDominance: 51.5,
				ethDominance: 14,
				marketCapChange24hPct: 1.5,
				updatedAt: 1727956800,
			},
			macro: {
				BAMLH0A0HYM2: {
					id: "BAMLH0A0HYM2",
					name: "ICE BofA US High Yield Spread",
					frequency: "Daily",
					units: "Percent",
					data: [{ date: "2026-10-01", value: 3.2 }],
				},
			},
		},
		sources: {
			cnn: { ok: true, label: "CNN" },
			cryptoFng: { ok: true, label: "Crypto" },
			quotes: { ok: true, label: "Quotes" },
			coingecko: { ok: true, label: "CoinGecko" },
			fred: { ok: true, label: "FRED" },
		},
		fetchedAt: "2026-10-03T12:00:00Z",
		...overrides,
	};
}

describe("TradersCheatsheet Component", () => {
	describe("Capital Preservation Mode (Danger Zone)", () => {
		it("does not render danger banner during normal market conditions", () => {
			const data = createMockData();
			const { container } = render(<TradersCheatsheet data={data} />);

			expect(container.textContent).not.toContain("CAPITAL PRESERVATION MODE");
		});

		it("triggers Capital Preservation Mode when High Yield Spread > 5.0%", () => {
			const data = createMockData();
			if (data.markets.macro.BAMLH0A0HYM2) {
				data.markets.macro.BAMLH0A0HYM2.data = [
					{ date: "2026-10-01", value: 5.65 },
				];
			}

			const { container } = render(<TradersCheatsheet data={data} />);
			expect(container.textContent).toContain("CAPITAL PRESERVATION MODE");
			expect(container.textContent).toContain(
				"High Yield Spread is extremely elevated (5.65%)",
			);
			expect(container.textContent).toContain(
				"The macro engine has detected severe systemic stress",
			);
		});

		it("triggers Capital Preservation Mode when VIX score indicates extreme panic (<20)", () => {
			const data = createMockData();
			if (data.sentiment.traditional?.market_volatility_vix) {
				data.sentiment.traditional.market_volatility_vix.score = 12;
			}

			const { container } = render(<TradersCheatsheet data={data} />);
			expect(container.textContent).toContain("CAPITAL PRESERVATION MODE");
			expect(container.textContent).toContain(
				"VIX is signaling extreme panic and market illiquidity",
			);
		});

		it("triggers Capital Preservation Mode when CNN score < 15", () => {
			const data = createMockData();
			if (data.sentiment.traditional?.fear_and_greed) {
				data.sentiment.traditional.fear_and_greed.score = 10;
			}

			const { container } = render(<TradersCheatsheet data={data} />);
			expect(container.textContent).toContain("CAPITAL PRESERVATION MODE");
			expect(container.textContent).toContain(
				"Broad market is in absolute capitulation",
			);
		});
	});

	describe("Tactical Weekly Checklist", () => {
		it("answers 'YES' to Altcoins when BTC Dominance <= 54%", () => {
			const data = createMockData();
			if (data.markets.cryptoGlobal) {
				data.markets.cryptoGlobal.btcDominance = 51.2;
			}

			const { container } = render(<TradersCheatsheet data={data} />);
			expect(container.textContent).toContain(
				"Should I buy Altcoins this week?",
			);
			expect(container.textContent).toContain(
				"Alt-season liquidity rotation is active",
			);
		});

		it("answers 'NO' to Altcoins when BTC Dominance > 54%", () => {
			const data = createMockData();
			if (data.markets.cryptoGlobal) {
				data.markets.cryptoGlobal.btcDominance = 57.8;
			}

			const { container } = render(<TradersCheatsheet data={data} />);
			expect(container.textContent).toContain(
				"Liquidity is staying in Bitcoin",
			);
		});

		it("evaluates IHSG swing trade safety against DXY threshold (104.5)", () => {
			// Safe when DXY <= 104.5
			const safeData = createMockData();
			safeData.markets.quotes.DXY.last = 101.5;
			const { container: safeContainer } = render(
				<TradersCheatsheet data={safeData} />,
			);
			expect(safeContainer.textContent).toContain(
				"Is it safe to Swing Trade IHSG?",
			);
			expect(safeContainer.textContent).toContain(
				"US Dollar (DXY 101.5) is cooling",
			);

			// Unsafe when DXY > 104.5
			const unsafeData = createMockData();
			unsafeData.markets.quotes.DXY.last = 105.8;
			const { container: unsafeContainer } = render(
				<TradersCheatsheet data={unsafeData} />,
			);
			expect(unsafeContainer.textContent).toContain(
				"pulling foreign capital out of emerging markets",
			);
		});

		it("evaluates Lump-Sum investing depending on sentiment extremes", () => {
			// Extreme Greed (>70) -> NO
			const greedData = createMockData();
			if (greedData.sentiment.traditional?.fear_and_greed) {
				greedData.sentiment.traditional.fear_and_greed.score = 75;
			}
			const { container: greedContainer } = render(
				<TradersCheatsheet data={greedData} />,
			);
			expect(greedContainer.textContent).toContain(
				"Market is in Extreme Greed",
			);

			// Extreme Fear (<30) -> YES
			const fearData = createMockData();
			if (fearData.sentiment.traditional?.fear_and_greed) {
				fearData.sentiment.traditional.fear_and_greed.score = 25;
			}
			const { container: fearContainer } = render(
				<TradersCheatsheet data={fearData} />,
			);
			expect(fearContainer.textContent).toContain("Market is in Extreme Fear");

			// Neutral -> DCA
			const neutralData = createMockData();
			const { container: neutralContainer } = render(
				<TradersCheatsheet data={neutralData} />,
			);
			expect(neutralContainer.textContent).toContain(
				"Stick to steady Dollar-Cost Averaging",
			);
		});
	});

	describe("The Golden Rules of Discipline", () => {
		it("renders all 4 discipline rules with high contrast typography", () => {
			const data = createMockData();
			const { container } = render(<TradersCheatsheet data={data} />);

			expect(container.textContent).toContain("The Golden Rules");
			expect(container.textContent).toContain(
				"Unbreakable discipline protocols",
			);
			expect(container.textContent).toContain(
				"Never average down on a losing swing trade",
			);
			expect(container.textContent).toContain("Respect the Macro Regime");
			expect(container.textContent).toContain(
				"Yield Curve Inversion = Flight to Quality",
			);
			expect(container.textContent).toContain("Do not buy into Extreme Greed");
		});
	});
});
