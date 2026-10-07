import { BROWSER_USER_AGENT, buildFetchInit } from "./http";
import type { FetchPolicy, MarketQuote } from "./types";

interface YahooChartMeta {
	symbol?: string;
	shortName?: string;
	longName?: string;
	currency?: string;
	regularMarketPrice?: number;
	chartPreviousClose?: number;
	previousClose?: number;
	regularMarketChange?: number;
	regularMarketChangePercent?: number;
	fulldayChange?: number;
	fulldayChangePercent?: number;
	regularMarketDayHigh?: number;
	regularMarketDayLow?: number;
	fiftyTwoWeekHigh?: number;
	fiftyTwoWeekLow?: number;
	regularMarketTime?: number;
}

const finite = (value: unknown): number | null =>
	typeof value === "number" && Number.isFinite(value) ? value : null;

/**
 * Normalises Yahoo chart metadata into a MarketQuote.
 * Prefers explicit change and percentage figures provided by Yahoo,
 * falling back to calculated differences against previous close.
 */
export function normalizeYahooMeta(
	meta: YahooChartMeta,
	requestedSymbol: string,
): MarketQuote | null {
	const last = finite(meta?.regularMarketPrice);
	if (last === null) return null;

	// Prefer official market change metrics reported by Yahoo Finance
	const explicitChange =
		finite(meta.regularMarketChange) ?? finite(meta.fulldayChange);
	const explicitChangePct =
		finite(meta.regularMarketChangePercent) ??
		finite(meta.fulldayChangePercent);

	const previousClose =
		finite(meta.previousClose) ??
		(explicitChange !== null ? last - explicitChange : null) ??
		finite(meta.chartPreviousClose);

	const change =
		explicitChange !== null
			? explicitChange
			: previousClose !== null
				? last - previousClose
				: null;

	const changePct =
		explicitChangePct !== null
			? explicitChangePct
			: previousClose && change !== null
				? (change / previousClose) * 100
				: null;

	return {
		symbol: meta.symbol || requestedSymbol,
		name: meta.shortName || meta.longName || requestedSymbol,
		last,
		change,
		changePct,
		open: null,
		high: finite(meta.regularMarketDayHigh),
		low: finite(meta.regularMarketDayLow),
		previousClose,
		high52w: finite(meta.fiftyTwoWeekHigh),
		low52w: finite(meta.fiftyTwoWeekLow),
		currency: meta.currency ?? null,
		lastTime: meta.regularMarketTime
			? new Date(meta.regularMarketTime * 1000).toISOString().split("T")[0]
			: null,
		marketStatus: null,
		source: "yahoo",
	};
}

/**
 * Single-symbol fallback via Yahoo Finance chart endpoint.
 * Used for instruments CNBC does not resolve (e.g. IHSG `^JKSE`).
 */
export async function fetchYahooQuote(
	symbol: string,
	policy: FetchPolicy,
): Promise<MarketQuote | null> {
	const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
		symbol,
	)}?range=1d&interval=1d`;

	const response = await fetch(
		url,
		buildFetchInit(policy, {
			"User-Agent": BROWSER_USER_AGENT,
			Accept: "application/json",
		}),
	);

	if (!response.ok) {
		throw new Error(`Yahoo chart error for ${symbol}: ${response.status}`);
	}

	const body = (await response.json()) as {
		chart?: { result?: Array<{ meta?: YahooChartMeta }> };
	};
	const meta = body?.chart?.result?.[0]?.meta;
	return meta ? normalizeYahooMeta(meta, symbol) : null;
}
