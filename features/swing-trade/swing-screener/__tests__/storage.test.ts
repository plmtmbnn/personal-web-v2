import { beforeEach, describe, expect, it } from "vitest";
import {
	readSwingScreenerSettings,
	saveSwingScreenerSettings,
} from "../lib/storage";
import { DEFAULT_SWING_SCREENER_SETTINGS } from "../types";

describe("swing-screener storage", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("returns default settings when storage is empty", () => {
		const settings = readSwingScreenerSettings();
		expect(settings).toEqual(DEFAULT_SWING_SCREENER_SETTINGS);
	});

	it("falls back to existing swing-trade keys for baseUrl and token", () => {
		localStorage.setItem(
			"trade-book-5m:settings",
			JSON.stringify({
				baseUrl: "https://fallback.com",
				token: "fallback-token",
			}),
		);

		const settings = readSwingScreenerSettings();
		expect(settings.baseUrl).toBe("https://fallback.com");
		expect(settings.token).toBe("fallback-token");
		expect(settings.feeBuy).toBe(0.15);
		expect(settings.feeSell).toBe(0.25);
	});

	it("persists and reads back swing screener settings correctly", () => {
		saveSwingScreenerSettings({
			baseUrl: "https://my-api.com",
			token: "my-token-123",
			symbol: "PWON",
			feeBuy: 0.12,
			feeSell: 0.22,
			apiEndpoint: "https://custom-screener.com/api/v1/analyze-swing",
			ingestMode: "upload",
		});

		const loaded = readSwingScreenerSettings();
		expect(loaded.baseUrl).toBe("https://my-api.com");
		expect(loaded.token).toBe("my-token-123");
		expect(loaded.symbol).toBe("PWON");
		expect(loaded.feeBuy).toBe(0.12);
		expect(loaded.feeSell).toBe(0.22);
		expect(loaded.apiEndpoint).toBe(
			"https://custom-screener.com/api/v1/analyze-swing",
		);
		expect(loaded.ingestMode).toBe("upload");
	});
});
