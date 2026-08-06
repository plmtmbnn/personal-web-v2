import { cookies } from "next/headers";
import { refreshSession } from "@/lib/core/redis";

/**
 * Refresh the Redis session TTL when Supabase token is refreshed.
 * Call this after successful token refresh to keep Redis session in sync.
 */
export async function syncSessionRefresh(): Promise<boolean> {
	try {
		const cookieStore = await cookies();
		const sessionId = cookieStore.get("app_session")?.value;

		if (!sessionId) {
			console.warn("[Auth Utils] No app_session cookie found for refresh");
			return false;
		}

		const refreshed = await refreshSession(sessionId);

		if (refreshed) {
			console.log("[Auth Utils] Redis session synced with token refresh");
		} else {
			console.warn("[Auth Utils] Failed to refresh Redis session");
		}

		return refreshed;
	} catch (error) {
		console.error("[Auth Utils] Error syncing session refresh:", error);
		return false;
	}
}

/**
 * Get current session ID from cookies.
 */
export async function getCurrentSessionId(): Promise<string | null> {
	try {
		const cookieStore = await cookies();
		return cookieStore.get("app_session")?.value || null;
	} catch (error) {
		console.error("[Auth Utils] Error getting session ID:", error);
		return null;
	}
}
