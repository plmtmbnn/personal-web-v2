import { ENV_GLOBAL } from "@/lib/core/env";
import { NextResponse } from "next/server";
import { getInvestmentCompass } from "@/features/investment/actions";
import { redis, CACHE_KEYS } from "@/lib/core/redis";

/**
 * GET /api/investment/cron/snapshot
 * Triggered daily by Vercel Cron to record the state of the Investment Compass.
 * Retains history to allow "What Changed" delta comparisons.
 */
export async function GET(request: Request) {
	// 1. Verify Authorization
	const authHeader = request.headers.get("authorization");
	const { searchParams } = new URL(request.url);
	const secret =
		searchParams.get("secret") || authHeader?.replace("Bearer ", "");

	if (
		process.env.NODE_ENV === "production" &&
		(!ENV_GLOBAL.CRON_SECRET || secret !== ENV_GLOBAL.CRON_SECRET)
	) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		// 2. Fetch fresh compass data
		const data = await getInvestmentCompass(true);

		// 3. Generate today's date key (e.g. '2023-10-25')
		const today = new Date().toISOString().split("T")[0];
		const cacheKey = CACHE_KEYS.COMPASS_SNAPSHOT(today);

		// 4. Save to Redis (7 day TTL, we only need a rolling window for weekly deltas)
		const sevenDaysInSeconds = 7 * 24 * 60 * 60;
		await redis.set(cacheKey, JSON.stringify(data), { ex: sevenDaysInSeconds });

		return NextResponse.json({
			success: true,
			message: `Snapshot recorded for ${today}`,
			regime: data.sentiment.traditional?.fear_and_greed?.rating,
		});
	} catch (error: any) {
		console.error("[Cron:Snapshot] Failed:", error);
		return NextResponse.json(
			{ error: "Internal Server Error", details: error.message },
			{ status: 500 },
		);
	}
}
