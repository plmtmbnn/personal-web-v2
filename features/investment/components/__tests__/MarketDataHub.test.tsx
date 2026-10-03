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
				IHSG: {
					symbol: "^JKSE",
					name: "IHSG",
					last: 7500,
					change: -20,
					changePct: -0.27,
					open: 7500,
					high: 7500,
					low: 7500,
					previousClose: 7520,
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
				FEDFUNDS: {
					id: "FEDFUNDS",
					name: "Federal Funds Rate",
					frequency: "Monthly",
					units: "Percent",
					data: [{ date: "2026-09-01", value: 4.83 }],
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
	it("renders terminal navigation and default active tab (Macro Lens)", () => {
		const data = createMockData();
		const { container } = render(<MarketDataHub data={data} />);

		expect(container.textContent).toContain("Market Data Terminal");
		expect(container.textContent).toContain("Raw Indicators & Quotes");
		expect(container.textContent).toContain("Macro Lens");
		expect(container.textContent).toContain("Global Quotes");
		expect(container.textContent).toContain("Economic Narrative");
		expect(container.textContent).toContain("Sentiment Dials");
	});

	it("switches to Global Quotes tab when clicked", () => {
		const data = createMockData();
		const { getByText, container } = render(<MarketDataHub data={data} />);

		const quotesButton = getByText("Global Quotes");
		fireEvent.click(quotesButton);

		expect(container.textContent).toContain("Global Macro & Micro Outlook");
		expect(container.textContent).toContain("Live Cross-Asset Summary");
	});

	it("switches to Economic Narrative tab when clicked", () => {
		const data = createMockData();
		const { getByText, container } = render(<MarketDataHub data={data} />);

		const narrativeButton = getByText("Economic Narrative");
		fireEvent.click(narrativeButton);

		expect(container.textContent).toContain("Macro Economy");
		expect(container.textContent).toContain("Micro / Corporate Health");
	});

	it("switches to Sentiment Dials tab when clicked", () => {
		const data = createMockData();
		const { getByText, container } = render(<MarketDataHub data={data} />);

		const sentimentButton = getByText("Sentiment Dials");
		fireEvent.click(sentimentButton);

		expect(container.textContent).toContain("Traditional Market Sentiment");
	});
});
