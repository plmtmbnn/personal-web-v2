import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/core/env", () => ({
	ENV_GLOBAL: {
		CRON_SECRET: "test-cron-secret",
	},
}));

vi.mock("@/lib/core/redis", () => ({
	redis: {
		set: vi.fn(),
		get: vi.fn(),
	},
	CACHE_KEYS: {
		COMPASS_SNAPSHOT: (date: string) => `compass:snapshot:${date}`,
	},
}));

vi.mock("@/features/investment/actions", () => ({
	getInvestmentCompass: vi.fn(),
}));

vi.mock("@/services/market-data/idx-flows", () => ({
	syncIdxStockSummary: vi.fn(),
}));

import { GET } from "../route";
import { getInvestmentCompass } from "@/features/investment/actions";
import { syncIdxStockSummary } from "@/services/market-data/idx-flows";
import { redis } from "@/lib/core/redis";

describe("GET /api/investment/cron/snapshot", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("blocks unauthorized requests in production when secret is missing or invalid", async () => {
		vi.stubEnv("NODE_ENV", "production");

		const request = new Request(
			"https://example.com/api/investment/cron/snapshot",
		);
		const response = await GET(request);

		expect(response.status).toBe(401);
		const body = await response.json();
		expect(body).toEqual({ error: "Unauthorized" });

		vi.unstubAllEnvs();
	});

	it("executes syncIdxStockSummary and saves compass snapshot on authorized request", async () => {
		vi.mocked(syncIdxStockSummary).mockResolvedValueOnce({
			success: true,
			count: 850,
		});

		vi.mocked(getInvestmentCompass).mockResolvedValueOnce({
			sentiment: {
				traditional: {
					fear_and_greed: { rating: "greed" },
				},
			},
		} as any);

		vi.mocked(redis.set).mockResolvedValueOnce("OK" as any);

		const request = new Request(
			"https://example.com/api/investment/cron/snapshot?secret=test-cron-secret",
		);
		const response = await GET(request);

		expect(response.status).toBe(200);
		const body = await response.json();

		expect(syncIdxStockSummary).toHaveBeenCalledWith(true);
		expect(getInvestmentCompass).toHaveBeenCalledWith(true);
		expect(redis.set).toHaveBeenCalledTimes(1);

		expect(body.success).toBe(true);
		expect(body.regime).toBe("greed");
		expect(body.stockSync).toEqual({ success: true, count: 850 });
	});

	it("returns 500 when an internal error occurs", async () => {
		vi.mocked(syncIdxStockSummary).mockRejectedValueOnce(
			new Error("Fatal crash"),
		);

		const request = new Request(
			"https://example.com/api/investment/cron/snapshot?secret=test-cron-secret",
		);
		const response = await GET(request);

		expect(response.status).toBe(500);
		const body = await response.json();
		expect(body.error).toBe("Internal Server Error");
	});
});
