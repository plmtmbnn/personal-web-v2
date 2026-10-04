import { BROWSER_USER_AGENT, buildFetchInit } from "./http";
import type { FetchPolicy, PriceHistorySeries, PricePoint } from "./types";
import { redis, CACHE_KEYS } from "@/lib/core/redis";

interface YahooChartPayload {
	chart?: {
		result?: Array<{
			timestamp?: number[];
			indicators?: {
				quote?: Array<{
					close?: Array<number | null>;
				}>;
			};
		}>;
	};
}

/**
 * Fetch raw price history directly from Yahoo Finance chart API.
 */
export async function fetchYahooHistory(
	symbol: string,
	options: { range: string; interval: string },
	policy: FetchPolicy,
): Promise<PriceHistorySeries | null> {
	const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
		symbol,
	)}?range=${encodeURIComponent(options.range)}&interval=${encodeURIComponent(options.interval)}`;

	try {
		const res = await fetch(
			url,
			buildFetchInit(policy, {
				"User-Agent": BROWSER_USER_AGENT,
				Accept: "application/json",
			}),
		);

		if (!res.ok) {
			console.warn(`[History] Yahoo API error for ${symbol}: ${res.status}`);
			return null;
		}

		const data = (await res.json()) as YahooChartPayload;
		const result = data?.chart?.result?.[0];
		if (!result?.timestamp || !result.indicators?.quote?.[0]?.close) {
			return null;
		}

		const timestamps = result.timestamp;
		const closes = result.indicators.quote[0].close;

		const points: PricePoint[] = [];
		for (let i = 0; i < timestamps.length; i++) {
			const t = timestamps[i];
			const c = closes[i];
			if (typeof c === "number" && Number.isFinite(c)) {
				points.push({ t, c });
			}
		}

		points.sort((a, b) => a.t - b.t);

		return {
			symbol,
			interval: options.interval,
			points,
		};
	} catch (e) {
		console.warn(`[History] Fetch failed for ${symbol}:`, e);
		return null;
	}
}

/**
 * Cached price history loader with Upstash Redis (6h TTL + perpetual backup).
 */
export async function getOrFetchHistory(
	symbol: string,
	options: { range: string; interval: string },
	forceRefresh = false,
): Promise<{ series: PriceHistorySeries | null; sourceOk: boolean }> {
	const cacheKey = CACHE_KEYS.MARKET_HISTORY(symbol, options.interval);
	const backupKey = CACHE_KEYS.MARKET_HISTORY_BACKUP(symbol, options.interval);

	if (!forceRefresh) {
		try {
			const cached = await redis.get<PriceHistorySeries>(cacheKey);
			if (cached?.points && cached.points.length > 0) {
				return { series: cached, sourceOk: true };
			}
		} catch (e) {
			console.warn(`[History] Cache read error for ${symbol}:`, e);
		}
	}

	try {
		const live = await fetchYahooHistory(symbol, options, {
			revalidate: 21600, // 6 hours
			fresh: forceRefresh,
		});

		if (live && live.points.length > 0) {
			await redis.set(cacheKey, JSON.stringify(live), { ex: 21600 });
			await redis.set(backupKey, JSON.stringify(live));
			return { series: live, sourceOk: true };
		}
	} catch (e) {
		console.warn(`[History] Live fetch error for ${symbol}:`, e);
	}

	try {
		const backup = await redis.get<PriceHistorySeries>(backupKey);
		if (backup?.points && backup.points.length > 0) {
			return { series: backup, sourceOk: false };
		}
	} catch (e) {
		console.warn(`[History] Backup read error for ${symbol}:`, e);
	}

	return { series: null, sourceOk: false };
}
