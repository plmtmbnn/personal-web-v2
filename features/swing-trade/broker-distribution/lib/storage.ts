import {
	DEFAULT_BROKER_DISTRIBUTION_SETTINGS,
	type BrokerDistributionSettings,
} from "../types";

export const BROKER_DISTRIBUTION_STORAGE_KEY = "broker-distribution:settings";
const RT_KEY = "running-trade-chart:settings";
const TB5M_KEY = "trade-book-5m:settings";
const MARKET_DETECTOR_KEY = "market-detector:settings";
const HISTORICAL_KEY = "historical-trade:settings";
const RUNNING_KEY = "running-trade:settings";

export function readBrokerDistributionSettings(): BrokerDistributionSettings {
	if (typeof window === "undefined") {
		return DEFAULT_BROKER_DISTRIBUTION_SETTINGS;
	}

	try {
		const raw = localStorage.getItem(BROKER_DISTRIBUTION_STORAGE_KEY);
		if (raw) {
			return { ...DEFAULT_BROKER_DISTRIBUTION_SETTINGS, ...JSON.parse(raw) };
		}

		// Fallback pre-fill from existing settings keys
		for (const key of [
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
						...DEFAULT_BROKER_DISTRIBUTION_SETTINGS,
						baseUrl: parsed.baseUrl || "",
						token: parsed.token || "",
					};
				}
			}
		}

		return DEFAULT_BROKER_DISTRIBUTION_SETTINGS;
	} catch {
		return DEFAULT_BROKER_DISTRIBUTION_SETTINGS;
	}
}

export function saveBrokerDistributionSettings(
	settings: BrokerDistributionSettings,
): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(
			BROKER_DISTRIBUTION_STORAGE_KEY,
			JSON.stringify(settings),
		);
	} catch {}
}
