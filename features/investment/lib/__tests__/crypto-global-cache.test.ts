import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { readRedis, fetchGlobal } = vi.hoisted(() => ({
	readRedis: vi.fn(),
	fetchGlobal: vi.fn(),
}));

vi.mock("@/lib/core/redis", () => ({
	CACHE_KEYS: {
		CRYPTO_GLOBAL: "compass:crypto:global",
		CRYPTO_GLOBAL_BACKUP: "compass:crypto:global:backup",
		COMPASS_SNAPSHOT: (date: string) => `compass:snapshot:${date}`,
	},
	redis: { get: readRedis, mget: vi.fn().mockResolvedValue([]) },
}));
vi.mock("@/services/market-data", () => ({
	fetchCryptoGlobal: fetchGlobal,
	fetchCnbcQuotes: vi.fn().mockResolvedValue(new Map()),
	fetchYahooQuote: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/services/market-data/fred", () => ({
	fetchFredSeries: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/services/market-data/history", () => ({
	getOrFetchHistory: vi
		.fn()
		.mockResolvedValue({ series: null, sourceOk: false }),
}));
vi.mock("@/services/market-data/defillama", () => ({
	fetchStablecoinSupply30d: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/services/market-data/okx", () => ({
	fetchOkxCryptoMetrics: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/services/market-data/onchain", () => ({
	fetchBitcoinMvrvObservation: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/services/market-data/idx-flows", () => ({
	fetchIhsgForeignFlow: vi.fn().mockResolvedValue(null),
}));
vi.mock("next/cache", () => ({
	revalidatePath: vi.fn(),
	unstable_cache: (load: unknown) => load,
}));

import { getInvestmentCompass } from "../../actions";

const snapshot = {
	totalMarketCapUsd: 3e12,
	totalVolumeUsd: 80e9,
	marketCapChange24hPct: -1.25,
	btcDominance: 55.92,
	ethDominance: 12.1,
	updatedAt: 1794801600,
	retrievedAt: "2026-11-16T12:00:00Z",
};

describe("Investment Compass crypto aggregate cache", () => {
	beforeEach(() => {
		readRedis.mockReset().mockResolvedValue(null);
		fetchGlobal.mockReset().mockResolvedValue(null);
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
	});
	afterEach(() => vi.unstubAllGlobals());

	it.each([false, true])(
		"preserves numeric fields on a cache hit (JSON string: %s)",
		async (encoded) => {
			readRedis.mockImplementation(async (key) =>
				key === "compass:crypto:global"
					? encoded
						? JSON.stringify(snapshot)
						: snapshot
					: null,
			);

			const data = await getInvestmentCompass();

			expect(data.markets.cryptoGlobal).toEqual({
				...snapshot,
				origin: "cache",
			});
			expect(fetchGlobal).not.toHaveBeenCalled();
		},
	);

	it("rejects corrupted numeric fields and uses the valid backup", async () => {
		readRedis.mockImplementation(async (key) => {
			if (key === "compass:crypto:global")
				return { ...snapshot, btcDominance: { 0: "5", origin: "cache" } };
			return key === "compass:crypto:global:backup"
				? JSON.stringify(snapshot)
				: null;
		});

		const data = await getInvestmentCompass();

		expect(fetchGlobal).toHaveBeenCalledOnce();
		expect(data.markets.cryptoGlobal).toEqual({
			...snapshot,
			origin: "backup",
		});
	});
});
