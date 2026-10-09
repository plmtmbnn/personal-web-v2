import { describe, expect, it } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import OverviewRegimes from "../OverviewRegimes";
import type { MarketRegimeScore } from "../../types";

const mockGlobalRegime: MarketRegimeScore = {
	id: "global",
	title: "Global Liquidity & Macro",
	marketName: "Global Macro Context",
	state: "selective",
	score: 52,
	coverage: 1.0,
	headline: "Neutral global financial conditions",
	diagnosis: "Moderate US dollar strength and steady yields",
	tone: "neutral",
	factors: [
		{
			key: "dxy",
			label: "US Dollar Index",
			valueStr: "103.2",
			score: 55,
			weight: 0.3,
			direction: "neutral",
			note: "DXY hovering in normal range",
		},
	],
	contextFlags: ["Neutral Macro"],
};

const mockIhsgRegime: MarketRegimeScore = {
	id: "ihsg",
	title: "IHSG Composite Regime",
	marketName: "Indonesia IDX",
	state: "defensive",
	score: 38,
	coverage: 0.9,
	headline: "IDX trading below key technical thresholds",
	diagnosis: "USDIDR depreciation pressure elevated",
	tone: "caution",
	factors: [
		{
			key: "ihsg_trend",
			label: "Price vs 200D MA",
			valueStr: "-2.4%",
			score: 35,
			weight: 0.35,
			direction: "bearish",
			note: "Trading below structural long-term average",
		},
		{
			key: "usdidr",
			label: "USD/IDR FX Stability",
			valueStr: "Rp 15,850",
			score: 40,
			weight: 0.25,
			direction: "bearish",
			note: "Rupiah under mild pressure",
		},
	],
	contextFlags: ["Below 200D MA"],
};

const mockCryptoRegime: MarketRegimeScore = {
	id: "crypto",
	title: "Crypto Liquidity Regime",
	marketName: "Digital Assets",
	state: "risk_on",
	score: 72,
	coverage: 1.0,
	headline: "Strong stablecoin inflows and momentum",
	diagnosis: "BTC holding above 200D MA with active stablecoin expansion",
	tone: "positive",
	factors: [
		{
			key: "btc_trend",
			label: "BTC vs 200D MA",
			valueStr: "+12.5%",
			score: 80,
			weight: 0.3,
			direction: "bullish",
			note: "Firm technical bull trend",
		},
	],
	contextFlags: ["Bull Market Phase"],
};

describe("OverviewRegimes Component", () => {
	it("renders all 3 regime score cards and headlines", () => {
		const { container } = render(
			<OverviewRegimes
				globalRegime={mockGlobalRegime}
				ihsgRegime={mockIhsgRegime}
				cryptoRegime={mockCryptoRegime}
			/>,
		);

		expect(container.textContent).toContain("IHSG Composite Regime");
		expect(container.textContent).toContain("Crypto Liquidity Regime");
		expect(container.textContent).toContain(
			"Global Macro & Dollar Liquidity Context",
		);

		// State badges
		expect(container.textContent).toContain("defensive");
		expect(container.textContent).toContain("risk on");
		expect(container.textContent).toContain("selective");

		// Factor labels
		expect(container.textContent).toContain("Price vs 200D MA");
		expect(container.textContent).toContain("BTC vs 200D MA");
	});

	it("opens and closes factor note popover when factor button is clicked", () => {
		const { getByText, queryByText, container } = render(
			<OverviewRegimes
				globalRegime={mockGlobalRegime}
				ihsgRegime={mockIhsgRegime}
				cryptoRegime={mockCryptoRegime}
			/>,
		);

		// Click on factor button
		const factorBtn = getByText("Price vs 200D MA");
		fireEvent.click(factorBtn);

		// Popover appears
		expect(container.textContent).toContain(
			"Trading below structural long-term average",
		);

		// Click close button
		const closeBtn = getByText("Close");
		fireEvent.click(closeBtn);

		// Popover is dismissed
		expect(
			queryByText("Trading below structural long-term average"),
		).toBeNull();
	});

	it("renders Asymmetry Zone banner when asymmetryZone is active", () => {
		const regimeWithAsymmetry: MarketRegimeScore = {
			...mockCryptoRegime,
			asymmetryZone: {
				type: "accumulation",
				title: "Generational Asymmetry: Accumulation Zone Active",
				description: "Bitcoin is at a historic valuation floor (MVRV <= 1.0)",
			},
		};

		const { container } = render(
			<OverviewRegimes
				globalRegime={mockGlobalRegime}
				ihsgRegime={mockIhsgRegime}
				cryptoRegime={regimeWithAsymmetry}
			/>,
		);

		expect(container.textContent).toContain(
			"Generational Asymmetry: Accumulation Zone Active",
		);
		expect(container.textContent).toContain(
			"Bitcoin is at a historic valuation floor",
		);
	});
});
