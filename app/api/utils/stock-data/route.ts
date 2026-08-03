import { z } from "zod";
import { type NextRequest, NextResponse } from "next/server";

// Schema for validating query parameters (optional: add filtering parameters)
const stockDataQuerySchema = z
	.object({
		limit: z.coerce.number().optional().default(100),
		offset: z.coerce.number().optional().default(0),
	})
	.partial();
import { getStockData, saveStockData, redis } from "@/lib/core/redis";
import { gotScraping } from "got-scraping";

export const dynamic = "force-dynamic";

const FETCH_ATTEMPT_KEY = "idx:last-fetch-attempt";

export async function GET(request: NextRequest) {
	try {
		// Validate query parameters
		const url = new URL(request.url);
		const queryParams = {
			limit: url.searchParams.get("limit"),
			offset: url.searchParams.get("offset"),
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

		// 2. Get cached data from Redis
		let data = await getStockData();

		// 3. Determine if external API call to IDX is needed
		const shouldFetch = forceRefresh || !data || data.length === 0;

		// 4. Perform fetch from IDX only if Redis is empty or forceRefresh is true
		if (shouldFetch) {
			try {
				console.log("Redis cache empty or force refresh requested. Fetching stock data from IDX...");

				const response = await gotScraping({
					url: "https://www.idx.co.id/primary/TradingSummary/GetStockSummary",
					headers: {
						Referer: "https://www.idx.co.id/",
						"User-Agent":
							"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
						Accept: "application/json, text/plain, */*",
					},
					timeout: { request: 10000 },
					responseType: "json",
				});

				if (response.statusCode >= 200 && response.statusCode < 300) {
					const body = response.body as any;
					if (body && Array.isArray(body.data) && body.data.length > 0) {
						// Store to Redis (12h TTL)
						await saveStockData(body.data, 43200);
						data = body.data;
						console.log(
							`Successfully fetched and cached ${body.data.length} stocks from IDX to Redis (12h TTL).`,
						);
					}
				}

				// Set cooldown key to avoid spamming IDX (expires in 1 hour)
				await redis.set(FETCH_ATTEMPT_KEY, "true", { ex: 3600 });
			} catch (fetchError) {
				console.error(
					"Failed to fetch fresh stock data from IDX, falling back to cache:",
					fetchError,
				);
				// If we have cached data, we can still serve it. If not, we throw.
				if (!data) {
					throw fetchError;
				}
				// Set short cooldown on failure (15 minutes) so we don't spam on errors
				await redis.set(FETCH_ATTEMPT_KEY, "failed", { ex: 900 });
			}
		}

	if (!data || data.length === 0) {
		return NextResponse.json(
			{ error: "No stock data available and failed to fetch from IDX." },
			{ status: 404 },
		);
	}

	// Apply pagination if requested
	const { limit, offset } = parsedQuery.data;
	const paginatedData = limit ? data.slice(offset || 0, (offset || 0) + limit) : data;

	return NextResponse.json({ 
		data: paginatedData,
		total: data.length,
		limit,
		offset 
	});
	} catch (error: any) {
		console.error("Stock Data Retrieval Error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error", details: error.message },
			{ status: 500 },
		);
	}
}

