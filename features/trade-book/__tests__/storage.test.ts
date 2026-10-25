import { beforeEach, describe, expect, it } from "vitest";
import { readTradeBookSettings, saveTradeBookSettings } from "../lib/storage";
import { DEFAULT_TRADE_BOOK_SETTINGS } from "../types";

describe("Trade Book Storage", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("returns default settings when storage is empty", () => {
		const settings = readTradeBookSettings();
		expect(settings).toEqual(DEFAULT_TRADE_BOOK_SETTINGS);
	});

	it("falls back to running-trade credentials if trade-book credentials are empty", () => {
		localStorage.setItem(
			"running-trade:settings",
			JSON.stringify({
				baseUrl: "https://api.runningtrade.test",
				token: "rt-secret-token",
				symbol: "BBCA",
			}),
		);

		const settings = readTradeBookSettings();
		expect(settings.baseUrl).toBe("https://api.runningtrade.test");
		expect(settings.token).toBe("rt-secret-token");
		expect(settings.symbol).toBe("BBCA");
		expect(settings.actionMode).toBe("visualize");
	});

	it("saves settings and synchronizes baseUrl and token with running-trade", () => {
		localStorage.setItem(
			"running-trade:settings",
			JSON.stringify({
				baseUrl: "https://old.url",
				token: "old-token",
				symbol: "TLKM",
				limit: 100,
			}),
		);

		saveTradeBookSettings({
			baseUrl: "https://new.api.url",
			token: "new-auth-token",
			symbol: "KETR",
			actionMode: "json",
		});

		const tb = readTradeBookSettings();
		expect(tb.baseUrl).toBe("https://new.api.url");
		expect(tb.token).toBe("new-auth-token");
		expect(tb.symbol).toBe("KETR");
		expect(tb.actionMode).toBe("json");

		const rtRaw = localStorage.getItem("running-trade:settings");
		const rt = rtRaw ? JSON.parse(rtRaw) : {};
		expect(rt.baseUrl).toBe("https://new.api.url");
		expect(rt.token).toBe("new-auth-token");
		expect(rt.limit).toBe(100);
	});
});
