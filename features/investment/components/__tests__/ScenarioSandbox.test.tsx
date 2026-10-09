import { describe, expect, it } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import ScenarioSandbox from "../ScenarioSandbox";
import type { InvestmentCompassData, CompassOutput } from "../../types";
import { PLAYBOOK_SCRIPTS } from "../../data/playbooks";

const mockData: InvestmentCompassData = {
	sentiment: {
		traditional: null,
		crypto: {
			name: "Fear and Greed",
			data: [
				{
					value: "50",
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
				change: 10,
				changePct: 0.15,
				open: null,
				high: 7520,
				low: 7480,
				previousClose: 7490,
				high52w: 7900,
				low52w: 6700,
				currency: "IDR",
				lastTime: "2026-10-04",
				marketStatus: null,
				source: "yahoo",
			},
			USDIDR: {
				symbol: "IDR=X",
				name: "USD/IDR",
				last: 15850,
				change: -10,
				changePct: -0.06,
				open: null,
				high: 15900,
				low: 15800,
				previousClose: 15860,
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
				last: 88000,
				change: 1200,
				changePct: 1.4,
				open: null,
				high: 89000,
				low: 86500,
				previousClose: 86800,
				high52w: 108000,
				low52w: 52000,
				currency: "USD",
				lastTime: "2026-10-04",
				marketStatus: null,
				source: "yahoo",
			},
		},
		cryptoGlobal: null,
		macro: {
			FEDFUNDS: {
				id: "FEDFUNDS",
				name: "Federal Funds Rate",
				frequency: "Monthly",
				units: "Percent",
				data: [{ date: "2026-09-01", value: 4.5 }],
			},
			PCEPILFE: {
				id: "PCEPILFE",
				name: "Core PCE Price Index",
				frequency: "Monthly",
				units: "Percent Change from Year Ago",
				data: [{ date: "2026-09-01", value: 2.2 }],
			},
			DGS10: {
				id: "DGS10",
				name: "10-Year Treasury Yield",
				frequency: "Daily",
				units: "Percent",
				data: [{ date: "2026-10-02", value: 3.9 }],
			},
		},
		history: {},
	},
	sources: {},
	fetchedAt: new Date().toISOString(),
};

const mockLiveOutput: CompassOutput = {
	regimes: {
		global: {
			id: "global",
			title: "Global Liquidity & Macro",
			marketName: "Global Macro Context",
			state: "selective",
			score: 55,
			coverage: 0.8,
			headline: "Global Liquidity Neutral",
			diagnosis: "Balanced macro backdrop",
			tone: "neutral",
			factors: [],
			contextFlags: [],
		},
		ihsg: {
			id: "ihsg",
			title: "IHSG Market Regime",
			marketName: "Indonesian Equities (IDX)",
			state: "selective",
			score: 50,
			coverage: 0.7,
			headline: "IHSG Consolidating",
			diagnosis: "Range-bound Indonesian market",
			tone: "neutral",
			factors: [],
			contextFlags: [],
		},
		crypto: {
			id: "crypto",
			title: "Crypto Market Regime",
			marketName: "Digital Assets (BTC & Majors)",
			state: "selective",
			score: 52,
			coverage: 0.75,
			headline: "Crypto Markets Consolidating",
			diagnosis: "BTC trading in neutral structure",
			tone: "neutral",
			factors: [],
			contextFlags: [],
		},
	},
	permissions: {
		ihsg: {
			scalp: {
				status: "selective",
				label: "Selective",
				reason: "Normal market",
			},
			swing: {
				status: "selective",
				label: "Selective",
				reason: "Normal market",
			},
			dca: { status: "allowed", label: "Allowed", reason: "Normal market" },
			maxExposure: "40%",
		},
		crypto: {
			scalp: {
				status: "selective",
				label: "Selective",
				reason: "Normal market",
			},
			swing: {
				status: "selective",
				label: "Selective",
				reason: "Normal market",
			},
			dca: { status: "allowed", label: "Allowed", reason: "Normal market" },
			maxExposure: "30%",
		},
		altcoins: {
			scalp: {
				status: "not_allowed",
				label: "Restricted",
				reason: "BTC Dominance",
			},
			swing: {
				status: "not_allowed",
				label: "Restricted",
				reason: "BTC Dominance",
			},
			dca: {
				status: "not_allowed",
				label: "Restricted",
				reason: "BTC Dominance",
			},
			maxExposure: "0%",
		},
		ihsgSectorGates: [],
		globalStressActive: false,
		summaryNotes: [],
	},
	playbooks: {
		ihsg: PLAYBOOK_SCRIPTS.IHSG.selective,
		crypto: PLAYBOOK_SCRIPTS.Crypto.selective,
	},
	alerts: [],
	activeSeasonality: [],
	upcomingEvents: [],
	halvingCycle: {
		monthsElapsed: 12,
		phase: "Parabolic Window",
		description: "Post-halving expansion phase",
	},
};

describe("ScenarioSandbox Component", () => {
	it("renders title, sliders, preset buttons, and comparative impact cards", () => {
		const { container } = render(
			<ScenarioSandbox data={mockData} liveOutput={mockLiveOutput} />,
		);

		expect(container.textContent).toContain("Macro Scenario Sandbox");
		expect(container.textContent).toContain("Fed Funds Rate");
		expect(container.textContent).toContain("USD / IDR FX Rate");
		expect(container.textContent).toContain("Bitcoin Price (BTC)");
		expect(container.textContent).toContain("Global Macro");
		expect(container.textContent).toContain("IHSG (IDX)");
		expect(container.textContent).toContain("Crypto (Digital Assets)");
	});

	it("applies preset and reveals reset button and simulation badge", () => {
		const { getByText, container } = render(
			<ScenarioSandbox data={mockData} liveOutput={mockLiveOutput} />,
		);

		// Click Fed Easing preset
		const easingBtn = getByText("Fed Easing Cycle (3.25% & Strong IDR)");
		fireEvent.click(easingBtn);

		// Simulation active badge should appear
		expect(container.textContent).toContain("Simulation Active");
		expect(container.textContent).toContain("Reset to Live");

		// Click Reset
		const resetBtn = getByText("Reset to Live");
		fireEvent.click(resetBtn);

		// Simulation active badge dismissed
		expect(container.textContent).not.toContain("Simulation Active");
	});

	it("toggles collapse and expand", () => {
		const { getByText, container } = render(
			<ScenarioSandbox data={mockData} liveOutput={mockLiveOutput} />,
		);

		// Click Collapse
		const collapseBtn = getByText("Collapse");
		fireEvent.click(collapseBtn);

		// Body collapsed
		expect(container.textContent).not.toContain("Quick Scenarios:");
		expect(getByText("Expand")).toBeDefined();

		// Click Expand
		fireEvent.click(getByText("Expand"));
		expect(container.textContent).toContain("Quick Scenarios:");
	});

	it("updates simulated scores when slider changes", () => {
		const { container } = render(
			<ScenarioSandbox data={mockData} liveOutput={mockLiveOutput} />,
		);

		const sliders = container.querySelectorAll('input[type="range"]');
		expect(sliders.length).toBe(3);

		// Change Fed Funds slider to 2.50%
		fireEvent.change(sliders[0], { target: { value: "2.5" } });

		expect(container.textContent).toContain("2.50%");
		expect(container.textContent).toContain("Simulation Active");
	});
});
