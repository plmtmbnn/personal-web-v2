import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
	get: vi.fn(),
	set: vi.fn(),
	snapshot: vi.fn(),
	save: vi.fn(),
	ring: vi.fn(),
}));
vi.mock("@/lib/core/redis", () => ({
	redis: { get: mocks.get, set: mocks.set },
	getStockData: vi.fn(),
	getStockDataSnapshot: mocks.snapshot,
	saveStockData: mocks.save,
	updateTickerHistoryRingBuffer: mocks.ring,
}));
import { fetchIhsgForeignFlow, syncIdxStockSummary } from "../idx-flows";

const stock = (date: string) => ({
	StockCode: "BBCA",
	StockName: "BCA",
	Date: date,
	Close: 10000,
	Previous: 10000,
	ForeignBuy: 100,
	ForeignSell: 50,
	Volume: 1000,
	Value: 10000000,
});
beforeEach(() => {
	vi.clearAllMocks();
	vi.useFakeTimers();
	vi.setSystemTime(new Date("2026-11-18T12:00:00Z"));
	mocks.get.mockResolvedValue(null);
	mocks.save.mockResolvedValue(true);
});
afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

describe("IDX completed-session refresh", () => {
	it("refreshes an unexpired cache that trails the completed session", async () => {
		mocks.snapshot
			.mockResolvedValueOnce({ data: [stock("2026-11-17")], origin: "cache" })
			.mockResolvedValueOnce({ data: [stock("2026-11-18")], origin: "cache" });
		const fetcher = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ data: [stock("2026-11-18")] }),
		});
		vi.stubGlobal("fetch", fetcher);
		const result = await fetchIhsgForeignFlow({});
		expect(fetcher).toHaveBeenCalledOnce();
		expect(result?.asOf).toBe("2026-11-18");
	});
	it("retains the last completed snapshot during an intraday session", async () => {
		vi.setSystemTime(new Date("2026-11-18T05:00:00Z"));
		mocks.snapshot.mockResolvedValue({
			data: [stock("2026-11-18")],
			origin: "cache",
		});
		mocks.get.mockImplementation(async (key: string) =>
			key.includes("completed")
				? { data: [stock("2026-11-17")], retrievedAt: "2026-11-17T12:00:00Z" }
				: null,
		);
		const fetcher = vi.fn();
		vi.stubGlobal("fetch", fetcher);
		const result = await fetchIhsgForeignFlow({});
		expect(result?.asOf).toBe("2026-11-17");
		expect(fetcher).not.toHaveBeenCalled();
	});
	it("does not overwrite caches with malformed numeric data", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({
					data: [{ ...stock("2026-11-18"), ForeignBuy: "100" }],
				}),
			}),
		);
		expect((await syncIdxStockSummary(true)).success).toBe(false);
		expect(mocks.save).not.toHaveBeenCalled();
	});
	it("shares concurrent summary refreshes", async () => {
		const fetcher = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ data: [stock("2026-11-18")] }),
		});
		vi.stubGlobal("fetch", fetcher);
		await Promise.all([syncIdxStockSummary(true), syncIdxStockSummary(true)]);
		expect(fetcher).toHaveBeenCalledOnce();
	});
});
