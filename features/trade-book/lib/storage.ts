import { DEFAULT_TRADE_BOOK_SETTINGS, type TradeBookSettings } from "../types";

const TRADE_BOOK_STORAGE_KEY = "trade-book:settings";
const RUNNING_TRADE_STORAGE_KEY = "running-trade:settings";

interface StoredRunningTrade {
	baseUrl?: string;
	token?: string;
	symbol?: string;
}

export function readTradeBookSettings(): TradeBookSettings {
	if (typeof window === "undefined") {
		return DEFAULT_TRADE_BOOK_SETTINGS;
	}

	try {
		const rawTb = localStorage.getItem(TRADE_BOOK_STORAGE_KEY);
		const tb = rawTb ? JSON.parse(rawTb) : null;

		const rawRt = localStorage.getItem(RUNNING_TRADE_STORAGE_KEY);
		const rt: StoredRunningTrade = rawRt ? JSON.parse(rawRt) : {};

		const baseUrl = (tb?.baseUrl || rt?.baseUrl || "").trim();
		const token = (tb?.token || rt?.token || "").trim();
		const symbol = (tb?.symbol || rt?.symbol || "").trim();
		const actionMode =
			tb?.actionMode === "json"
				? "json"
				: DEFAULT_TRADE_BOOK_SETTINGS.actionMode;

		return {
			baseUrl,
			token,
			symbol,
			actionMode,
		};
	} catch {
		return DEFAULT_TRADE_BOOK_SETTINGS;
	}
}

export function saveTradeBookSettings(settings: TradeBookSettings): void {
	if (typeof window === "undefined") return;

	try {
		localStorage.setItem(TRADE_BOOK_STORAGE_KEY, JSON.stringify(settings));

		// Keep connection credentials synchronized with running-trade settings
		const rawRt = localStorage.getItem(RUNNING_TRADE_STORAGE_KEY);
		const rt = rawRt ? JSON.parse(rawRt) : {};
		localStorage.setItem(
			RUNNING_TRADE_STORAGE_KEY,
			JSON.stringify({
				...rt,
				baseUrl: settings.baseUrl,
				token: settings.token,
			}),
		);
	} catch {
		// Ignore storage quota or disabled errors
	}
}
