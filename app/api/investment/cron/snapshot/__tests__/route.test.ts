import { afterEach, describe, expect, it, vi, beforeEach } from "vitest";

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

vi.mock("@/features/investment/macro/fred-sync", () => ({ syncFred: vi.fn() }));
vi.mock("@/features/investment/macro/postgres", () => ({
	createMacroPostgres: vi.fn(),
	postgresFredStore: vi.fn(() => ({})),
}));

vi.mock("@/services/market-data/idx-flows", () => ({
	syncIdxStockSummary: vi.fn(),
}));

vi.mock("@/services/market-data/idx-research-store", () => ({
	syncIdxResearch: vi.fn().mockResolvedValue({ state: "waiting" }),
}));

import { GET } from "../route";
import { getInvestmentCompass } from "@/features/investment/actions";
import { syncFred } from "@/features/investment/macro/fred-sync";
import { HOSTED_SERIES } from "@/features/investment/macro/series";
import { syncIdxStockSummary } from "@/services/market-data/idx-flows";
import { redis } from "@/lib/core/redis";

describe("GET /api/investment/cron/snapshot", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubEnv("MACRO_RESEARCH_ENABLED", "0");
		vi.stubEnv("FRED_API_KEY", "test-fred-key");
	});
	afterEach(() => vi.unstubAllEnvs());

	it("blocks unauthorized requests in production when secret is missing or invalid", async () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.stubEnv("MACRO_RESEARCH_ENABLED", "1");

		const request = new Request(
			"https://example.com/api/investment/cron/snapshot",
		);
		const response = await GET(request);

		expect(response.status).toBe(401);
		const body = await response.json();
		expect(body).toEqual({ error: "Unauthorized" });
		expect(syncFred).not.toHaveBeenCalled();
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
		expect(getInvestmentCompass).toHaveBeenCalledWith(true, true);
		expect(redis.set).toHaveBeenCalledTimes(1);

		expect(body.success).toBe(true);
		expect(body.regime).toBe("greed");
		expect(body.stockSync).toEqual({ success: true, count: 850 });
		expect(body.macroSync).toEqual({ state: "disabled" });
		expect(syncFred).not.toHaveBeenCalled();
	});

	it.each(["synced", "partial", "failed"] as const)(
		"records the snapshot when the macro refresh is %s",
		async (state) => {
			vi.stubEnv("MACRO_RESEARCH_ENABLED", "1");
			vi.mocked(syncIdxStockSummary).mockResolvedValueOnce({
				success: true,
				count: 850,
			});
			vi.mocked(getInvestmentCompass).mockResolvedValueOnce({
				sentiment: {},
			} as Awaited<ReturnType<typeof getInvestmentCompass>>);
			const results = HOSTED_SERIES.map((id) =>
				state === "partial" && id === "GDPC1"
					? { id, synced: false, error: "FRED HTTP 503" }
					: { id, synced: true },
			);
			if (state === "failed") {
				vi.mocked(syncFred).mockRejectedValueOnce(
					new Error("Provider unavailable"),
				);
			} else {
				vi.mocked(syncFred).mockResolvedValueOnce(results);
			}

			const response = await GET(
				new Request("https://example.com/api/investment/cron/snapshot", {
					headers: { authorization: "Bearer test-cron-secret" },
				}),
			);

			expect(response.status).toBe(200);
			expect(redis.set).toHaveBeenCalledOnce();
			expect(syncFred).toHaveBeenCalledWith(
				expect.anything(),
				"test-fred-key",
				{
					ids: HOSTED_SERIES,
					signal: expect.any(AbortSignal),
				},
			);
			expect(await response.json()).toMatchObject({
				success: true,
				macroSync: state === "failed" ? { state } : { state, results },
			});
		},
	);

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
