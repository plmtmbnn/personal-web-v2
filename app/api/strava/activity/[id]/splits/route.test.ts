import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getRecentRuns: vi.fn(),
	getActivitySplits: vi.fn(),
}));

vi.mock("@/services/strava/service", () => ({
	getRecentRuns: mocks.getRecentRuns,
	getActivitySplits: mocks.getActivitySplits,
}));

import { GET } from "./route";

const request = new Request("http://localhost/api/strava/activity/123/splits");
const context = (id: string) => ({ params: Promise.resolve({ id }) });

describe("GET /api/strava/activity/[id]/splits", () => {
	beforeEach(() => vi.resetAllMocks());

	it("rejects malformed activity IDs", async () => {
		const response = await GET(request, context("123abc"));

		expect(response.status).toBe(400);
		expect(mocks.getActivitySplits).not.toHaveBeenCalled();
	});

	it("does not fetch splits for activities outside the public recent runs", async () => {
		mocks.getRecentRuns.mockResolvedValue([{ id: 456 }]);

		const response = await GET(request, context("123"));

		expect(response.status).toBe(404);
		expect(mocks.getActivitySplits).not.toHaveBeenCalled();
	});

	it("returns splits for a run shown on the public page", async () => {
		mocks.getRecentRuns.mockResolvedValue([{ id: 123 }]);
		mocks.getActivitySplits.mockResolvedValue([{ split: 1 }]);

		const response = await GET(request, context("123"));

		expect(response.status).toBe(200);
		expect((await response.json()).splits).toEqual([{ split: 1 }]);
	});
});
