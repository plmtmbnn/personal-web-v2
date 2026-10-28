"use server";

import { checkAdmin } from "@/features/auth/actions";
import { CACHE_KEYS, redis } from "@/lib/core/redis";
import type { MarketCredentials } from "./types";
import { sanitizeMarketCredentials, validateMarketCredentials } from "./utils";

export async function getMarketCredentialsAction(): Promise<MarketCredentials | null> {
	const isAdmin = await checkAdmin();
	if (!isAdmin) return null;

	try {
		const raw = await redis.get(CACHE_KEYS.MARKET_CREDENTIALS);
		if (!raw) return null;
		const parsed: MarketCredentials =
			typeof raw === "string" ? JSON.parse(raw) : (raw as MarketCredentials);
		return parsed;
	} catch (error) {
		console.error("Failed to fetch market credentials from Redis:", error);
		return null;
	}
}

export async function saveMarketCredentialsAction(input: {
	baseUrl: string;
	token: string;
}): Promise<{
	success: boolean;
	error?: string;
	credentials?: MarketCredentials;
}> {
	const isAdmin = await checkAdmin();
	if (!isAdmin) {
		return { success: false, error: "Unauthorized" };
	}

	const validation = validateMarketCredentials(input);
	if (!validation.isValid) {
		return { success: false, error: validation.error };
	}

	const sanitized = sanitizeMarketCredentials(input);

	try {
		await redis.set(CACHE_KEYS.MARKET_CREDENTIALS, JSON.stringify(sanitized));
		return { success: true, credentials: sanitized };
	} catch (error) {
		console.error("Failed to save market credentials to Redis:", error);
		return { success: false, error: "Failed to persist credentials in Redis" };
	}
}

export async function clearMarketCredentialsAction(): Promise<{
	success: boolean;
}> {
	const isAdmin = await checkAdmin();
	if (!isAdmin) return { success: false };

	try {
		await redis.del(CACHE_KEYS.MARKET_CREDENTIALS);
		return { success: true };
	} catch (error) {
		console.error("Failed to clear market credentials from Redis:", error);
		return { success: false };
	}
}
