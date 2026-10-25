import type { TradeBookResponse } from "@/features/trade-book/types";
import {
	DEFAULT_TAPE_ANALYZER_SETTINGS,
	type TapeAnalyzerResponse,
	type TapeAnalyzerSettings,
} from "../types/tape-analyzer";

const TAPE_ANALYZER_STORAGE_KEY = "tape-analyzer:settings";
const RUNNING_TRADE_STORAGE_KEY = "running-trade:settings";
const TRADE_BOOK_STORAGE_KEY = "trade-book:settings";

export function readTapeAnalyzerSettings(): TapeAnalyzerSettings {
	if (typeof window === "undefined") {
		return DEFAULT_TAPE_ANALYZER_SETTINGS;
	}

	try {
		const rawTa = localStorage.getItem(TAPE_ANALYZER_STORAGE_KEY);
		const ta = rawTa ? JSON.parse(rawTa) : null;

		const rawRt = localStorage.getItem(RUNNING_TRADE_STORAGE_KEY);
		const rt = rawRt ? JSON.parse(rawRt) : {};

		const rawTb = localStorage.getItem(TRADE_BOOK_STORAGE_KEY);
		const tb = rawTb ? JSON.parse(rawTb) : {};

		const baseUrl = (ta?.baseUrl || rt?.baseUrl || tb?.baseUrl || "").trim();
		const token = (ta?.token || rt?.token || tb?.token || "").trim();
		const symbol = (ta?.symbol || rt?.symbol || tb?.symbol || "").trim();

		return {
			baseUrl,
			token,
			symbol,
			feeBuy: typeof ta?.feeBuy === "number" ? ta.feeBuy : 0.15,
			feeSell: typeof ta?.feeSell === "number" ? ta.feeSell : 0.25,
			blockMode: ta?.blockMode === "fixed" ? "fixed" : "adaptive",
			apiEndpoint:
				ta?.apiEndpoint || DEFAULT_TAPE_ANALYZER_SETTINGS.apiEndpoint,
		};
	} catch {
		return DEFAULT_TAPE_ANALYZER_SETTINGS;
	}
}

export function saveTapeAnalyzerSettings(
	settings: Partial<TapeAnalyzerSettings>,
): void {
	if (typeof window === "undefined") return;

	try {
		const current = readTapeAnalyzerSettings();
		const updated = { ...current, ...settings };
		localStorage.setItem(TAPE_ANALYZER_STORAGE_KEY, JSON.stringify(updated));

		// Synchronize base credentials with other tabs
		if (settings.baseUrl !== undefined || settings.token !== undefined) {
			const rawRt = localStorage.getItem(RUNNING_TRADE_STORAGE_KEY);
			const rt = rawRt ? JSON.parse(rawRt) : {};
			localStorage.setItem(
				RUNNING_TRADE_STORAGE_KEY,
				JSON.stringify({
					...rt,
					baseUrl: updated.baseUrl,
					token: updated.token,
					symbol: updated.symbol,
				}),
			);
		}
	} catch {
		// Ignore storage quota or disabled storage
	}
}

export async function fetchTradeBookData(params: {
	baseUrl: string;
	token: string;
	symbol: string;
	signal?: AbortSignal;
}): Promise<TradeBookResponse["data"]> {
	const res = await fetch("/api/admin/trade-book", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			baseUrl: params.baseUrl.trim(),
			token: params.token.trim(),
			symbol: params.symbol.trim(),
		}),
		signal: params.signal,
	});

	const json = (await res.json().catch(() => null)) as
		| (TradeBookResponse & { error?: string })
		| null;

	if (!res.ok) {
		throw new Error(json?.error ?? `Trade-book request failed (${res.status})`);
	}

	if (!json?.data) {
		throw new Error("No trade book data returned from upstream");
	}

	return json.data;
}

export async function executeTapeAnalysis(params: {
	tradesCsv: string | Blob;
	tradeBookJson: unknown | Blob;
	ticker: string;
	feeBuy?: number;
	feeSell?: number;
	blockMode?: "adaptive" | "fixed";
	apiEndpoint?: string;
	signal?: AbortSignal;
}): Promise<TapeAnalyzerResponse> {
	const formData = new FormData();

	// Append CSV Blob
	if (params.tradesCsv instanceof Blob) {
		formData.append(
			"trades_file",
			params.tradesCsv,
			`running-trade_${params.ticker.toUpperCase()}.csv`,
		);
	} else {
		const csvBlob = new Blob([params.tradesCsv], {
			type: "text/csv;charset=utf-8",
		});
		formData.append(
			"trades_file",
			csvBlob,
			`running-trade_${params.ticker.toUpperCase()}.csv`,
		);
	}

	// Append JSON Blob
	if (params.tradeBookJson instanceof Blob) {
		formData.append(
			"book_file",
			params.tradeBookJson,
			`trade-book_${params.ticker.toUpperCase()}.json`,
		);
	} else {
		const jsonString =
			typeof params.tradeBookJson === "string"
				? params.tradeBookJson
				: JSON.stringify(params.tradeBookJson);
		const jsonBlob = new Blob([jsonString], {
			type: "application/json;charset=utf-8",
		});
		formData.append(
			"book_file",
			jsonBlob,
			`trade-book_${params.ticker.toUpperCase()}.json`,
		);
	}

	formData.append("ticker", params.ticker.toUpperCase());
	if (params.blockMode) formData.append("block_mode", params.blockMode);
	if (params.feeBuy !== undefined)
		formData.append("fee_buy", String(params.feeBuy));
	if (params.feeSell !== undefined)
		formData.append("fee_sell", String(params.feeSell));

	const endpoint =
		params.apiEndpoint || DEFAULT_TAPE_ANALYZER_SETTINGS.apiEndpoint;

	const res = await fetch(endpoint, {
		method: "POST",
		body: formData,
		signal: params.signal,
	});

	if (!res.ok) {
		const errJson = await res.json().catch(() => null);
		const detail =
			errJson?.detail ||
			errJson?.message ||
			errJson?.error ||
			`Server responded with ${res.status}`;
		throw new Error(detail);
	}

	return res.json() as Promise<TapeAnalyzerResponse>;
}
