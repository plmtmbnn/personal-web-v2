"use server";

import type { LfcFixtureResponse } from "./types";

export interface GetFixturesResult {
	upcoming: LfcFixtureResponse[];
	played: LfcFixtureResponse[];
	lastUpdated: string;
	error?: string;
}

/**
 * Fetch Liverpool FC fixtures from official REST API
 * Separates matches into upcoming fixtures and played results
 */
export async function getLiverpoolFixtures(
	seasonYear = 2026,
): Promise<GetFixturesResult> {
	const url = `https://backend.liverpoolfc.com/lfc-rest-api/fixtures?sort=asc&teamSlug=mens&seasonYear=${seasonYear}`;

	try {
		const response = await fetch(url, {
			next: { revalidate: 3600 }, // Cache for 1 hour
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
				Accept: "application/json",
			},
		});

		if (!response.ok) {
			console.error(
				`Liverpool FC API error: ${response.status} - ${response.statusText}`,
			);
			return {
				upcoming: [],
				played: [],
				lastUpdated: new Date().toISOString(),
				error: `API error: ${response.statusText || response.status}`,
			};
		}

		const rawData = await response.json();

		if (!Array.isArray(rawData)) {
			console.error(
				"Liverpool FC API: Invalid response format, expected array",
			);
			return {
				upcoming: [],
				played: [],
				lastUpdated: new Date().toISOString(),
				error: "Invalid data format from API",
			};
		}

		const allItems = rawData as LfcFixtureResponse[];

		// Upcoming fixtures (Fixture, TBC, etc. != 'Played') sorted ascending (nearest upcoming first)
		const upcoming = allItems
			.filter((item) => item?.matchData?.status !== "Played")
			.sort((a, b) => {
				const dateA = new Date(a?.matchData?.date || "").getTime();
				const dateB = new Date(b?.matchData?.date || "").getTime();
				return dateA - dateB;
			});

		// Played fixtures sorted descending (most recent results first)
		const played = allItems
			.filter((item) => item?.matchData?.status === "Played")
			.sort((a, b) => {
				const dateA = new Date(a?.matchData?.date || "").getTime();
				const dateB = new Date(b?.matchData?.date || "").getTime();
				return dateB - dateA;
			});

		return {
			upcoming,
			played,
			lastUpdated: new Date().toISOString(),
		};
	} catch (error) {
		console.error("Liverpool FC fixtures fetch failed:", error);
		return {
			upcoming: [],
			played: [],
			lastUpdated: new Date().toISOString(),
			error:
				error instanceof Error ? error.message : "Failed to fetch fixtures",
		};
	}
}
