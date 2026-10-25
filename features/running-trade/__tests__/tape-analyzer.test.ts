import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	getSessionTradeBook,
	getSessionTrades,
	hasSessionData,
	setSessionTradeBook,
	setSessionTrades,
} from "../lib/session-cache";
import {
	executeTapeAnalysis,
	readTapeAnalyzerSettings,
	saveTapeAnalyzerSettings,
} from "../lib/tape-analyzer";
import type { RunningTrade } from "../types";

const mockTrade: RunningTrade = {
	id: "trade-1",
	time: "09:05:00",
	action: "BUY",
	code: "PTRO",
	price: "3100",
	change: "20",
	lot: "100",
	is_broker_exists: true,
	buyer: "CC",
	seller: "YP",
	trade_number: "12345",
	buyer_type: "D",
	seller_type: "D",
	market_board: "RG",
	buy_order_number: "B1",
	sell_order_number: "S1",
	group_order_number: "G1",
	value: { raw: 31000000, formatted: "31M" },
};

describe("Tape Analyzer Session Cache", () => {
	it("stores and retrieves trades and trade-book in memory", () => {
		expect(getSessionTrades("PTRO")).toBeNull();

		setSessionTrades("PTRO", [mockTrade]);
		expect(getSessionTrades("ptro")).toHaveLength(1);
		expect(getSessionTrades("PTRO")?.[0].code).toBe("PTRO");

		setSessionTradeBook("PTRO", {
			date: "2026-10-23",
			book_total: {
				buy_lot: "1000",
				sell_lot: "1000",
				buy_value: "100M",
				sell_value: "100M",
				total_lot: "2000",
			},
		} as unknown as Parameters<typeof setSessionTradeBook>[1]);

		expect(getSessionTradeBook("PTRO")?.date).toBe("2026-10-23");
		expect(hasSessionData("PTRO").hasTrades).toBe(true);
		expect(hasSessionData("PTRO").hasTradeBook).toBe(true);
	});
});

describe("Tape Analyzer Settings Storage", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("falls back to defaults when storage is empty", () => {
		const s = readTapeAnalyzerSettings();
		expect(s.feeBuy).toBe(0.15);
		expect(s.feeSell).toBe(0.25);
		expect(s.blockMode).toBe("adaptive");
		expect(s.apiEndpoint).toContain("/api/v1/analyze");
	});

	it("saves settings and persists to storage", () => {
		saveTapeAnalyzerSettings({
			baseUrl: "https://example.com",
			token: "secret-token",
			symbol: "PTRO",
			feeBuy: 0.1,
			feeSell: 0.2,
			blockMode: "fixed",
		});

		const s = readTapeAnalyzerSettings();
		expect(s.baseUrl).toBe("https://example.com");
		expect(s.token).toBe("secret-token");
		expect(s.symbol).toBe("PTRO");
		expect(s.feeBuy).toBe(0.1);
		expect(s.feeSell).toBe(0.2);
		expect(s.blockMode).toBe("fixed");
	});
});

describe("executeTapeAnalysis", () => {
	it("posts FormData to the configured endpoint", async () => {
		const mockResponse = {
			ticker: "PTRO",
			action: { key: "RANGE", label: "Range Bound" },
			ohlc: { o: 3000, h: 3100, l: 3000, c: 3080, last: 3080 },
		};

		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => mockResponse,
		});
		vi.stubGlobal("fetch", fetchMock);

		const result = await executeTapeAnalysis({
			tradesCsv: "time,action,price,lot\n09:00:00,buy,3100,100",
			tradeBookJson: { test: true },
			ticker: "PTRO",
			feeBuy: 0.15,
			feeSell: 0.25,
			blockMode: "adaptive",
			apiEndpoint: "https://test.api/analyze",
		});

		expect(fetchMock).toHaveBeenCalledWith(
			"https://test.api/analyze",
			expect.objectContaining({
				method: "POST",
				body: expect.any(FormData),
			}),
		);
		expect(result).toEqual(mockResponse);

		vi.unstubAllGlobals();
	});
});
