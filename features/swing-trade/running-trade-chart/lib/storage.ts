import {
	DEFAULT_RUNNING_TRADE_CHART_SETTINGS,
	type RunningTradeChartSettings,
} from "../types";

export const RUNNING_TRADE_CHART_STORAGE_KEY = "running-trade-chart:settings";
const TB5M_KEY = "trade-book-5m:settings";
const MARKET_DETECTOR_KEY = "market-detector:settings";
const HISTORICAL_KEY = "historical-trade:settings";
const RUNNING_KEY = "running-trade:settings";

export function readRunningTradeChartSettings(): RunningTradeChartSettings {
	if (typeof window === "undefined") {
		return DEFAULT_RUNNING_TRADE_CHART_SETTINGS;
	}

	try {
		const raw = localStorage.getItem(RUNNING_TRADE_CHART_STORAGE_KEY);
		if (raw) {
			return { ...DEFAULT_RUNNING_TRADE_CHART_SETTINGS, ...JSON.parse(raw) };
		}

		// Fallback pre-fill from existing settings keys
		for (const key of [
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
						...DEFAULT_RUNNING_TRADE_CHART_SETTINGS,
						baseUrl: parsed.baseUrl || "",
						token: parsed.token || "",
					};
				}
			}
		}

		return DEFAULT_RUNNING_TRADE_CHART_SETTINGS;
	} catch {
		return DEFAULT_RUNNING_TRADE_CHART_SETTINGS;
	}
}

export function saveRunningTradeChartSettings(
	settings: RunningTradeChartSettings,
): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(
			RUNNING_TRADE_CHART_STORAGE_KEY,
			JSON.stringify(settings),
		);
	} catch {}
}
