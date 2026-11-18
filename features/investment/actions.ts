import { jakartaDate } from "@/services/market-data/provenance";
import { applyMarketProvenance } from "./lib/provenance";
import { redis, CACHE_KEYS } from "@/lib/core/redis";
import { revalidatePath, unstable_cache } from "next/cache";
import { z } from "zod";
import type {
	CryptoFearAndGreedResponse,
	InvestmentCompassData,
	CryptoOnChainSnapshot,
	IhsgForeignFlowSnapshot,
} from "./types";
import { INSTRUMENTS } from "./data/instruments";
import {
	FRED_SERIES,
	quoteIsCurrent,
	registeredQuotes,
	registeredMacro,
} from "@/services/market-data/registry";
import { fetchIndonesiaMacro } from "@/services/market-data/indonesia-macro";
import { MODEL_VERSION } from "./lib/engine/evidence";
import {
	fetchCnbcQuotes,
	fetchYahooQuote,
	fetchCryptoGlobal,
} from "@/services/market-data";
import { fetchFredSeries } from "@/services/market-data/fred";
import { getOrFetchHistory } from "@/services/market-data/history";
import { fetchStablecoinSupply30d } from "@/services/market-data/defillama";
import { fetchOkxCryptoMetrics } from "@/services/market-data/okx";
import { computeCompass } from "./lib/engine";
import type {
	MarketQuote,
	MacroSeries,
	PriceHistorySeries,
	CryptoFlowsSnapshot,
	CryptoGlobalSnapshot,
} from "@/services/market-data/types";
import { fetchBitcoinMvrvObservation } from "@/services/market-data/onchain";
import { fetchIhsgForeignFlow } from "@/services/market-data/idx-flows";

/**
 * Fetch Crypto Fear and Greed Index from Alternative.me (Free API, 30 days history)
 */
async function getCryptoFearAndGreedData(): Promise<CryptoFearAndGreedResponse | null> {
	const url = "https://api.alternative.me/fng/?limit=30";

	try {
		const response = await fetch(url, {
			next: { revalidate: 3600 }, // Cache for 1 hour
			headers: {
				Accept: "application/json",
			},
		});

		if (!response.ok) {
			console.error(
				`Crypto Fear and Greed API error: ${response.status} - ${response.statusText}`,
			);
			return null;
		}

		const data = await response.json();
		if (!data?.data || !Array.isArray(data.data)) {
			console.error("Crypto Fear and Greed API: Invalid response structure");
			return null;
		}

		return data as CryptoFearAndGreedResponse;
	} catch (error) {
		console.error("Crypto Fear and Greed fetch failed:", error);
		return null;
	}
}

/**
 * Retrieves market quotes by fetching them from CNBC & Yahoo and caching in Redis.
 */
async function getMarketQuotes(
	forceRefresh: boolean,
	failures: Record<string, string> = {},
): Promise<{ quotes: Record<string, MarketQuote>; sourceOk: boolean }> {
	const cacheKey = CACHE_KEYS.MARKET_QUOTES;
	const backupKey = CACHE_KEYS.MARKET_QUOTES_BACKUP;

	if (!forceRefresh) {
		try {
			const cachedRaw = await redis.get<Record<string, MarketQuote> | string>(
				cacheKey,
			);
			if (cachedRaw) {
				const cached: Record<string, MarketQuote> =
					typeof cachedRaw === "string" ? JSON.parse(cachedRaw) : cachedRaw;
				if (cached && Object.keys(cached).length > 0) {
					return {
						quotes: Object.fromEntries(
							Object.entries(registeredQuotes(cached)).map(([id, q]) => [
								id,
								{ ...q, origin: q.origin === "backup" ? "backup" : "cache" },
							]),
						),
						sourceOk: true,
					};
				}
			}
		} catch (e) {
			console.warn("[Investment] Quotes cache read failed:", e);
		}
	}

	try {
		// Group symbols by provider
		const cnbcSymbols = INSTRUMENTS.filter((i) => Boolean(i.cnbc)).map(
			(i) => i.cnbc!,
		);

		// Fetch CNBC batch with safe error fallback
		const cnbcQuotes = await fetchCnbcQuotes(cnbcSymbols, {
			revalidate: 60, // 1 min ISR baseline
			fresh: forceRefresh,
		}).catch((e) => {
			console.warn("[Investment] CNBC batch fetch failed:", e);
			return new Map<string, MarketQuote>();
		});

		// Fetch Yahoo missing symbols in parallel:
		// Covers instruments without CNBC identifier (e.g. IHSG) OR any symbol CNBC failed to resolve
		const yahooInsts = INSTRUMENTS.filter(
			(inst) =>
				Boolean(inst.yahoo) &&
				(!inst.cnbc || !quoteIsCurrent(inst.id, cnbcQuotes.get(inst.cnbc))),
		);

		const yahooPromises = yahooInsts.map(async (inst) => {
			try {
				const quote = await fetchYahooQuote(inst.yahoo!, {
					revalidate: 60,
					fresh: forceRefresh,
				});
				return { id: inst.id, quote };
			} catch (e) {
				console.warn(`[Investment] Yahoo fallback failed for ${inst.id}`, e);
				failures[inst.id] =
					e instanceof Error && /429/.test(e.message)
						? "Yahoo rate limit (HTTP 429)"
						: "Yahoo quote request failed";
				return { id: inst.id, quote: null };
			}
		});

		const yahooResults = await Promise.all(yahooPromises);

		// Map to our internal IDs
		const quotesRecord: Record<string, MarketQuote> = {};
		for (const inst of INSTRUMENTS) {
			let q: MarketQuote | null | undefined;
			if (inst.cnbc) {
				q = cnbcQuotes.get(inst.cnbc);
			}
			if ((!q || !quoteIsCurrent(inst.id, q)) && inst.yahoo) {
				q = yahooResults.find((y) => y.id === inst.id)?.quote;
			}
			if (q && quoteIsCurrent(inst.id, q)) {
				quotesRecord[inst.id] = {
					...q,
					origin: "live",
					retrievedAt: new Date().toISOString(),
				};
			}
		}

		let existingBackup: Record<string, MarketQuote> = {};
		try {
			const rawBackup = await redis.get<Record<string, MarketQuote> | string>(
				backupKey,
			);
			if (rawBackup) {
				existingBackup =
					typeof rawBackup === "string" ? JSON.parse(rawBackup) : rawBackup;
			}
		} catch (e) {
			console.warn("[Investment] Failed reading quotes backup for merge:", e);
		}

		const mergedQuotes = {
			...Object.fromEntries(
				Object.entries(registeredQuotes(existingBackup)).map(([id, q]) => [
					id,
					{ ...q, origin: "backup" as const },
				]),
			),
			...quotesRecord,
		};
		const freshCount = Object.keys(quotesRecord).length;
		const totalMergedCount = Object.keys(mergedQuotes).length;

		if (totalMergedCount > 0) {
			// Update cache with merged state so stale items don't disappear prematurely
			await redis.set(cacheKey, JSON.stringify(mergedQuotes), { ex: 300 }); // 5 min TTL
			// Update permanent backup
			await redis.set(backupKey, JSON.stringify(mergedQuotes));

			// sourceOk is true if we got healthy fresh data (> 50% of expected symbols)
			const isComprehensive =
				freshCount >= Math.round(INSTRUMENTS.length * 0.5);
			return { quotes: mergedQuotes, sourceOk: isComprehensive };
		}
	} catch (e) {
		console.warn("[Investment] Live quotes fetch failed:", e);
	}

	// Fallback to backup
	try {
		const backup = await redis.get<Record<string, MarketQuote> | string>(
			backupKey,
		);
		if (backup) {
			const parsed: Record<string, MarketQuote> =
				typeof backup === "string" ? JSON.parse(backup) : backup;
			if (parsed && Object.keys(parsed).length > 0) {
				return {
					quotes: Object.fromEntries(
						Object.entries(registeredQuotes(parsed)).map(([id, q]) => [
							id,
							{ ...q, origin: "backup" },
						]),
					),
					sourceOk: false,
				}; // false = using stale backup
			}
		}
	} catch (e) {
		console.warn("[Investment] Quotes backup read failed:", e);
	}

	return { quotes: {}, sourceOk: false };
}

const cryptoGlobalCacheSchema = z.object({
	totalMarketCapUsd: z.number(),
	totalVolumeUsd: z.number(),
	marketCapChange24hPct: z.number(),
	btcDominance: z.number(),
	ethDominance: z.number(),
	updatedAt: z.number(),
	retrievedAt: z.string().optional(),
});

async function readCryptoGlobalCache(
	key: string,
	origin: "cache" | "backup",
): Promise<CryptoGlobalSnapshot | null> {
	const raw = await redis.get<unknown>(key);
	const data = cryptoGlobalCacheSchema.safeParse(
		typeof raw === "string" ? JSON.parse(raw) : raw,
	);
	return data.success ? { ...data.data, origin } : null;
}

async function getCryptoGlobalData(
	forceRefresh: boolean,
): Promise<{ data: CryptoGlobalSnapshot | null; sourceOk: boolean }> {
	const cacheKey = CACHE_KEYS.CRYPTO_GLOBAL;
	const backupKey = CACHE_KEYS.CRYPTO_GLOBAL_BACKUP;

	if (!forceRefresh) {
		try {
			const cached = await readCryptoGlobalCache(cacheKey, "cache");
			if (cached) return { data: cached, sourceOk: true };
		} catch (e) {
			console.warn("[Investment] Crypto Global cache read failed:", e);
		}
	}

	try {
		const globalData = await fetchCryptoGlobal({
			revalidate: 600, // 10 min ISR
			fresh: forceRefresh,
		});
		if (globalData) {
			const snapshot: CryptoGlobalSnapshot = {
				...globalData,
				origin: "live",
				retrievedAt: new Date().toISOString(),
			};
			await redis.set(cacheKey, JSON.stringify(snapshot), { ex: 900 }); // 15 min TTL
			await redis.set(backupKey, JSON.stringify(snapshot));
			return { data: snapshot, sourceOk: true };
		}
	} catch (e) {
		console.warn("[Investment] Live Crypto Global fetch failed:", e);
	}

	try {
		const backup = await readCryptoGlobalCache(backupKey, "backup");
		if (backup) return { data: backup, sourceOk: false };
	} catch (e) {
		console.warn("[Investment] Crypto Global backup read failed:", e);
	}

	return { data: null, sourceOk: false };
}

/**
 * Retrieves core macro indicators from FRED.
 */
async function getMacroData(
	forceRefresh: boolean,
	failures: Record<string, string> = {},
): Promise<{ data: Record<string, MacroSeries>; sourceOk: boolean }> {
	const cacheKey = `${CACHE_KEYS.MACRO_FRED}:v4`;
	const backupKey = `${CACHE_KEYS.MACRO_FRED_BACKUP}:v4`;

	if (!forceRefresh) {
		try {
			const cached = await redis.get<Record<string, MacroSeries>>(cacheKey);
			if (cached && Object.keys(cached).length > 0) {
				return {
					data: Object.fromEntries(
						Object.entries(registeredMacro(cached)).map(([id, series]) => [
							id,
							{
								...series,
								origin: series.origin === "backup" ? "backup" : "cache",
							},
						]),
					),
					sourceOk: true,
				};
			}
		} catch (e) {
			console.warn("[Investment] Macro cache read failed:", e);
		}
	}

	try {
		// Key macro series to fetch:
		// FEDFUNDS (Fed Funds Rate), CPIAUCSL (CPI YoY), M2SL (M2 YoY Money Supply), UNRATE (Unemployment)
		// DGS10 (10Y Treasury), T10Y2Y (Yield Curve), BAMLH0A0HYM2 (HY OAS Spread)
		// Domestic policy and CPI observations come from Bank Indonesia, not retired FRED mappings.
		const seriesConfigs = FRED_SERIES;
		const macroData: Record<string, MacroSeries> = {};

		const promises = seriesConfigs.map(async (config) => {
			const series = await fetchFredSeries(
				config.id,
				{
					revalidate: 3600, // 1 hour
					fresh: forceRefresh,
					onError: (reason) => {
						failures[config.id] = reason;
					},
				},
				config.units ? { units: config.units } : undefined,
			);
			if (series?.data.length) {
				macroData[config.id] = {
					...series,
					origin: "live",
					retrievedAt: new Date().toISOString(),
				};
			}
		});

		await Promise.allSettled(promises);
		Object.assign(
			macroData,
			await fetchIndonesiaMacro({
				revalidate: 3600,
				fresh: forceRefresh,
				onError: (reason) => {
					failures.indonesiaMacro = reason;
				},
			}),
		);

		let existingBackup: Record<string, MacroSeries> = {};
		try {
			const rawBackup = await redis.get<Record<string, MacroSeries> | string>(
				backupKey,
			);
			if (rawBackup) {
				existingBackup =
					typeof rawBackup === "string" ? JSON.parse(rawBackup) : rawBackup;
			}
		} catch (e) {
			console.warn("[Investment] Failed reading macro backup for merge:", e);
		}

		const mergedMacro = {
			...Object.fromEntries(
				Object.entries(registeredMacro(existingBackup)).map(([id, series]) => [
					id,
					{ ...series, origin: "backup" as const },
				]),
			),
			...macroData,
		};
		const freshCount = Object.keys(macroData).length;
		const totalMergedCount = Object.keys(mergedMacro).length;

		if (totalMergedCount > 0) {
			await redis.set(cacheKey, JSON.stringify(mergedMacro), { ex: 3600 }); // 1 hour TTL
			await redis.set(backupKey, JSON.stringify(mergedMacro));
			// Comprehensive if at least 4 key series succeeded in the fresh batch
			return { data: mergedMacro, sourceOk: freshCount >= 4 };
		}
	} catch (e) {
		console.warn("[Investment] Live Macro fetch failed:", e);
	}

	try {
		const backup = await redis.get<Record<string, MacroSeries> | string>(
			backupKey,
		);
		if (backup) {
			const parsed: Record<string, MacroSeries> =
				typeof backup === "string" ? JSON.parse(backup) : backup;
			if (parsed && Object.keys(parsed).length > 0) {
				return {
					data: Object.fromEntries(
						Object.entries(registeredMacro(parsed)).map(([id, series]) => [
							id,
							{ ...series, origin: "backup" },
						]),
					),
					sourceOk: false,
				};
			}
		}
	} catch (e) {
		console.warn("[Investment] Macro backup read failed:", e);
	}

	return { data: {}, sourceOk: false };
}

/**
 * Retrieves core historical series for technicals and moving averages.
 */
async function getHistoryData(forceRefresh: boolean): Promise<{
	history: Record<string, PriceHistorySeries | null>;
	sourceOk: boolean;
}> {
	const coreSymbols = [
		{ symbol: "^JKSE", range: "2y", interval: "1d" },
		{ symbol: "IDR=X", range: "2y", interval: "1d" },
		{ symbol: "BTC-USD", range: "2y", interval: "1d" },
	];
	const sectorSymbols = [
		{ symbol: "BBCA.JK", range: "6mo", interval: "1d" }, // Financials bellwether
		{ symbol: "ADRO.JK", range: "6mo", interval: "1d" }, // Energy bellwether
		{ symbol: "ICBP.JK", range: "6mo", interval: "1d" }, // Consumer bellwether
		{ symbol: "ANTM.JK", range: "6mo", interval: "1d" }, // Basic Materials bellwether
		{ symbol: "TLKM.JK", range: "6mo", interval: "1d" }, // Telco/Infra bellwether
		{ symbol: "ASII.JK", range: "6mo", interval: "1d" }, // Industrial/Auto bellwether
	];
	const allItems = [...coreSymbols, ...sectorSymbols];
	const history: Record<string, PriceHistorySeries | null> = {};
	let coreOk = true;

	const promises = allItems.map(async (item) => {
		const res = await getOrFetchHistory(
			item.symbol,
			{ range: item.range, interval: item.interval },
			forceRefresh,
		);
		const isCore = coreSymbols.some((c) => c.symbol === item.symbol);
		if (isCore && !res.sourceOk) {
			coreOk = false;
		}
		return { symbol: item.symbol, series: res.series };
	});

	const results = await Promise.allSettled(promises);
	for (const r of results) {
		if (r.status === "fulfilled") {
			history[r.value.symbol] = r.value.series;
			if (r.value.symbol === "^JKSE") {
				history.JKSE = r.value.series;
			}
			if (r.value.symbol === "IDR=X") {
				history.USDIDR = r.value.series;
			}
		}
	}
	return { history, sourceOk: coreOk && Object.keys(history).length > 0 };
}

/**
 * Retrieves crypto liquidity metrics (stablecoin issuance, futures funding/OI).
 */
async function getCryptoFlowsData(
	forceRefresh: boolean,
	failures: Record<string, string> = {},
): Promise<{
	data: CryptoFlowsSnapshot | null;
	sourceOk: boolean;
}> {
	const cacheKey = `${CACHE_KEYS.CRYPTO_FLOWS}:v4`;
	const backupKey = `${CACHE_KEYS.CRYPTO_FLOWS_BACKUP}:v4`;

	if (!forceRefresh) {
		try {
			const cached = await redis.get<CryptoFlowsSnapshot | string>(cacheKey);
			if (cached) {
				const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
				if (parsed)
					return {
						data: {
							...parsed,
							origin: "cache",
							stablecoinOrigin:
								parsed.stablecoinOrigin === "backup" ? "backup" : "cache",
							fundingOrigin:
								parsed.fundingOrigin === "backup" ? "backup" : "cache",
						},
						sourceOk: true,
					};
			}
		} catch (e) {
			console.warn("[Investment] Crypto flows cache read failed:", e);
		}
	}

	try {
		const [stableRes, okxRes] = await Promise.allSettled([
			fetchStablecoinSupply30d({
				revalidate: 21600,
				fresh: forceRefresh,
				onError: (reason) => {
					failures.supply = reason;
				},
			}),
			fetchOkxCryptoMetrics({ revalidate: 900, fresh: forceRefresh }),
		]);

		const stableData =
			stableRes.status === "fulfilled" ? stableRes.value : null;
		const okxData = okxRes.status === "fulfilled" ? okxRes.value : null;
		let previous: CryptoFlowsSnapshot | null = null;
		try {
			const rawPrevious = await redis.get<CryptoFlowsSnapshot | string>(
				backupKey,
			);
			previous =
				typeof rawPrevious === "string" ? JSON.parse(rawPrevious) : rawPrevious;
		} catch {
			console.warn("[Investment] Crypto flow backup could not be read");
		}

		if (stableData || okxData || previous) {
			const snapshot: CryptoFlowsSnapshot = {
				totalStablecoinSupplyUsd:
					stableData?.totalUsd ?? previous?.totalStablecoinSupplyUsd ?? null,
				stablecoin30dChangePct:
					stableData?.change30dPct ?? previous?.stablecoin30dChangePct ?? null,
				btcFundingRate8hPct:
					okxData?.fundingRate8hPct ?? previous?.btcFundingRate8hPct ?? null,
				btcOpenInterestUsd:
					okxData?.openInterestUsd ?? previous?.btcOpenInterestUsd ?? null,
				stablecoinAsOf: stableData?.asOf ?? previous?.stablecoinAsOf,
				fundingAsOf:
					okxData?.fundingRate8hPct != null
						? okxData.fundingAsOf
						: previous?.fundingAsOf,
				fundingProvider:
					okxData?.fundingRate8hPct != null
						? okxData.fundingProvider
						: previous?.fundingProvider,
				stablecoinOrigin: stableData ? "live" : "backup",
				stablecoinRetrievedAt: stableData
					? new Date().toISOString()
					: previous?.stablecoinRetrievedAt,
				fundingOrigin: okxData?.fundingRate8hPct != null ? "live" : "backup",
				fundingRetrievedAt:
					okxData?.fundingRate8hPct != null
						? new Date().toISOString()
						: previous?.fundingRetrievedAt,
				updatedAt: Math.floor(Date.now() / 1000),
				retrievedAt: new Date().toISOString(),
				origin: "live",
			};

			await redis.set(cacheKey, JSON.stringify(snapshot), { ex: 900 }); // 15 min TTL
			await redis.set(backupKey, JSON.stringify(snapshot));
			return { data: snapshot, sourceOk: true };
		}
	} catch (e) {
		console.warn("[Investment] Live crypto flows fetch failed:", e);
	}

	try {
		const backup = await redis.get<CryptoFlowsSnapshot | string>(backupKey);
		if (backup) {
			const parsed = typeof backup === "string" ? JSON.parse(backup) : backup;
			if (parsed)
				return {
					data: {
						...parsed,
						origin: "backup",
						stablecoinOrigin: "backup",
						fundingOrigin: "backup",
					},
					sourceOk: false,
				};
		}
	} catch (e) {
		console.warn("[Investment] Crypto flows backup read failed:", e);
	}

	return { data: null, sourceOk: false };
}

/**
 * Retrieves crypto on-chain valuation metrics.
 */
async function getCryptoOnChainData(forceRefresh: boolean): Promise<{
	data: CryptoOnChainSnapshot | null;
	sourceOk: boolean;
}> {
	const cacheKey = CACHE_KEYS.CRYPTO_ONCHAIN;
	const backupKey = CACHE_KEYS.CRYPTO_ONCHAIN_BACKUP;

	if (!forceRefresh) {
		try {
			const cached = await redis.get<CryptoOnChainSnapshot | string>(cacheKey);
			if (cached) {
				const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
				if (parsed && typeof parsed.mvrvZScore === "number") {
					return { data: { ...parsed, origin: "cache" }, sourceOk: true };
				}
			}
		} catch (e) {
			console.warn("[Investment] Crypto onchain cache read failed:", e);
		}
	}

	try {
		const mvrv = await fetchBitcoinMvrvObservation({
			revalidate: 21600,
			fresh: forceRefresh,
		});

		if (mvrv != null) {
			const snapshot: CryptoOnChainSnapshot = {
				mvrvZScore: mvrv.value,
				mvrvRatio: mvrv.value,
				asOf: mvrv.asOf ? new Date(mvrv.asOf * 1000).toISOString() : undefined,
				updatedAt: Math.floor(Date.now() / 1000),
				retrievedAt: new Date().toISOString(),
				origin: "live",
			};

			await redis.set(cacheKey, JSON.stringify(snapshot), { ex: 21600 }); // 6 hour TTL
			await redis.set(backupKey, JSON.stringify(snapshot));
			return { data: snapshot, sourceOk: true };
		}
	} catch (e) {
		console.warn("[Investment] Live crypto onchain fetch failed:", e);
	}

	try {
		const backup = await redis.get<CryptoOnChainSnapshot | string>(backupKey);
		if (backup) {
			const parsed = typeof backup === "string" ? JSON.parse(backup) : backup;
			if (parsed && typeof parsed.mvrvZScore === "number") {
				return { data: { ...parsed, origin: "backup" }, sourceOk: false };
			}
		}
	} catch (e) {
		console.warn("[Investment] Crypto onchain backup read failed:", e);
	}

	return { data: null, sourceOk: false };
}

/**
 * Retrieves IHSG Net Foreign Flow and Streak.
 */
async function getIhsgFlowsData(forceRefresh: boolean): Promise<{
	data: IhsgForeignFlowSnapshot | null;
	sourceOk: boolean;
}> {
	// Flows calculated locally using Redis history and stock summary cache.
	// We still provide a sourceOk flag for telemetry.
	try {
		const flows = await fetchIhsgForeignFlow({
			revalidate: 21600,
			fresh: forceRefresh,
		});
		if (flows != null) {
			return { data: flows, sourceOk: true };
		}
	} catch (e) {
		console.warn("[Investment] IHSG flows fetch failed:", e);
	}
	return { data: null, sourceOk: false };
}

/**
 * Fetch all market data and sentiment needed for the Investment Compass.
 * Resolves completely even if some services fail.
 */
export async function getInvestmentCompass(
	forceRefresh = false,
	idxAlreadySynced = false,
): Promise<InvestmentCompassData> {
	if (forceRefresh) {
		try {
			revalidatePath("/investment");
		} catch (e) {
			console.warn("[Investment] revalidatePath failed:", e);
		}
	}

	const fetchFailures: Record<string, string> = {};
	const [
		cryptoFngResult,
		quotesResult,
		cryptoGlobalResult,
		macroResult,
		historyResult,
		cryptoFlowsResult,
		cryptoOnChainResult,
		ihsgFlowsResult,
	] = await Promise.allSettled([
		getCryptoFearAndGreedData(),
		getMarketQuotes(forceRefresh, fetchFailures),
		getCryptoGlobalData(forceRefresh),
		getMacroData(forceRefresh, fetchFailures),
		getHistoryData(forceRefresh),
		getCryptoFlowsData(forceRefresh, fetchFailures),
		getCryptoOnChainData(forceRefresh),
		getIhsgFlowsData(forceRefresh && !idxAlreadySynced),
	]);

	const crypto =
		cryptoFngResult.status === "fulfilled" ? cryptoFngResult.value : null;
	const quotesData =
		quotesResult.status === "fulfilled"
			? quotesResult.value
			: { quotes: {}, sourceOk: false };
	const cgData =
		cryptoGlobalResult.status === "fulfilled"
			? cryptoGlobalResult.value
			: { data: null, sourceOk: false };
	const macroData =
		macroResult.status === "fulfilled"
			? macroResult.value
			: { data: {}, sourceOk: false };
	const historyData =
		historyResult.status === "fulfilled"
			? historyResult.value
			: { history: {}, sourceOk: false };
	const flowsData =
		cryptoFlowsResult.status === "fulfilled"
			? cryptoFlowsResult.value
			: { data: null, sourceOk: false };
	const onChainData =
		cryptoOnChainResult.status === "fulfilled"
			? cryptoOnChainResult.value
			: { data: null, sourceOk: false };
	const ihsgFlowData =
		ihsgFlowsResult.status === "fulfilled"
			? ihsgFlowsResult.value
			: { data: null, sourceOk: false };

	const vixQuote = quotesData.quotes.VIX ?? null;

	const compassData: InvestmentCompassData = {
		fetchFailures,
		sentiment: {
			crypto,
			vix: vixQuote,
			traditional: null,
		},
		markets: {
			quotes: quotesData.quotes,
			cryptoGlobal: cgData.data,
			macro: macroData.data,
			history: historyData.history,
			cryptoFlows: flowsData.data,
			cryptoOnChain: onChainData.data,
			ihsgFlows: ihsgFlowData.data,
		},
		sources: {
			vix: {
				ok: Boolean(vixQuote),
				label: "CBOE VIX Volatility",
				stale: !vixQuote,
			},
			cryptoFng: {
				ok: !!crypto,
				label: "Alternative.me",
				stale: !crypto,
			},
			quotes: {
				ok: quotesData.sourceOk,
				label: "Global Quotes",
				stale: !quotesData.sourceOk,
			},
			coingecko: {
				ok: cgData.sourceOk,
				label: "CoinGecko",
				stale: !cgData.sourceOk,
			},
			fred: {
				ok: macroData.sourceOk,
				label: "FRED Macro",
				stale: !macroData.sourceOk,
			},
			indonesiaMacro: { ok: false, label: "Indonesia Policy & Inflation" },
			history: {
				ok: historyData.sourceOk,
				label: "Yahoo Chart History",
				stale: !historyData.sourceOk,
			},
			defillama: {
				ok: !!flowsData.data?.totalStablecoinSupplyUsd,
				label: "DefiLlama Stablecoins",
				stale: !flowsData.data?.totalStablecoinSupplyUsd,
			},
			okx: {
				ok: flowsData.data?.btcFundingRate8hPct != null,
				label: "Crypto Derivatives",
				stale: flowsData.data?.btcFundingRate8hPct == null,
			},
			onchain: {
				ok: onChainData.sourceOk,
				label: "On-Chain Valuation",
				stale: !onChainData.sourceOk,
			},
			idxFlows: {
				ok: ihsgFlowData.sourceOk,
				label: "IDX Foreign Flow",
				stale: !ihsgFlowData.sourceOk,
			},
		},
		fetchedAt: new Date().toISOString(),
	};

	try {
		applyMarketProvenance(compassData);
		compassData.engineOutput = computeCompass(compassData);
		compassData.snapshotId = compassData.fetchedAt;
	} catch (e) {
		console.error("[Investment] Failed to compute compass engine:", e);
	}

	const today = jakartaDate(compassData.fetchedAt);
	try {
		const priorKeys = Array.from({ length: 6 }, (_, i) =>
			CACHE_KEYS.COMPASS_SNAPSHOT(
				jakartaDate(Date.parse(compassData.fetchedAt) - (i + 1) * 86_400_000),
			),
		);
		const previous = (
			await redis.mget<InvestmentCompassData[]>(...priorKeys)
		).find(
			(item) =>
				item?.engineOutput?.modelVersion === MODEL_VERSION &&
				item?.fetchedAt &&
				jakartaDate(item.fetchedAt) < today &&
				item.engineOutput?.permissions.ihsg.mandate?.state,
		);
		const priorRegime = previous?.engineOutput?.permissions.ihsg.mandate?.state;
		if (previous && priorRegime && previous.engineOutput) {
			compassData.previousSnapshot = {
				asOf: previous.fetchedAt,
				regime: priorRegime,
				score: previous.engineOutput.regimes.ihsg.score,
			};
		}
	} catch (error) {
		console.warn("[Investment] Prior snapshot unavailable", error);
	}

	return compassData;
}

export const getCachedInvestmentCompass = unstable_cache(
	async () => getInvestmentCompass(false),
	["investment-compass-data-v4"],
	{ revalidate: 60, tags: ["compass-data"] },
);
