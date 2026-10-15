import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
	getAccessToken,
	getRecentRuns,
	getAthleteStats,
	getActivitySplits,
	getStravaData,
	mapStravaRunActivity,
	mapStravaStats,
	mapStravaSplitsMetric,
	STRAVA_CACHE_KEYS,
} from "../service";

const redisStore = new Map<string, string>();

vi.mock("@/lib/core/redis", () => ({
	redis: {
		get: vi.fn(async (key: string) => redisStore.get(key) || null),
		set: vi.fn(async (key: string, val: any) => {
			redisStore.set(key, typeof val === "string" ? val : JSON.stringify(val));
			return "OK" as any;
		}),
		del: vi.fn(async (key: string) => {
			redisStore.delete(key);
			return 1 as any;
		}),
	},
}));

vi.mock("@/lib/core/env", () => ({
	ENV_GLOBAL: {
		STRAVA_CLIENT_ID: "mock-client-id",
		STRAVA_CLIENT_SECRET: "mock-client-secret",
		STRAVA_REFRESH_TOKEN: "mock-refresh-token",
		NEXT_PUBLIC_SITE_URL: "https://polmatambunan.com",
	},
}));

describe("Strava Service", () => {
	const originalFetch = global.fetch;

	beforeEach(() => {
		vi.clearAllMocks();
		redisStore.clear();
		global.fetch = vi.fn();
	});

	afterEach(() => {
		global.fetch = originalFetch;
	});

	describe("Domain Mappers", () => {
		it("mapStravaRunActivity correctly normalizes raw activity data", () => {
			const raw = {
				id: "123456",
				name: "Morning Tempo Run",
				distance: "10500.5",
				moving_time: "3000",
				elapsed_time: "3100",
				total_elevation_gain: "120",
				start_date_local: "2026-10-10T06:00:00Z",
				average_speed: "3.5",
				max_speed: "5.2",
				has_heartrate: true,
				average_heartrate: "162",
				max_heartrate: "178",
			};

			const mapped = mapStravaRunActivity(raw);
			expect(mapped.id).toBe(123456);
			expect(mapped.name).toBe("Morning Tempo Run");
			expect(mapped.distance).toBe(10500.5);
			expect(mapped.moving_time).toBe(3000);
			expect(mapped.average_speed).toBe(3.5);
			expect(mapped.has_heartrate).toBe(true);
			expect(mapped.average_heartrate).toBe(162);
			expect(mapped.max_heartrate).toBe(178);
		});

		it("mapStravaStats correctly normalizes athlete statistics", () => {
			const raw = {
				ytd_run_totals: {
					count: "45",
					distance: "450000",
					moving_time: "140000",
					elevation_gain: "3500",
				},
				all_run_totals: {
					count: "200",
					distance: "2100000",
					moving_time: "650000",
					elevation_gain: "16000",
				},
			};

			const mapped = mapStravaStats(raw);
			expect(mapped.ytd_run_totals.count).toBe(45);
			expect(mapped.ytd_run_totals.distance).toBe(450000);
			expect(mapped.all_run_totals.count).toBe(200);
			expect(mapped.all_run_totals.elevation_gain).toBe(16000);
		});

		it("mapStravaSplitsMetric handles empty or missing splits safely", () => {
			expect(mapStravaSplitsMetric([])).toEqual([]);
			expect(mapStravaSplitsMetric(null as any)).toEqual([]);

			const rawSplits = [
				{
					split: 1,
					distance: 1000,
					elapsed_time: 300,
					moving_time: 300,
					average_speed: 3.33,
					elevation_difference: 5,
					average_heartrate: 155,
					pace_zone: 2,
				},
			];

			const mapped = mapStravaSplitsMetric(rawSplits);
			expect(mapped).toHaveLength(1);
			expect(mapped[0].split).toBe(1);
			expect(mapped[0].distance).toBe(1000);
			expect(mapped[0].average_speed).toBe(3.33);
		});
	});

	describe("getAccessToken()", () => {
		it("returns valid unexpired token from Redis cache", async () => {
			const futureExpiry = Math.floor(Date.now() / 1000) + 3600;
			redisStore.set(
				STRAVA_CACHE_KEYS.TOKEN_DATA,
				JSON.stringify({
					access_token: "cached-token-123",
					refresh_token: "refresh-token-123",
					expires_at: futureExpiry,
					athlete_id: 999,
				}),
			);

			const token = await getAccessToken();
			expect(token).toBe("cached-token-123");
			expect(global.fetch).not.toHaveBeenCalled();
		});

		it("refreshes expired token and persists updated token to Redis", async () => {
			const pastExpiry = Math.floor(Date.now() / 1000) - 100;
			redisStore.set(
				STRAVA_CACHE_KEYS.TOKEN_DATA,
				JSON.stringify({
					access_token: "expired-token",
					refresh_token: "valid-refresh-token",
					expires_at: pastExpiry,
					athlete_id: 999,
				}),
			);

			const newExpiry = Math.floor(Date.now() / 1000) + 7200;
			vi.mocked(global.fetch).mockResolvedValue({
				ok: true,
				json: async () => ({
					access_token: "fresh-access-token",
					refresh_token: "new-refresh-token",
					expires_at: newExpiry,
					athlete: { id: 999 },
				}),
			} as any);

			const token = await getAccessToken();
			expect(token).toBe("fresh-access-token");
			expect(global.fetch).toHaveBeenCalledWith(
				"https://www.strava.com/oauth/token",
				expect.objectContaining({ method: "POST" }),
			);
			expect(redisStore.get(STRAVA_CACHE_KEYS.TOKEN_DATA)).toContain(
				"fresh-access-token",
			);
		});

		it("evicts token from Redis when refresh returns permanent auth error (401)", async () => {
			const pastExpiry = Math.floor(Date.now() / 1000) - 100;
			redisStore.set(
				STRAVA_CACHE_KEYS.TOKEN_DATA,
				JSON.stringify({
					access_token: "expired-token",
					refresh_token: "revoked-refresh-token",
					expires_at: pastExpiry,
				}),
			);

			vi.mocked(global.fetch).mockResolvedValue({
				ok: false,
				status: 401,
				text: async () => "Unauthorized",
			} as any);

			const token = await getAccessToken();
			expect(token).toBeNull();
			expect(redisStore.has(STRAVA_CACHE_KEYS.TOKEN_DATA)).toBe(false);
		});
	});

	describe("getRecentRuns()", () => {
		it("returns cached runs from Redis without invoking API", async () => {
			const cachedRuns = [
				{
					id: 1,
					name: "Morning Run",
					distance: 5000,
					moving_time: 1500,
					elapsed_time: 1500,
					total_elevation_gain: 20,
					start_date_local: "2026-10-10T06:00:00Z",
					average_speed: 3.33,
					max_speed: 4.5,
					has_heartrate: false,
				},
			];

			redisStore.set(STRAVA_CACHE_KEYS.ACTIVITIES, JSON.stringify(cachedRuns));

			const runs = await getRecentRuns(5);
			expect(runs).toEqual(cachedRuns);
			expect(global.fetch).not.toHaveBeenCalled();
		});

		it("fetches, filters non-run activities, and caches runs to Redis", async () => {
			const futureExpiry = Math.floor(Date.now() / 1000) + 3600;
			redisStore.set(
				STRAVA_CACHE_KEYS.TOKEN_DATA,
				JSON.stringify({
					access_token: "token-abc",
					refresh_token: "refresh-abc",
					expires_at: futureExpiry,
				}),
			);

			const rawActivities = [
				{
					id: 101,
					name: "Long Run",
					type: "Run",
					distance: 15000,
					moving_time: 4500,
				},
				{
					id: 102,
					name: "Morning Ride",
					type: "Ride",
					distance: 30000,
					moving_time: 3600,
				},
				{
					id: 103,
					name: "Intervals",
					type: "Run",
					distance: 8000,
					moving_time: 2100,
				},
			];

			vi.mocked(global.fetch).mockResolvedValue({
				ok: true,
				status: 200,
				json: async () => rawActivities,
			} as any);

			const runs = await getRecentRuns(10);
			expect(runs).toHaveLength(2);
			expect(runs?.[0].id).toBe(101);
			expect(runs?.[1].id).toBe(103);
			expect(redisStore.has(STRAVA_CACHE_KEYS.ACTIVITIES)).toBe(true);
		});

		it("recovers automatically from 401 by refreshing token and retrying", async () => {
			const futureExpiry = Math.floor(Date.now() / 1000) + 3600;
			redisStore.set(
				STRAVA_CACHE_KEYS.TOKEN_DATA,
				JSON.stringify({
					access_token: "stale-token",
					refresh_token: "valid-refresh",
					expires_at: futureExpiry,
				}),
			);

			// 1st call: activities 401
			// 2nd call: token refresh POST
			// 3rd call: activities retry 200
			vi.mocked(global.fetch)
				.mockResolvedValueOnce({
					ok: false,
					status: 401,
					text: async () => "Unauthorized",
				} as any)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						access_token: "new-valid-token",
						refresh_token: "valid-refresh",
						expires_at: futureExpiry + 3600,
					}),
				} as any)
				.mockResolvedValueOnce({
					ok: true,
					status: 200,
					json: async () => [
						{
							id: 201,
							name: "Post-recovery Run",
							type: "Run",
							distance: 5000,
							moving_time: 1500,
						},
					],
				} as any);

			const runs = await getRecentRuns(5);
			expect(runs).toHaveLength(1);
			expect(runs?.[0].id).toBe(201);
			expect(global.fetch).toHaveBeenCalledTimes(3);
		});
	});

	describe("getAthleteStats()", () => {
		it("resolves athlete ID from athlete profile endpoint if missing from token", async () => {
			const futureExpiry = Math.floor(Date.now() / 1000) + 3600;
			redisStore.set(
				STRAVA_CACHE_KEYS.TOKEN_DATA,
				JSON.stringify({
					access_token: "token-with-no-id",
					refresh_token: "refresh-token",
					expires_at: futureExpiry,
					// athlete_id omitted
				}),
			);

			// 1st call: /athlete profile
			// 2nd call: /athletes/555/stats
			vi.mocked(global.fetch)
				.mockResolvedValueOnce({
					ok: true,
					status: 200,
					json: async () => ({ id: 555 }),
				} as any)
				.mockResolvedValueOnce({
					ok: true,
					status: 200,
					json: async () => ({
						ytd_run_totals: {
							count: 30,
							distance: 300000,
							moving_time: 90000,
							elevation_gain: 2000,
						},
						all_run_totals: {
							count: 100,
							distance: 1000000,
							moving_time: 300000,
							elevation_gain: 8000,
						},
					}),
				} as any);

			const stats = await getAthleteStats();
			expect(stats?.ytd_run_totals.count).toBe(30);
			expect(global.fetch).toHaveBeenCalledWith(
				"https://www.strava.com/api/v3/athlete",
				expect.anything(),
			);
			expect(global.fetch).toHaveBeenCalledWith(
				"https://www.strava.com/api/v3/athletes/555/stats",
				expect.anything(),
			);
		});
	});

	describe("getActivitySplits()", () => {
		it("fetches activity splits and caches 7-day TTL in Redis", async () => {
			const futureExpiry = Math.floor(Date.now() / 1000) + 3600;
			redisStore.set(
				STRAVA_CACHE_KEYS.TOKEN_DATA,
				JSON.stringify({
					access_token: "token-splits",
					refresh_token: "refresh-splits",
					expires_at: futureExpiry,
				}),
			);

			vi.mocked(global.fetch).mockResolvedValue({
				ok: true,
				status: 200,
				json: async () => ({
					splits_metric: [
						{ split: 1, distance: 1000, moving_time: 290, average_speed: 3.44 },
						{ split: 2, distance: 1000, moving_time: 285, average_speed: 3.5 },
					],
				}),
			} as any);

			const splits = await getActivitySplits(9999);
			expect(splits).toHaveLength(2);
			expect(redisStore.has(STRAVA_CACHE_KEYS.SPLITS(9999))).toBe(true);
		});
	});

	describe("getStravaData()", () => {
		it("aggregates runs and stats correctly", async () => {
			const futureExpiry = Math.floor(Date.now() / 1000) + 3600;
			redisStore.set(
				STRAVA_CACHE_KEYS.TOKEN_DATA,
				JSON.stringify({
					access_token: "token-agg",
					refresh_token: "refresh-agg",
					expires_at: futureExpiry,
					athlete_id: 1001,
				}),
			);

			vi.mocked(global.fetch)
				.mockResolvedValueOnce({
					ok: true,
					status: 200,
					json: async () => [
						{ id: 1, type: "Run", distance: 10000, moving_time: 3000 },
					],
				} as any)
				.mockResolvedValueOnce({
					ok: true,
					status: 200,
					json: async () => ({
						ytd_run_totals: {
							count: 10,
							distance: 100000,
							moving_time: 30000,
							elevation_gain: 500,
						},
						all_run_totals: {
							count: 50,
							distance: 500000,
							moving_time: 150000,
							elevation_gain: 2500,
						},
					}),
				} as any);

			const data = await getStravaData();
			expect(data.isConfigured).toBe(true);
			expect(data.hasToken).toBe(true);
			expect(data.runs).toHaveLength(1);
			expect(data.stats?.ytd_run_totals.count).toBe(10);
		});
	});
});
