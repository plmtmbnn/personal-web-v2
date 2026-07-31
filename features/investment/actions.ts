"use server";

import type { FearAndGreedData } from "./types";

/**
 * Fetch Fear and Greed Index data from CNN
 * Implements robust error handling with fallback mechanisms
 */
export async function getFearAndGreedData(): Promise<FearAndGreedData | null> {
	const today = new Date().toISOString().split("T")[0];
	const url = `https://production.dataviz.cnn.io/index/fearandgreed/graphdata/${today}`;

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
