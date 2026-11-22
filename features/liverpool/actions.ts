"use server";

import { redis, CACHE_KEYS } from "@/lib/core/redis";
import type { LfcFixture, TheSportsDbResponse } from "./types";
import {
	normalizeTheSportsDbFixture,
	calculateFixtureTtlSeconds,
} from "./utils";

export interface GetFixturesResult {
	upcoming: LfcFixture[];
	lastUpdated: string;
	error?: string;
}

/**
 * Fetch Liverpool FC fixtures directly from TheSportsDB with Next.js ISR caching.
 * Bypasses Redis to preserve static site generation (SSG/ISR).
 */
export async function getLiverpoolFixturesStatic(
	forceRefresh = false,
): Promise<GetFixturesResult> {
	const url =
		"https://www.thesportsdb.com/api/v1/json/123/eventsnext.php?id=133602";

	try {
		const response = await fetch(url, {
			...(forceRefresh
				? { cache: "no-store" as const }
				: { next: { revalidate: 3600 } }),
			headers: {
				Accept: "application/json",
			},
		});

		if (!response.ok) {
			console.error(
				`TheSportsDB API error: ${response.status} - ${response.statusText}`,
			);
			return {
				upcoming: [],
				lastUpdated: new Date().toISOString(),
				error: `API error: ${response.statusText || response.status}`,
			};
		}

		const data = (await response.json()) as TheSportsDbResponse;

		if (data?.events === null) {
			return {
				upcoming: [],
				lastUpdated: new Date().toISOString(),
			};
		}
		if (!data || !Array.isArray(data.events)) {
			return {
				upcoming: [],
				lastUpdated: new Date().toISOString(),
				error: "Invalid fixture response",
			};
		}

		const upcoming = data.events
			.filter((event) => Boolean(event?.idEvent))
			.map(normalizeTheSportsDbFixture)
			.sort(
				(a, b) =>
					(Date.parse(a.date) || Infinity) - (Date.parse(b.date) || Infinity),
			);

		return {
			upcoming,
			lastUpdated: new Date().toISOString(),
		};
	} catch (error) {
		console.error("Liverpool FC fixtures fetch failed:", error);
		return {
			upcoming: [],
			lastUpdated: new Date().toISOString(),
			error:
				error instanceof Error ? error.message : "Failed to fetch fixtures",
		};
	}
}

/**
 * Fetch Liverpool FC upcoming fixtures with Redis caching.
 * The cache expires at strTimestamp + 1 day of the imminent next match.
 * Team ID: 133602 (Liverpool FC)
 */
export async function getLiverpoolFixtures(
	forceRefresh = false,
): Promise<GetFixturesResult> {
	const cacheKey = CACHE_KEYS.LFC_FIXTURES;

	// 1. Check Redis cache first if not forced refresh
	if (!forceRefresh) {
		try {
			const cached = await redis.get<GetFixturesResult | string>(cacheKey);
			if (cached) {
				const parsed =
					typeof cached === "string"
						? (JSON.parse(cached) as GetFixturesResult)
						: cached;
				if (
					Array.isArray(parsed?.upcoming) &&
					parsed.upcoming.length > 0 &&
					!parsed.error
				) {
					return parsed;
				}
			}
		} catch (cacheError) {
			console.warn("[Liverpool] Redis cache read failed:", cacheError);
		}
	}

	// 2. Fetch fresh data from TheSportsDB with ISR
	const result = await getLiverpoolFixturesStatic(forceRefresh);
	if (result.error || result.upcoming.length === 0) {
		if (forceRefresh && !result.error) {
			try {
				await redis.del(cacheKey);
			} catch (cacheErr) {
				console.warn("[Liverpool] Redis cache clear failed:", cacheErr);
			}
		}
		return result;
	}

	// 3. Save response to Redis with calculated dynamic TTL
	try {
		const ttlSeconds = calculateFixtureTtlSeconds(result.upcoming[0]?.date);
		await redis.set(cacheKey, JSON.stringify(result), { ex: ttlSeconds });
	} catch (cacheErr) {
		console.warn("[Liverpool] Redis cache write failed:", cacheErr);
	}

	return result;
}
