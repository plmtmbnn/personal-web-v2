import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	checkAdmin: vi.fn(),
	exists: vi.fn(),
	ttl: vi.fn(),
	del: vi.fn(),
	snapshot: vi.fn(),
	getStockData: vi.fn(),
	saveStockData: vi.fn(),
}));

vi.mock("@/features/auth/actions", () => ({ checkAdmin: mocks.checkAdmin }));
vi.mock("@/lib/core/redis", () => ({
	CACHE_KEYS: {
		STOCK_SUMMARY: "idx:stock-summary",
		STOCK_SUMMARY_BACKUP: "idx:stock-summary:backup",
	},
	redis: { exists: mocks.exists, ttl: mocks.ttl, del: mocks.del },
	getStockDataSnapshot: mocks.snapshot,
	getStockData: mocks.getStockData,
	saveStockData: mocks.saveStockData,
}));

import { DELETE, GET, POST } from "../route";

const stock = {
	StockCode: "BBCA",
	Date: "2026-11-24",
	Close: 10000,
	Volume: 1000,
	Value: 10000000,
	ForeignBuy: 100,
	ForeignSell: 50,
};

beforeEach(() => {
	vi.clearAllMocks();
	mocks.checkAdmin.mockResolvedValue(true);
	mocks.ttl.mockResolvedValue(3600);
	mocks.del.mockResolvedValue(3);
	mocks.saveStockData.mockResolvedValue(true);
});

describe("stock manager cache API", () => {
	it.each([
		[1, 1, "active", 3600],
		[0, 1, "backup", null],
		[0, 0, "empty", null],
	] as const)(
		"reports primary=%i backup=%i as %s",
		async (primary, backup, state, ttl) => {
			mocks.exists.mockResolvedValueOnce(primary).mockResolvedValueOnce(backup);
			mocks.snapshot.mockResolvedValue(
				primary || backup ? { data: [stock] } : null,
			);
			mocks.ttl.mockResolvedValue(primary ? 3600 : -2);
			const response = await GET();
			expect(response.status).toBe(200);
			expect(await response.json()).toMatchObject({
				state,
				ttlSeconds: ttl,
				available: !!(primary || backup),
			});
		},
	);

	it("reports a read failure instead of an empty cache", async () => {
		mocks.exists.mockResolvedValueOnce(1).mockResolvedValueOnce(1);
		mocks.snapshot.mockResolvedValue(null);
		expect((await GET()).status).toBe(500);
	});

	it("purges primary, backup, and refresh cooldown", async () => {
		expect((await DELETE()).status).toBe(200);
		expect(mocks.del).toHaveBeenCalledWith(
			"idx:stock-summary",
			"idx:stock-summary:backup",
			"idx:last-fetch-attempt",
		);
	});

	it("rejects incomplete imports without saving", async () => {
		const response = await POST(
			new Request("http://localhost/api/admin/import-stock", {
				method: "POST",
				body: JSON.stringify({ data: [{ StockCode: "BBCA" }], force: true }),
			}),
		);
		expect(response.status).toBe(400);
		expect(mocks.saveStockData).not.toHaveBeenCalled();
	});

	it("saves a valid import", async () => {
		const response = await POST(
			new Request("http://localhost/api/admin/import-stock", {
				method: "POST",
				body: JSON.stringify({ data: [stock], force: true }),
			}),
		);
		expect(response.status).toBe(200);
		expect(mocks.saveStockData).toHaveBeenCalledWith([stock], 43200);
	});
});
