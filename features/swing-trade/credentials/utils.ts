import type { MarketCredentials } from "./types";

export function sanitizeMarketCredentials(input: {
	baseUrl: string;
	token: string;
}): MarketCredentials {
	const baseUrl = input.baseUrl.trim().replace(/\/+$/, "");
	const token = input.token.trim();
	return {
		baseUrl,
		token,
		updatedAt: new Date().toISOString(),
	};
}

export function validateMarketCredentials(input: {
	baseUrl: string;
	token: string;
}): { isValid: boolean; error?: string } {
	const trimmedUrl = input.baseUrl.trim();
	const trimmedToken = input.token.trim();

	if (!trimmedUrl) {
		return { isValid: false, error: "Base URL is required" };
	}
	if (!trimmedUrl.startsWith("https://")) {
		return { isValid: false, error: "Base URL must use secure https://" };
	}
	try {
		new URL(trimmedUrl);
	} catch {
		return { isValid: false, error: "Invalid Base URL format" };
	}

	if (!trimmedToken) {
		return { isValid: false, error: "Bearer Token is required" };
	}

	return { isValid: true };
}
