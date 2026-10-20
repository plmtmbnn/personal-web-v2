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
	STOCK_TICKER_HISTORY_10D: "idx:ticker:history:10d",
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
 * Retrieve the rolling 10-trading-day per-ticker ring buffer from Redis.
 */
export async function getTickerHistoryRingBuffer(): Promise<Record<
	string,
	Record<
		string,
		{
			c: number;
			h: number;
			l: number;
			v: number;
			val: number;
			f: number;
			fn: number;
		}
	>
> | null> {
	try {
		const raw = await redis.get(CACHE_KEYS.STOCK_TICKER_HISTORY_10D);
		if (!raw) return null;
		return typeof raw === "string" ? JSON.parse(raw) : (raw as any);
	} catch (error) {
		console.warn("Redis Get Ticker History 10D Error:", error);
		return null;
	}
}

/**
 * Updates the rolling 10-trading-day per-ticker ring buffer in Redis
 * when a valid weekday trading session payload is received.
 */
export async function updateTickerHistoryRingBuffer(stocks: any[]) {
	try {
		if (!stocks || !Array.isArray(stocks) || stocks.length === 0) return null;

		let sessionDateStr = "";
		const rawPayloadDate = stocks[0]?.Date;
		if (rawPayloadDate && typeof rawPayloadDate === "string") {
			const clean = rawPayloadDate.split("T")[0];
			if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
				sessionDateStr = clean;
			}
		}

		const now = new Date();
		const wibFormatter = new Intl.DateTimeFormat("en-US", {
			timeZone: "Asia/Jakarta",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "numeric",
			hour12: false,
		});
		const parts = wibFormatter.formatToParts(now);
		const currentYear = parts.find((p) => p.type === "year")?.value;
		const currentMonth = parts.find((p) => p.type === "month")?.value;
		const currentDay = parts.find((p) => p.type === "day")?.value;
		const currentWibDateStr = `${currentYear}-${currentMonth}-${currentDay}`;
		const wibHour = parseInt(
			parts.find((p) => p.type === "hour")?.value ?? "0",
			10,
		);

		if (!sessionDateStr) {
			sessionDateStr = currentWibDateStr;
		}

		const isToday = sessionDateStr === currentWibDateStr;
		const isSessionActiveOrClosed = !isToday || wibHour >= 9;
		const sessionDayOfWeek = new Date(
			`${sessionDateStr}T12:00:00Z`,
		).getUTCDay();
		const isTradingDay =
			sessionDayOfWeek !== 0 &&
			sessionDayOfWeek !== 6 &&
			isSessionActiveOrClosed;

		let ringBuffer = (await getTickerHistoryRingBuffer()) || {};

		// Prune any weekend dates
		for (const d of Object.keys(ringBuffer)) {
			const dow = new Date(`${d}T12:00:00Z`).getUTCDay();
			if (dow === 0 || dow === 6) {
				delete ringBuffer[d];
			}
		}

		if (isTradingDay) {
			const daySnapshot: Record<
				string,
				{
					c: number;
					h: number;
					l: number;
					v: number;
					val: number;
					f: number;
					fn: number;
				}
			> = {};

			for (const stock of stocks) {
				if (!stock?.StockCode) continue;
				const vwap =
					stock.Volume > 0
						? stock.Value / stock.Volume
						: stock.Close || stock.Previous || 0;
				const isForeignNominal = stock.ForeignBuy > stock.Volume * 5;
				const foreignNetVol = isForeignNominal
					? vwap > 0
						? Math.round((stock.ForeignBuy - stock.ForeignSell) / vwap)
						: 0
					: (stock.ForeignBuy || 0) - (stock.ForeignSell || 0);
				const foreignNet = isForeignNominal
					? (stock.ForeignBuy || 0) - (stock.ForeignSell || 0)
					: Math.round(foreignNetVol * vwap);

				daySnapshot[stock.StockCode] = {
					c: stock.Close || 0,
					h: stock.High || stock.Close || 0,
					l: stock.Low || stock.Close || 0,
					v: stock.Volume || 0,
					val: stock.Value || 0,
					f: stock.Frequency || 0,
					fn: foreignNet,
				};
			}

			ringBuffer[sessionDateStr] = daySnapshot;

			const sortedDates = Object.keys(ringBuffer).sort((a, b) =>
				a > b ? -1 : 1,
			);
			if (sortedDates.length > 10) {
				const pruned: typeof ringBuffer = {};
				for (let i = 0; i < 10; i++) {
					pruned[sortedDates[i]] = ringBuffer[sortedDates[i]];
				}
				ringBuffer = pruned;
			}

			await redis.set(
				CACHE_KEYS.STOCK_TICKER_HISTORY_10D,
				JSON.stringify(ringBuffer),
			);
		}

		return ringBuffer;
	} catch (error) {
		console.warn("Redis Update Ticker History 10D Error:", error);
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
