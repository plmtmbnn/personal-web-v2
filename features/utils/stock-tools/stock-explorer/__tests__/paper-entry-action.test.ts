import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StockPick } from "../types";

const stubs = vi.hoisted(() => ({
	authorized: vi.fn(),
	lookup: vi.fn(),
	holdings: vi.fn(),
	insert: vi.fn(),
	update: vi.fn(),
	fetchMarket: vi.fn(),
}));
vi.mock("@/features/auth/actions", () => ({ checkAdmin: stubs.authorized }));
vi.mock("@/features/investment/actions", () => ({
	getCachedInvestmentCompass: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/lib/core/redis", () => ({
	getStockDataSnapshot: stubs.fetchMarket,
	redis: {
		set: vi.fn().mockResolvedValue("OK"),
		eval: vi.fn().mockResolvedValue(1),
	},
}));
vi.mock("@/lib/core/supabase-server", () => ({
	createAdminClient: async () => ({
		from: () => ({
			select: () => ({
				eq: (column: string) =>
					column === "id"
						? { maybeSingle: stubs.lookup }
						: { limit: stubs.holdings },
			}),
			insert: (payload: object) => {
				stubs.insert(payload);
				return {
					select: () => ({ maybeSingle: async () => ({ data: payload }) }),
				};
			},
			update: (payload: object) => {
				stubs.update(payload);
				return {
					eq: () => ({
						eq: () => ({
							select: () => ({
								maybeSingle: async () => ({ data: { id: pick.id } }),
							}),
						}),
					}),
				};
			},
		}),
	}),
}));

import {
	closeCloudStockPickAction,
	saveCloudStockPickAction,
} from "../actions/stockpicks";

const pick: StockPick = {
	id: "4c2ed215-8c00-452c-af3f-f3f8b39a1234",
	stockCode: "BBCA",
	stockName: "Bank Central Asia",
	sector: "Banking",
	status: "active",
	buyPrice: 1000,
	quantityLots: 1,
	entryDate: "2026-11-13",
	stopLossPrice: 950,
	targetPrice: 1200,
	highestPriceTraced: 1000,
	lowestPriceTraced: 1000,
	createdAt: 0,
	updatedAt: 0,
};

describe("paper trade persistence", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		stubs.authorized.mockResolvedValue(true);
		stubs.lookup.mockResolvedValue({ data: null });
		stubs.holdings.mockResolvedValue({ data: [] });
		stubs.fetchMarket.mockResolvedValue(null);
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-11-13T11:00:00Z"));
	});
	afterEach(() => vi.useRealTimers());

	it("rejects unauthorized mutations before touching market data or the ledger", async () => {
		stubs.authorized.mockResolvedValue(false);
		expect(await saveCloudStockPickAction(pick, { equityIdr: 10e6 })).toEqual({
			success: false,
			error: "Unauthorized",
		});
		expect(stubs.lookup).not.toHaveBeenCalled();
		expect(stubs.fetchMarket).not.toHaveBeenCalled();
	});

	it("rechecks missing context and saves reviewable failed checks only with a reason", async () => {
		const request = { equityIdr: 10e6 };
		expect((await saveCloudStockPickAction(pick, request)).success).toBe(false);
		expect(stubs.insert).not.toHaveBeenCalled();
		const saved = await saveCloudStockPickAction(pick, {
			...request,
			overrideReason: "Testing an entry without a current quote.",
		});
		expect(saved.data?.decision).toMatchObject({
			regime: "insufficient",
			snapshotId: null,
			overrideReason: "Testing an entry without a current quote.",
			failed: expect.arrayContaining(["data", "regime", "size"]),
		});
		expect(stubs.insert).toHaveBeenCalledWith(
			expect.objectContaining({ trade_decision: saved.data?.decision }),
		);
	});

	it("closes an active pick with unavailable market data and computes net results from the fill", async () => {
		stubs.lookup.mockResolvedValue({
			data: {
				id: pick.id,
				status: "active",
				stock_code: "BBCA",
				buy_price: 1000,
				quantity_lots: 1,
				stop_loss_price: 950,
				entry_date: pick.entryDate,
				updated_at: "2026-11-13T10:00:00Z",
				trade_review: null,
				trade_decision: null,
			},
		});
		const result = await closeCloudStockPickAction(pick.id, {
			exitPrice: 1100,
			exitReason: "manual_profit",
			peakGainPct: 10,
			maxDrawdownPct: 0,
			holdingDays: 0,
			realizedPlNominal: 123,
			realizedPlPct: 1,
		});
		expect(result.success).toBe(true);
		expect(stubs.fetchMarket).not.toHaveBeenCalled();
		expect(stubs.update).toHaveBeenCalledWith(
			expect.objectContaining({
				realized_pl_nominal: 10000,
				trade_review: expect.objectContaining({
					netPnlIdr: 9575,
					realizedR: null,
				}),
			}),
		);
	});
});
