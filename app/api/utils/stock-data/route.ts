import { z } from "zod";
import { type NextRequest, NextResponse } from "next/server";
import { getStockData, saveStockData, redis } from "@/lib/core/redis";
import { gotScraping } from "got-scraping";
import { FALLBACK_IDX_STOCKS } from "@/features/utils/stock-tools/stock-explorer/data/fallbackData";

export const dynamic = "force-dynamic";

const FETCH_ATTEMPT_KEY = "idx:last-fetch-attempt";

// Schema for validating query parameters
const stockDataQuerySchema = z
	.object({
		limit: z.coerce.number().optional(),
		offset: z.coerce.number().optional().default(0),
	})
	.partial();

export async function GET(request: NextRequest) {
	try {
		// Validate query parameters
		const url = new URL(request.url);
		const queryParams = {
			limit: url.searchParams.get("limit") || undefined,
			offset: url.searchParams.get("offset") || undefined,
		};
		const parsedQuery = stockDataQuerySchema.safeParse(queryParams);

		if (!parsedQuery.success) {
			return NextResponse.json(
				{ error: "Invalid query parameters", details: parsedQuery.error.format() },
				{ status: 400 },
			);
		}

		// 1. Check query for force refresh
		const forceRefresh = url.searchParams.get("refresh") === "true";

		// 2. Prioritize retrieving data from Redis (checks main cache key then backup key)
		let data = await getStockData();
		let source = data && data.length > 0 ? "redis" : "none";

		// 3. Determine if external API call to IDX is needed
		const shouldFetch = forceRefresh || !data || data.length === 0;

		// 4. Perform fetch from IDX only if Redis is empty or forceRefresh is true
		if (shouldFetch) {
			try {
				console.log(
					"Redis cache empty or force refresh requested. Attempting fetch from IDX...",
				);

				const response = await gotScraping({
					url: "https://www.idx.co.id/primary/TradingSummary/GetStockSummary",
					headers: {
						Referer: "https://www.idx.co.id/",
						"User-Agent":
							"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
						Accept: "application/json, text/plain, */*",
					},
					timeout: { request: 8000 },
					responseType: "json",
				});

				if (response.statusCode >= 200 && response.statusCode < 300) {
					const body = response.body as any;
					if (body && Array.isArray(body.data) && body.data.length > 0) {
						// Store to Redis (12h TTL + backup key)
						await saveStockData(body.data, 43200);
						data = body.data;
						source = "idx_live";
						console.log(
							`Successfully fetched and cached ${body.data.length} stocks from IDX to Redis.`,
						);
					}
				}

				// Set cooldown key to avoid spamming IDX
				await redis.set(FETCH_ATTEMPT_KEY, "true", { ex: 3600 }).catch(() => {});
			} catch (fetchError: any) {
				console.warn(
					"Failed to fetch fresh stock data from IDX (likely cloud datacenter/IP block):",
					fetchError?.message || fetchError,
				);
				await redis.set(FETCH_ATTEMPT_KEY, "failed", { ex: 900 }).catch(() => {});

				// If we don't have cached Redis data, fall back to resilient static dataset
				if (!data || data.length === 0) {
					data = FALLBACK_IDX_STOCKS;
					source = "fallback_static";
				}
			}
		}

		if (!data || data.length === 0) {
			data = FALLBACK_IDX_STOCKS;
			source = "fallback_static";
		}

		// Apply pagination if requested explicitly
		const { limit, offset } = parsedQuery.data;
		const offsetNum = offset || 0;
		const paginatedData = limit
			? data.slice(offsetNum, offsetNum + limit)
			: data;

		return NextResponse.json({
			data: paginatedData,
			total: data.length,
			limit: limit || data.length,
			offset: offsetNum,
			source,
			metadata: {
				lastFetchAt: new Date().toISOString(),
				cached: source.startsWith("redis") || source.startsWith("fallback"),
			},
		});
	} catch (error: any) {
		console.error("Stock Data Retrieval Error:", error);
		// Guaranteed resilience fallback: return static market data
		return NextResponse.json({
			data: FALLBACK_IDX_STOCKS,
			total: FALLBACK_IDX_STOCKS.length,
			source: "fallback_error",
			metadata: {
				lastFetchAt: new Date().toISOString(),
				cached: true,
			},
		});
	}
}
