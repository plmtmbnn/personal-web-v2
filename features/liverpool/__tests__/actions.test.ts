import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getLiverpoolFixtures, getLiverpoolFixturesStatic } from "../actions";

const cache = vi.hoisted(() => ({
	get: vi.fn(),
	set: vi.fn(),
	del: vi.fn(),
}));

vi.mock("@/lib/core/redis", () => ({
	redis: cache,
	CACHE_KEYS: { LFC_FIXTURES: "lfc:fixtures" },
}));

const event = {
	idEvent: "match-1",
	strEvent: "Liverpool vs Fulham",
	strLeague: "Premier League",
	strHomeTeam: "Liverpool",
	strAwayTeam: "Fulham",
	dateEvent: "2026-11-23",
	strTime: "15:00:00",
	idHomeTeam: "133602",
	idAwayTeam: "other",
};

describe("Liverpool fixture fetching", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ events: [event] }),
			}),
		);
	});

	afterEach(() => vi.unstubAllGlobals());

	it("uses one-hour caching for the page fetch", async () => {
		await getLiverpoolFixturesStatic();
		expect(fetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ next: { revalidate: 3600 } }),
		);
	});

	it("bypasses Redis and Next fetch caching for manual refresh", async () => {
		const result = await getLiverpoolFixtures(true);
		expect(result.upcoming).toHaveLength(1);
		expect(cache.get).not.toHaveBeenCalled();
		expect(fetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ cache: "no-store" }),
		);
		expect(cache.set).toHaveBeenCalledOnce();
	});

	it("does not cache provider failures or an empty fixture feed", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: false,
			status: 503,
			statusText: "Unavailable",
		} as Response);
		expect((await getLiverpoolFixtures(true)).error).toContain("Unavailable");
		expect(cache.set).not.toHaveBeenCalled();
		expect(cache.del).not.toHaveBeenCalled();

		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ events: null }),
		} as Response);
		expect((await getLiverpoolFixtures(true)).upcoming).toEqual([]);
		expect(cache.set).not.toHaveBeenCalled();
		expect(cache.del).toHaveBeenCalledWith("lfc:fixtures");
	});
});
