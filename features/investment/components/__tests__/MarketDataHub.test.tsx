import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import MarketDataHub from "../MarketDataHub";
import type { InvestmentCompassData } from "../../types";

vi.mock("framer-motion", () => ({
	motion: new Proxy(
		{},
		{
			get: (_target, prop: string) => {
				return ({
					children,
					className,
				}: {
					children?: React.ReactNode;
					className?: string;
				}) => {
					const Tag = prop as keyof React.JSX.IntrinsicElements;
					return <Tag className={className}>{children}</Tag>;
				};
			},
		},
	),
	AnimatePresence: ({ children }: { children?: React.ReactNode }) => (
		<>{children}</>
	),
	useReducedMotion: () => false,
}));

function createMockData(
	overrides: Partial<InvestmentCompassData> = {},
): InvestmentCompassData {
	return {
		sentiment: {
			traditional: {
				fear_and_greed: {
					score: 55,
					rating: "greed",
					timestamp: "2026-10-03T12:00:00Z",
					previous_close: 52,
					previous_1_week: 50,
					previous_1_month: 48,
					previous_1_year: 45,
				},
				fear_and_greed_historical: {
					timestamp: 1727956800,
					score: 55,
					rating: "greed",
					data: [],
				},
				market_momentum_sp500: {
					timestamp: 1727956800,
					score: 55,
					rating: "greed",
					data: [],
				},
				market_momentum_sp125: {
					timestamp: 1727956800,
					score: 55,
					rating: "greed",
					data: [],
				},
				stock_price_strength: {
					timestamp: 1727956800,
					score: 55,
					rating: "greed",
					data: [],
				},
				stock_price_breadth: {
					timestamp: 1727956800,
					score: 55,
					rating: "greed",
					data: [],
				},
				put_call_options: {
					timestamp: 1727956800,
					score: 55,
					rating: "greed",
					data: [],
				},
				market_volatility_vix: {
					timestamp: 1727956800,
					score: 55,
					rating: "greed",
					data: [],
				},
				market_volatility_vix_50: {
					timestamp: 1727956800,
					score: 55,
					rating: "greed",
					data: [],
				},
				junk_bond_demand: {
					timestamp: 1727956800,
					score: 55,
					rating: "greed",
					data: [],
				},
				safe_haven_demand: {
					timestamp: 1727956800,
					score: 55,
					rating: "greed",
					data: [],
				},
			},
			crypto: null,
		},
		markets: {
			quotes: {
				SPX: {
					symbol: ".SPX",
					name: "S&P 500",
					last: 5800,
					change: 15,
					changePct: 0.26,
					open: 5800,
					high: 5800,
					low: 5800,
					previousClose: 5785,
					high52w: null,
					low52w: null,
					currency: "USD",
					lastTime: "2026-10-03",
					marketStatus: "OPEN",
					source: "cnbc",
				},
				JKSE: {
					symbol: "^JKSE",
					name: "IHSG",
					last: 7500,
					change: -20,
					changePct: -0.27,
					open: 7500,
					high: 7500,
					low: 7500,
					previousClose: 7520,
					high52w: 7900,
					low52w: 7000,
					currency: "IDR",
					lastTime: "2026-10-03",
					marketStatus: "OPEN",
					source: "yahoo",
				},
				USDIDR: {
					symbol: "IDR=X",
					name: "USD/IDR",
					last: 15600,
					change: 25,
					changePct: 0.16,
					open: 15575,
					high: 15620,
					low: 15550,
					previousClose: 15575,
					high52w: null,
					low52w: null,
					currency: "IDR",
					lastTime: "2026-10-03",
					marketStatus: "OPEN",
					source: "yahoo",
				},
				BTC: {
					symbol: "BTC-USD",
					name: "Bitcoin",
					last: 62000,
					change: 1000,
					changePct: 1.64,
					open: 61000,
					high: 62500,
					low: 60800,
					previousClose: 61000,
					high52w: 73750,
					low52w: 25000,
					currency: "USD",
					lastTime: "2026-10-03",
					marketStatus: "OPEN",
					source: "yahoo",
				},
			},
			history: {
				"^JKSE": {
					symbol: "^JKSE",
					interval: "1d",
					points: [
						{ t: 1725148800, c: 7200 },
						{ t: 1726012800, c: 7400 },
						{ t: 1727956800, c: 7500 },
					],
				},
				"BTC-USD": {
					symbol: "BTC-USD",
					interval: "1d",
					points: [
						{ t: 1725148800, c: 50000 },
						{ t: 1726012800, c: 58000 },
						{ t: 1727956800, c: 62000 },
					],
				},
			},
			cryptoFlows: {
				totalStablecoinSupplyUsd: 170000000000,
				stablecoin30dChangePct: 2.5,
				btcFundingRate8hPct: 0.008,
				btcOpenInterestUsd: 35000000000,
				updatedAt: 1727956800,
			},
			cryptoGlobal: {
				totalMarketCapUsd: 2300000000000,
				totalVolumeUsd: 75000000000,
				marketCapChange24hPct: 1.2,
				btcDominance: 56.4,
				ethDominance: 14.2,
				updatedAt: 1727956800,
			},
			macro: {
				FEDFUNDS: {
					id: "FEDFUNDS",
					name: "Federal Funds Rate",
					frequency: "Monthly",
					units: "Percent",
					data: [{ date: "2026-09-01", value: 4.83 }],
				},
				IRLTLT01IDM156N: {
					id: "IRLTLT01IDM156N",
					name: "Indonesia 10Y Yield",
					frequency: "Monthly",
					units: "Percent",
					data: [{ date: "2026-09-01", value: 6.85 }],
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

describe("MarketDataHub Component", () => {
	it("renders terminal navigation and default active tab (Indonesia IDX)", () => {
		const data = createMockData();
		const { container } = render(<MarketDataHub data={data} />);

		expect(container.textContent).toContain("Market Data Terminal");
		expect(container.textContent).toContain("Indonesia (IDX)");
		expect(container.textContent).toContain("Crypto Majors");
		expect(container.textContent).toContain("Global Macro & Contagion");

		// WAI-ARIA tab semantics
		const tablist = container.querySelector('[role="tablist"]');
		expect(tablist).not.toBeNull();
		const activeTab = tablist?.querySelector(
			'[role="tab"][aria-selected="true"]',
		);
		expect(activeTab?.textContent).toContain("Indonesia (IDX)");
		expect(activeTab?.getAttribute("aria-controls")).toBe("tabpanel-indonesia");

		// Default active tab is Indonesia
		expect(container.textContent).toContain("Indonesia Domestic Market Data");
		expect(container.textContent).toContain("200-Day Moving Average");
		expect(container.textContent).toContain("Sector Rotation Bellwethers");
	});

	it("displays --- instead of dummy yield when 10Y yield data is null", () => {
		const base = createMockData();
		const noYieldData: InvestmentCompassData = {
			...base,
			markets: {
				...base.markets,
				macro: {
					...base.markets.macro,
					IRLTLT01IDM156N:
						undefined as unknown as (typeof base.markets.macro)["IRLTLT01IDM156N"],
				},
			},
		};
		const { container } = render(<MarketDataHub data={noYieldData} />);
		expect(container.textContent).toContain("---");
		expect(container.textContent).not.toContain("6.85%");
	});

	it("switches to Crypto Majors tab and displays calibrated 59.0% dominance threshold", () => {
		const data = createMockData();
		const { getByText, container } = render(<MarketDataHub data={data} />);

		const cryptoButton = getByText("Crypto Majors");
		fireEvent.click(cryptoButton);

		expect(container.textContent).toContain(
			"Digital Asset Metrics & Liquidity",
		);
		expect(container.textContent).toContain("Bitcoin MVRV Valuation");
		expect(container.textContent).toContain("Stablecoin 30D Net Issuance");
		// Calibrated post-ETF Bitcoin dominance threshold (59.0%)
		expect(container.textContent).toContain("59.0%");
		expect(container.textContent).not.toContain("54.0%");
	});

	it("switches to Global Macro & Contagion tab and displays Regional Transmission Pulse", () => {
		const data = createMockData();
		const { getByText, container } = render(<MarketDataHub data={data} />);

		const macroButton = getByText("Global Macro & Contagion");
		fireEvent.click(macroButton);

		expect(container.textContent).toContain(
			"Regional Market Transmission Pulse",
		);
		expect(container.textContent).toContain("Contagion Monitor");
		expect(container.textContent).toContain("S&P 500");
		expect(container.textContent).toContain("Nasdaq Composite");
		expect(container.textContent).toContain("Hang Seng");
		expect(container.textContent).toContain("CBOE VIX");
	});
});
