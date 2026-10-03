import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import MarketDeltaAlerts from "../MarketDeltaAlerts";
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
				VIX: {
					symbol: ".VIX",
					name: "CBOE Volatility Index",
					last: 15,
					change: 0,
					changePct: 0,
					open: 15,
					high: 15,
					low: 15,
					previousClose: 15,
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
			},
			cryptoGlobal: null,
			macro: {},
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

describe("MarketDeltaAlerts Component", () => {
	it("renders nothing (null) when there are no significant market delta shifts", () => {
		const data = createMockData();
		const { container } = render(<MarketDeltaAlerts data={data} />);
		expect(container.firstChild).toBeNull();
	});

	it("renders VIX Spike danger alert when VIX changePct >= 10%", () => {
		const data = createMockData();
		data.markets.quotes.VIX.changePct = 14.5;

		const { container } = render(<MarketDeltaAlerts data={data} />);
		expect(container.textContent).toContain("Significant Market Shifts");
		expect(container.textContent).toContain(
			"Volatility Shock: VIX spiked +14.5%",
		);
	});

	it("renders VIX Crush alert when VIX changePct <= -10%", () => {
		const data = createMockData();
		data.markets.quotes.VIX.changePct = -11.2;

		const { container } = render(<MarketDeltaAlerts data={data} />);
		expect(container.textContent).toContain(
			"Volatility Crush: VIX dropped -11.2%",
		);
	});

	it("renders Sentiment Plunge alert when CNN Fear & Greed drops >= 15 points overnight", () => {
		const data = createMockData();
		if (data.sentiment.traditional?.fear_and_greed) {
			data.sentiment.traditional.fear_and_greed.score = 30;
			data.sentiment.traditional.fear_and_greed.previous_close = 50; // delta: -20
		}

		const { container } = render(<MarketDeltaAlerts data={data} />);
		expect(container.textContent).toContain(
			"Sentiment Plunge: CNN Fear & Greed dropped 20 points",
		);
	});

	it("renders Sentiment Surge alert when CNN Fear & Greed jumps >= 15 points overnight", () => {
		const data = createMockData();
		if (data.sentiment.traditional?.fear_and_greed) {
			data.sentiment.traditional.fear_and_greed.score = 68;
			data.sentiment.traditional.fear_and_greed.previous_close = 45; // delta: +23
		}

		const { container } = render(<MarketDeltaAlerts data={data} />);
		expect(container.textContent).toContain(
			"Sentiment Surge: CNN Fear & Greed jumped +23 points",
		);
	});

	it("renders US and Domestic selloff alerts when equity indices breach thresholds", () => {
		const data = createMockData();
		data.markets.quotes.SPX.changePct = -2.35;
		data.markets.quotes.IHSG.changePct = -1.85;

		const { container } = render(<MarketDeltaAlerts data={data} />);
		expect(container.textContent).toContain(
			"US Selloff: S&P 500 is down -2.35%",
		);
		expect(container.textContent).toContain(
			"Domestic Selloff: IHSG is down -1.85%",
		);
	});

	it("renders Dollar Rally warning when DXY surges >= 0.8%", () => {
		const data = createMockData();
		data.markets.quotes.DXY.changePct = 0.95;

		const { container } = render(<MarketDeltaAlerts data={data} />);
		expect(container.textContent).toContain("Dollar Rally: DXY surged +0.95%");
		expect(container.textContent).toContain("headwinds for Crypto and IHSG");
	});
});
