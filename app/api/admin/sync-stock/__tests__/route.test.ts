import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ checkAdmin: vi.fn(), sync: vi.fn() }));
vi.mock("@/features/auth/actions", () => ({ checkAdmin: mocks.checkAdmin }));
vi.mock("@/services/market-data/idx-flows", () => ({
	syncIdxStockSummary: mocks.sync,
}));

import { POST } from "../route";

beforeEach(() => {
	vi.clearAllMocks();
	mocks.checkAdmin.mockResolvedValue(true);
});

describe("admin stock sync", () => {
	it("requires admin access", async () => {
		mocks.checkAdmin.mockResolvedValue(false);
		expect((await POST()).status).toBe(401);
		expect(mocks.sync).not.toHaveBeenCalled();
	});

	it("reports only a completed sync as success", async () => {
		mocks.sync.mockResolvedValueOnce({ success: true, count: 3 });
		expect((await POST()).status).toBe(200);
		expect(mocks.sync).toHaveBeenCalledWith(true);
		mocks.sync.mockResolvedValueOnce({
			success: false,
			count: 0,
			error: "Upstream unavailable",
		});
		const failure = await POST();
		expect(failure.status).toBe(503);
		expect(await failure.json()).toMatchObject({
			error: "Upstream unavailable",
		});
	});
});
