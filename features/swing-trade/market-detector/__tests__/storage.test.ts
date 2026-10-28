import { beforeEach, describe, expect, it } from "vitest";
import {
	MARKET_DETECTOR_STORAGE_KEY,
	readMarketDetectorSettings,
	saveMarketDetectorSettings,
} from "../lib/storage";
import { DEFAULT_MARKET_DETECTOR_SETTINGS } from "../types";

describe("Market Detector Storage", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("returns defaults when localStorage is empty", () => {
		const settings = readMarketDetectorSettings();
		expect(settings).toEqual(DEFAULT_MARKET_DETECTOR_SETTINGS);
	});

	it("pre-fills baseUrl and token from historical-trade settings if present", () => {
		localStorage.setItem(
			"historical-trade:settings",
			JSON.stringify({
				baseUrl: "https://api.broker.id",
				token: "hist-token-123",
			}),
		);

		const settings = readMarketDetectorSettings();
		expect(settings.baseUrl).toBe("https://api.broker.id");
		expect(settings.token).toBe("hist-token-123");
		expect(settings.period).toBe("BROKER_SUMMARY_PERIOD_LAST_3_MONTHS");
	});

	it("saves and reads settings to market-detector:settings", () => {
		const custom = {
			...DEFAULT_MARKET_DETECTOR_SETTINGS,
			symbol: "DOOH",
			token: "my-jwt-token",
			period: "BROKER_SUMMARY_PERIOD_LAST_1_MONTH" as const,
		};

		saveMarketDetectorSettings(custom);
		const read = readMarketDetectorSettings();
		expect(read.symbol).toBe("DOOH");
		expect(read.token).toBe("my-jwt-token");
		expect(read.period).toBe("BROKER_SUMMARY_PERIOD_LAST_1_MONTH");
		expect(localStorage.getItem(MARKET_DETECTOR_STORAGE_KEY)).toBeDefined();
	});
});
