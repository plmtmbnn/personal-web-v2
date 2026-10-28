import { beforeEach, describe, expect, it } from "vitest";
import {
	readRunningTradeChartSettings,
	saveRunningTradeChartSettings,
	RUNNING_TRADE_CHART_STORAGE_KEY,
} from "../lib/storage";
import { DEFAULT_RUNNING_TRADE_CHART_SETTINGS } from "../types";

describe("Running Trade Chart Storage", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("returns defaults when localStorage is empty", () => {
		const settings = readRunningTradeChartSettings();
		expect(settings).toEqual(DEFAULT_RUNNING_TRADE_CHART_SETTINGS);
	});

	it("pre-fills baseUrl and token from trade-book-5m settings if present", () => {
		localStorage.setItem(
			"trade-book-5m:settings",
			JSON.stringify({
				baseUrl: "https://api.broker.id",
				token: "trade-book-token-888",
			}),
		);

		const settings = readRunningTradeChartSettings();
		expect(settings.baseUrl).toBe("https://api.broker.id");
		expect(settings.token).toBe("trade-book-token-888");
		expect(settings.period).toBe("RT_PERIOD_LAST_3_MONTHS");
	});

	it("saves and reads settings to running-trade-chart:settings", () => {
		const custom = {
			...DEFAULT_RUNNING_TRADE_CHART_SETTINGS,
			symbol: "DOOH",
			token: "custom-token-running-chart",
			period: "RT_PERIOD_LAST_6_MONTHS" as const,
		};

		saveRunningTradeChartSettings(custom);
		const read = readRunningTradeChartSettings();
		expect(read.symbol).toBe("DOOH");
		expect(read.token).toBe("custom-token-running-chart");
		expect(read.period).toBe("RT_PERIOD_LAST_6_MONTHS");
		expect(localStorage.getItem(RUNNING_TRADE_CHART_STORAGE_KEY)).toBeDefined();
	});
});
