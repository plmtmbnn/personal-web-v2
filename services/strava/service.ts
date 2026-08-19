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

export interface StravaSplitMetric {
	distance: number; // meters
	elapsed_time: number; // seconds
	elevation_difference?: number; // meters
	moving_time: number; // seconds
	split: number;
	average_speed: number; // m/s
	average_heartrate?: number;
	pace_zone?: number;
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

async function forceTokenRefresh(): Promise<void> {
	try {
		const rawTokenData = await redis.get<any>("strava:token_data");
		if (rawTokenData) {
			const tokenData: StravaTokenData = typeof rawTokenData === "string"
				? JSON.parse(rawTokenData)
				: rawTokenData;
			if (tokenData) {
				tokenData.expires_at = 0; // Force refresh on next request
				await redis.set("strava:token_data", JSON.stringify(tokenData), { ex: 60 * 60 * 24 * 30 });
				console.log("Strava token expiration forced to 0 in Redis for self-healing.");
			}
		}
	} catch (err) {
		console.error("Failed to force token refresh in Redis:", err);
	}
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
			await redis.set("strava:token_data", JSON.stringify(tokenData), { ex: 60 * 60 * 24 * 30 });
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
			await redis.set("strava:token_data", JSON.stringify(tokenData), { ex: 60 * 60 * 24 * 30 });
		} catch (error: any) {
			console.error("Error refreshing Strava token:", error);
			
			// Only evict the token if it's a permanent authentication error (400 or 401)
			// e.g. "Failed to refresh Strava token: 400 - ..."
			const match = error?.message?.match(/Failed to refresh Strava token: (\d+)/);
			const status = match ? parseInt(match[1], 10) : null;
			
			if (status === 400 || status === 401) {
				console.warn(`Permanent auth failure (${status}). Evicting Strava token from Redis...`);
				try {
					await redis.del("strava:token_data");
				} catch (delErr) {
					console.error("Failed to delete expired token data from Redis:", delErr);
				}
			} else {
				console.warn("Transient or network error refreshing Strava token. Retaining token in Redis.");
			}
			return null;
		}
	}

	return tokenData.access_token;
}

export async function getRecentRuns(limit = 10, accessToken?: string | null): Promise<StravaRunActivity[] | null> {
	const token = accessToken ?? await getAccessToken();
	if (!token) return null;

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
					Authorization: `Bearer ${token}`,
				},
			},
		);

		if (response.status === 401) {
			console.warn("Strava access token is unauthorized (401). Attempting immediate token refresh...");
			await forceTokenRefresh();
			const freshToken = await getAccessToken();
			if (freshToken) {
				const retryRes = await fetch(
					"https://www.strava.com/api/v3/athlete/activities?per_page=50",
					{
						headers: {
							Authorization: `Bearer ${freshToken}`,
						},
					},
				);
				if (retryRes.ok) {
					const activities = await retryRes.json();
					if (Array.isArray(activities)) {
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
							await redis.set("strava:activities", JSON.stringify(runs), { ex: 43200 }); // Cache 12 hours
						} catch (err) {
							console.error("Error writing activities cache to Redis:", err);
						}

						return runs;
					}
				} else {
					const retryErr = await retryRes.text();
					if (retryErr.includes("activity:read_permission") || retryErr.includes("Authorization Error")) {
						console.warn("[Strava API] Missing 'activity:read_all' permission. Reconnection required via /adventures/running.");
					} else {
						console.error(`[Strava API] Retry activities failed with status ${retryRes.status}:`, retryErr);
					}
					if (retryRes.status === 401 || retryRes.status === 403) {
						try {
							await redis.del("strava:token_data");
						} catch (delErr) {
							console.error("Failed to delete expired token data from Redis:", delErr);
						}
					}
				}
			} else {
				console.warn("[Strava API] No valid token available after refresh attempt.");
			}
			return null;
		}

		if (!response.ok) {
			const errBody = await response.text();
			console.warn(`[Strava API] Activities request returned status ${response.status}:`, errBody);
			return null;
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
			await redis.set("strava:activities", JSON.stringify(runs), { ex: 43200 }); // Cache 12 hours
		} catch (err) {
			console.error("Error writing activities cache to Redis:", err);
		}

		return runs;
	} catch (error) {
		console.error("Error in getRecentRuns:", error);
		return null;
	}
}

export async function getAthleteStats(accessToken?: string | null): Promise<StravaStats | null> {
	const token = accessToken ?? await getAccessToken();
	if (!token) return null;

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
				headers: { Authorization: `Bearer ${token}` },
			});
			if (athleteResponse.status === 401) {
				console.warn("Strava access token is unauthorized (401) during profile check. Forcing token refresh in Redis...");
				await forceTokenRefresh();
				return null;
			}
			if (!athleteResponse.ok) {
				throw new Error(`Failed to fetch Strava athlete profile: ${athleteResponse.status}`);
			}
			const athlete = await athleteResponse.json();
			athleteId = Number(athlete.id);

			if (tokenData && athleteId) {
				tokenData.athlete_id = athleteId;
				await redis.set("strava:token_data", JSON.stringify(tokenData), { ex: 60 * 60 * 24 * 30 });
			}
		}

		if (!athleteId) {
			return null;
		}

		const statsResponse = await fetch(
			`https://www.strava.com/api/v3/athletes/${athleteId}/stats`,
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);

		if (statsResponse.status === 401) {
			console.warn("Strava access token is unauthorized (401) during stats fetch. Attempting immediate token refresh...");
			await forceTokenRefresh();
			const freshToken = await getAccessToken();
			if (freshToken && freshToken !== token) {
				const retryStatsResponse = await fetch(
					`https://www.strava.com/api/v3/athletes/${athleteId}/stats`,
					{
						headers: { Authorization: `Bearer ${freshToken}` },
					},
				);
				if (retryStatsResponse.ok) {
					const stats = await retryStatsResponse.json();
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
						await redis.set("strava:stats", JSON.stringify(runningStats), { ex: 43200 });
					} catch (err) {
						console.error("Error writing stats cache to Redis:", err);
					}
					return runningStats;
				}
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
			await redis.set("strava:stats", JSON.stringify(runningStats), { ex: 43200 }); // Cache 12 hours
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

	try {
		// Fetch token once, then pass it to both functions to avoid redundant Redis reads
		const accessToken = await getAccessToken();

		const [runs, stats] = await Promise.all([
			getRecentRuns(10, accessToken),
			getAthleteStats(accessToken),
		]);

		const activeToken = await getAccessToken();
		const hasValidToken = Boolean(activeToken);

		console.log('🏃 Strava Data Fetched:', {
			hasToken: hasValidToken,
			runsCount: runs?.length ?? 0,
			runsIsNull: runs === null,
			statsAvailable: !!stats,
		});

		return {
			isConfigured: true,
			runs,
			stats,
			clientId: ENV_GLOBAL.STRAVA_CLIENT_ID,
			siteUrl: ENV_GLOBAL.NEXT_PUBLIC_SITE_URL,
			hasToken: hasValidToken,
		};
	} catch (error) {
		console.error("Error fetching aggregated Strava data:", error);

		return {
			isConfigured: true,
			runs: null,
			stats: null,
			clientId: ENV_GLOBAL.STRAVA_CLIENT_ID,
			siteUrl: ENV_GLOBAL.NEXT_PUBLIC_SITE_URL,
			hasToken: false,
		};
	}
}

/**
 * Fetch detailed per-kilometer split metrics for a specific Strava activity.
 * Results are cached in Redis for 7 days to preserve Strava API rate limits.
 */
export async function getActivitySplits(
	activityId: number,
	accessToken?: string | null,
): Promise<StravaSplitMetric[] | null> {
	if (!activityId || typeof activityId !== "number") return null;

	const token = accessToken ?? (await getAccessToken());
	if (!token) return null;

	const cacheKey = `strava:activity:${activityId}:splits`;
	try {
		const cached = await redis.get<any>(cacheKey);
		if (cached) {
			return typeof cached === "string" ? JSON.parse(cached) : cached;
		}
	} catch (err) {
		console.error("Error retrieving cached activity splits from Redis:", err);
	}

	try {
		const response = await fetch(
			`https://www.strava.com/api/v3/activities/${activityId}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);

		if (response.status === 401) {
			console.warn(`[Strava API] Activity ${activityId} splits unauthorized (401). Refreshing token...`);
			await forceTokenRefresh();
			const freshToken = await getAccessToken();
			if (freshToken) {
				const retryRes = await fetch(
					`https://www.strava.com/api/v3/activities/${activityId}`,
					{
						headers: {
							Authorization: `Bearer ${freshToken}`,
						},
					},
				);
				if (retryRes.ok) {
					const data = await retryRes.json();
					const splitsMetric: StravaSplitMetric[] = Array.isArray(data.splits_metric)
						? data.splits_metric.map((s: any) => ({
								distance: Number(s.distance || 0),
								elapsed_time: Number(s.elapsed_time || 0),
								elevation_difference:
									typeof s.elevation_difference === "number"
										? s.elevation_difference
										: undefined,
								moving_time: Number(s.moving_time || 0),
								split: Number(s.split || 0),
								average_speed: Number(s.average_speed || 0),
								average_heartrate:
									typeof s.average_heartrate === "number"
										? s.average_heartrate
										: undefined,
								pace_zone:
									typeof s.pace_zone === "number"
										? s.pace_zone
										: undefined,
						  }))
						: [];

					if (splitsMetric.length > 0) {
						try {
							await redis.set(cacheKey, JSON.stringify(splitsMetric), {
								ex: 60 * 60 * 24 * 7,
							});
						} catch (cacheErr) {
							console.error("Error caching splits to Redis:", cacheErr);
						}
					}

					return splitsMetric;
				}
			}
			return null;
		}

		if (!response.ok) {
			console.warn(
				`[Strava API] Activity ${activityId} splits request returned status ${response.status}`,
			);
			return null;
		}

		const data = await response.json();
		const splitsMetric: StravaSplitMetric[] = Array.isArray(data.splits_metric)
			? data.splits_metric.map((s: any) => ({
					distance: Number(s.distance || 0),
					elapsed_time: Number(s.elapsed_time || 0),
					elevation_difference:
						typeof s.elevation_difference === "number"
							? s.elevation_difference
							: undefined,
					moving_time: Number(s.moving_time || 0),
					split: Number(s.split || 0),
					average_speed: Number(s.average_speed || 0),
					average_heartrate:
						typeof s.average_heartrate === "number"
							? s.average_heartrate
							: undefined,
					pace_zone:
						typeof s.pace_zone === "number" ? s.pace_zone : undefined,
			  }))
			: [];

		if (splitsMetric.length > 0) {
			try {
				await redis.set(cacheKey, JSON.stringify(splitsMetric), {
					ex: 60 * 60 * 24 * 7,
				});
			} catch (cacheErr) {
				console.error("Error caching splits to Redis:", cacheErr);
			}
		}

		return splitsMetric;
	} catch (error) {
		console.error(`Error fetching splits for activity ${activityId}:`, error);
		return null;
	}
}
