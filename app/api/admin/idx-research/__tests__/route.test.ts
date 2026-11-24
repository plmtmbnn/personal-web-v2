import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	checkAdmin: vi.fn(),
	get: vi.fn(),
	exists: vi.fn(),
	sync: vi.fn(),
}));
vi.mock("@/features/auth/actions", () => ({ checkAdmin: mocks.checkAdmin }));
vi.mock("@/lib/core/redis", () => ({
	redis: { get: mocks.get, exists: mocks.exists },
}));
vi.mock("@/services/market-data/idx-research-store", () => ({
	idxResearchStatusKey: "idx:research:status",
	idxResearchLockKey: "idx:research:lock",
	syncIdxResearch: mocks.sync,
}));

import { GET } from "../route";

beforeEach(() => {
	vi.clearAllMocks();
	mocks.checkAdmin.mockResolvedValue(true);
	mocks.get.mockResolvedValue({ state: "ready", session: "2026-11-24" });
	mocks.exists.mockResolvedValue(0);
});

describe("IDX research status", () => {
	it("requires admin access", async () => {
		mocks.checkAdmin.mockResolvedValue(false);
		expect((await GET()).status).toBe(401);
		expect(mocks.get).not.toHaveBeenCalled();
	});

	it("reports an active batch instead of the previous completed result", async () => {
		mocks.exists.mockResolvedValue(1);
		expect(await (await GET()).json()).toEqual({ status: { state: "busy" } });
		expect(mocks.exists).toHaveBeenCalledWith("idx:research:lock");
	});

	it("returns the saved result when no batch is running", async () => {
		expect(await (await GET()).json()).toEqual({
			status: { state: "ready", session: "2026-11-24" },
		});
	});
});
