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
};

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
 * Create a new user session in Redis (7 days TTL).
 */
export async function createSession(userId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  const key = CACHE_KEYS.SESSION(sessionId);
  
  // Store userId as value, TTL = 7 days (604800 seconds)
  await redis.set(key, userId, { ex: 604800 });
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
 * Delete a session from Redis.
 */
export async function deleteSession(sessionId: string) {
  try {
    await redis.del(CACHE_KEYS.SESSION(sessionId));
  } catch (err) {
    console.error("Redis Delete Session Error:", err);
  }
}
