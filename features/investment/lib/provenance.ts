import {
	completedIdxSession,
	idxEvidence,
	jakartaDate,
	marketEvidence,
	monthlyPeriodEnd,
	type MarketEvidence,
} from "@/services/market-data/provenance";
import type { RetrievedMarketData } from "@/services/market-data/types";
import type { InvestmentCompassData } from "../types";
import { INSTRUMENTS } from "../data/instruments";
import {
	FRED_SERIES,
	DOMESTIC_SERIES,
	HISTORY_SYMBOLS,
} from "@/services/market-data/registry";

export function applyMarketProvenance(data: InvestmentCompassData) {
	const { markets, fetchedAt } = data;
	const observe = (
		provider: string,
		item: RetrievedMarketData | null | undefined,
		date: string | number | null | undefined,
		ageDays: number,
	) =>
		marketEvidence(
			provider,
			item?.origin ?? "unknown",
			date,
			fetchedAt,
			ageDays,
			item?.retrievedAt,
		);
	const sources = (key: string, evidence: Record<string, MarketEvidence>) => {
		for (const [id, item] of Object.entries(evidence)) {
			if (item.status !== "current")
				item.reason =
					data.fetchFailures?.[id] ?? data.fetchFailures?.[key] ?? item.reason;
		}
		const observations = Object.values(evidence);
		const current = observations.filter((item) => item.status === "current");
		const source = data.sources[key];
		data.sources[key] = {
			...source,
			label: source?.label ?? key,
			ok: current.length > 0,
			stale: current.length !== observations.length,
			status:
				current.length === observations.length && observations.length > 0
					? "current"
					: current.length > 0
						? "partial"
						: observations.some((item) => item.status === "stale")
							? "stale"
							: "unavailable",
			evidence,
		};
	};
	const idxSeries = markets.history?.["^JKSE"]?.points ?? [];
	const indexDate = idxSeries
		.flatMap(({ t }) => {
			const date = completedIdxSession(jakartaDate(t * 1000), fetchedAt);
			return date ? [date] : [];
		})
		.at(-1);
	const idx = markets.ihsgFlows;
	const flow = idxEvidence(
		idx?.asOf ?? null,
		fetchedAt,
		idx?.origin ?? "unknown",
		indexDate,
		idx?.retrievedAt,
	);
	const quotes = Object.fromEntries(
		INSTRUMENTS.map(({ id: key }) => {
			const quote = markets.quotes[key];
			return [
				key,
				observe(
					quote?.source ?? "CNBC / Yahoo",
					quote,
					quote?.lastTime,
					key === "BTC" || key === "ETH" ? 0.25 : 4,
				),
			];
		}),
	);
	sources("quotes", quotes);
	sources("vix", quotes.VIX ? { VIX: quotes.VIX } : {});
	sources(
		"fred",
		Object.fromEntries(
			FRED_SERIES.map(({ id: key, maxAgeDays, frequency }) => {
				const series = markets.macro[key];
				const date = series?.data.at(-1)?.date;
				const periodEnd =
					frequency === "Monthly" ? monthlyPeriodEnd(date) : undefined;
				const original = observe("FRED", series, date, maxAgeDays);
				const evidence =
					periodEnd &&
					original.status !== "invalid" &&
					periodEnd <= fetchedAt.slice(0, 10)
						? {
								...observe("FRED", series, periodEnd, maxAgeDays),
								asOf: original.asOf,
								periodEnd,
							}
						: original;
				return [key, evidence];
			}),
		),
	);
	sources(
		"indonesiaMacro",
		Object.fromEntries(
			DOMESTIC_SERIES.map((key) => {
				const series = markets.macro[key];
				return [
					key,
					observe(
						series?.provider ?? "Bank Indonesia",
						series,
						series?.observationPeriodEnd ?? series?.data.at(-1)?.date,
						series?.provider === "BIS" ? 7 : 75,
					),
				];
			}),
		),
	);
	sources(
		"history",
		Object.fromEntries(
			HISTORY_SYMBOLS.map((key) => {
				const series = markets.history?.[key];
				return [
					key,
					observe(
						"Yahoo Finance",
						series,
						series?.points.at(-1)?.t,
						key === "BTC-USD" ? 2 : 5,
					),
				];
			}),
		),
	);
	sources("cryptoFng", {
		sentiment: observe(
			"Alternative.me",
			null,
			Number(data.sentiment.crypto?.data[0]?.timestamp) || null,
			2,
		),
	});
	sources("coingecko", {
		global: observe(
			"CoinGecko",
			markets.cryptoGlobal,
			markets.cryptoGlobal?.updatedAt,
			1,
		),
	});
	sources("defillama", {
		supply: observe(
			"DefiLlama",
			markets.cryptoFlows
				? {
						origin:
							markets.cryptoFlows.stablecoinOrigin ??
							markets.cryptoFlows.origin,
						retrievedAt: markets.cryptoFlows.stablecoinRetrievedAt,
					}
				: null,
			markets.cryptoFlows?.stablecoinAsOf,
			3,
		),
	});
	sources("okx", {
		funding: observe(
			markets.cryptoFlows?.fundingProvider ?? "Derivatives",
			markets.cryptoFlows
				? {
						origin:
							markets.cryptoFlows.fundingOrigin ?? markets.cryptoFlows.origin,
						retrievedAt: markets.cryptoFlows.fundingRetrievedAt,
					}
				: null,
			markets.cryptoFlows?.fundingAsOf,
			0.5,
		),
	});
	sources("onchain", {
		valuation: observe(
			"Blockchain.com",
			markets.cryptoOnChain,
			markets.cryptoOnChain?.asOf,
			4,
		),
	});
	sources("idxFlows", { session: flow });
	if (idx && flow.status !== "current") idx.topAlphaPicks = [];
}

export function currentMarketInputs(
	data: InvestmentCompassData,
): InvestmentCompassData {
	if (!data.sources.quotes?.evidence) return data;
	const current = (source: string, item: string) =>
		data.sources[source]?.evidence?.[item]?.status === "current";
	const { markets, sentiment } = data;
	return {
		...data,
		sentiment: {
			...sentiment,
			vix: current("quotes", "VIX") ? sentiment.vix : null,
			crypto: current("cryptoFng", "sentiment") ? sentiment.crypto : null,
		},
		markets: {
			quotes: Object.fromEntries(
				Object.entries(markets.quotes).filter(([key]) =>
					current("quotes", key),
				),
			),
			macro: Object.fromEntries(
				Object.entries(markets.macro).filter(([key]) =>
					current(
						DOMESTIC_SERIES.includes(key as (typeof DOMESTIC_SERIES)[number])
							? "indonesiaMacro"
							: "fred",
						key,
					),
				),
			),
			history: Object.fromEntries(
				Object.entries(markets.history ?? {}).filter(([key]) =>
					current("history", key),
				),
			),
			cryptoGlobal: current("coingecko", "global")
				? markets.cryptoGlobal
				: null,
			cryptoFlows: markets.cryptoFlows
				? {
						...markets.cryptoFlows,
						totalStablecoinSupplyUsd: current("defillama", "supply")
							? markets.cryptoFlows.totalStablecoinSupplyUsd
							: null,
						stablecoin30dChangePct: current("defillama", "supply")
							? markets.cryptoFlows.stablecoin30dChangePct
							: null,
						btcFundingRate8hPct: current("okx", "funding")
							? markets.cryptoFlows.btcFundingRate8hPct
							: null,
						btcOpenInterestUsd: current("okx", "funding")
							? markets.cryptoFlows.btcOpenInterestUsd
							: null,
					}
				: null,
			cryptoOnChain: current("onchain", "valuation")
				? markets.cryptoOnChain
				: null,
			ihsgFlows: current("idxFlows", "session") ? markets.ihsgFlows : null,
		},
	};
}
