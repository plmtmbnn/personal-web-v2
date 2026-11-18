import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
	get: vi.fn(),
	set: vi.fn(),
	stable: vi.fn(),
	funding: vi.fn(),
	cnbc: vi.fn(),
	yahoo: vi.fn(),
}));
vi.mock("@/lib/core/redis", () => ({
	CACHE_KEYS: {
		CRYPTO_FLOWS: "flows",
		CRYPTO_FLOWS_BACKUP: "flows:backup",
		MARKET_QUOTES: "quotes",
		MARKET_QUOTES_BACKUP: "quotes:backup",
		COMPASS_SNAPSHOT: (date: string) => `snapshot:${date}`,
	},
	redis: {
		get: mocks.get,
		set: mocks.set,
		mget: vi.fn().mockResolvedValue([]),
	},
}));
vi.mock("@/services/market-data", () => ({
	fetchCryptoGlobal: vi.fn().mockResolvedValue(null),
	fetchCnbcQuotes: mocks.cnbc,
	fetchYahooQuote: mocks.yahoo,
}));
vi.mock("@/services/market-data/fred", () => ({
	fetchFredSeries: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/services/market-data/indonesia-macro", () => ({
	fetchIndonesiaMacro: vi.fn().mockResolvedValue({}),
}));
vi.mock("@/services/market-data/history", () => ({
	getOrFetchHistory: vi
		.fn()
		.mockResolvedValue({ series: null, sourceOk: false }),
}));
vi.mock("@/services/market-data/defillama", () => ({
	fetchStablecoinSupply30d: mocks.stable,
}));
vi.mock("@/services/market-data/okx", () => ({
	fetchOkxCryptoMetrics: mocks.funding,
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
import type { MarketQuote } from "@/services/market-data/types";

const now = "2026-11-18T12:00:00Z";
const previous = {
	totalStablecoinSupplyUsd: 200e9,
	stablecoin30dChangePct: 2,
	stablecoinAsOf: 1794873600,
	stablecoinRetrievedAt: "2026-11-17T12:00:00Z",
	btcFundingRate8hPct: 0.01,
	fundingAsOf: 1795001400,
	fundingRetrievedAt: "2026-11-18T11:30:00Z",
	btcOpenInterestUsd: 1e9,
	fundingProvider: "OKX",
};
beforeEach(() => {
	vi.clearAllMocks();
	vi.useFakeTimers();
	vi.setSystemTime(new Date(now));
	vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
	mocks.get.mockImplementation(async (key: string) =>
		key === "flows:backup:v4" ? previous : null,
	);
	mocks.cnbc.mockResolvedValue(new Map());
	mocks.yahoo.mockResolvedValue(null);
	mocks.stable.mockResolvedValue(null);
	mocks.funding.mockResolvedValue(null);
});
afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

it("preserves stablecoin values and dates when derivatives refresh alone", async () => {
	mocks.funding.mockResolvedValue({
		fundingRate8hPct: 0.02,
		fundingAsOf: Date.parse(now) / 1000,
		fundingProvider: "OKX",
		openInterestUsd: 2e9,
	});
	const data = await getInvestmentCompass(true);
	expect(data.markets.cryptoFlows).toMatchObject({
		totalStablecoinSupplyUsd: previous.totalStablecoinSupplyUsd,
		stablecoinAsOf: previous.stablecoinAsOf,
		stablecoinRetrievedAt: previous.stablecoinRetrievedAt,
		stablecoinOrigin: "backup",
		btcFundingRate8hPct: 0.02,
	});
	expect(data.sources.defillama.status).toBe("current");
});

it("preserves funding values and dates when stablecoins refresh alone", async () => {
	mocks.stable.mockResolvedValue({
		totalUsd: 210e9,
		change30dPct: 3,
		asOf: Date.parse(now) / 1000,
	});
	const data = await getInvestmentCompass(true);
	expect(data.markets.cryptoFlows).toMatchObject({
		totalStablecoinSupplyUsd: 210e9,
		btcFundingRate8hPct: previous.btcFundingRate8hPct,
		fundingAsOf: previous.fundingAsOf,
		fundingRetrievedAt: previous.fundingRetrievedAt,
		fundingOrigin: "backup",
	});
});

it("tries Yahoo for stale CNBC data and purges retired backup instruments", async () => {
	const old = {
		last: 100,
		lastTime: "2026-10-01",
		source: "cnbc",
	} as MarketQuote;
	const current = { ...old, source: "yahoo", lastTime: now } as MarketQuote;
	mocks.get.mockImplementation(async (key: string) =>
		key === "quotes:backup" ? { RETIRED: old } : null,
	);
	mocks.cnbc.mockResolvedValue(new Map([[".SPX", old]]));
	mocks.yahoo.mockImplementation(async (symbol: string) =>
		symbol === "^GSPC" ? current : null,
	);
	const data = await getInvestmentCompass(true);
	expect(data.markets.quotes.SPX.source).toBe("yahoo");
	expect(data.markets.quotes.RETIRED).toBeUndefined();
	expect(data.sources.quotes.status).toBe("partial");
});
