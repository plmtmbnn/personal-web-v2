import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/core/supabase-server";
import { getAuthSession } from "@/lib/core/redis";
import {
	getAuthMode,
	type AuthMode,
	type AuthResult,
	type AuthSession,
	type AuthUser,
} from "./types";

/**
 * Verifies authorization status according to the active AuthMode:
 * - "disabled": Bypasses all checks (local dev/test)
 * - "login_only": Requires valid Google OAuth user (and optionally admin role)
 * - "pin_only": Requires valid PIN session in Redis
 * - "serial": Requires valid Google OAuth user AND verified PIN session (2FA)
 */
export async function checkAuth(
	modeParam?: AuthMode | { requireAdmin?: boolean },
	options?: {
		requireAdmin?: boolean;
	},
): Promise<AuthResult> {
	const mode: AuthMode =
		typeof modeParam === "string" ? modeParam : getAuthMode();

	const effectiveOptions = typeof modeParam === "object" ? modeParam : options;

	// 1. Bypass mode for development/testing
	if (mode === "disabled") {
		const devUser: AuthUser = {
			id: "dev-admin",
			email: "admin@localhost",
			name: "Local Administrator",
			isAdmin: true,
		};
		return {
			authorized: true,
			status: "disabled",
			session: null,
			user: devUser,
		};
	}

	let sessionId: string | undefined;
	try {
		const cookieStore = await cookies();
		sessionId = cookieStore?.get
			? cookieStore.get("app_session")?.value
			: undefined;
	} catch {
		// Ignore if cookies() is inaccessible
	}
	const authSession = sessionId ? await getAuthSession(sessionId) : null;

	// 2. Google OAuth verification (required for login_only and serial)
	let googleUser: AuthUser | null = null;
	if (mode === "login_only" || mode === "serial") {
		try {
			const supabase = await createClient();
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser();

			if (!userError && user) {
				const { data: profile } = await supabase
					.from("profiles")
					.select("is_admin, is_verified, full_name, avatar_url")
					.eq("id", user.id)
					.single();

				googleUser = {
					id: user.id,
					email: user.email,
					name:
						profile?.full_name ||
						user.user_metadata?.full_name ||
						user.email?.split("@")[0],
					avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url,
					isAdmin: !!profile?.is_admin,
				};
			}
		} catch (err) {
			console.error("[checkAuth] Supabase auth check error:", err);
		}
	}

	// 3. Evaluate by active Mode
	if (mode === "login_only") {
		if (!googleUser) {
			return {
				authorized: false,
				status: "unauthenticated",
				session: null,
				user: null,
				redirectUrl: "/login",
			};
		}

		if (effectiveOptions?.requireAdmin && !googleUser.isAdmin) {
			return {
				authorized: false,
				status: "forbidden",
				session: authSession,
				user: googleUser,
				redirectUrl: "/unauthorized?message=pending",
			};
		}

		return {
			authorized: true,
			status: "authorized",
			session: authSession,
			user: googleUser,
		};
	}

	if (mode === "pin_only") {
		if (!authSession?.pinAuthenticated) {
			return {
				authorized: false,
				status: "unauthenticated",
				session: null,
				user: null,
				redirectUrl: "/login",
			};
		}

		const pinUser: AuthUser = {
			id: authSession.userId || "pin-admin",
			email: authSession.email || "admin@pin.auth",
			name: authSession.name || "Administrator",
			avatarUrl: authSession.avatarUrl,
			isAdmin: true,
		};

		return {
			authorized: true,
			status: "authorized",
			session: authSession,
			user: pinUser,
		};
	}

	if (mode === "serial") {
		// Step 1: Must be authenticated via Google
		if (!googleUser) {
			return {
				authorized: false,
				status: "unauthenticated",
				session: null,
				user: null,
				redirectUrl: "/login",
			};
		}

		// Must have admin role if requested
		if (effectiveOptions?.requireAdmin && !googleUser.isAdmin) {
			return {
				authorized: false,
				status: "forbidden",
				session: authSession,
				user: googleUser,
				redirectUrl: "/unauthorized?message=pending",
			};
		}

		// Step 2: Must be authenticated via PIN
		if (!authSession?.pinAuthenticated) {
			return {
				authorized: false,
				status: "needs_pin",
				session: authSession,
				user: googleUser,
				redirectUrl: "/login?step=pin",
			};
		}

		return {
			authorized: true,
			status: "authorized",
			session: authSession,
			user: googleUser,
		};
	}

	return {
		authorized: false,
		status: "unauthenticated",
		session: null,
		user: null,
		redirectUrl: "/login",
	};
}

/**
 * Server Component Route Guard:
 * Call at the top of any page or layout to enforce custom per-page security.
 *
 * Supported single-parameter usage:
 *   await requireAuth("login_only")
 *   await requireAuth("pin_only")
 *   await requireAuth("serial")
 *   await requireAuth("disabled")
 *
 * With optional options:
 *   await requireAuth("pin_only", { redirectTo: "/tasks" })
 *   await requireAuth({ requireAdmin: true, redirectTo: "/admin" })
 *
 * If unauthorized, automatically redirects to /login with the required mode and destination.
 * Returns the verified session and user if authorized.
 */
export async function requireAuth(
	modeParam?: AuthMode | { requireAdmin?: boolean; redirectTo?: string },
	options?: {
		requireAdmin?: boolean;
		redirectTo?: string;
	},
): Promise<{ session: AuthSession | null; user: AuthUser | null }> {
	const mode: AuthMode =
		typeof modeParam === "string" ? modeParam : getAuthMode();

	const effectiveOptions =
		typeof modeParam === "object"
			? modeParam
			: {
					requireAdmin: options?.requireAdmin ?? true,
					redirectTo: options?.redirectTo,
				};

	const result = await checkAuth(mode, effectiveOptions);

	if (!result.authorized) {
		if (result.status === "forbidden") {
			redirect("/unauthorized?message=pending");
			return { session: null, user: null };
		}

		const queryParams = new URLSearchParams();

		if (result.status === "needs_pin") {
			queryParams.set("step", "pin");
		}

		if (typeof modeParam === "string" && modeParam !== "disabled") {
			queryParams.set("mode", modeParam);
		}

		let nextDestination = effectiveOptions?.redirectTo;
		if (!nextDestination) {
			try {
				const headerList = await headers();
				const xPathname =
					headerList?.get?.("x-pathname") || headerList?.get?.("x-invoke-path");
				if (xPathname?.startsWith("/")) {
					nextDestination = xPathname;
				}
			} catch {
				// Ignore if headers() is inaccessible
			}
		}

		if (nextDestination) {
			queryParams.set("next", nextDestination);
		}

		const queryString = queryParams.toString();
		redirect(queryString ? `/login?${queryString}` : "/login");
		return { session: null, user: null };
	}

	return { session: result.session, user: result.user };
}
