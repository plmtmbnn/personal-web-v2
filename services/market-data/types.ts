/**
 * Shared market data contracts used by all provider clients.
 * Provider-agnostic so features can swap or combine sources freely.
 */

export type QuoteSource = "cnbc" | "yahoo";

export interface MarketQuote {
	/** Provider symbol the quote was resolved from (e.g. ".SPX", "^JKSE"). */
	symbol: string;
	name: string;
	last: number | null;
	change: number | null;
	changePct: number | null;
	open: number | null;
	high: number | null;
	low: number | null;
	previousClose: number | null;
	high52w: number | null;
	low52w: number | null;
	currency: string | null;
	/** Provider-supplied last trade date (ISO date or raw provider string). */
	lastTime: string | null;
	marketStatus: string | null;
	source: QuoteSource;
}

export interface CryptoGlobalSnapshot {
	totalMarketCapUsd: number;
	totalVolumeUsd: number;
	marketCapChange24hPct: number;
	btcDominance: number;
	ethDominance: number;
	/** Unix timestamp (seconds). */
	updatedAt: number;
}

export interface MacroObservation {
	date: string;
	value: number;
}

export interface MacroSeries {
	id: string;
	name: string;
	frequency: string;
	units: string;
	data: MacroObservation[];
}

export interface PricePoint {
	t: number;
	c: number;
}

export interface PriceHistorySeries {
	symbol: string;
	interval: string;
	points: PricePoint[];
}

export interface CryptoFlowsSnapshot {
	totalStablecoinSupplyUsd: number | null;
	stablecoin30dChangePct: number | null;
	btcFundingRate8hPct: number | null;
	btcOpenInterestUsd: number | null;
	updatedAt: number;
}

/**
 * Fetch caching policy.
 * - `revalidate`: Next.js data cache lifetime in seconds (ISR-friendly).
 * - `fresh`: bypass the data cache entirely (manual refresh).
 */
export interface FetchPolicy {
	revalidate?: number;
	fresh?: boolean;
}
