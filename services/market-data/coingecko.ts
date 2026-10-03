import { buildFetchInit } from "./http";
import type { CryptoGlobalSnapshot, FetchPolicy } from "./types";

interface CoinGeckoGlobalResponse {
	data?: {
		total_market_cap?: Record<string, number>;
		total_volume?: Record<string, number>;
		market_cap_percentage?: Record<string, number>;
		market_cap_change_percentage_24h_usd?: number;
		updated_at?: number;
	};
}

/**
 * Normalises the CoinGecko `/global` payload. Returns null when
 * mandatory aggregates (market cap, BTC dominance) are missing.
 */
export function normalizeCoinGeckoGlobal(
	body: CoinGeckoGlobalResponse,
): CryptoGlobalSnapshot | null {
	const data = body?.data;
	const totalMarketCapUsd = data?.total_market_cap?.usd;
	const btcDominance = data?.market_cap_percentage?.btc;
	if (
		typeof totalMarketCapUsd !== "number" ||
		typeof btcDominance !== "number"
	) {
		return null;
	}

	return {
		totalMarketCapUsd,
		totalVolumeUsd: data?.total_volume?.usd ?? 0,
		marketCapChange24hPct: data?.market_cap_change_percentage_24h_usd ?? 0,
		btcDominance,
		ethDominance: data?.market_cap_percentage?.eth ?? 0,
		updatedAt: data?.updated_at ?? Math.floor(Date.now() / 1000),
	};
}

/**
 * Fetches global crypto market aggregates (free tier, no API key).
 */
export async function fetchCryptoGlobal(
	policy: FetchPolicy,
): Promise<CryptoGlobalSnapshot | null> {
	const response = await fetch(
		"https://api.coingecko.com/api/v3/global",
		buildFetchInit(policy, { Accept: "application/json" }),
	);

	if (!response.ok) {
		throw new Error(`CoinGecko global error: ${response.status}`);
	}

	return normalizeCoinGeckoGlobal(
		(await response.json()) as CoinGeckoGlobalResponse,
	);
}
