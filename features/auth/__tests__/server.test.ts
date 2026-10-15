import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkAuth, requireAuth } from "../server";
import { createClient } from "@/lib/core/supabase-server";
import { getAuthSession } from "@/lib/core/redis";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const mockEnv: {
	NEXT_PUBLIC_ENABLE_GOOGLE_AUTH?: boolean;
	NEXT_PUBLIC_ENABLE_PINGUARD?: boolean;
} = {};

vi.mock("@/lib/core/env", () => ({
	get ENV_GLOBAL() {
		return mockEnv;
	},
}));

vi.mock("@/lib/core/supabase-server", () => ({
	createClient: vi.fn(),
}));

vi.mock("@/lib/core/redis", () => ({
	getAuthSession: vi.fn(),
}));

vi.mock("next/headers", () => ({
	cookies: vi.fn(),
	headers: vi.fn(),
}));

vi.mock("next/navigation", () => ({
	redirect: vi.fn(),
}));

describe("Centralized Server Auth Guards", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockEnv.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH = true;
		mockEnv.NEXT_PUBLIC_ENABLE_PINGUARD = true;

		// Default cookie mock
		vi.mocked(cookies).mockResolvedValue({
			get: vi.fn().mockReturnValue({ value: "test-session-id" }),
		} as any);
	});

	describe("Mode: disabled", () => {
		it("bypasses authentication and returns dev administrator", async () => {
			mockEnv.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH = false;
			mockEnv.NEXT_PUBLIC_ENABLE_PINGUARD = false;

			const result = await checkAuth({ requireAdmin: true });
			expect(result.authorized).toBe(true);
			expect(result.status).toBe("disabled");
			expect(result.user?.id).toBe("dev-admin");
			expect(createClient).not.toHaveBeenCalled();
		});
	});

	describe("Mode: login_only", () => {
		beforeEach(() => {
			mockEnv.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH = true;
			mockEnv.NEXT_PUBLIC_ENABLE_PINGUARD = false;
		});

		it("returns unauthenticated when Google session is missing", async () => {
			vi.mocked(createClient).mockResolvedValue({
				auth: {
					getUser: vi.fn().mockResolvedValue({
						data: { user: null },
						error: new Error("No session"),
					}),
				},
			} as any);

			const result = await checkAuth();
			expect(result.authorized).toBe(false);
			expect(result.status).toBe("unauthenticated");
			expect(result.redirectUrl).toBe("/login");
		});

		it("returns forbidden when user is not an admin and admin is required", async () => {
			const mockSingle = vi.fn().mockResolvedValue({
				data: { is_admin: false, is_verified: true, full_name: "Regular User" },
				error: null,
			});
			const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
			const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
			const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

			vi.mocked(createClient).mockResolvedValue({
				auth: {
					getUser: vi.fn().mockResolvedValue({
						data: { user: { id: "user-123", email: "user@example.com" } },
						error: null,
					}),
				},
				from: mockFrom,
			} as any);

			const result = await checkAuth({ requireAdmin: true });
			expect(result.authorized).toBe(false);
			expect(result.status).toBe("forbidden");
			expect(result.redirectUrl).toBe("/unauthorized?message=pending");
		});

		it("returns authorized when Google user has admin role", async () => {
			const mockSingle = vi.fn().mockResolvedValue({
				data: { is_admin: true, is_verified: true, full_name: "Admin User" },
				error: null,
			});
			const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
			const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
			const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

			vi.mocked(createClient).mockResolvedValue({
				auth: {
					getUser: vi.fn().mockResolvedValue({
						data: { user: { id: "admin-123", email: "admin@example.com" } },
						error: null,
					}),
				},
				from: mockFrom,
			} as any);

			const result = await checkAuth({ requireAdmin: true });
			expect(result.authorized).toBe(true);
			expect(result.status).toBe("authorized");
			expect(result.user?.id).toBe("admin-123");
			expect(result.user?.isAdmin).toBe(true);
		});
	});

	describe("Mode: pin_only", () => {
		beforeEach(() => {
			mockEnv.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH = false;
			mockEnv.NEXT_PUBLIC_ENABLE_PINGUARD = true;
		});

		it("returns unauthenticated when session is missing or PIN is not verified", async () => {
			vi.mocked(getAuthSession).mockResolvedValue(null);

			const result = await checkAuth();
			expect(result.authorized).toBe(false);
			expect(result.status).toBe("unauthenticated");
		});

		it("returns authorized when session has pinAuthenticated: true", async () => {
			vi.mocked(getAuthSession).mockResolvedValue({
				sessionId: "sess-123",
				userId: "pin-admin",
				isAdmin: true,
				googleAuthenticated: false,
				pinAuthenticated: true,
				mode: "pin_only",
				createdAt: Date.now(),
				lastRefreshedAt: Date.now(),
				expiresAt: Date.now() + 100000,
			});

			const result = await checkAuth();
			expect(result.authorized).toBe(true);
			expect(result.status).toBe("authorized");
			expect(result.user?.id).toBe("pin-admin");
		});
	});

	describe("Mode: serial (2-Factor Google + PIN)", () => {
		beforeEach(() => {
			mockEnv.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH = true;
			mockEnv.NEXT_PUBLIC_ENABLE_PINGUARD = true;
		});

		it("returns unauthenticated when Google session is missing", async () => {
			vi.mocked(createClient).mockResolvedValue({
				auth: {
					getUser: vi
						.fn()
						.mockResolvedValue({ data: { user: null }, error: null }),
				},
			} as any);

			const result = await checkAuth();
			expect(result.authorized).toBe(false);
			expect(result.status).toBe("unauthenticated");
		});

		it("returns needs_pin when Google is authenticated but PIN is not yet verified", async () => {
			const mockSingle = vi.fn().mockResolvedValue({
				data: { is_admin: true, is_verified: true, full_name: "Admin User" },
				error: null,
			});
			const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
			const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
			const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

			vi.mocked(createClient).mockResolvedValue({
				auth: {
					getUser: vi.fn().mockResolvedValue({
						data: { user: { id: "admin-123", email: "admin@example.com" } },
						error: null,
					}),
				},
				from: mockFrom,
			} as any);

			// Session has Google auth but pinAuthenticated is false
			vi.mocked(getAuthSession).mockResolvedValue({
				sessionId: "sess-123",
				userId: "admin-123",
				isAdmin: true,
				googleAuthenticated: true,
				pinAuthenticated: false,
				mode: "serial",
				createdAt: Date.now(),
				lastRefreshedAt: Date.now(),
				expiresAt: Date.now() + 100000,
			});

			const result = await checkAuth({ requireAdmin: true });
			expect(result.authorized).toBe(false);
			expect(result.status).toBe("needs_pin");
			expect(result.redirectUrl).toBe("/login?step=pin");
		});

		it("returns authorized when both Google and PIN are verified", async () => {
			const mockSingle = vi.fn().mockResolvedValue({
				data: { is_admin: true, is_verified: true, full_name: "Admin User" },
				error: null,
			});
			const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
			const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
			const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

			vi.mocked(createClient).mockResolvedValue({
				auth: {
					getUser: vi.fn().mockResolvedValue({
						data: { user: { id: "admin-123", email: "admin@example.com" } },
						error: null,
					}),
				},
				from: mockFrom,
			} as any);

			vi.mocked(getAuthSession).mockResolvedValue({
				sessionId: "sess-123",
				userId: "admin-123",
				isAdmin: true,
				googleAuthenticated: true,
				pinAuthenticated: true,
				mode: "serial",
				createdAt: Date.now(),
				lastRefreshedAt: Date.now(),
				expiresAt: Date.now() + 100000,
			});

			const result = await checkAuth({ requireAdmin: true });
			expect(result.authorized).toBe(true);
			expect(result.status).toBe("authorized");
			expect(result.user?.id).toBe("admin-123");
		});
	});

	describe("requireAuth()", () => {
		it("redirects to /login?step=pin when status is needs_pin", async () => {
			mockEnv.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH = true;
			mockEnv.NEXT_PUBLIC_ENABLE_PINGUARD = true;

			const mockSingle = vi.fn().mockResolvedValue({
				data: { is_admin: true, is_verified: true, full_name: "Admin User" },
				error: null,
			});
			const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
			const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
			const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

			vi.mocked(createClient).mockResolvedValue({
				auth: {
					getUser: vi.fn().mockResolvedValue({
						data: { user: { id: "admin-123", email: "admin@example.com" } },
						error: null,
					}),
				},
				from: mockFrom,
			} as any);

			vi.mocked(getAuthSession).mockResolvedValue({
				sessionId: "sess-123",
				userId: "admin-123",
				isAdmin: true,
				googleAuthenticated: true,
				pinAuthenticated: false,
				mode: "serial",
				createdAt: Date.now(),
				lastRefreshedAt: Date.now(),
				expiresAt: Date.now() + 100000,
			});

			await requireAuth({ requireAdmin: true, redirectTo: "/tasks" });
			expect(redirect).toHaveBeenCalledWith("/login?step=pin&next=%2Ftasks");
		});

		it("redirects to /login?next=... when unauthenticated", async () => {
			mockEnv.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH = true;
			mockEnv.NEXT_PUBLIC_ENABLE_PINGUARD = false;

			vi.mocked(createClient).mockResolvedValue({
				auth: {
					getUser: vi
						.fn()
						.mockResolvedValue({ data: { user: null }, error: null }),
				},
			} as any);

			await requireAuth({ requireAdmin: true, redirectTo: "/admin" });
			expect(redirect).toHaveBeenCalledWith("/login?next=%2Fadmin");
		});

		it("returns session and user without redirecting when authorized", async () => {
			mockEnv.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH = false;
			mockEnv.NEXT_PUBLIC_ENABLE_PINGUARD = false;

			const auth = await requireAuth({ redirectTo: "/admin" });
			expect(redirect).not.toHaveBeenCalled();
			expect(auth.user?.id).toBe("dev-admin");
		});

		it("supports single-param requireAuth('login_only')", async () => {
			vi.mocked(createClient).mockResolvedValue({
				auth: {
					getUser: vi
						.fn()
						.mockResolvedValue({ data: { user: null }, error: null }),
				},
			} as any);

			await requireAuth("login_only");
			expect(redirect).toHaveBeenCalledWith("/login?mode=login_only");
		});

		it("supports single-param requireAuth('pin_only')", async () => {
			vi.mocked(getAuthSession).mockResolvedValue(null);

			await requireAuth("pin_only");
			expect(redirect).toHaveBeenCalledWith("/login?mode=pin_only");
		});

		it("supports single-param requireAuth('serial')", async () => {
			const mockSingle = vi.fn().mockResolvedValue({
				data: { is_admin: true, is_verified: true, full_name: "Admin User" },
				error: null,
			});
			const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
			const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
			const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

			vi.mocked(createClient).mockResolvedValue({
				auth: {
					getUser: vi.fn().mockResolvedValue({
						data: { user: { id: "admin-123", email: "admin@example.com" } },
						error: null,
					}),
				},
				from: mockFrom,
			} as any);

			vi.mocked(getAuthSession).mockResolvedValue({
				sessionId: "sess-123",
				userId: "admin-123",
				isAdmin: true,
				googleAuthenticated: true,
				pinAuthenticated: false,
				mode: "serial",
				createdAt: Date.now(),
				lastRefreshedAt: Date.now(),
				expiresAt: Date.now() + 100000,
			});

			await requireAuth("serial");
			expect(redirect).toHaveBeenCalledWith("/login?step=pin&mode=serial");
		});

		it("supports single-param requireAuth('disabled')", async () => {
			const auth = await requireAuth("disabled");
			expect(redirect).not.toHaveBeenCalled();
			expect(auth.user?.id).toBe("dev-admin");
		});
	});
});
