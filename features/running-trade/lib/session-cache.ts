import type { TradeBookData } from "@/features/trade-book/types";
import type { RunningTrade } from "../types";
import type { TapeAnalyzerResponse } from "../types/tape-analyzer";

interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

const tradesCache = new Map<string, CacheEntry<RunningTrade[]>>();
const tradeBookCache = new Map<string, CacheEntry<TradeBookData>>();
const analysisCache = new Map<string, CacheEntry<TapeAnalyzerResponse>>();

// Cache expiration: 15 minutes
const TTL_MS = 15 * 60 * 1000;

function cleanKey(symbol: string): string {
	return symbol.trim().toUpperCase();
}

function getValid<T>(map: Map<string, CacheEntry<T>>, key: string): T | null {
	const entry = map.get(key);
	if (!entry) return null;
	if (Date.now() - entry.timestamp > TTL_MS) {
		map.delete(key);
		return null;
	}
	return entry.data;
}

export function getSessionTrades(symbol: string): RunningTrade[] | null {
	return getValid(tradesCache, cleanKey(symbol));
}

export function setSessionTrades(symbol: string, trades: RunningTrade[]): void {
	if (trades.length === 0) return;
	tradesCache.set(cleanKey(symbol), { data: trades, timestamp: Date.now() });
}

export function getSessionTradeBook(symbol: string): TradeBookData | null {
	return getValid(tradeBookCache, cleanKey(symbol));
}

export function setSessionTradeBook(symbol: string, data: TradeBookData): void {
	tradeBookCache.set(cleanKey(symbol), { data, timestamp: Date.now() });
}

export function getSessionAnalysis(
	symbol: string,
): TapeAnalyzerResponse | null {
	return getValid(analysisCache, cleanKey(symbol));
}

export function setSessionAnalysis(
	symbol: string,
	res: TapeAnalyzerResponse,
): void {
	analysisCache.set(cleanKey(symbol), { data: res, timestamp: Date.now() });
}

export function hasSessionData(symbol: string): {
	hasTrades: boolean;
	hasTradeBook: boolean;
	hasAnalysis: boolean;
} {
	const k = cleanKey(symbol);
	return {
		hasTrades: getSessionTrades(k) !== null,
		hasTradeBook: getSessionTradeBook(k) !== null,
		hasAnalysis: getSessionAnalysis(k) !== null,
	};
}
