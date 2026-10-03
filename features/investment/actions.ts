"use server";

import { redis, CACHE_KEYS } from "@/lib/core/redis";
import type {
	FearAndGreedData,
	CryptoFearAndGreedResponse,
	InvestmentCompassData,
} from "./types";
import { INSTRUMENTS } from "./data/instruments";
import {
	fetchCnbcQuotes,
	fetchYahooQuote,
	fetchCryptoGlobal,
} from "@/services/market-data";
import { fetchFredSeries } from "@/services/market-data/fred";
import type { MarketQuote, MacroSeries } from "@/services/market-data/types";

/**
 * Fetch Fear and Greed Index data from CNN
 * Implements robust error handling with fallback mechanisms
 */
export async function getFearAndGreedData(): Promise<FearAndGreedData | null> {
	// Request historical time series starting 30 days ago so Trend Velocity and factor cards have full trend data
	const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
		.toISOString()
		.split("T")[0];
	const url = `https://production.dataviz.cnn.io/index/fearandgreed/graphdata/${startDate}`;

	try {
		const response = await fetch(url, {
			next: { revalidate: 3600 }, // Cache for 1 hour - SSG-like behavior
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
				Accept: "application/json",
			},
		});

		if (!response.ok) {
			console.error(
				`Fear and Greed API error: ${response.status} - ${response.statusText}`,
			);
			return null;
		}

		const data = await response.json();

		// Validate expected structure
		if (!data?.fear_and_greed || !data.fear_and_greed_historical?.data) {
			console.error("Fear and Greed API: Invalid response structure");
			return null;
		}

		return data as FearAndGreedData;
	} catch (error) {
		console.error("Fear and Greed fetch failed:", error);
		return null;
	}
}

/**
 * Fetch Crypto Fear and Greed Index from Alternative.me (Free API, 30 days history)
 */
export async function getCryptoFearAndGreedData(): Promise<CryptoFearAndGreedResponse | null> {
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
): Promise<{ quotes: Record<string, MarketQuote>; sourceOk: boolean }> {
	const cacheKey = CACHE_KEYS.MARKET_QUOTES;
	const backupKey = CACHE_KEYS.MARKET_QUOTES_BACKUP;

	if (!forceRefresh) {
		try {
			const cached = await redis.get<Record<string, MarketQuote>>(cacheKey);
			if (cached && Object.keys(cached).length > 0) {
				return { quotes: cached, sourceOk: true };
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
		const yahooInsts = INSTRUMENTS.filter((i) => !i.cnbc && Boolean(i.yahoo));

		// Fetch CNBC batch
		const cnbcQuotes = await fetchCnbcQuotes(cnbcSymbols, {
			revalidate: 60, // 1 min ISR baseline
			fresh: forceRefresh,
		});

		// Fetch Yahoo missing symbols (e.g., IHSG) in parallel
		const yahooPromises = yahooInsts.map(async (inst) => {
			try {
				const quote = await fetchYahooQuote(inst.yahoo!, {
					revalidate: 60,
					fresh: forceRefresh,
				});
				return { id: inst.id, quote };
			} catch (e) {
				console.warn(`[Investment] Yahoo fallback failed for ${inst.id}`, e);
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
			if (!q && inst.yahoo) {
				q = yahooResults.find((y) => y.id === inst.id)?.quote;
			}
			if (q) {
				quotesRecord[inst.id] = q;
			}
		}

		if (Object.keys(quotesRecord).length > 0) {
			await redis.set(cacheKey, JSON.stringify(quotesRecord), { ex: 300 }); // 5 min TTL
			await redis.set(backupKey, JSON.stringify(quotesRecord)); // Perpetual backup
			return { quotes: quotesRecord, sourceOk: true };
		}
	} catch (e) {
		console.warn("[Investment] Live quotes fetch failed:", e);
	}

	// Fallback to backup
	try {
		const backup = await redis.get<Record<string, MarketQuote>>(backupKey);
		if (backup && Object.keys(backup).length > 0) {
			return { quotes: backup, sourceOk: false }; // false = using stale backup
		}
	} catch (e) {
		console.warn("[Investment] Quotes backup read failed:", e);
	}

	return { quotes: {}, sourceOk: false };
}

/**
 * Retrieves global crypto aggregates (market cap, dominance) from CoinGecko.
 */
async function getCryptoGlobalData(
	forceRefresh: boolean,
): Promise<{ data: any; sourceOk: boolean }> {
	const cacheKey = CACHE_KEYS.CRYPTO_GLOBAL;
	const backupKey = CACHE_KEYS.CRYPTO_GLOBAL_BACKUP;

	if (!forceRefresh) {
		try {
			const cached = await redis.get(cacheKey);
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
			await redis.set(cacheKey, JSON.stringify(globalData), { ex: 900 }); // 15 min TTL
			await redis.set(backupKey, JSON.stringify(globalData));
			return { data: globalData, sourceOk: true };
		}
	} catch (e) {
		console.warn("[Investment] Live Crypto Global fetch failed:", e);
	}

	try {
		const backup = await redis.get(backupKey);
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
): Promise<{ data: Record<string, MacroSeries>; sourceOk: boolean }> {
	const cacheKey = CACHE_KEYS.MACRO_FRED;
	const backupKey = CACHE_KEYS.MACRO_FRED_BACKUP;

	if (!forceRefresh) {
		try {
			const cached = await redis.get<Record<string, MacroSeries>>(cacheKey);
			if (cached && Object.keys(cached).length > 0) {
				return { data: cached, sourceOk: true };
			}
		} catch (e) {
			console.warn("[Investment] Macro cache read failed:", e);
		}
	}

	try {
		// Key US macro series to fetch
		// FEDFUNDS (Fed Funds Rate), CPIAUCSL (CPI YoY), UNRATE (Unemployment)
		// DGS10 (10Y Treasury), T10Y2Y (Yield Curve), BAMLH0A0HYM2 (HY OAS Spread)
		const seriesIds = [
			"FEDFUNDS",
			"CPIAUCSL",
			"UNRATE",
			"DGS10",
			"T10Y2Y",
			"BAMLH0A0HYM2",
		];
		const macroData: Record<string, MacroSeries> = {};

		const promises = seriesIds.map(async (id) => {
			const series = await fetchFredSeries(id, {
				revalidate: 3600, // 1 hour
				fresh: forceRefresh,
			});
			if (series) {
				macroData[id] = series;
			}
		});

		await Promise.allSettled(promises);

		if (Object.keys(macroData).length > 0) {
			await redis.set(cacheKey, JSON.stringify(macroData), { ex: 3600 }); // 1 hour TTL
			await redis.set(backupKey, JSON.stringify(macroData));
			return { data: macroData, sourceOk: true };
		}
	} catch (e) {
		console.warn("[Investment] Live Macro fetch failed:", e);
	}

	try {
		const backup = await redis.get<Record<string, MacroSeries>>(backupKey);
		if (backup && Object.keys(backup).length > 0) {
			return { data: backup, sourceOk: false };
		}
	} catch (e) {
		console.warn("[Investment] Macro backup read failed:", e);
	}

	return { data: {}, sourceOk: false };
}

/**
 * Fetch all market data and sentiment needed for the Investment Compass.
 * Resolves completely even if some services fail.
 */
export async function getInvestmentCompass(
	forceRefresh = false,
): Promise<InvestmentCompassData> {
	const [
		cnnResult,
		cryptoFngResult,
		quotesResult,
		cryptoGlobalResult,
		macroResult,
	] = await Promise.allSettled([
		getFearAndGreedData(),
		getCryptoFearAndGreedData(),
		getMarketQuotes(forceRefresh),
		getCryptoGlobalData(forceRefresh),
		getMacroData(forceRefresh),
	]);

	const traditional = cnnResult.status === "fulfilled" ? cnnResult.value : null;
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

	return {
		sentiment: { traditional, crypto },
		markets: {
			quotes: quotesData.quotes,
			cryptoGlobal: cgData.data,
			macro: macroData.data,
		},
		sources: {
			cnn: { ok: !!traditional, label: "CNN Fear & Greed" },
			cryptoFng: { ok: !!crypto, label: "Alternative.me" },
			quotes: { ok: quotesData.sourceOk, label: "Global Quotes" },
			coingecko: { ok: cgData.sourceOk, label: "CoinGecko" },
			fred: { ok: macroData.sourceOk, label: "FRED Macro" },
		},
		fetchedAt: new Date().toISOString(),
	};
}
