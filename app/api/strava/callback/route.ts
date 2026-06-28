import { NextResponse } from "next/server";
import { redis } from "@/lib/core/redis";
import { ENV_GLOBAL } from "@/lib/core/env";
import type { StravaTokenData } from "@/services/strava/service";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const code = searchParams.get("code");
	const error = searchParams.get("error");
	const scope = searchParams.get("scope");

	const siteUrl = ENV_GLOBAL.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

	if (error) {
		console.error("Strava OAuth error callback:", error);
		return NextResponse.redirect(
			new URL(`/adventures/running?error=${encodeURIComponent(error)}`, siteUrl),
		);
	}

	if (!code) {
		return NextResponse.redirect(
			new URL("/adventures/running?error=no_code", siteUrl),
		);
	}

	// Verify scope
	const hasRequiredScope =
		scope && (scope.includes("activity:read_all") || scope.includes("activity:read"));
	if (!hasRequiredScope) {
		console.warn("Strava OAuth scope warning: missing activity:read_all / activity:read in:", scope);
	}

	if (!ENV_GLOBAL.STRAVA_CLIENT_ID || !ENV_GLOBAL.STRAVA_CLIENT_SECRET) {
		console.error("Missing Strava credentials in environment.");
		return NextResponse.redirect(
			new URL("/adventures/running?error=missing_credentials", siteUrl),
		);
	}

	try {
		console.log("Exchanging Strava authorization code for tokens...");
		const response = await fetch("https://www.strava.com/oauth/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				client_id: ENV_GLOBAL.STRAVA_CLIENT_ID,
				client_secret: ENV_GLOBAL.STRAVA_CLIENT_SECRET,
				code,
				grant_type: "authorization_code",
			}),
		});

		if (!response.ok) {
			const errText = await response.text();
			throw new Error(`Failed to exchange code: ${response.status} - ${errText}`);
		}

		const data = await response.json();

		const tokenData: StravaTokenData = {
			access_token: String(data.access_token || ""),
			refresh_token: String(data.refresh_token || ""),
			expires_at: Number(data.expires_at || 0),
			athlete_id: data.athlete?.id ? Number(data.athlete.id) : undefined,
		};

		// Store in Redis
		await redis.set("strava:token_data", JSON.stringify(tokenData), { ex: 3600 });

		// Invalidate cached data to pull immediately
		await redis.del("strava:activities");
		await redis.del("strava:stats");

		console.log("Strava token exchange successfully stored in Redis.");
		return NextResponse.redirect(
			new URL("/adventures/running?success=true", siteUrl),
		);
	} catch (err: any) {
		console.error("Strava OAuth token exchange exception:", err);
		return NextResponse.redirect(
			new URL(
				`/adventures/running?error=${encodeURIComponent(err.message || "token_exchange_failed")}`,
				siteUrl,
			),
		);
	}
}
