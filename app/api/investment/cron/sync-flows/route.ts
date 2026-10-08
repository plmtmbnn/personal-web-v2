import { NextResponse } from "next/server";
import { fetchIhsgForeignFlow } from "@/services/market-data/idx-flows";
import { ENV_GLOBAL } from "@/lib/core/env";

export const dynamic = "force-dynamic";

/**
 * API Route for forcing an end-of-day IHSG Net Foreign Flow sync.
 * Designed to be triggered by Vercel Cron at 16:30 Jakarta Time (09:30 UTC).
 * Secured via CRON_SECRET header or query param.
 */
export async function GET(request: Request) {
	const authHeader = request.headers.get("Authorization");
	const { searchParams } = new URL(request.url);
	const secret =
		searchParams.get("secret") || authHeader?.replace("Bearer ", "");

	const CRON_SECRET = process.env.CRON_SECRET || ENV_GLOBAL.CRON_SECRET;

	// Security check: Fail shut if CRON_SECRET is not configured or secret is invalid
	if (!CRON_SECRET || secret !== CRON_SECRET) {
		console.warn("[API Cron Sync] Unauthorized attempt blocked.");
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		console.log(
			"[API Cron Sync] Initiating end-of-day IHSG flow synchronization...",
		);
		// Use fresh: true to ensure we bypass any intermediate data caching layer
		// and directly fetch/scrape the closing data from IDX.
		const flowSnapshot = await fetchIhsgForeignFlow({
			revalidate: 0,
			fresh: true,
		});

		if (!flowSnapshot) {
			console.warn(
				"[API Cron Sync] Synchronization failed: Unable to fetch flows.",
			);
			return NextResponse.json(
				{ error: "Fetch failed or returned null" },
				{ status: 502 },
			);
		}

		console.log(
			"[API Cron Sync] Successfully synchronized flows:",
			flowSnapshot,
		);

		return NextResponse.json({
			success: true,
			message: "IHSG Foreign Flows synchronized.",
			data: flowSnapshot,
		});
	} catch (error: any) {
		console.error("[API Cron Sync] Failure:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
