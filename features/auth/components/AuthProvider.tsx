"use client";

import { useEffect } from "react";
import { SupabaseConn } from "@/lib/core/supabase";
import { useRouter } from "next/navigation";

/**
 * AuthProvider - Manages automatic token refresh and auth state changes
 * Should wrap admin/protected pages to ensure sessions stay fresh
 */
export default function AuthProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();

	useEffect(() => {
		// Set up auth state change listener
		const {
			data: { subscription },
		} = SupabaseConn.auth.onAuthStateChange(async (event, _session) => {
			console.log("[AuthProvider] Auth event:", event);

			// Handle different auth events
			switch (event) {
				case "SIGNED_OUT":
					console.log("[AuthProvider] User signed out, redirecting to login");
					router.push("/login");
					break;

				case "TOKEN_REFRESHED":
					console.log("[AuthProvider] Token refreshed successfully");
					// Sync Redis session with refreshed token
					try {
						await fetch("/api/auth/refresh-session", { method: "POST" });
						console.log("[AuthProvider] Redis session synced");
					} catch (error) {
						console.error(
							"[AuthProvider] Failed to sync Redis session:",
							error,
						);
					}
					// Refresh the page to update server-side session
					router.refresh();
					break;

				case "USER_UPDATED":
					console.log("[AuthProvider] User data updated");
					break;

				case "SIGNED_IN":
					console.log("[AuthProvider] User signed in");
					break;

				default:
					break;
			}
		});

		// Manual token refresh check every 5 minutes
		const refreshInterval = setInterval(
			async () => {
				const {
					data: { session },
					error,
				} = await SupabaseConn.auth.getSession();

				if (error) {
					console.error("[AuthProvider] Error checking session:", error);
					return;
				}

				if (!session) {
					console.warn("[AuthProvider] No active session found");
					return;
				}

				// Check if token is close to expiration (within 5 minutes)
				const expiresAt = session.expires_at;
				const now = Math.floor(Date.now() / 1000);
				const timeUntilExpiry = expiresAt ? expiresAt - now : 0;

				if (timeUntilExpiry < 300) {
					// Less than 5 minutes
					console.log("[AuthProvider] Token expiring soon, refreshing...");
					const { error: refreshError } =
						await SupabaseConn.auth.refreshSession();

					if (refreshError) {
						console.error("[AuthProvider] Token refresh failed:", refreshError);
					} else {
						console.log("[AuthProvider] Token refreshed proactively");
						// Sync Redis session
						try {
							await fetch("/api/auth/refresh-session", { method: "POST" });
							console.log("[AuthProvider] Redis session synced");
						} catch (syncError) {
							console.error(
								"[AuthProvider] Failed to sync Redis session:",
								syncError,
							);
						}
						router.refresh(); // Update server-side state
					}
				}
			},
			5 * 60 * 1000,
		); // Check every 5 minutes

		// Cleanup
		return () => {
			subscription.unsubscribe();
			clearInterval(refreshInterval);
		};
	}, [router]);

	return <>{children}</>;
}
