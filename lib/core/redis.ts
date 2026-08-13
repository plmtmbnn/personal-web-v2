import { Redis } from "@upstash/redis";
import { ENV_GLOBAL } from "@/lib/core/env";

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
interface SessionMetadata {
	userId: string;
	createdAt: number;
	lastRefreshedAt: number;
	expiresAt: number;
}

/**
 * Create a new user session in Redis (30 weeks TTL to match cookie).
 * Also stores metadata for tracking session lifecycle.
 */
export async function createSession(userId: string): Promise<string> {
	const sessionId = crypto.randomUUID();
	const key = CACHE_KEYS.SESSION(sessionId);
	const metaKey = CACHE_KEYS.SESSION_META(sessionId);

	const now = Date.now();
	const ttlSeconds = 604800 * 30; // 30 weeks to match cookie

	const metadata: SessionMetadata = {
		userId,
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
 * Retrieve a userId from session ID.
 */
export async function getSession(sessionId: string): Promise<string | null> {
	try {
		return await redis.get<string>(CACHE_KEYS.SESSION(sessionId));
	} catch (err) {
		console.error("Redis Get Session Error:", err);
		return null;
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
		let metadata: SessionMetadata;

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
				userId,
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
 * Get session metadata for monitoring and debugging.
 */
export async function getSessionMetadata(
	sessionId: string,
): Promise<SessionMetadata | null> {
	try {
		const metaKey = CACHE_KEYS.SESSION_META(sessionId);
		const data = await redis.get<string>(metaKey);

		if (!data) return null;

		return typeof data === "string" ? JSON.parse(data) : data;
	} catch (err) {
		console.error("Redis Get Session Metadata Error:", err);
		return null;
	}
}

/**
 * Delete a session from Redis.
 */
export async function deleteSession(sessionId: string) {
	try {
		await redis.del(CACHE_KEYS.SESSION(sessionId));
	} catch (err) {
		console.error("Redis Delete Session Error:", err);
	}
}
