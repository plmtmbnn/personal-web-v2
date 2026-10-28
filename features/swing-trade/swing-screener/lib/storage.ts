import {
	DEFAULT_SWING_SCREENER_SETTINGS,
	type SwingScreenerSettings,
} from "../types";

export const SWING_SCREENER_STORAGE_KEY = "swing-screener:settings";
const BD_KEY = "broker-distribution:settings";
const RT_KEY = "running-trade-chart:settings";
const TB5M_KEY = "trade-book-5m:settings";
const MARKET_DETECTOR_KEY = "market-detector:settings";
const HISTORICAL_KEY = "historical-trade:settings";
const RUNNING_KEY = "running-trade:settings";

export function readSwingScreenerSettings(): SwingScreenerSettings {
	if (typeof window === "undefined") {
		return DEFAULT_SWING_SCREENER_SETTINGS;
	}

	try {
		const raw = localStorage.getItem(SWING_SCREENER_STORAGE_KEY);
		if (raw) {
			return { ...DEFAULT_SWING_SCREENER_SETTINGS, ...JSON.parse(raw) };
		}

		// Fallback pre-fill from existing settings keys
		for (const key of [
			BD_KEY,
			RT_KEY,
			TB5M_KEY,
			MARKET_DETECTOR_KEY,
			HISTORICAL_KEY,
			RUNNING_KEY,
		]) {
			const existing = localStorage.getItem(key);
			if (existing) {
				const parsed = JSON.parse(existing);
				if (parsed.baseUrl || parsed.token) {
					return {
						...DEFAULT_SWING_SCREENER_SETTINGS,
						baseUrl: parsed.baseUrl || "",
						token: parsed.token || "",
					};
				}
			}
		}

		return DEFAULT_SWING_SCREENER_SETTINGS;
	} catch {
		return DEFAULT_SWING_SCREENER_SETTINGS;
	}
}

export function saveSwingScreenerSettings(
	settings: SwingScreenerSettings,
): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(SWING_SCREENER_STORAGE_KEY, JSON.stringify(settings));
	} catch {}
}
