import { NextResponse } from "next/server";
import { getStockData, saveStockData, redis } from "@/lib/core/redis";


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
				console.log("Fetching fresh stock data from IDX...");
				// Bypass Turbopack bundling for got-scraping to avoid __dirname adm-zip issues
				const gotScraping = eval("require('got-scraping')").gotScraping;
				const response = await gotScraping.get(
					"https://www.idx.co.id/primary/TradingSummary/GetStockSummary",
					{
						headers: {
							Referer: "https://www.idx.co.id/",
						},
						timeout: {
							request: 10000, // 10 seconds timeout
						},
					},
				);

				if (response.statusCode === 200) {
					const body = JSON.parse(response.body);
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

