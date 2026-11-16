import { afterEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ get: vi.fn(), db: vi.fn() }));
vi.mock("@/features/auth/actions", () => ({ checkAdmin: async () => true }));
vi.mock("@/lib/core/redis", () => ({
	redis: { get: mocks.get },
	CACHE_KEYS: { STATS: (period: string) => `tasks:analytics:${period}` },
}));
vi.mock("@/lib/core/supabase-server", () => ({ createAdminClient: mocks.db }));
import { getTaskStats } from "../actions/analytics";

afterEach(() => {
	vi.useRealTimers();
	vi.clearAllMocks();
});
it("uses only analytics cached for the current Jakarta date", async () => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date("2026-11-15T16:59:59Z"));
	const stats = { totalTasks: 3 };
	mocks.get.mockResolvedValue({ day: "2026-11-15", stats });
	expect(await getTaskStats("today")).toEqual(stats);
	expect(mocks.db).not.toHaveBeenCalled();
	vi.setSystemTime(new Date("2026-11-15T17:00:00Z"));
	mocks.db.mockRejectedValueOnce(new Error("Fetching fresh data"));
	await expect(getTaskStats("today")).rejects.toThrow("Fetching fresh data");
	expect(mocks.db).toHaveBeenCalledOnce();
});
