import { NextResponse } from "next/server";
import { redis } from "@/lib/core/redis";
import { getStravaData } from "@/services/strava/service";

/**
 * API Route to trigger live sync of Strava running activities and statistics.
 * Invalidates cached Redis keys and re-fetches fresh data from Strava API.
 */
export async function POST() {
	try {
		// Invalidate existing Redis cache to force live fetch
		try {
			await Promise.all([
				redis.del("strava:activities"),
				redis.del("strava:stats"),
			]);
		} catch (cacheErr) {
			console.warn("[Strava Sync] Redis cache clearing warning:", cacheErr);
		}

		// Fetch live Strava data
		const freshData = await getStravaData();

		if (!freshData.isConfigured) {
			return NextResponse.json(
				{ error: "Strava integration is not configured." },
				{ status: 400 },
			);
		}

		if (!freshData.hasToken) {
			return NextResponse.json(
				{
					error:
						"Strava account is not connected. Please authorize your account first.",
				},
				{ status: 401 },
			);
		}

		if (freshData.runs === null) {
			return NextResponse.json(
				{
					error:
						"Unable to retrieve activities from Strava API. Token may be expired or rate-limited. Please reconnect your account.",
				},
				{ status: 502 },
			);
		}

		return NextResponse.json({
			success: true,
			message: "Strava activities live synced successfully.",
			data: freshData,
		});
	} catch (error: any) {
		console.error("[Strava Sync API Error]:", error);
		return NextResponse.json(
			{ error: error?.message || "Failed to sync Strava activities." },
			{ status: 500 },
		);
	}
}
