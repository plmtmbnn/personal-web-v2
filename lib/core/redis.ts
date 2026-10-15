import { Redis } from "@upstash/redis";
import { ENV_GLOBAL } from "@/lib/core/env";
import type { AuthMode, AuthSession } from "@/features/auth/types";
export type { AuthSession } from "@/features/auth/types";

/**
 * Centralized Redis client using Upstash.
 */
export const redis = new Redis({
	url: ENV_GLOBAL.UPSTASH_REDIS_REST_URL!,
	token: ENV_GLOBAL.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Cache keys constants.
 */
export const CACHE_KEYS = {
	STATS: (period: string) => `tasks:analytics:${period}`,
	SESSION: (sessionId: string) => `session:${sessionId}`,
	SESSION_META: (sessionId: string) => `session:meta:${sessionId}`,
	STOCK_SUMMARY: "idx:stock-summary",
	STOCK_SUMMARY_BACKUP: "idx:stock-summary:backup",
	LFC_FIXTURES: "liverpool:fixtures:upcoming",
	MARKET_QUOTES: "compass:quotes:live",
	MARKET_QUOTES_BACKUP: "compass:quotes:backup",
	CRYPTO_GLOBAL: "compass:crypto:global",
	CRYPTO_GLOBAL_BACKUP: "compass:crypto:backup",
	MACRO_FRED: "compass:macro:fred",
	MACRO_FRED_BACKUP: "compass:macro:fred:backup",
	MARKET_HISTORY: (symbol: string, interval: string) =>
		`compass:history:${symbol}:${interval}`,
	MARKET_HISTORY_BACKUP: (symbol: string, interval: string) =>
		`compass:history:${symbol}:${interval}:backup`,
	CRYPTO_FLOWS: "compass:crypto:flows",
	CRYPTO_FLOWS_BACKUP: "compass:crypto:flows:backup",
	CRYPTO_ONCHAIN: "compass:crypto:onchain",
	CRYPTO_ONCHAIN_BACKUP: "compass:crypto:onchain:backup",
	COMPASS_SNAPSHOT: (date: string) => `compass:snapshot:${date}`,
	MOVEMENT_STATE: "admin:movement:state",
};

/**
 * Save stock data to Redis (12 hours TTL + perpetual backup).
 */
export async function saveStockData(data: any[], ttlSeconds = 43200) {
	try {
		const key = CACHE_KEYS.STOCK_SUMMARY;
		const backupKey = CACHE_KEYS.STOCK_SUMMARY_BACKUP;
		const value = JSON.stringify(data);
		// Save primary with 12h TTL and backup key indefinitely
		await Promise.all([
			redis.set(key, value, { ex: ttlSeconds }),
			redis.set(backupKey, value),
		]);
		return true;
	} catch (error) {
		console.error("Redis Save Stock Error:", error);
		return false;
	}
}

/**
 * Retrieve stock data from Redis (checks primary cache first, then backup).
 */
export async function getStockData(): Promise<any[] | null> {
	try {
		const key = CACHE_KEYS.STOCK_SUMMARY;
		const backupKey = CACHE_KEYS.STOCK_SUMMARY_BACKUP;
		let data = await redis.get<string>(key);
		if (!data) {
			data = await redis.get<string>(backupKey);
		}
		if (!data) return null;
		return typeof data === "string" ? JSON.parse(data) : data;
	} catch (error) {
		console.error("Redis Get Stock Error:", error);
		return null;
	}
}

/**
 * Invalidate all analytics cache keys.
 */
export async function invalidateStatsCache() {
	try {
		const keys = ["today", "week", "month"].map(CACHE_KEYS.STATS);
		await redis.del(...keys);
	} catch (error) {
		console.error("Redis Invalidation Error:", error);
	}
}

/**
 * Session metadata interface
 */
export type SessionMetadata = AuthSession;

/**
 * Create a new user session in Redis (30 weeks TTL to match cookie).
 * Also stores metadata for tracking session lifecycle and auth factor progress.
 */
export async function createSession(
	userId: string,
	options?: {
		email?: string;
		name?: string;
		avatarUrl?: string;
		isAdmin?: boolean;
		googleAuthenticated?: boolean;
		pinAuthenticated?: boolean;
		mode?: AuthMode;
	},
): Promise<string> {
	const sessionId = crypto.randomUUID();
	const key = CACHE_KEYS.SESSION(sessionId);
	const metaKey = CACHE_KEYS.SESSION_META(sessionId);

	const now = Date.now();
	const ttlSeconds = 604800 * 30; // 30 weeks to match cookie

	const metadata: AuthSession = {
		sessionId,
		userId,
		email: options?.email,
		name: options?.name,
		avatarUrl: options?.avatarUrl,
		isAdmin: options?.isAdmin ?? true,
		googleAuthenticated: options?.googleAuthenticated ?? false,
		pinAuthenticated: options?.pinAuthenticated ?? false,
		mode:
			options?.mode ??
			(options?.googleAuthenticated && options?.pinAuthenticated
				? "serial"
				: options?.pinAuthenticated
					? "pin_only"
					: "login_only"),
		createdAt: now,
		lastRefreshedAt: now,
		expiresAt: now + ttlSeconds * 1000,
	};

	// Store both userId and metadata with same TTL
	await Promise.all([
		redis.set(key, userId, { ex: ttlSeconds }),
		redis.set(metaKey, JSON.stringify(metadata), { ex: ttlSeconds }),
	]);

	return sessionId;
}

/**
 * Retrieve verified AuthSession from Redis metadata.
 */
export async function getAuthSession(
	sessionId: string,
): Promise<AuthSession | null> {
	try {
		const key = CACHE_KEYS.SESSION(sessionId);
		const metaKey = CACHE_KEYS.SESSION_META(sessionId);

		const [rawMeta, userId] = await Promise.all([
			redis.get<string | AuthSession>(metaKey),
			redis.get<string>(key),
		]);

		if (!rawMeta && !userId) {
			return null;
		}

		if (rawMeta) {
			const parsed: AuthSession =
				typeof rawMeta === "string" ? JSON.parse(rawMeta) : rawMeta;
			return parsed;
		}

		// Fallback for legacy sessions without structured metadata
		if (userId) {
			const now = Date.now();
			return {
				sessionId,
				userId,
				isAdmin: true,
				googleAuthenticated: true,
				pinAuthenticated: false,
				mode: "login_only",
				createdAt: now,
				lastRefreshedAt: now,
				expiresAt: now + 604800 * 30 * 1000,
			};
		}

		return null;
	} catch (err) {
		console.error("[Redis] getAuthSession Error:", err);
		return null;
	}
}

/**
 * Mark PIN authentication as verified for an existing session.
 */
export async function updateSessionPinAuth(
	sessionId: string,
): Promise<boolean> {
	try {
		const session = await getAuthSession(sessionId);
		if (!session) {
			console.warn(
				"[Redis] Cannot update PIN auth for non-existent session:",
				sessionId,
			);
			return false;
		}

		const now = Date.now();
		const ttlSeconds = 604800 * 30; // 30 weeks

		session.pinAuthenticated = true;
		session.lastRefreshedAt = now;
		session.expiresAt = now + ttlSeconds * 1000;

		const key = CACHE_KEYS.SESSION(sessionId);
		const metaKey = CACHE_KEYS.SESSION_META(sessionId);

		await Promise.all([
			redis.expire(key, ttlSeconds),
			redis.set(metaKey, JSON.stringify(session), { ex: ttlSeconds }),
		]);

		return true;
	} catch (err) {
		console.error("[Redis] updateSessionPinAuth Error:", err);
		return false;
	}
}

/**
 * Refresh session TTL to extend its lifetime (called on token refresh).
 * Extends both session and metadata by 30 weeks from now.
 */
export async function refreshSession(sessionId: string): Promise<boolean> {
	try {
		const key = CACHE_KEYS.SESSION(sessionId);
		const metaKey = CACHE_KEYS.SESSION_META(sessionId);

		// Check if session exists
		const userId = await redis.get<string>(key);
		if (!userId) {
			console.warn("[Redis] Cannot refresh non-existent session:", sessionId);
			return false;
		}

		const now = Date.now();
		const ttlSeconds = 604800 * 30; // 30 weeks

		// Get existing metadata
		const existingMeta = await redis.get<string>(metaKey);
		let metadata: AuthSession;

		if (existingMeta) {
			const parsed =
				typeof existingMeta === "string"
					? JSON.parse(existingMeta)
					: existingMeta;
			metadata = {
				...parsed,
				lastRefreshedAt: now,
				expiresAt: now + ttlSeconds * 1000,
			};
		} else {
			// Recreate metadata if missing
			metadata = {
				sessionId,
				userId,
				isAdmin: true,
				googleAuthenticated: true,
				pinAuthenticated: false,
				mode: "login_only",
				createdAt: now,
				lastRefreshedAt: now,
				expiresAt: now + ttlSeconds * 1000,
			};
		}

		// Extend TTL for both session and metadata
		await Promise.all([
			redis.expire(key, ttlSeconds),
			redis.set(metaKey, JSON.stringify(metadata), { ex: ttlSeconds }),
		]);

		console.log("[Redis] Session refreshed:", sessionId);
		return true;
	} catch (err) {
		console.error("Redis Refresh Session Error:", err);
		return false;
	}
}

/**
 * Delete a session from Redis (removes both primary key and metadata).
 */
export async function deleteSession(sessionId: string) {
	try {
		await Promise.all([
			redis.del(CACHE_KEYS.SESSION(sessionId)),
			redis.del(CACHE_KEYS.SESSION_META(sessionId)),
		]);
	} catch (err) {
		console.error("Redis Delete Session Error:", err);
	}
}
