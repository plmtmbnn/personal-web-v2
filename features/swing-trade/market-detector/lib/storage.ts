import {
	DEFAULT_MARKET_DETECTOR_SETTINGS,
	type MarketDetectorSettings,
} from "../types";

export const MARKET_DETECTOR_STORAGE_KEY = "market-detector:settings";
const HISTORICAL_STORAGE_KEY = "historical-trade:settings";
const RUNNING_STORAGE_KEY = "running-trade:settings";

export function readMarketDetectorSettings(): MarketDetectorSettings {
	if (typeof window === "undefined") {
		return DEFAULT_MARKET_DETECTOR_SETTINGS;
	}

	try {
		const raw = localStorage.getItem(MARKET_DETECTOR_STORAGE_KEY);
		if (raw) {
			return { ...DEFAULT_MARKET_DETECTOR_SETTINGS, ...JSON.parse(raw) };
		}

		// Fallback pre-fill from existing settings keys
		const histRaw = localStorage.getItem(HISTORICAL_STORAGE_KEY);
		if (histRaw) {
			const histParsed = JSON.parse(histRaw);
			if (histParsed.baseUrl || histParsed.token) {
				return {
					...DEFAULT_MARKET_DETECTOR_SETTINGS,
					baseUrl: histParsed.baseUrl || "",
					token: histParsed.token || "",
				};
			}
		}

		const runningRaw = localStorage.getItem(RUNNING_STORAGE_KEY);
		if (runningRaw) {
			const runParsed = JSON.parse(runningRaw);
			return {
				...DEFAULT_MARKET_DETECTOR_SETTINGS,
				baseUrl: runParsed.baseUrl || "",
				token: runParsed.token || "",
			};
		}

		return DEFAULT_MARKET_DETECTOR_SETTINGS;
	} catch {
		return DEFAULT_MARKET_DETECTOR_SETTINGS;
	}
}

export function saveMarketDetectorSettings(
	settings: MarketDetectorSettings,
): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(MARKET_DETECTOR_STORAGE_KEY, JSON.stringify(settings));
	} catch {}
}
