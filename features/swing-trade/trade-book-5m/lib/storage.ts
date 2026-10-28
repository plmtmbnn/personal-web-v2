import {
	DEFAULT_TRADE_BOOK_5M_SETTINGS,
	type TradeBook5MSettings,
} from "../types";

export const TRADE_BOOK_5M_STORAGE_KEY = "trade-book-5m:settings";
const MARKET_DETECTOR_KEY = "market-detector:settings";
const HISTORICAL_KEY = "historical-trade:settings";
const RUNNING_KEY = "running-trade:settings";

export function readTradeBook5MSettings(): TradeBook5MSettings {
	if (typeof window === "undefined") {
		return DEFAULT_TRADE_BOOK_5M_SETTINGS;
	}

	try {
		const raw = localStorage.getItem(TRADE_BOOK_5M_STORAGE_KEY);
		if (raw) {
			return { ...DEFAULT_TRADE_BOOK_5M_SETTINGS, ...JSON.parse(raw) };
		}

		// Fallback pre-fill from existing settings keys
		for (const key of [MARKET_DETECTOR_KEY, HISTORICAL_KEY, RUNNING_KEY]) {
			const existing = localStorage.getItem(key);
			if (existing) {
				const parsed = JSON.parse(existing);
				if (parsed.baseUrl || parsed.token) {
					return {
						...DEFAULT_TRADE_BOOK_5M_SETTINGS,
						baseUrl: parsed.baseUrl || "",
						token: parsed.token || "",
					};
				}
			}
		}

		return DEFAULT_TRADE_BOOK_5M_SETTINGS;
	} catch {
		return DEFAULT_TRADE_BOOK_5M_SETTINGS;
	}
}

export function saveTradeBook5MSettings(settings: TradeBook5MSettings): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(TRADE_BOOK_5M_STORAGE_KEY, JSON.stringify(settings));
	} catch {}
}
