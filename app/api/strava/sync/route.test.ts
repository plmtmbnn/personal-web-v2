import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	checkAdmin: vi.fn(),
	del: vi.fn(),
	getStravaData: vi.fn(),
	revalidatePath: vi.fn(),
	revalidateTag: vi.fn(),
}));

vi.mock("@/features/auth/actions", () => ({ checkAdmin: mocks.checkAdmin }));
vi.mock("@/lib/core/redis", () => ({ redis: { del: mocks.del } }));
vi.mock("@/services/strava/service", () => ({
	getStravaData: mocks.getStravaData,
}));
vi.mock("next/cache", () => ({
	revalidatePath: mocks.revalidatePath,
	revalidateTag: mocks.revalidateTag,
}));

import { POST } from "./route";

describe("POST /api/strava/sync", () => {
	beforeEach(() => vi.resetAllMocks());

	it("rejects public requests before clearing the cache", async () => {
		mocks.checkAdmin.mockResolvedValue(false);

		const response = await POST();

		expect(response.status).toBe(401);
		expect(mocks.del).not.toHaveBeenCalled();
		expect(mocks.getStravaData).not.toHaveBeenCalled();
	});

	it("refreshes the running page after an admin sync", async () => {
		mocks.checkAdmin.mockResolvedValue(true);
		mocks.getStravaData.mockResolvedValue({
			isConfigured: true,
			hasToken: true,
			runs: [],
			stats: null,
		});

		const response = await POST();

		expect(response.status).toBe(200);
		expect(mocks.del).toHaveBeenCalledTimes(2);
		expect(mocks.revalidateTag).toHaveBeenCalledWith("strava-runs", {
			expire: 0,
		});
		expect(mocks.revalidatePath).toHaveBeenCalledWith("/adventures/running");
	});
});
