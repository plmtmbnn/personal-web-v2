import {
	completedIdxSession,
	idxEvidence,
	jakartaDate,
	marketEvidence,
	type MarketEvidence,
} from "@/services/market-data/provenance";
import type { RetrievedMarketData } from "@/services/market-data/types";
import type { InvestmentCompassData } from "../types";

const monthlySeries = new Set([
	"FEDFUNDS",
	"CPIAUCSL",
	"PCEPILFE",
	"M2SL",
	"UNRATE",
	"IRSTCB01IDM156N",
	"IRLTLT01IDM156N",
	"IDNCPIALLMINMEI",
]);

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
		const observations = Object.values(evidence);
		const current = observations.filter((item) => item.status === "current");
		const source = data.sources[key];
		data.sources[key] = {
			...source,
			ok: current.length > 0,
			stale: current.length !== observations.length,
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
		Object.entries(markets.quotes).map(([key, quote]) => [
			key,
			observe(
				quote.source,
				quote,
				quote.lastTime,
				key === "BTC" || key === "ETH" ? 0.25 : 4,
			),
		]),
	);
	sources("quotes", quotes);
	sources("vix", quotes.VIX ? { VIX: quotes.VIX } : {});
	sources(
		"fred",
		Object.fromEntries(
			Object.entries(markets.macro).map(([key, series]) => [
				key,
				observe(
					"FRED",
					series,
					series.data.at(-1)?.date,
					monthlySeries.has(key) ? 75 : 7,
				),
			]),
		),
	);
	sources(
		"history",
		Object.fromEntries(
			Object.entries(markets.history ?? {}).map(([key, series]) => [
				key,
				observe(
					"Yahoo Finance",
					series,
					series?.points.at(-1)?.t,
					key === "BTC-USD" ? 2 : 5,
				),
			]),
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
			markets.cryptoFlows,
			markets.cryptoFlows?.stablecoinAsOf,
			3,
		),
	});
	sources("okx", {
		funding: observe(
			markets.cryptoFlows?.fundingProvider ?? "Derivatives",
			markets.cryptoFlows,
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
				Object.entries(markets.macro).filter(([key]) => current("fred", key)),
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
