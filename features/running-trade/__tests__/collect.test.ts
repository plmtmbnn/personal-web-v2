import { describe, expect, it, vi } from "vitest";
import {
	buildCsv,
	collectRunningTrades,
	CSV_COLUMNS,
	RateLimitError,
} from "../lib/collect";
import type { RunningTrade } from "../types";

const trade = (n: number): RunningTrade => ({
	id: `id-${n}`,
	time: "09:00:01",
	action: "BUY",
	code: "DAAZ",
	price: "100",
	change: "1",
	lot: "5",
	is_broker_exists: true,
	buyer: "YP",
	seller: "CC",
	trade_number: String(n),
	buyer_type: "D",
	seller_type: "F",
	market_board: "RG",
	buy_order_number: "b",
	sell_order_number: "s",
	group_order_number: "g",
	value: { raw: n * 1000, formatted: `${n}K` },
});

describe("collectRunningTrades", () => {
	it("follows the last trade_number until an empty page", async () => {
		const pages = [[trade(1), trade(2)], [trade(3)], []];
		const fetchPage = vi.fn(async (_cursor?: string) => pages.shift() ?? []);

		const res = await collectRunningTrades({ fetchPage });

		expect(res.stopReason).toBe("empty");
		expect(res.trades.map((t) => t.trade_number)).toEqual(["1", "2", "3"]);
		expect(fetchPage.mock.calls.map((c) => c[0] as string | undefined)).toEqual(
			[undefined, "2", "3"],
		);
	});

	it("keeps partial rows on error", async () => {
		const fetchPage = vi
			.fn()
			.mockResolvedValueOnce([trade(1)])
			.mockRejectedValueOnce(new Error("boom"));

		const res = await collectRunningTrades({ fetchPage });

		expect(res).toMatchObject({ stopReason: "error", error: "boom", pages: 1 });
		expect(res.trades).toHaveLength(1);
	});

	it("stops when the cursor does not advance", async () => {
		const fetchPage = vi.fn(async () => [trade(7)]);
		const res = await collectRunningTrades({ fetchPage });
		expect(res.stopReason).toBe("stalled");
		expect(fetchPage).toHaveBeenCalledTimes(2);
	});

	it("honours the page cap and abort signal", async () => {
		let n = 0;
		const capped = await collectRunningTrades({
			fetchPage: async () => [trade(++n)],
			maxPages: 3,
		});
		expect(capped).toMatchObject({ stopReason: "cap", pages: 3 });

		const ac = new AbortController();
		ac.abort();
		const cancelled = await collectRunningTrades({
			fetchPage: async () => [trade(1)],
			signal: ac.signal,
		});
		expect(cancelled.stopReason).toBe("cancelled");
	});
});

describe("collectRunningTrades rate limiting", () => {
	it("pauses once per pauseEvery pages, not on every loop", async () => {
		let n = 0;
		const sleep = vi.fn(async () => {});
		await collectRunningTrades({
			fetchPage: async () => [trade(++n)],
			maxPages: 7,
			pauseEvery: 3,
			pauseMs: 50,
			sleep,
		});

		// 7 pages with a pause after pages 3 and 6.
		expect(sleep).toHaveBeenCalledTimes(2);
		expect(sleep).toHaveBeenCalledWith(50, undefined);
	});

	it("retries the same cursor after a 429 and honours Retry-After", async () => {
		const sleep = vi.fn(async () => {});
		const onWait = vi.fn();
		const fetchPage = vi
			.fn<(c?: string) => Promise<RunningTrade[]>>()
			.mockResolvedValueOnce([trade(1)])
			.mockRejectedValueOnce(new RateLimitError("429", 7000))
			.mockResolvedValueOnce([trade(2)])
			.mockResolvedValueOnce([]);

		const res = await collectRunningTrades({ fetchPage, sleep, onWait });

		expect(res.stopReason).toBe("empty");
		expect(res.trades.map((t) => t.trade_number)).toEqual(["1", "2"]);
		expect(sleep).toHaveBeenCalledWith(7000, undefined);
		expect(onWait).toHaveBeenCalledWith(7000, "rate-limit");
		// Failed call and its retry both used the cursor of page 1.
		expect(fetchPage.mock.calls.map((c) => c[0])).toEqual([
			undefined,
			"1",
			"1",
			"2",
		]);
	});

	it("backs off linearly without Retry-After and gives up after maxRetries", async () => {
		const waits: number[] = [];
		const res = await collectRunningTrades({
			fetchPage: async () => {
				throw new RateLimitError("Upstream 429");
			},
			maxRetries: 2,
			sleep: async (ms) => {
				waits.push(ms);
			},
		});

		expect(waits).toEqual([10_000, 20_000]);
		expect(res).toMatchObject({ stopReason: "error", error: "Upstream 429" });
	});

	it("stops waiting when cancelled during a rate-limit sleep", async () => {
		const ac = new AbortController();
		const res = await collectRunningTrades({
			fetchPage: async () => {
				throw new RateLimitError("429", 1000);
			},
			signal: ac.signal,
			sleep: async () => ac.abort(),
		});

		expect(res.stopReason).toBe("cancelled");
	});
});

describe("buildCsv", () => {
	it("emits only the agreed columns with amount from value.raw", () => {
		const [header, row] = buildCsv([trade(2)]).split("\r\n");

		expect(header.split(",")).toEqual([...CSV_COLUMNS]);
		expect(header).not.toMatch(/\b(id|code|buyer|seller|is_broker_exists)\b/);
		expect(row.split(",").at(-1)).toBe("2000");
	});
});
