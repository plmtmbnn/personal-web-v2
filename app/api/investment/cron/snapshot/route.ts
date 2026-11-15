import { ENV_GLOBAL } from "@/lib/core/env";
import { NextResponse } from "next/server";
import { getInvestmentCompass } from "@/features/investment/actions";
import { redis, CACHE_KEYS } from "@/lib/core/redis";
import { syncIdxStockSummary } from "@/services/market-data/idx-flows";
import { syncIdxResearch } from "@/services/market-data/idx-research-store";
import { jakartaDate } from "@/services/market-data/provenance";

export const maxDuration = 180;

/**
 * GET /api/investment/cron/snapshot
 * Triggered daily by external cron / Vercel Cron to record the state of the Investment Compass.
 * Retains history for delta comparisons and updates daily IDX stock summary + 10d ring buffer.
 */
export async function GET(request: Request) {
	// 1. Verify Authorization
	const authHeader = request.headers.get("authorization");
	const { searchParams } = new URL(request.url);
	const secret =
		searchParams.get("secret") || authHeader?.replace("Bearer ", "");

	if (!ENV_GLOBAL.CRON_SECRET || secret !== ENV_GLOBAL.CRON_SECRET) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		// 2. Refresh IDX stock summary & 10-day ring buffer from peoel-screener-py
		const stockSync = await syncIdxStockSummary(true);

		// 3. Fetch fresh compass data
		const data = await getInvestmentCompass(true, true);

		// 4. Generate today's date key (e.g. '2023-10-25')
		const today = jakartaDate(data.fetchedAt ?? Date.now());
		const cacheKey = CACHE_KEYS.COMPASS_SNAPSHOT(today);

		// 5. Save to Redis (7 day TTL, rolling window for weekly deltas)
		const sevenDaysInSeconds = 7 * 24 * 60 * 60;
		await redis.set(cacheKey, JSON.stringify(data), { ex: sevenDaysInSeconds });
		const research = stockSync.success
			? await syncIdxResearch()
			: { state: "waiting", reason: "IDX summary sync failed." };

		return NextResponse.json({
			success: true,
			message: `Snapshot recorded for ${today}`,
			regime: data.sentiment.traditional?.fear_and_greed?.rating,
			stockSync,
			research,
		});
	} catch (error: any) {
		console.error("[Cron:Snapshot] Failed:", error);
		return NextResponse.json(
			{ error: "Internal Server Error", details: error.message },
			{ status: 500 },
		);
	}
}
