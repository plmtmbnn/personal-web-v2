"use server";

import type { CryptoFearAndGreedResponse, FearAndGreedData } from "./types";

/**
 * Fetch Fear and Greed Index data from CNN
 * Implements robust error handling with fallback mechanisms
 */
export async function getFearAndGreedData(): Promise<FearAndGreedData | null> {
	// Request historical time series starting 30 days ago so Trend Velocity and factor cards have full trend data
	const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
		.toISOString()
		.split("T")[0];
	const url = `https://production.dataviz.cnn.io/index/fearandgreed/graphdata/${startDate}`;

	try {
		const response = await fetch(url, {
			next: { revalidate: 3600 }, // Cache for 1 hour - SSG-like behavior
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
				Accept: "application/json",
			},
		});

		if (!response.ok) {
			console.error(
				`Fear and Greed API error: ${response.status} - ${response.statusText}`,
			);
			return null;
		}

		const data = await response.json();

		// Validate expected structure
		if (!data?.fear_and_greed || !data.fear_and_greed_historical?.data) {
			console.error("Fear and Greed API: Invalid response structure");
			return null;
		}

		return data as FearAndGreedData;
	} catch (error) {
		console.error("Fear and Greed fetch failed:", error);
		return null;
	}
}

/**
 * Fetch Crypto Fear and Greed Index from Alternative.me (Free API, 30 days history)
 */
export async function getCryptoFearAndGreedData(): Promise<CryptoFearAndGreedResponse | null> {
	const url = "https://api.alternative.me/fng/?limit=30";

	try {
		const response = await fetch(url, {
			next: { revalidate: 3600 }, // Cache for 1 hour
			headers: {
				Accept: "application/json",
			},
		});

		if (!response.ok) {
			console.error(
				`Crypto Fear and Greed API error: ${response.status} - ${response.statusText}`,
			);
			return null;
		}

		const data = await response.json();
		if (!data?.data || !Array.isArray(data.data)) {
			console.error("Crypto Fear and Greed API: Invalid response structure");
			return null;
		}

		return data as CryptoFearAndGreedResponse;
	} catch (error) {
		console.error("Crypto Fear and Greed fetch failed:", error);
		return null;
	}
}

/**
 * Fetch both Traditional Market Sentiment and Crypto Sentiment in parallel
 */
export async function getCombinedMarketIntelligence(): Promise<{
	traditional: FearAndGreedData | null;
	crypto: CryptoFearAndGreedResponse | null;
}> {
	const [tradResult, cryptoResult] = await Promise.allSettled([
		getFearAndGreedData(),
		getCryptoFearAndGreedData(),
	]);

	return {
		traditional: tradResult.status === "fulfilled" ? tradResult.value : null,
		crypto: cryptoResult.status === "fulfilled" ? cryptoResult.value : null,
	};
}
