import { describe, it, expect, vi, beforeEach } from "vitest";
import { syncSessionRefresh, getCurrentSessionId } from "../auth-utils";
import { refreshSession } from "@/lib/core/redis";
import { cookies } from "next/headers";

vi.mock("@/lib/core/redis", () => ({
	refreshSession: vi.fn(),
}));

vi.mock("next/headers", () => ({
	cookies: vi.fn(),
}));

describe("Authentication Utilities", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getCurrentSessionId()", () => {
		it("returns session ID from app_session cookie", async () => {
			vi.mocked(cookies).mockResolvedValue({
				get: vi.fn().mockReturnValue({ value: "sess-xyz-999" }),
			} as any);

			const sessionId = await getCurrentSessionId();
			expect(sessionId).toBe("sess-xyz-999");
		});

		it("returns null if app_session cookie is not set", async () => {
			vi.mocked(cookies).mockResolvedValue({
				get: vi.fn().mockReturnValue(undefined),
			} as any);

			const sessionId = await getCurrentSessionId();
			expect(sessionId).toBeNull();
		});

		it("returns null and catches errors when cookies() throws", async () => {
			vi.mocked(cookies).mockRejectedValue(new Error("Cookie error"));

			const sessionId = await getCurrentSessionId();
			expect(sessionId).toBeNull();
		});
	});

	describe("syncSessionRefresh()", () => {
		it("returns false if no app_session cookie exists", async () => {
			vi.mocked(cookies).mockResolvedValue({
				get: vi.fn().mockReturnValue(undefined),
			} as any);

			const result = await syncSessionRefresh();
			expect(result).toBe(false);
			expect(refreshSession).not.toHaveBeenCalled();
		});

		it("calls refreshSession and returns true when session is successfully refreshed", async () => {
			vi.mocked(cookies).mockResolvedValue({
				get: vi.fn().mockReturnValue({ value: "sess-abc-123" }),
			} as any);
			vi.mocked(refreshSession).mockResolvedValue(true);

			const result = await syncSessionRefresh();
			expect(result).toBe(true);
			expect(refreshSession).toHaveBeenCalledWith("sess-abc-123");
		});

		it("returns false when refreshSession fails", async () => {
			vi.mocked(cookies).mockResolvedValue({
				get: vi.fn().mockReturnValue({ value: "sess-expired" }),
			} as any);
			vi.mocked(refreshSession).mockResolvedValue(false);

			const result = await syncSessionRefresh();
			expect(result).toBe(false);
		});

		it("catches unexpected exceptions and returns false", async () => {
			vi.mocked(cookies).mockRejectedValue(new Error("Fatal"));

			const result = await syncSessionRefresh();
			expect(result).toBe(false);
		});
	});
});
