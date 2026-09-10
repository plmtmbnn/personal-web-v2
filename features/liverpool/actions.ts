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

const DEFAULT_TTL_SECONDS = 86400; // 1 day fallback if no upcoming events

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
				if (Array.isArray(parsed?.upcoming)) {
					return parsed;
				}
			}
		} catch (cacheError) {
			console.warn("[Liverpool] Redis cache read failed:", cacheError);
		}
	}

	// 2. Fetch from TheSportsDB free API
	const url =
		"https://www.thesportsdb.com/api/v1/json/123/eventsnext.php?id=133602";

	try {
		const response = await fetch(url, {
			next: { revalidate: 3600 }, // Cache for 1 hour via Next.js ISR
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

		if (!data || !Array.isArray(data.events)) {
			// When there are no upcoming events scheduled, TheSportsDB returns { events: null }
			const emptyResult: GetFixturesResult = {
				upcoming: [],
				lastUpdated: new Date().toISOString(),
			};

			try {
				await redis.set(cacheKey, JSON.stringify(emptyResult), {
					ex: DEFAULT_TTL_SECONDS,
				});
			} catch (cacheErr) {
				console.warn("[Liverpool] Redis cache write failed:", cacheErr);
			}

			return emptyResult;
		}

		const upcoming = data.events
			.filter((event) => Boolean(event?.idEvent))
			.map(normalizeTheSportsDbFixture)
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

		const result: GetFixturesResult = {
			upcoming,
			lastUpdated: new Date().toISOString(),
		};

		// 3. Calculate TTL = strTimestamp + 1 day of the imminent next match
		const nextEvent =
			data.events.find((e) => String(e?.idEvent) === upcoming[0]?.id) ||
			data.events[0];
		const ttlSeconds = calculateFixtureTtlSeconds(
			upcoming[0]?.date,
			nextEvent?.strTimestamp,
		);

		// 4. Save response to Redis with calculated TTL
		try {
			await redis.set(cacheKey, JSON.stringify(result), { ex: ttlSeconds });
		} catch (cacheErr) {
			console.warn("[Liverpool] Redis cache write failed:", cacheErr);
		}

		return result;
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
