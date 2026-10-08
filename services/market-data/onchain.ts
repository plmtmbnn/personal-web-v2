import { buildFetchInit, BROWSER_USER_AGENT } from "./http";
import type { FetchPolicy } from "./types";

export interface CryptoOnChainSnapshot {
	mvrvZScore?: number | null;
	nupl?: number | null;
	asOf?: string;
	updatedAt?: number;
}

/**
 * Fetches Bitcoin MVRV (Market Value to Realized Value) ratio
 * from blockchain.info public charts API.
 *
 * Note: While the domain model calls it mvrvZScore for historical reasons,
 * we are fetching the MVRV ratio (which scales differently but represents the same valuation structure).
 * MVRV > 3.7 indicates overheat, MVRV < 1.0 indicates accumulation.
 *
 * Blockchain.com requires `metadata=false` on the chart endpoint, otherwise it returns HTTP 404.
 */
export async function fetchBitcoinMvrv(
	policy: FetchPolicy,
): Promise<number | null> {
	const endpoints = [
		"https://api.blockchain.info/charts/mvrv?timespan=5days&sampled=true&metadata=false&cors=true&format=json",
		"https://api.blockchain.info/charts/mvrv?timespan=30days&sampled=true&metadata=false&cors=true&format=json",
	];

	for (const url of endpoints) {
		try {
			const response = await fetch(
				url,
				buildFetchInit(policy, {
					Accept: "application/json",
					"User-Agent": BROWSER_USER_AGENT,
				}),
			);

			if (!response.ok) {
				console.warn(`Blockchain.info MVRV error (${url}): ${response.status}`);
				continue;
			}

			const data = await response.json();
			const values = data?.values;

			if (Array.isArray(values) && values.length > 0) {
				// Get the last data point
				const lastPoint = values[values.length - 1];
				if (
					lastPoint &&
					typeof lastPoint.y === "number" &&
					Number.isFinite(lastPoint.y) &&
					lastPoint.y > 0
				) {
					return lastPoint.y;
				}
			}
		} catch (error) {
			console.warn("Blockchain.info MVRV fetch failed:", error);
		}
	}

	return null;
}
