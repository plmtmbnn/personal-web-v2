import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { checkAdmin } from "@/features/auth/actions";
import { redis } from "@/lib/core/redis";
import { DELETE, GET } from "../route";

vi.mock("@/features/auth/actions", () => ({
	checkAdmin: vi.fn(),
}));

vi.mock("@/lib/core/redis", () => ({
	redis: {
		keys: vi.fn(),
		del: vi.fn(),
	},
}));

describe("mock API management", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("rejects unauthenticated requests", async () => {
		vi.mocked(checkAdmin).mockResolvedValue(false);

		const response = await GET();

		expect(response.status).toBe(401);
		expect(redis.keys).not.toHaveBeenCalled();
	});

	it("cannot delete Redis keys outside the mock namespace", async () => {
		vi.mocked(checkAdmin).mockResolvedValue(true);
		const request = new NextRequest(
			"http://localhost/api/mock/manage?key=admin:market:credentials",
			{ method: "DELETE" },
		);

		const response = await DELETE(request);

		expect(response.status).toBe(400);
		expect(redis.del).not.toHaveBeenCalled();
	});
});
