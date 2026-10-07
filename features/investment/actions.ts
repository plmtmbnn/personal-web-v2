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
import { getOrFetchHistory } from "@/services/market-data/history";
import { fetchStablecoinSupply30d } from "@/services/market-data/defillama";
import { fetchOkxCryptoMetrics } from "@/services/market-data/okx";
import { computeCompass } from "./lib/engine";
import type {
	MarketQuote,
	MacroSeries,
	PriceHistorySeries,
	CryptoFlowsSnapshot,
} from "@/services/market-data/types";

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

		if (quotesRecord.JKSE && !quotesRecord.IHSG) {
			quotesRecord.IHSG = quotesRecord.JKSE;
		}
		if (quotesRecord.IHSG && !quotesRecord.JKSE) {
			quotesRecord.JKSE = quotesRecord.IHSG;
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
			if (backup.JKSE && !backup.IHSG) backup.IHSG = backup.JKSE;
			if (backup.IHSG && !backup.JKSE) backup.JKSE = backup.IHSG;
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
		const seriesConfigs: Array<{ id: string; units?: string }> = [
			{ id: "FEDFUNDS" },
			{ id: "CPIAUCSL", units: "pc1" },
			{ id: "UNRATE" },
			{ id: "DGS10" },
			{ id: "T10Y2Y" },
			{ id: "BAMLH0A0HYM2" },
		];
		const macroData: Record<string, MacroSeries> = {};

		const promises = seriesConfigs.map(async (config) => {
			const series = await fetchFredSeries(
				config.id,
				{
					revalidate: 3600, // 1 hour
					fresh: forceRefresh,
				},
				config.units ? { units: config.units } : undefined,
			);
			if (series) {
				macroData[config.id] = series;
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
 * Retrieves core historical series for technicals and moving averages.
 */
async function getHistoryData(forceRefresh: boolean): Promise<{
	history: Record<string, PriceHistorySeries | null>;
	sourceOk: boolean;
}> {
	const symbols = [
		{ symbol: "^JKSE", range: "2y", interval: "1d" },
		{ symbol: "IDR=X", range: "2y", interval: "1d" },
		{ symbol: "BTC-USD", range: "2y", interval: "1d" },
	];
	const history: Record<string, PriceHistorySeries | null> = {};
	let allOk = true;

	const promises = symbols.map(async (item) => {
		const res = await getOrFetchHistory(
			item.symbol,
			{ range: item.range, interval: item.interval },
			forceRefresh,
		);
		if (!res.sourceOk) allOk = false;
		return { symbol: item.symbol, series: res.series };
	});

	const results = await Promise.allSettled(promises);
	for (const r of results) {
		if (r.status === "fulfilled") {
			history[r.value.symbol] = r.value.series;
			if (r.value.symbol === "^JKSE") {
				history.JKSE = r.value.series;
				history.IHSG = r.value.series;
			}
		}
	}
	return { history, sourceOk: allOk && Object.keys(history).length > 0 };
}

/**
 * Retrieves crypto liquidity metrics (stablecoin issuance, futures funding/OI).
 */
async function getCryptoFlowsData(forceRefresh: boolean): Promise<{
	data: CryptoFlowsSnapshot | null;
	sourceOk: boolean;
}> {
	const cacheKey = CACHE_KEYS.CRYPTO_FLOWS;
	const backupKey = CACHE_KEYS.CRYPTO_FLOWS_BACKUP;

	if (!forceRefresh) {
		try {
			const cached = await redis.get<CryptoFlowsSnapshot>(cacheKey);
			if (cached) return { data: cached, sourceOk: true };
		} catch (e) {
			console.warn("[Investment] Crypto flows cache read failed:", e);
		}
	}

	try {
		const [stableRes, okxRes] = await Promise.allSettled([
			fetchStablecoinSupply30d({ revalidate: 21600, fresh: forceRefresh }),
			fetchOkxCryptoMetrics({ revalidate: 900, fresh: forceRefresh }),
		]);

		const stableData =
			stableRes.status === "fulfilled" ? stableRes.value : null;
		const okxData = okxRes.status === "fulfilled" ? okxRes.value : null;

		if (stableData || okxData) {
			const snapshot: CryptoFlowsSnapshot = {
				totalStablecoinSupplyUsd: stableData?.totalUsd ?? null,
				stablecoin30dChangePct: stableData?.change30dPct ?? null,
				btcFundingRate8hPct: okxData?.fundingRate8hPct ?? null,
				btcOpenInterestUsd: okxData?.openInterestUsd ?? null,
				updatedAt: Math.floor(Date.now() / 1000),
			};

			await redis.set(cacheKey, JSON.stringify(snapshot), { ex: 900 }); // 15 min TTL
			await redis.set(backupKey, JSON.stringify(snapshot));
			return { data: snapshot, sourceOk: true };
		}
	} catch (e) {
		console.warn("[Investment] Live crypto flows fetch failed:", e);
	}

	try {
		const backup = await redis.get<CryptoFlowsSnapshot>(backupKey);
		if (backup) return { data: backup, sourceOk: false };
	} catch (e) {
		console.warn("[Investment] Crypto flows backup read failed:", e);
	}

	return { data: null, sourceOk: false };
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
		historyResult,
		cryptoFlowsResult,
	] = await Promise.allSettled([
		getFearAndGreedData(),
		getCryptoFearAndGreedData(),
		getMarketQuotes(forceRefresh),
		getCryptoGlobalData(forceRefresh),
		getMacroData(forceRefresh),
		getHistoryData(forceRefresh),
		getCryptoFlowsData(forceRefresh),
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
	const historyData =
		historyResult.status === "fulfilled"
			? historyResult.value
			: { history: {}, sourceOk: false };
	const flowsData =
		cryptoFlowsResult.status === "fulfilled"
			? cryptoFlowsResult.value
			: { data: null, sourceOk: false };

	const compassData: InvestmentCompassData = {
		sentiment: { traditional, crypto },
		markets: {
			quotes: quotesData.quotes,
			cryptoGlobal: cgData.data,
			macro: macroData.data,
			history: historyData.history,
			cryptoFlows: flowsData.data,
		},
		sources: {
			cnn: {
				ok: !!traditional,
				label: "CNN Fear & Greed",
				stale: !traditional,
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
		},
		fetchedAt: new Date().toISOString(),
	};

	try {
		compassData.engineOutput = computeCompass(compassData);
	} catch (e) {
		console.error("[Investment] Failed to compute compass engine:", e);
	}

	return compassData;
}
