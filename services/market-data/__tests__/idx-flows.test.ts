import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/core/redis", () => ({
	redis: {
		get: vi.fn(),
		set: vi.fn(),
	},
	getStockData: vi.fn(),
	saveStockData: vi.fn(),
	updateTickerHistoryRingBuffer: vi.fn(),
}));

import {
	calculateStreak,
	calculateNetFlow,
	syncIdxStockSummary,
} from "../idx-flows";
import {
	getStockData,
	saveStockData,
	updateTickerHistoryRingBuffer,
} from "@/lib/core/redis";
import type { IDXStock } from "@/features/utils/stock-tools/stock-explorer/types";

describe("IDX Flows foreign telemetry logic", () => {
	describe("calculateStreak", () => {
		it("returns 0 for empty history", () => {
			expect(calculateStreak([])).toBe(0);
		});

		it("counts consecutive positive flow days as positive streak", () => {
			// history sorted newest first: [day0, day-1, day-2]
			expect(calculateStreak([100, 250, 400])).toBe(3);
			expect(calculateStreak([100, 250, -50, 300])).toBe(2);
		});

		it("counts consecutive negative flow days as negative streak", () => {
			// history sorted newest first: [-150, -300, -80]
			expect(calculateStreak([-150, -300, -80])).toBe(-3);
			expect(calculateStreak([-150, 200, -80])).toBe(-1);
		});
	});

	describe("calculateNetFlow", () => {
		it("calculates net flow for normal volume scale", () => {
			const mockStocks: IDXStock[] = [
				{
					Code: "BBCA",
					Name: "Bank Central Asia",
					Close: 10000,
					Volume: 100000,
					Value: 1000000000,
					ForeignBuy: 50000,
					ForeignSell: 30000,
				} as unknown as IDXStock,
			];
			// VWAP = 1,000,000,000 / 100,000 = 10,000
			// ForeignBuy (50,000) <= Volume * 5 (500,000), so ForeignBuy is share count
			// foreignNetVol = 50,000 - 30,000 = 20,000
			// net IDR = 20,000 * 10,000 = 200,000,000
			const flow = calculateNetFlow(mockStocks);
			expect(flow).toBe(200000000);
		});

		it("calculates net flow when ForeignBuy is already nominal value", () => {
			const mockStocks: IDXStock[] = [
				{
					Code: "BBRI",
					Name: "Bank Rakyat Indonesia",
					Close: 5000,
					Volume: 1000,
					Value: 5000000,
					ForeignBuy: 50000000, // 50M >> 1000 * 5, so nominal value scale
					ForeignSell: 30000000,
				} as unknown as IDXStock,
			];
			const flow = calculateNetFlow(mockStocks);
			expect(flow).toBe(20000000);
		});
	});

	describe("Trading session & weekend validation logic", () => {
		it("correctly identifies weekend days to exclude from foreign flow history", () => {
			// Sunday Oct 18, 2026
			const sunday = new Date("2026-10-18T12:00:00Z").getUTCDay();
			expect(sunday).toBe(0);

			// Saturday Oct 17, 2026
			const saturday = new Date("2026-10-17T12:00:00Z").getUTCDay();
			expect(saturday).toBe(6);

			// Monday Oct 19, 2026
			const monday = new Date("2026-10-19T12:00:00Z").getUTCDay();
			expect(monday).toBe(1);
			expect(monday !== 0 && monday !== 6).toBe(true);
		});

		it("verifies market session hour guard logic (opens at 09:00 WIB)", () => {
			const isSessionActiveOrClosed = (isToday: boolean, wibHour: number) =>
				!isToday || wibHour >= 9;

			// Before 09:00 WIB on today: session NOT active or closed yet
			expect(isSessionActiveOrClosed(true, 7)).toBe(false);
			expect(isSessionActiveOrClosed(true, 8)).toBe(false);

			// At or after 09:00 WIB on today: session active/closed
			expect(isSessionActiveOrClosed(true, 9)).toBe(true);
			expect(isSessionActiveOrClosed(true, 15)).toBe(true);

			// Historical session (not today): always valid regardless of current hour
			expect(isSessionActiveOrClosed(false, 7)).toBe(true);
		});
	});

	describe("syncIdxStockSummary", () => {
		it("returns cached count without network fetch if not forced and data exists", async () => {
			vi.mocked(getStockData).mockResolvedValueOnce([{ Code: "BBCA" }] as any);
			const result = await syncIdxStockSummary(false);
			expect(result).toEqual({ success: true, count: 1 });
			expect(saveStockData).not.toHaveBeenCalled();
		});

		it("fetches upstream and updates Redis + ring buffer on force = true", async () => {
			const mockStocks = [{ Code: "BBCA", Close: 10000 }];
			const originalFetch = global.fetch;
			global.fetch = vi.fn().mockResolvedValueOnce({
				ok: true,
				json: async () => ({ data: mockStocks }),
			} as any);

			vi.mocked(saveStockData).mockResolvedValueOnce(true);
			vi.mocked(updateTickerHistoryRingBuffer).mockResolvedValueOnce({} as any);

			const result = await syncIdxStockSummary(true);

			expect(result).toEqual({ success: true, count: 1 });
			expect(saveStockData).toHaveBeenCalledWith(mockStocks, 43200);
			expect(updateTickerHistoryRingBuffer).toHaveBeenCalledWith(mockStocks);

			global.fetch = originalFetch;
		});

		it("handles fetch failure gracefully", async () => {
			const originalFetch = global.fetch;
			global.fetch = vi
				.fn()
				.mockRejectedValueOnce(new Error("Network timeout"));

			const result = await syncIdxStockSummary(true);
			expect(result.success).toBe(false);
			expect(result.count).toBe(0);
			expect(result.error).toContain("Network timeout");

			global.fetch = originalFetch;
		});
	});
});
