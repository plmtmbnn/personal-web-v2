import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SwingTradeTabs from "../components/SwingTradeTabs";

vi.mock("next/navigation", () => ({
	useSearchParams: () => new URLSearchParams("tab=historical-trade"),
}));

vi.mock("../historical-trade/components/HistoricalTradeView", () => ({
	default: () => (
		<div data-testid="historical-trade-view">Historical Trade View Mock</div>
	),
}));

vi.mock("../market-detector/components/MarketDetectorView", () => ({
	default: () => (
		<div data-testid="market-detector-view">Market Detector View Mock</div>
	),
}));

vi.mock("../trade-book-5m/components/TradeBook5MView", () => ({
	default: () => (
		<div data-testid="trade-book-5m-view">Trade Book 5M View Mock</div>
	),
}));

vi.mock("../running-trade-chart/components/RunningTradeChartView", () => ({
	default: () => (
		<div data-testid="running-trade-chart-view">
			Running Trade Chart View Mock
		</div>
	),
}));

vi.mock("../broker-distribution/components/BrokerDistributionView", () => ({
	default: () => (
		<div data-testid="broker-distribution-view">
			Broker Distribution View Mock
		</div>
	),
}));

vi.mock("../swing-screener/components/SwingScreenerView", () => ({
	default: () => (
		<div data-testid="swing-screener-view">Swing Screener View Mock</div>
	),
}));

vi.mock("../credentials/hooks/useMarketCredentials", () => ({
	useMarketCredentials: () => ({
		credentials: {
			baseUrl: "https://api.broker.co.id",
			token: "test-token",
			updatedAt: "2026-10-28T00:00:00Z",
		},
		loading: false,
		saveCredentials: vi.fn(),
		reload: vi.fn(),
	}),
}));

vi.mock("../credentials/components/MarketCredentialsModal", () => ({
	default: () => null,
}));

describe("SwingTradeTabs", () => {
	it("renders all 6 tabs and toggles between views", () => {
		render(<SwingTradeTabs />);

		const histTab = screen.getByRole("button", {
			name: /historical data trade/i,
		});
		const detectorTab = screen.getByRole("button", {
			name: /market detector/i,
		});
		const tb5mTab = screen.getByRole("button", {
			name: /trade book 5m/i,
		});
		const rtcTab = screen.getByRole("button", {
			name: /running trade chart/i,
		});
		const bdTab = screen.getByRole("button", {
			name: /broker distribution/i,
		});
		const screenerTab = screen.getByRole("button", {
			name: /swing screener/i,
		});

		expect(histTab).toBeDefined();
		expect(detectorTab).toBeDefined();
		expect(tb5mTab).toBeDefined();
		expect(rtcTab).toBeDefined();
		expect(bdTab).toBeDefined();
		expect(screenerTab).toBeDefined();

		// Initially historical view is active
		expect(screen.getByTestId("historical-trade-view")).toBeDefined();

		// Switch to Swing Screener
		fireEvent.click(screenerTab);
		expect(screen.getByTestId("swing-screener-view")).toBeDefined();
		expect(screen.queryByTestId("historical-trade-view")).toBeNull();

		// Switch to Broker Distribution
		fireEvent.click(bdTab);
		expect(screen.getByTestId("broker-distribution-view")).toBeDefined();
		expect(screen.queryByTestId("swing-screener-view")).toBeNull();
	});
});
