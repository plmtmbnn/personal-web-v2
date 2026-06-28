import { redis } from "@/lib/core/redis";
import { ENV_GLOBAL } from "@/lib/core/env";

export interface StravaTokenData {
	access_token: string;
	refresh_token: string;
	expires_at: number; // Unix timestamp in seconds
	athlete_id?: number;
}

export interface StravaRunActivity {
	id: number;
	name: string;
	distance: number; // meters
	moving_time: number; // seconds
	elapsed_time: number; // seconds
	total_elevation_gain: number; // meters
	start_date_local: string; // ISO string
	average_speed: number; // m/s
	max_speed: number;
	has_heartrate: boolean;
	average_heartrate?: number;
	max_heartrate?: number;
}

export interface StravaStats {
	ytd_run_totals: {
		count: number;
		distance: number; // meters
		moving_time: number; // seconds
		elevation_gain: number; // meters
	};
	all_run_totals: {
		count: number;
		distance: number; // meters
		moving_time: number; // seconds
		elevation_gain: number; // meters
	};
}

async function refreshAccessToken(refreshToken: string): Promise<StravaTokenData> {
	if (!ENV_GLOBAL.STRAVA_CLIENT_ID || !ENV_GLOBAL.STRAVA_CLIENT_SECRET) {
		throw new Error("Missing Strava Client ID or Secret in environment.");
	}

	const response = await fetch("https://www.strava.com/oauth/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			client_id: ENV_GLOBAL.STRAVA_CLIENT_ID,
			client_secret: ENV_GLOBAL.STRAVA_CLIENT_SECRET,
			grant_type: "refresh_token",
			refresh_token: refreshToken,
		}),
	});

	if (!response.ok) {
		const errText = await response.text();
		throw new Error(`Failed to refresh Strava token: ${response.status} - ${errText}`);
	}

	const data = await response.json();
	return {
		access_token: String(data.access_token || ""),
		refresh_token: String(data.refresh_token || refreshToken),
		expires_at: Number(data.expires_at || 0),
		athlete_id: data.athlete?.id ? Number(data.athlete.id) : undefined,
	};
}

export async function getAccessToken(): Promise<string | null> {
	if (!ENV_GLOBAL.STRAVA_CLIENT_ID || !ENV_GLOBAL.STRAVA_CLIENT_SECRET) {
		return null;
	}

	let tokenData: StravaTokenData | null = null;
	try {
		const rawData = await redis.get<any>("strava:token_data");
		if (rawData) {
			tokenData = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
		}
	} catch (err) {
		console.error("Error reading Strava token from Redis:", err);
	}

	// If not in redis, bootstrap using fallback refresh token in env
	if (!tokenData && ENV_GLOBAL.STRAVA_REFRESH_TOKEN) {
		try {
			console.log("Bootstrapping Strava token from fallback env refresh token...");
			const refreshed = await refreshAccessToken(ENV_GLOBAL.STRAVA_REFRESH_TOKEN);
			tokenData = refreshed;
			await redis.set("strava:token_data", JSON.stringify(tokenData), { ex: 3600 });
		} catch (error) {
			console.error("Error bootstrapping Strava token:", error);
			return null;
		}
	}

	if (!tokenData) {
		return null;
	}

	// Check expiration (refresh if expiring in less than 60 seconds)
	const now = Math.floor(Date.now() / 1000);
	if (tokenData.expires_at < now + 60) {
		try {
			console.log("Strava access token expired or expiring soon. Refreshing...");
			const refreshed = await refreshAccessToken(tokenData.refresh_token);
			tokenData = {
				...refreshed,
				athlete_id: tokenData.athlete_id || refreshed.athlete_id,
			};
			await redis.set("strava:token_data", JSON.stringify(tokenData), { ex: 3600 });
		} catch (error) {
			console.error("Error refreshing Strava token. Evicting from Redis:", error);
			try {
				await redis.del("strava:token_data");
			} catch (delErr) {
				console.error("Failed to delete expired token data from Redis:", delErr);
			}
			return null;
		}
	}

	return tokenData.access_token;
}

export async function getRecentRuns(limit = 10): Promise<StravaRunActivity[] | null> {
	const accessToken = await getAccessToken();
	if (!accessToken) return null;

	try {
		const cached = await redis.get<any>("strava:activities");
		if (cached) {
			return typeof cached === "string" ? JSON.parse(cached) : cached;
		}
	} catch (err) {
		console.error("Error retrieving cached activities from Redis:", err);
	}

	try {
		const response = await fetch(
			"https://www.strava.com/api/v3/athlete/activities?per_page=50",
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			},
		);

		if (response.status === 401) {
			console.warn("Strava access token is unauthorized (401). Evicting from Redis...");
			try {
				await redis.del("strava:token_data");
			} catch (delErr) {
				console.error("Failed to delete unauthorized token from Redis:", delErr);
			}
			return null;
		}

		if (!response.ok) {
			throw new Error(`Failed to fetch Strava activities: ${response.status}`);
		}

		const activities = await response.json();
		if (!Array.isArray(activities)) {
			return null;
		}

		const runs: StravaRunActivity[] = activities
			.filter((act: any) => act.type === "Run" || act.sport_type === "Run")
			.slice(0, limit)
			.map((act: any) => ({
				id: Number(act.id),
				name: String(act.name || "Run"),
				distance: Number(act.distance || 0),
				moving_time: Number(act.moving_time || 0),
				elapsed_time: Number(act.elapsed_time || 0),
				total_elevation_gain: Number(act.total_elevation_gain || 0),
				start_date_local: String(act.start_date_local || new Date().toISOString()),
				average_speed: Number(act.average_speed || 0),
				max_speed: Number(act.max_speed || 0),
				has_heartrate: Boolean(act.has_heartrate),
				average_heartrate: act.average_heartrate ? Number(act.average_heartrate) : undefined,
				max_heartrate: act.max_heartrate ? Number(act.max_heartrate) : undefined,
			}));

		try {
			await redis.set("strava:activities", JSON.stringify(runs), { ex: 3600 }); // Cache 1 hour
		} catch (err) {
			console.error("Error writing activities cache to Redis:", err);
		}

		return runs;
	} catch (error) {
		console.error("Error in getRecentRuns:", error);
		return null;
	}
}

export async function getAthleteStats(): Promise<StravaStats | null> {
	const accessToken = await getAccessToken();
	if (!accessToken) return null;

	try {
		const cached = await redis.get<any>("strava:stats");
		if (cached) {
			return typeof cached === "string" ? JSON.parse(cached) : cached;
		}
	} catch (err) {
		console.error("Error retrieving cached stats from Redis:", err);
	}

	try {
		// Get token data to retrieve or fetch athlete_id
		let athleteId: number | undefined;
		const rawTokenData = await redis.get<any>("strava:token_data");
		const tokenData: StravaTokenData | null = rawTokenData
			? typeof rawTokenData === "string"
				? JSON.parse(rawTokenData)
				: rawTokenData
			: null;

		athleteId = tokenData?.athlete_id;

		if (!athleteId) {
			const athleteResponse = await fetch("https://www.strava.com/api/v3/athlete", {
				headers: { Authorization: `Bearer ${accessToken}` },
			});
			if (athleteResponse.status === 401) {
				console.warn("Strava access token is unauthorized (401) during profile check. Evicting from Redis...");
				try {
					await redis.del("strava:token_data");
				} catch (delErr) {
					console.error("Failed to delete unauthorized token from Redis:", delErr);
				}
				return null;
			}
			if (!athleteResponse.ok) {
				throw new Error(`Failed to fetch Strava athlete profile: ${athleteResponse.status}`);
			}
			const athlete = await athleteResponse.json();
			athleteId = Number(athlete.id);

			if (tokenData && athleteId) {
				tokenData.athlete_id = athleteId;
				await redis.set("strava:token_data", JSON.stringify(tokenData), { ex: 3600 });
			}
		}

		if (!athleteId) {
			return null;
		}

		const statsResponse = await fetch(
			`https://www.strava.com/api/v3/athletes/${athleteId}/stats`,
			{
				headers: { Authorization: `Bearer ${accessToken}` },
			},
		);

		if (statsResponse.status === 401) {
			console.warn("Strava access token is unauthorized (401) during stats fetch. Evicting from Redis...");
			try {
				await redis.del("strava:token_data");
			} catch (delErr) {
				console.error("Failed to delete unauthorized token from Redis:", delErr);
			}
			return null;
		}

		if (!statsResponse.ok) {
			throw new Error(`Failed to fetch Strava athlete stats: ${statsResponse.status}`);
		}

		const stats = await statsResponse.json();
		const runningStats: StravaStats = {
			ytd_run_totals: {
				count: Number(stats.ytd_run_totals?.count || 0),
				distance: Number(stats.ytd_run_totals?.distance || 0),
				moving_time: Number(stats.ytd_run_totals?.moving_time || 0),
				elevation_gain: Number(stats.ytd_run_totals?.elevation_gain || 0),
			},
			all_run_totals: {
				count: Number(stats.all_run_totals?.count || 0),
				distance: Number(stats.all_run_totals?.distance || 0),
				moving_time: Number(stats.all_run_totals?.moving_time || 0),
				elevation_gain: Number(stats.all_run_totals?.elevation_gain || 0),
			},
		};

		try {
			await redis.set("strava:stats", JSON.stringify(runningStats), { ex: 3600 }); // Cache 1 hour
		} catch (err) {
			console.error("Error writing stats cache to Redis:", err);
		}

		return runningStats;
	} catch (error) {
		console.error("Error in getAthleteStats:", error);
		return null;
	}
}

export interface StravaDataResult {
	isConfigured: boolean;
	runs: StravaRunActivity[] | null;
	stats: StravaStats | null;
	clientId?: string;
	siteUrl?: string;
	hasToken?: boolean;
}

export async function getStravaData(): Promise<StravaDataResult> {
	const isConfigured = Boolean(ENV_GLOBAL.STRAVA_CLIENT_ID && ENV_GLOBAL.STRAVA_CLIENT_SECRET);
	if (!isConfigured) {
		return {
			isConfigured: false,
			runs: null,
			stats: null,
		};
	}

	let hasToken = false;
	try {
		// Run fetches first
		const [runs, stats] = await Promise.all([getRecentRuns(), getAthleteStats()]);
		
		// Then verify if the token is still present in Redis (not evicted due to 401)
		const rawTokenData = await redis.get<any>("strava:token_data");
		hasToken = Boolean(rawTokenData);

		return {
			isConfigured: true,
			runs,
			stats,
			clientId: ENV_GLOBAL.STRAVA_CLIENT_ID,
			siteUrl: ENV_GLOBAL.NEXT_PUBLIC_SITE_URL,
			hasToken,
		};
	} catch (error) {
		console.error("Error fetching aggregated Strava data:", error);
		try {
			const rawTokenData = await redis.get<any>("strava:token_data");
			hasToken = Boolean(rawTokenData);
		} catch (_) {}
		
		return {
			isConfigured: true,
			runs: null,
			stats: null,
			clientId: ENV_GLOBAL.STRAVA_CLIENT_ID,
			siteUrl: ENV_GLOBAL.NEXT_PUBLIC_SITE_URL,
			hasToken,
		};
	}
}
