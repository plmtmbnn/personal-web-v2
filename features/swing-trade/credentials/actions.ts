"use server";

import { checkAdmin } from "@/features/auth/actions";
import { CACHE_KEYS, redis } from "@/lib/core/redis";
import { assertSafeExternalUrl } from "@/lib/server/url-security";
import type { MarketCredentials, MarketCredentialsStatus } from "./types";
import {
	sanitizeMarketCredentials,
	toMarketCredentialStatus,
	validateMarketCredentials,
} from "./utils";

export async function getMarketCredentialsAction(): Promise<MarketCredentialsStatus | null> {
	const isAdmin = await checkAdmin();
	if (!isAdmin) return null;

	try {
		const raw = await redis.get(CACHE_KEYS.MARKET_CREDENTIALS);
		if (!raw) return null;
		const parsed: MarketCredentials =
			typeof raw === "string" ? JSON.parse(raw) : (raw as MarketCredentials);
		return toMarketCredentialStatus(parsed);
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
	credentials?: MarketCredentialsStatus;
}> {
	const isAdmin = await checkAdmin();
	if (!isAdmin) {
		return { success: false, error: "Unauthorized" };
	}

	const validation = validateMarketCredentials(input);
	if (!validation.isValid) {
		return { success: false, error: validation.error };
	}
	try {
		await assertSafeExternalUrl(input.baseUrl.trim());
	} catch {
		return { success: false, error: "Base URL must use a public hostname" };
	}

	const sanitized = sanitizeMarketCredentials(input);

	try {
		await redis.set(CACHE_KEYS.MARKET_CREDENTIALS, JSON.stringify(sanitized));
		return { success: true, credentials: toMarketCredentialStatus(sanitized) };
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
