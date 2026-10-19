import { redis } from "@/lib/core/redis";
import { ENV_GLOBAL } from "@/lib/core/env";
import { unstable_cache } from "next/cache";

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

export interface StravaDataResult {
	isConfigured: boolean;
	runs: StravaRunActivity[] | null;
	stats: StravaStats | null;
	clientId?: string;
	siteUrl?: string;
	hasToken?: boolean;
}

// ── Cache & API Constants ───────────────────────────────────────────────────

export const STRAVA_CONFIG = {
	BASE_URL: "https://www.strava.com/api/v3",
	OAUTH_URL: "https://www.strava.com/oauth/token",
} as const;

export const STRAVA_CACHE_KEYS = {
	TOKEN_DATA: "strava:token_data",
	ACTIVITIES: "strava:activities",
	STATS: "strava:stats",
	SPLITS: (activityId: number) => `strava:activity:${activityId}:splits`,
} as const;

export const STRAVA_CACHE_TTLS = {
	TOKEN_DATA: 60 * 60 * 24 * 30, // 30 days
	ACTIVITIES: 43200, // 12 hours
	STATS: 43200, // 12 hours
	SPLITS: 60 * 60 * 24 * 7, // 7 days
} as const;

// ── Safe Redis Helpers ───────────────────────────────────────────────────────

async function safeRedisGet<T>(key: string): Promise<T | null> {
	try {
		const raw = await redis.get<any>(key);
		if (!raw) return null;
		return typeof raw === "string" ? JSON.parse(raw) : raw;
	} catch (err) {
		console.error(`Error reading "${key}" from Redis:`, err);
		return null;
	}
}

async function safeRedisSet(
	key: string,
	data: unknown,
	ttlSeconds?: number,
): Promise<void> {
	try {
		const value = JSON.stringify(data);
		if (ttlSeconds) {
			await redis.set(key, value, { ex: ttlSeconds });
		} else {
			await redis.set(key, value);
		}
	} catch (err) {
		console.error(`Error writing "${key}" to Redis:`, err);
	}
}

// ── Domain Mappers ──────────────────────────────────────────────────────────

export function mapStravaRunActivity(act: any): StravaRunActivity {
	return {
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
		average_heartrate: act.average_heartrate
			? Number(act.average_heartrate)
			: undefined,
		max_heartrate: act.max_heartrate ? Number(act.max_heartrate) : undefined,
	};
}

export function mapStravaStats(stats: any): StravaStats {
	return {
		ytd_run_totals: {
			count: Number(stats?.ytd_run_totals?.count || 0),
			distance: Number(stats?.ytd_run_totals?.distance || 0),
			moving_time: Number(stats?.ytd_run_totals?.moving_time || 0),
			elevation_gain: Number(stats?.ytd_run_totals?.elevation_gain || 0),
		},
		all_run_totals: {
			count: Number(stats?.all_run_totals?.count || 0),
			distance: Number(stats?.all_run_totals?.distance || 0),
			moving_time: Number(stats?.all_run_totals?.moving_time || 0),
			elevation_gain: Number(stats?.all_run_totals?.elevation_gain || 0),
		},
	};
}

export function mapStravaSplitsMetric(rawSplits: any[]): StravaSplitMetric[] {
	if (!Array.isArray(rawSplits)) return [];
	return rawSplits.map((s) => ({
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
			typeof s.average_heartrate === "number" ? s.average_heartrate : undefined,
		pace_zone: typeof s.pace_zone === "number" ? s.pace_zone : undefined,
	}));
}

// ── OAuth & Token Management ────────────────────────────────────────────────

async function refreshAccessToken(
	refreshToken: string,
): Promise<StravaTokenData> {
	if (!ENV_GLOBAL.STRAVA_CLIENT_ID || !ENV_GLOBAL.STRAVA_CLIENT_SECRET) {
		throw new Error("Missing Strava Client ID or Secret in environment.");
	}

	const response = await fetch(STRAVA_CONFIG.OAUTH_URL, {
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
		throw new Error(
			`Failed to refresh Strava token: ${response.status} - ${errText}`,
		);
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
		const tokenData = await safeRedisGet<StravaTokenData>(
			STRAVA_CACHE_KEYS.TOKEN_DATA,
		);
		if (tokenData) {
			tokenData.expires_at = 0; // Force immediate refresh on next check
			await safeRedisSet(
				STRAVA_CACHE_KEYS.TOKEN_DATA,
				tokenData,
				STRAVA_CACHE_TTLS.TOKEN_DATA,
			);
			console.log(
				"Strava token expiration forced to 0 in Redis for self-healing.",
			);
		}
	} catch (err) {
		console.error("Failed to force token refresh in Redis:", err);
	}
}

// In-flight refresh singleton to prevent duplicate concurrent refresh requests
let inFlightRefreshPromise: Promise<string | null> | null = null;

export async function getAccessToken(): Promise<string | null> {
	if (!ENV_GLOBAL.STRAVA_CLIENT_ID || !ENV_GLOBAL.STRAVA_CLIENT_SECRET) {
		return null;
	}

	if (inFlightRefreshPromise) {
		return inFlightRefreshPromise;
	}

	let tokenData = await safeRedisGet<StravaTokenData>(
		STRAVA_CACHE_KEYS.TOKEN_DATA,
	);

	// Bootstrap using fallback refresh token from env if not present in Redis
	if (!tokenData && ENV_GLOBAL.STRAVA_REFRESH_TOKEN) {
		try {
			console.log(
				"Bootstrapping Strava token from fallback env refresh token...",
			);
			const refreshed = await refreshAccessToken(
				ENV_GLOBAL.STRAVA_REFRESH_TOKEN,
			);
			tokenData = refreshed;
			await safeRedisSet(
				STRAVA_CACHE_KEYS.TOKEN_DATA,
				tokenData,
				STRAVA_CACHE_TTLS.TOKEN_DATA,
			);
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
		inFlightRefreshPromise = (async () => {
			try {
				console.log(
					"Strava access token expired or expiring soon. Refreshing...",
				);
				const refreshed = await refreshAccessToken(tokenData!.refresh_token);
				const updatedData: StravaTokenData = {
					...refreshed,
					athlete_id: tokenData!.athlete_id || refreshed.athlete_id,
				};
				await safeRedisSet(
					STRAVA_CACHE_KEYS.TOKEN_DATA,
					updatedData,
					STRAVA_CACHE_TTLS.TOKEN_DATA,
				);
				return updatedData.access_token;
			} catch (error: any) {
				console.error("Error refreshing Strava token:", error);
				const match = error?.message?.match(
					/Failed to refresh Strava token: (\d+)/,
				);
				const status = match ? Number.parseInt(match[1], 10) : null;

				if (status === 400 || status === 401) {
					console.warn(
						`Permanent auth failure (${status}). Evicting Strava token from Redis...`,
					);
					try {
						await redis.del(STRAVA_CACHE_KEYS.TOKEN_DATA);
					} catch (delErr) {
						console.error(
							"Failed to delete expired token data from Redis:",
							delErr,
						);
					}
				} else {
					console.warn(
						"Transient or network error refreshing Strava token. Retaining token in Redis.",
					);
				}
				return null;
			} finally {
				inFlightRefreshPromise = null;
			}
		})();

		return inFlightRefreshPromise;
	}

	return tokenData.access_token;
}

// ── Unified Authenticated Fetch Client ──────────────────────────────────────

interface StravaFetchResult<T> {
	data: T | null;
	status: number;
	ok: boolean;
}

async function stravaFetch<T>(
	endpoint: string,
	accessToken?: string | null,
): Promise<StravaFetchResult<T>> {
	const token = accessToken ?? (await getAccessToken());
	if (!token) {
		return { data: null, status: 401, ok: false };
	}

	const url = endpoint.startsWith("http")
		? endpoint
		: `${STRAVA_CONFIG.BASE_URL}${endpoint}`;

	try {
		let response = await fetch(url, {
			headers: { Authorization: `Bearer ${token}` },
		});

		// Auto 401 recovery: force refresh and retry once
		if (response.status === 401) {
			console.warn(
				`[Strava API] Access token unauthorized (401) on ${endpoint}. Refreshing...`,
			);
			await forceTokenRefresh();
			const freshToken = await getAccessToken();

			if (freshToken) {
				response = await fetch(url, {
					headers: { Authorization: `Bearer ${freshToken}` },
				});

				if (response.status === 401 || response.status === 403) {
					try {
						await redis.del(STRAVA_CACHE_KEYS.TOKEN_DATA);
					} catch (delErr) {
						console.error(
							"Failed to delete expired token data from Redis:",
							delErr,
						);
					}
				}
			} else {
				console.warn("[Strava API] No fresh token obtained after 401 refresh.");
				return { data: null, status: 401, ok: false };
			}
		}

		if (!response.ok) {
			const errText = await response.text().catch(() => "");
			console.warn(
				`[Strava API] Request to ${endpoint} returned status ${response.status}:`,
				errText,
			);
			return { data: null, status: response.status, ok: false };
		}

		const data = (await response.json()) as T;
		return { data, status: response.status, ok: true };
	} catch (error) {
		console.error(`[Strava API] Network exception calling ${endpoint}:`, error);
		return { data: null, status: 500, ok: false };
	}
}

// ── Public API Services ─────────────────────────────────────────────────────

export async function getRecentRuns(
	limit = 10,
	accessToken?: string | null,
): Promise<StravaRunActivity[] | null> {
	const cached = await safeRedisGet<StravaRunActivity[]>(
		STRAVA_CACHE_KEYS.ACTIVITIES,
	);
	if (cached) {
		return cached;
	}

	const res = await stravaFetch<any[]>(
		"/athlete/activities?per_page=50",
		accessToken,
	);
	if (!res.ok || !Array.isArray(res.data)) {
		return null;
	}

	const runs: StravaRunActivity[] = res.data
		.filter((act: any) => act.type === "Run" || act.sport_type === "Run")
		.slice(0, limit)
		.map(mapStravaRunActivity);

	await safeRedisSet(
		STRAVA_CACHE_KEYS.ACTIVITIES,
		runs,
		STRAVA_CACHE_TTLS.ACTIVITIES,
	);
	return runs;
}

export async function getAthleteStats(
	accessToken?: string | null,
): Promise<StravaStats | null> {
	const cached = await safeRedisGet<StravaStats>(STRAVA_CACHE_KEYS.STATS);
	if (cached) {
		return cached;
	}

	// Resolve athlete ID from cached token or athlete profile
	const tokenData = await safeRedisGet<StravaTokenData>(
		STRAVA_CACHE_KEYS.TOKEN_DATA,
	);
	let athleteId = tokenData?.athlete_id;

	if (!athleteId) {
		const athleteRes = await stravaFetch<any>("/athlete", accessToken);
		if (!athleteRes.ok || !athleteRes.data?.id) {
			return null;
		}

		athleteId = Number(athleteRes.data.id);
		if (tokenData && athleteId) {
			tokenData.athlete_id = athleteId;
			await safeRedisSet(
				STRAVA_CACHE_KEYS.TOKEN_DATA,
				tokenData,
				STRAVA_CACHE_TTLS.TOKEN_DATA,
			);
		}
	}

	if (!athleteId) {
		return null;
	}

	const statsRes = await stravaFetch<any>(
		`/athletes/${athleteId}/stats`,
		accessToken,
	);
	if (!statsRes.ok || !statsRes.data) {
		return null;
	}

	const stats = mapStravaStats(statsRes.data);
	await safeRedisSet(STRAVA_CACHE_KEYS.STATS, stats, STRAVA_CACHE_TTLS.STATS);
	return stats;
}

export const getCachedAthleteStats = unstable_cache(
	async () => getAthleteStats(),
	["athlete-stats-summary"],
	{ revalidate: 3600, tags: ["strava-stats"] },
);

export async function getActivitySplits(
	activityId: number,
	accessToken?: string | null,
): Promise<StravaSplitMetric[] | null> {
	if (!activityId || typeof activityId !== "number") return null;

	const cacheKey = STRAVA_CACHE_KEYS.SPLITS(activityId);
	const cached = await safeRedisGet<StravaSplitMetric[]>(cacheKey);
	if (cached) {
		return cached;
	}

	const res = await stravaFetch<any>(`/activities/${activityId}`, accessToken);
	if (!res.ok || !res.data) {
		return null;
	}

	const splitsMetric = mapStravaSplitsMetric(res.data.splits_metric);
	if (splitsMetric.length > 0) {
		await safeRedisSet(cacheKey, splitsMetric, STRAVA_CACHE_TTLS.SPLITS);
	}

	return splitsMetric;
}

export async function getStravaData(): Promise<StravaDataResult> {
	const isConfigured = Boolean(
		ENV_GLOBAL.STRAVA_CLIENT_ID && ENV_GLOBAL.STRAVA_CLIENT_SECRET,
	);
	if (!isConfigured) {
		return {
			isConfigured: false,
			runs: null,
			stats: null,
		};
	}

	try {
		const accessToken = await getAccessToken();

		const [runs, stats] = await Promise.all([
			getRecentRuns(10, accessToken),
			getAthleteStats(accessToken),
		]);

		const activeToken = await getAccessToken();
		const hasValidToken = Boolean(activeToken);

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

export const getCachedStravaData = unstable_cache(
	async () => getStravaData(),
	["strava-activity-data"],
	{ revalidate: 300, tags: ["strava-runs"] },
);
