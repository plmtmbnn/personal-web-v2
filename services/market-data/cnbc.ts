import { BROWSER_USER_AGENT, buildFetchInit, parseNumeric } from "./http";
import type { FetchPolicy, MarketQuote } from "./types";

const CNBC_ENDPOINT =
	"https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol";

export interface CnbcRawQuote {
	symbol?: string;
	code?: number | string;
	name?: string;
	shortName?: string;
	onAirName?: string;
	last?: string;
	change?: string;
	change_pct?: string;
	open?: string;
	high?: string;
	low?: string;
	previous_day_closing?: string;
	yrhiprice?: string;
	yrloprice?: string;
	currencyCode?: string;
	last_time?: string;
	curmktstatus?: string;
}

/**
 * Normalises a raw CNBC quote. Returns null for unresolved symbols
 * (non-zero `code`) or quotes without a parseable last price.
 */
export function normalizeCnbcQuote(raw: CnbcRawQuote): MarketQuote | null {
	if (!raw?.symbol || Number(raw.code) !== 0) return null;
	const last = parseNumeric(raw.last);
	if (last === null) return null;

	return {
		symbol: raw.symbol,
		name: raw.onAirName || raw.name || raw.shortName || raw.symbol,
		last,
		change: parseNumeric(raw.change),
		changePct: parseNumeric(raw.change_pct),
		open: parseNumeric(raw.open),
		high: parseNumeric(raw.high),
		low: parseNumeric(raw.low),
		previousClose: parseNumeric(raw.previous_day_closing),
		high52w: parseNumeric(raw.yrhiprice),
		low52w: parseNumeric(raw.yrloprice),
		currency: raw.currencyCode ?? null,
		lastTime: raw.last_time ?? null,
		marketStatus: raw.curmktstatus ?? null,
		source: "cnbc",
	};
}

/**
 * Batch-fetches quotes from the CNBC quote webservice (server-side only).
 * Covers global indices, futures, FX, treasury yields, and crypto spot.
 * Throws on transport/structure failure so callers can fall back.
 */
export async function fetchCnbcQuotes(
	symbols: readonly string[],
	policy: FetchPolicy,
): Promise<Map<string, MarketQuote>> {
	const result = new Map<string, MarketQuote>();
	if (symbols.length === 0) return result;

	const params = new URLSearchParams({
		symbols: symbols.join("|"),
		requestMethod: "itv",
		noform: "1",
		partnerId: "2",
		fund: "1",
		exthrs: "1",
		output: "json",
		events: "1",
	});

	const response = await fetch(
		`${CNBC_ENDPOINT}?${params.toString()}`,
		buildFetchInit(policy, {
			Referer: "https://www.cnbc.com/",
			"User-Agent": BROWSER_USER_AGENT,
			Accept: "application/json, text/plain, */*",
		}),
	);

	if (!response.ok) {
		throw new Error(`CNBC quote error: ${response.status}`);
	}

	const body = (await response.json()) as {
		FormattedQuoteResult?: { FormattedQuote?: CnbcRawQuote[] };
	};
	const quotes = body?.FormattedQuoteResult?.FormattedQuote;
	if (!Array.isArray(quotes)) {
		throw new Error("CNBC quote: invalid response structure");
	}

	for (const raw of quotes) {
		const quote = normalizeCnbcQuote(raw);
		if (quote) result.set(quote.symbol, quote);
	}

	return result;
}
