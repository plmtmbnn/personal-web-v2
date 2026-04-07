import { Redis } from "@upstash/redis";

/**
 * Centralized Redis client using Upstash.
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Cache keys constants to prevent typos.
 */
export const CACHE_KEYS = {
  STATS: (period: string) => `tasks:analytics:${period}`,
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
