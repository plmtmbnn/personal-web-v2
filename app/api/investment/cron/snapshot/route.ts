import { ENV_GLOBAL } from "@/lib/core/env";
import { NextResponse } from "next/server";
import { getInvestmentCompass } from "@/features/investment/actions";
import { syncFred } from "@/features/investment/macro/fred-sync";
import {
	createMacroPostgres,
	postgresFredStore,
} from "@/features/investment/macro/postgres";
import { HOSTED_SERIES } from "@/features/investment/macro/series";
import { redis, CACHE_KEYS } from "@/lib/core/redis";
import { syncIdxStockSummary } from "@/services/market-data/idx-flows";
import { syncIdxResearch } from "@/services/market-data/idx-research-store";
import { jakartaDate } from "@/services/market-data/provenance";

export const maxDuration = 180;

async function refreshHostedMacro() {
	if (process.env.MACRO_RESEARCH_ENABLED !== "1") return { state: "disabled" };
	const key = process.env.FRED_API_KEY;
	if (!key?.trim())
		return { state: "failed", error: "FRED API key is missing" };

	try {
		const signal = AbortSignal.timeout(50_000);
		const store = postgresFredStore(createMacroPostgres(signal));
		const results = await syncFred(store, key, { ids: HOSTED_SERIES, signal });
		const failed = results.filter((row) => !row.synced);
		if (!failed.length) return { state: "synced", results };
		console.warn("[Cron:Snapshot] Macro series failed to sync", failed);
		return {
			state: failed.length === results.length ? "failed" : "partial",
			results,
		};
	} catch {
		console.warn("[Cron:Snapshot] Hosted macro sync could not finish");
		return {
			state: "failed",
			error: "Macro sync could not finish. Check database setup and cron logs.",
		};
	}
}

/**
 * The external cron refreshes the Compass snapshot, IDX research, and hosted macro data.
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

	const macroSync = refreshHostedMacro();
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
			macroSync: await macroSync,
		});
	} catch (error: any) {
		console.error("[Cron:Snapshot] Failed:", error);
		return NextResponse.json(
			{
				error: "Internal Server Error",
				details: error.message,
				macroSync: await macroSync,
			},
			{ status: 500 },
		);
	}
}
