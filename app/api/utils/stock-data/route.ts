import { NextResponse } from "next/server";
import { getStockData, saveStockData, redis } from "@/lib/core/redis";
import { gotScraping } from "got-scraping";

export const dynamic = "force-dynamic";

const FETCH_ATTEMPT_KEY = "idx:last-fetch-attempt";

export async function GET() {
	try {
		// 1. Get cached data from Redis
		let data = await getStockData();

		// 2. Determine if we need to fetch fresh data from IDX
		let shouldFetch = false;

		if (!data || data.length === 0) {
			shouldFetch = true;
		} else {
			// Extract date from the first item (e.g., "2026-07-08T00:00:00" -> "2026-07-08")
			const cachedDateStr = data[0]?.Date?.substring(0, 10);
			const todayStr = new Date().toLocaleDateString("sv-SE", {
				timeZone: "Asia/Jakarta",
			});

			if (cachedDateStr && cachedDateStr < todayStr) {
				// Cache is older than today. Check if we've already tried fetching recently.
				const lastAttempt = await redis.get(FETCH_ATTEMPT_KEY);
				if (!lastAttempt) {
					shouldFetch = true;
				}
			}
		}

		// 3. Perform fetch from IDX if needed
		if (shouldFetch) {
			try {
				console.log("Fetching fresh stock data from IDX using got-scraping...");

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
						// Store to Redis
						await saveStockData(body.data);
						data = body.data;
						console.log(
							`Successfully fetched and cached ${body.data.length} stocks from IDX.`,
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

		return NextResponse.json({ data });
	} catch (error: any) {
		console.error("Stock Data Retrieval Error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error", details: error.message },
			{ status: 500 },
		);
	}
}

