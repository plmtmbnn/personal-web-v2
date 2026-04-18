"use server";

import type { FearAndGreedData } from "./types";

/**
 * Fetch Fear and Greed Index data from CNN
 */
export async function getFearAndGreedData(): Promise<FearAndGreedData | null> {
	const today = new Date().toISOString().split("T")[0];
	const url = `https://production.dataviz.cnn.io/index/fearandgreed/graphdata/${today}`;

	try {
		const response = await fetch(url, {
			next: { revalidate: 3600 }, // Cache for 1 hour
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
			},
		});

		if (!response.ok) {
			console.error(`Fear and Greed API error: ${response.status}`);
			return null;
		}

		const data = await response.json();
		return data as FearAndGreedData;
	} catch (error) {
		console.error("Fear and Greed fetch failed:", error);
		return null;
	}
}
