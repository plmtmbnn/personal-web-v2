import { describe, expect, it, vi } from "vitest";
import {
	buildCsv,
	collectHistoricalTrades,
	RateLimitError,
} from "../lib/collect";
import type { HistoricalTradeResponse, HistoricalTradeResult } from "../types";

const makeRow = (date: string, close = 100): HistoricalTradeResult => ({
	date,
	close,
	change: 1,
	value: 10_000_000,
	volume: 100_000,
	frequency: 50,
	foreign_buy: 10_000,
	foreign_sell: 5_000,
	net_foreign: 5_000,
	open: 99,
	high: 102,
	low: 98,
	average: 100,
	change_percentage: 1.01,
});

const makeResponse = (
	result: HistoricalTradeResult[],
	next_page = "",
): HistoricalTradeResponse => ({
	message: "Success",
	data: {
		result,
		paginate: { next_page },
	},
});

describe("buildCsv", () => {
	it("sorts rows chronologically ascending by date", () => {
		const raw = [
			makeRow("2026-10-27", 120),
			makeRow("2025-10-27", 100),
			makeRow("2026-05-15", 110),
		];
		const csv = buildCsv(raw);
		const lines = csv.trim().split("\r\n");
		expect(lines[0]).toContain("date,close,change");
		expect(lines[1]).toContain("2025-10-27");
		expect(lines[2]).toContain("2026-05-15");
		expect(lines[3]).toContain("2026-10-27");
	});
});

describe("collectHistoricalTrades", () => {
	it("completes in a single page if next_page is empty", async () => {
		const fetchPage = vi
			.fn()
			.mockResolvedValueOnce(makeResponse([makeRow("2026-10-27")], ""));

		const res = await collectHistoricalTrades({ fetchPage });

		expect(res.stopReason).toBe("complete");
		expect(res.pages).toBe(1);
		expect(res.results).toHaveLength(1);
		expect(fetchPage).toHaveBeenCalledTimes(1);
		expect(fetchPage).toHaveBeenCalledWith(1);
	});

	it("iterates through multiple pages until next_page is empty", async () => {
		const fetchPage = vi
			.fn()
			.mockResolvedValueOnce(makeResponse([makeRow("2026-10-27")], "2"))
			.mockResolvedValueOnce(makeResponse([makeRow("2026-10-26")], "3"))
			.mockResolvedValueOnce(makeResponse([makeRow("2026-10-25")], ""));

		const res = await collectHistoricalTrades({ fetchPage });

		expect(res.stopReason).toBe("complete");
		expect(res.pages).toBe(3);
		expect(res.results).toHaveLength(3);
		expect(fetchPage.mock.calls.map((c) => c[0])).toEqual([1, 2, 3]);
	});

	it("stops when next_page equals current page (stalled)", async () => {
		const fetchPage = vi
			.fn()
			.mockResolvedValueOnce(makeResponse([makeRow("2026-10-27")], "1"));

		const res = await collectHistoricalTrades({ fetchPage });

		expect(res.stopReason).toBe("stalled");
		expect(res.pages).toBe(1);
	});

	it("stops with empty reason when first page returns zero rows", async () => {
		const fetchPage = vi.fn().mockResolvedValueOnce(makeResponse([], ""));

		const res = await collectHistoricalTrades({ fetchPage });

		expect(res.stopReason).toBe("empty");
		expect(res.results).toHaveLength(0);
	});

	it("respects cancellation via AbortSignal", async () => {
		const ac = new AbortController();
		ac.abort();

		const fetchPage = vi.fn();
		const res = await collectHistoricalTrades({ fetchPage, signal: ac.signal });

		expect(res.stopReason).toBe("cancelled");
		expect(fetchPage).not.toHaveBeenCalled();
	});

	it("retries on RateLimitError", async () => {
		const fetchPage = vi
			.fn()
			.mockRejectedValueOnce(new RateLimitError("Too Many Requests", 10))
			.mockResolvedValueOnce(makeResponse([makeRow("2026-10-27")], ""));

		const res = await collectHistoricalTrades({ fetchPage, maxRetries: 2 });

		expect(res.stopReason).toBe("complete");
		expect(res.results).toHaveLength(1);
		expect(fetchPage).toHaveBeenCalledTimes(2);
	});
});
