import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkAdmin, logout } from "../actions";
import { createClient } from "@/lib/core/supabase-server";
import { deleteSession } from "@/lib/core/redis";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const mockEnv = {
	NEXT_PUBLIC_ENABLE_GOOGLE_AUTH: true,
};

vi.mock("@/lib/core/env", () => ({
	get ENV_GLOBAL() {
		return mockEnv;
	},
}));

vi.mock("@/lib/core/supabase-server", () => ({
	createClient: vi.fn(),
}));

vi.mock("@/lib/core/redis", () => ({
	deleteSession: vi.fn(),
}));

vi.mock("next/headers", () => ({
	cookies: vi.fn(),
}));

vi.mock("next/navigation", () => ({
	redirect: vi.fn(),
}));

describe("Auth Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockEnv.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH = true;
	});

	describe("checkAdmin()", () => {
		it("returns true immediately if Google Auth is disabled", async () => {
			mockEnv.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH = false;
			const result = await checkAdmin();
			expect(result).toBe(true);
			expect(createClient).not.toHaveBeenCalled();
		});

		it("returns false if supabase user is not found or returns an error", async () => {
			vi.mocked(createClient).mockResolvedValue({
				auth: {
					getUser: vi.fn().mockResolvedValue({
						data: { user: null },
						error: new Error("No session"),
					}),
				},
			} as any);

			const result = await checkAdmin();
			expect(result).toBe(false);
		});

		it("returns false if profile query returns error or no profile", async () => {
			const mockSingle = vi
				.fn()
				.mockResolvedValue({ data: null, error: new Error("Not found") });
			const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
			const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
			const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

			vi.mocked(createClient).mockResolvedValue({
				auth: {
					getUser: vi.fn().mockResolvedValue({
						data: { user: { id: "user-123" } },
						error: null,
					}),
				},
				from: mockFrom,
			} as any);

			const result = await checkAdmin();
			expect(result).toBe(false);
			expect(mockFrom).toHaveBeenCalledWith("profiles");
			expect(mockEq).toHaveBeenCalledWith("id", "user-123");
		});

		it("returns false if profile is_admin is false", async () => {
			const mockSingle = vi
				.fn()
				.mockResolvedValue({ data: { is_admin: false }, error: null });
			const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
			const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
			const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

			vi.mocked(createClient).mockResolvedValue({
				auth: {
					getUser: vi.fn().mockResolvedValue({
						data: { user: { id: "user-123" } },
						error: null,
					}),
				},
				from: mockFrom,
			} as any);

			const result = await checkAdmin();
			expect(result).toBe(false);
		});

		it("returns true if profile is_admin is true", async () => {
			const mockSingle = vi
				.fn()
				.mockResolvedValue({ data: { is_admin: true }, error: null });
			const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
			const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
			const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

			vi.mocked(createClient).mockResolvedValue({
				auth: {
					getUser: vi.fn().mockResolvedValue({
						data: { user: { id: "admin-123" } },
						error: null,
					}),
				},
				from: mockFrom,
			} as any);

			const result = await checkAdmin();
			expect(result).toBe(true);
		});
	});

	describe("logout()", () => {
		it("clears Redis session, signs out from Supabase, deletes cookie, and redirects to /login", async () => {
			const mockCookieDelete = vi.fn();
			const mockCookieGet = vi.fn().mockReturnValue({ value: "sess-abc-123" });
			vi.mocked(cookies).mockResolvedValue({
				get: mockCookieGet,
				delete: mockCookieDelete,
			} as any);

			const mockSignOut = vi.fn().mockResolvedValue({ error: null });
			vi.mocked(createClient).mockResolvedValue({
				auth: {
					signOut: mockSignOut,
				},
			} as any);

			await logout();

			expect(deleteSession).toHaveBeenCalledWith("sess-abc-123");
			expect(mockSignOut).toHaveBeenCalled();
			expect(mockCookieDelete).toHaveBeenCalledWith("app_session");
			expect(redirect).toHaveBeenCalledWith("/login");
		});

		it("handles logout gracefully when no app_session cookie is present", async () => {
			const mockCookieDelete = vi.fn();
			const mockCookieGet = vi.fn().mockReturnValue(undefined);
			vi.mocked(cookies).mockResolvedValue({
				get: mockCookieGet,
				delete: mockCookieDelete,
			} as any);

			const mockSignOut = vi.fn().mockResolvedValue({ error: null });
			vi.mocked(createClient).mockResolvedValue({
				auth: {
					signOut: mockSignOut,
				},
			} as any);

			await logout();

			expect(deleteSession).not.toHaveBeenCalled();
			expect(mockSignOut).toHaveBeenCalled();
			expect(mockCookieDelete).toHaveBeenCalledWith("app_session");
			expect(redirect).toHaveBeenCalledWith("/login");
		});
	});
});
