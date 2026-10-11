"use client";

import { useEffect, useRef, useCallback } from "react";
import { SupabaseConn } from "@/lib/core/supabase";
import { useRouter } from "next/navigation";

/**
 * AuthProvider - Manages automatic token refresh and auth state changes.
 * Wraps root layout to guarantee Supabase & Redis sessions stay fresh
 * with quiet log hygiene, debounced synchronization, and tab-focus refresh.
 */
export default function AuthProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const isSyncingRef = useRef(false);
	const lastSyncTimeRef = useRef(0);

	/**
	 * Synchronizes Redis session with refreshed Supabase token.
	 * Debounced to prevent simultaneous duplicate requests.
	 */
	const syncRedisSession = useCallback(async () => {
		const now = Date.now();
		// Debounce: minimum 10 seconds between sync requests
		if (isSyncingRef.current || now - lastSyncTimeRef.current < 10000) {
			return;
		}

		isSyncingRef.current = true;
		try {
			const res = await fetch("/api/auth/refresh-session", { method: "POST" });
			if (res.ok) {
				lastSyncTimeRef.current = Date.now();
				router.refresh();
			}
		} catch (error) {
			if (process.env.NODE_ENV === "development") {
				console.warn("[AuthProvider] Session sync warning:", error);
			}
		} finally {
			isSyncingRef.current = false;
		}
	}, [router]);

	/**
	 * Checks token expiry and proactively refreshes if less than 5 minutes remain.
	 */
	const checkAndRefresh = useCallback(async () => {
		try {
			const {
				data: { session },
				error,
			} = await SupabaseConn.auth.getSession();

			if (error || !session) return;

			const expiresAt = session.expires_at;
			const now = Math.floor(Date.now() / 1000);
			const timeUntilExpiry = expiresAt ? expiresAt - now : 0;

			// Proactively refresh if < 5 minutes (300 seconds) remain
			if (timeUntilExpiry < 300) {
				const { error: refreshError } =
					await SupabaseConn.auth.refreshSession();

				if (!refreshError) {
					await syncRedisSession();
				}
			}
		} catch {
			// Silently ignore transient network drops
		}
	}, [syncRedisSession]);

	useEffect(() => {
		// Set up auth state change listener
		const {
			data: { subscription },
		} = SupabaseConn.auth.onAuthStateChange(async (event, session) => {
			switch (event) {
				case "SIGNED_OUT":
					router.push("/login");
					break;

				case "TOKEN_REFRESHED":
					await syncRedisSession();
					break;

				case "SIGNED_IN":
					if (session) {
						await syncRedisSession();
					}
					break;

				default:
					break;
			}
		});

		// Proactive check on tab visibility change (e.g. user unlocks device or focuses tab)
		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				checkAndRefresh();
			}
		};

		const handleWindowFocus = () => {
			checkAndRefresh();
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		window.addEventListener("focus", handleWindowFocus);

		// Manual token refresh check every 5 minutes
		const refreshInterval = setInterval(checkAndRefresh, 5 * 60 * 1000);

		// Cleanup listeners and timers
		return () => {
			subscription.unsubscribe();
			clearInterval(refreshInterval);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			window.removeEventListener("focus", handleWindowFocus);
		};
	}, [router, checkAndRefresh, syncRedisSession]);

	return <>{children}</>;
}
