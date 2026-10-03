import { ENV_GLOBAL } from "@/lib/core/env";
import { buildFetchInit, BROWSER_USER_AGENT } from "./http";
import type { FetchPolicy, MacroSeries } from "./types";

const FRED_API_URL = "https://api.stlouisfed.org/fred/series/observations";

export async function fetchFredSeries(
	seriesId: string,
	policy: FetchPolicy,
): Promise<MacroSeries | null> {
	const apiKey = ENV_GLOBAL.FRED_API_KEY;
	if (!apiKey) {
		console.warn("[FRED] Missing FRED_API_KEY in environment variables.");
		return null;
	}

	// We only need the last ~2 years of data to show trends
	const observationStart = new Date();
	observationStart.setFullYear(observationStart.getFullYear() - 2);
	const observationStartStr = observationStart.toISOString().split("T")[0];

	const url = new URL(FRED_API_URL);
	url.searchParams.set("series_id", seriesId);
	url.searchParams.set("api_key", apiKey);
	url.searchParams.set("file_type", "json");
	url.searchParams.set("observation_start", observationStartStr);
	url.searchParams.set("sort_order", "asc"); // We want chronological order

	try {
		const res = await fetch(
			url.toString(),
			buildFetchInit(policy, {
				Accept: "application/json",
				"User-Agent": BROWSER_USER_AGENT,
			}),
		);

		if (!res.ok) {
			console.error(`[FRED] API returned ${res.status} for series ${seriesId}`);
			return null;
		}

		const data = await res.json();
		if (!data?.observations || !Array.isArray(data.observations)) {
			console.error(`[FRED] Invalid response structure for series ${seriesId}`);
			return null;
		}

		// Filter out invalid observations (FRED sometimes returns "." for missing data)
		const validObs = data.observations
			.filter((obs: any) => obs.value && obs.value !== ".")
			.map((obs: any) => ({
				date: obs.date,
				value: Number(obs.value),
			}));

		return {
			id: seriesId,
			name: seriesId, // We could fetch series details separately if we needed actual names
			frequency: "Daily", // This would also need series details, defaulting to Daily
			units: "Unknown", // Default
			data: validObs,
		};
	} catch (e) {
		console.error(`[FRED] Fetch failed for series ${seriesId}:`, e);
		return null;
	}
}
