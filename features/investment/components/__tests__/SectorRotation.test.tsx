import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import SectorRotation from "../SectorRotation";
import type { InvestmentCompassData } from "../../types";

function createMockData(
	overrides: Partial<InvestmentCompassData> = {},
): InvestmentCompassData {
	return {
		sentiment: {
			traditional: {
				fear_and_greed: {
					score: 70,
					rating: "greed",
					timestamp: "2026-10-03T12:00:00Z",
					previous_close: 68,
					previous_1_week: 65,
					previous_1_month: 60,
					previous_1_year: 50,
				},
				fear_and_greed_historical: {
					timestamp: 1727956800,
					score: 70,
					rating: "greed",
					data: [],
				},
				market_momentum_sp500: {
					timestamp: 1727956800,
					score: 70,
					rating: "greed",
					data: [],
				},
				market_momentum_sp125: {
					timestamp: 1727956800,
					score: 70,
					rating: "greed",
					data: [],
				},
				stock_price_strength: {
					timestamp: 1727956800,
					score: 70,
					rating: "greed",
					data: [],
				},
				stock_price_breadth: {
					timestamp: 1727956800,
					score: 70,
					rating: "greed",
					data: [],
				},
				put_call_options: {
					timestamp: 1727956800,
					score: 70,
					rating: "greed",
					data: [],
				},
				market_volatility_vix: {
					timestamp: 1727956800,
					score: 70,
					rating: "greed",
					data: [],
				},
				market_volatility_vix_50: {
					timestamp: 1727956800,
					score: 70,
					rating: "greed",
					data: [],
				},
				junk_bond_demand: {
					timestamp: 1727956800,
					score: 70,
					rating: "greed",
					data: [],
				},
				safe_haven_demand: {
					timestamp: 1727956800,
					score: 70,
					rating: "greed",
					data: [],
				},
			},
			crypto: null,
		},
		markets: {
			quotes: {
				XLK: {
					symbol: "XLK",
					name: "Technology Select Sector SPDR",
					last: 220,
					change: 2.5,
					changePct: 1.15,
					open: 220,
					high: 220,
					low: 220,
					previousClose: 217.5,
					high52w: null,
					low52w: null,
					currency: "USD",
					lastTime: "2026-10-03",
					marketStatus: "OPEN",
					source: "cnbc",
				},
				XLY: {
					symbol: "XLY",
					name: "Consumer Discretionary Select Sector SPDR",
					last: 195,
					change: 1.2,
					changePct: 0.62,
					open: 195,
					high: 195,
					low: 195,
					previousClose: 193.8,
					high52w: null,
					low52w: null,
					currency: "USD",
					lastTime: "2026-10-03",
					marketStatus: "OPEN",
					source: "cnbc",
				},
				XLU: {
					symbol: "XLU",
					name: "Utilities Select Sector SPDR",
					last: 70,
					change: -0.5,
					changePct: -0.71,
					open: 70,
					high: 70,
					low: 70,
					previousClose: 70.5,
					high52w: null,
					low52w: null,
					currency: "USD",
					lastTime: "2026-10-03",
					marketStatus: "OPEN",
					source: "cnbc",
				},
				XLP: {
					symbol: "XLP",
					name: "Consumer Staples Select Sector SPDR",
					last: 78,
					change: -0.3,
					changePct: -0.38,
					open: 78,
					high: 78,
					low: 78,
					previousClose: 78.3,
					high52w: null,
					low52w: null,
					currency: "USD",
					lastTime: "2026-10-03",
					marketStatus: "OPEN",
					source: "cnbc",
				},
				XLE: {
					symbol: "XLE",
					name: "Energy Select Sector SPDR",
					last: 90,
					change: 0.8,
					changePct: 0.9,
					open: 90,
					high: 90,
					low: 90,
					previousClose: 89.2,
					high52w: null,
					low52w: null,
					currency: "USD",
					lastTime: "2026-10-03",
					marketStatus: "OPEN",
					source: "cnbc",
				},
				XLF: {
					symbol: "XLF",
					name: "Financial Select Sector SPDR",
					last: 42,
					change: 0.4,
					changePct: 0.95,
					open: 42,
					high: 42,
					low: 42,
					previousClose: 41.6,
					high52w: null,
					low52w: null,
					currency: "USD",
					lastTime: "2026-10-03",
					marketStatus: "OPEN",
					source: "cnbc",
				},
				XLB: {
					symbol: "XLB",
					name: "Materials Select Sector SPDR",
					last: 88,
					change: 0.2,
					changePct: 0.23,
					open: 88,
					high: 88,
					low: 88,
					previousClose: 87.8,
					high52w: null,
					low52w: null,
					currency: "USD",
					lastTime: "2026-10-03",
					marketStatus: "OPEN",
					source: "cnbc",
				},
				XLV: {
					symbol: "XLV",
					name: "Health Care Select Sector SPDR",
					last: 145,
					change: -0.1,
					changePct: -0.07,
					open: 145,
					high: 145,
					low: 145,
					previousClose: 145.1,
					high52w: null,
					low52w: null,
					currency: "USD",
					lastTime: "2026-10-03",
					marketStatus: "OPEN",
					source: "cnbc",
				},
				XLI: {
					symbol: "XLI",
					name: "Industrial Select Sector SPDR",
					last: 125,
					change: 0.6,
					changePct: 0.48,
					open: 125,
					high: 125,
					low: 125,
					previousClose: 124.4,
					high52w: null,
					low52w: null,
					currency: "USD",
					lastTime: "2026-10-03",
					marketStatus: "OPEN",
					source: "cnbc",
				},
				XLC: {
					symbol: "XLC",
					name: "Communication Services Select Sector SPDR",
					last: 85,
					change: 0.7,
					changePct: 0.83,
					open: 85,
					high: 85,
					low: 85,
					previousClose: 84.3,
					high52w: null,
					low52w: null,
					currency: "USD",
					lastTime: "2026-10-03",
					marketStatus: "OPEN",
					source: "cnbc",
				},
				XLRE: {
					symbol: "XLRE",
					name: "Real Estate Select Sector SPDR",
					last: 40,
					change: -0.4,
					changePct: -0.99,
					open: 40,
					high: 40,
					low: 40,
					previousClose: 40.4,
					high52w: null,
					low52w: null,
					currency: "USD",
					lastTime: "2026-10-03",
					marketStatus: "OPEN",
					source: "cnbc",
				},
				DXY: {
					symbol: "DXY",
					name: "US Dollar Index",
					last: 101,
					change: 0,
					changePct: 0,
					open: 101,
					high: 101,
					low: 101,
					previousClose: 101,
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
					name: "IHSG",
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
			cryptoGlobal: null,
			macro: {
				DGS10: {
					id: "DGS10",
					name: "10-Year Treasury Constant Maturity",
					frequency: "Daily",
					units: "Percent",
					data: [{ date: "2026-10-01", value: 4.1 }],
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

describe("SectorRotation Component", () => {
	it("renders Sector Rotation header and narrative", () => {
		const data = createMockData();
		const { container } = render(<SectorRotation data={data} />);

		expect(container.textContent).toContain("Sector Rotation");
		expect(container.textContent).toContain("Regime-based US ETF Allocations");
		expect(container.textContent).toContain("Pro-cyclical growth rotation");
	});

	it("renders Overweight and Underweight sections with appropriate sector pills", () => {
		const data = createMockData();
		const { container } = render(<SectorRotation data={data} />);

		expect(container.textContent).toContain("Overweight / Watch");
		expect(container.textContent).toContain("Underweight / Avoid");

		// In expansion (score 70, yield 4.1): XLK, XLY are overweight, XLU, XLP are underweight
		expect(container.textContent).toContain("Technology");
		expect(container.textContent).toContain("XLK");
		expect(container.textContent).toContain("+1.15%");

		expect(container.textContent).toContain("Utilities");
		expect(container.textContent).toContain("XLU");
		expect(container.textContent).toContain("-0.71%");
	});

	it("renders IHSG and Crypto translator proxy badges correctly", () => {
		const data = createMockData();
		const { container } = render(<SectorRotation data={data} />);

		// Proxy badges
		expect(container.textContent).toContain("Proxy: Crypto Majors");
		expect(container.textContent).toContain("Bullish: Strong Consumer");
		expect(container.textContent).toContain("DANGER: Move to Cash/Defensives");
	});

	it("renders Energy & Financial proxies in decoupling regime", () => {
		const data = createMockData();
		if (data.markets.macro.DGS10) {
			data.markets.macro.DGS10.data = [{ date: "2026-10-01", value: 4.75 }];
		}

		const { container } = render(<SectorRotation data={data} />);
		expect(container.textContent).toContain("Proxy: IHSG Energy (ADRO, MEDC)");
		expect(container.textContent).toContain("Proxy: IHSG Banks (BBCA, BMRI)");
	});
});
