import { beforeEach, describe, expect, it } from "vitest";
import {
	readTradeBook5MSettings,
	saveTradeBook5MSettings,
	TRADE_BOOK_5M_STORAGE_KEY,
} from "../lib/storage";
import { DEFAULT_TRADE_BOOK_5M_SETTINGS } from "../types";

describe("Trade Book 5M Storage", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("returns defaults when localStorage is empty", () => {
		const settings = readTradeBook5MSettings();
		expect(settings).toEqual(DEFAULT_TRADE_BOOK_5M_SETTINGS);
	});

	it("pre-fills baseUrl and token from market-detector settings if present", () => {
		localStorage.setItem(
			"market-detector:settings",
			JSON.stringify({
				baseUrl: "https://api.broker.id",
				token: "market-detector-token-999",
			}),
		);

		const settings = readTradeBook5MSettings();
		expect(settings.baseUrl).toBe("https://api.broker.id");
		expect(settings.token).toBe("market-detector-token-999");
		expect(settings.timeInterval).toBe("5m");
	});

	it("saves and reads settings to trade-book-5m:settings", () => {
		const custom = {
			...DEFAULT_TRADE_BOOK_5M_SETTINGS,
			symbol: "DOOH",
			token: "custom-token-5m",
			period: "DATE_PICKER_PERIOD_LAST_1_WEEK" as const,
		};

		saveTradeBook5MSettings(custom);
		const read = readTradeBook5MSettings();
		expect(read.symbol).toBe("DOOH");
		expect(read.token).toBe("custom-token-5m");
		expect(read.period).toBe("DATE_PICKER_PERIOD_LAST_1_WEEK");
		expect(localStorage.getItem(TRADE_BOOK_5M_STORAGE_KEY)).toBeDefined();
	});
});
