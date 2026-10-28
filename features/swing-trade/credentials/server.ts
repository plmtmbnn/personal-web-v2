import { CACHE_KEYS, redis } from "@/lib/core/redis";
import type { MarketCredentials } from "./types";

/**
 * Resolves credentials with Redis fallback when omitted in the request body.
 */
export async function resolveMarketCredentials(
	bodyBaseUrl?: string,
	bodyToken?: string,
): Promise<{ baseUrl: string; token: string } | null> {
	const trimmedUrl = bodyBaseUrl?.trim();
	const trimmedToken = bodyToken?.trim();

	if (trimmedUrl && trimmedToken) {
		return {
			baseUrl: trimmedUrl.replace(/\/+$/, ""),
			token: trimmedToken,
		};
	}

	try {
		const raw = await redis.get(CACHE_KEYS.MARKET_CREDENTIALS);
		if (!raw) return null;
		const creds: MarketCredentials =
			typeof raw === "string" ? JSON.parse(raw) : (raw as MarketCredentials);
		if (creds.baseUrl && creds.token) {
			return {
				baseUrl: (trimmedUrl || creds.baseUrl).replace(/\/+$/, ""),
				token: trimmedToken || creds.token,
			};
		}
	} catch (error) {
		console.error("Failed to resolve market credentials from Redis:", error);
	}

	return null;
}
