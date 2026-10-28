import {
	buildCsv,
	collectHistoricalTrades,
	RateLimitError,
} from "../../historical-trade/lib/collect";
import type { HistoricalTradeResponse } from "../../historical-trade/types";
import type { MarketDetectorResponse } from "../../market-detector/types";
import type { RunningTradeChartResponse } from "../../running-trade-chart/types";
import type { TradeBook5MResponse } from "../../trade-book-5m/types";
import type { BrokerDistributionResponse } from "../../broker-distribution/types";
import type { SwingScreenerResponse } from "../types";

export interface FeedPayloads {
	historicalCsv?: string | Blob;
	tradeBookJson?: unknown | Blob;
	marketDetectorJson?: unknown | Blob;
	runningTradeChartJson?: unknown | Blob;
	brokerDistributionJson?: unknown | Blob;
}

export function getDefaultDateRange(): { startDate: string; endDate: string } {
	const now = new Date();
	const p = (n: number) => String(n).padStart(2, "0");
	const endDate = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;

	const past = new Date();
	past.setFullYear(now.getFullYear() - 1);
	const startDate = `${past.getFullYear()}-${p(past.getMonth() + 1)}-${p(past.getDate())}`;

	return { startDate, endDate };
}

export async function fetchHistoricalFeed(
	symbol: string,
	baseUrl: string,
	token: string,
	signal?: AbortSignal,
	onProgress?: (pages: number, rows: number) => void,
): Promise<string> {
	const { startDate, endDate } = getDefaultDateRange();

	const fetchPage = async (page: number): Promise<HistoricalTradeResponse> => {
		const res = await fetch("/api/admin/historical-trade", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				baseUrl,
				token,
				symbol,
				period: "HS_PERIOD_DAILY",
				startDate,
				endDate,
				limit: 50,
				page,
			}),
			signal,
		});

		const json = (await res.json().catch(() => null)) as
			| (HistoricalTradeResponse & {
					error?: string;
					retryAfterSeconds?: number;
			  })
			| null;

		if (res.status === 429) {
			const seconds = json?.retryAfterSeconds;
			throw new RateLimitError(
				json?.error ?? "Too Many Requests",
				seconds ? Math.min(seconds, 60) * 1000 : undefined,
			);
		}

		if (!res.ok) {
			throw new Error(json?.error ?? `Historical feed failed (${res.status})`);
		}

		return json as HistoricalTradeResponse;
	};

	const collectRes = await collectHistoricalTrades({
		fetchPage,
		onProgress,
		maxPages: 6,
		signal,
	});

	if (collectRes.error) {
		throw new Error(collectRes.error);
	}

	if (!collectRes.results || collectRes.results.length === 0) {
		throw new Error("No historical trade records returned");
	}

	return buildCsv(collectRes.results);
}

export async function fetchTradeBookFeed(
	symbol: string,
	baseUrl: string,
	token: string,
	signal?: AbortSignal,
): Promise<TradeBook5MResponse> {
	const res = await fetch("/api/admin/trade-book-5m", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			baseUrl,
			token,
			symbol,
			timeInterval: "5m",
			period: "DATE_PICKER_PERIOD_LAST_1_MONTH",
		}),
		signal,
	});

	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(err?.error ?? `Trade-book feed failed (${res.status})`);
	}

	return res.json();
}

export async function fetchMarketDetectorFeed(
	symbol: string,
	baseUrl: string,
	token: string,
	signal?: AbortSignal,
): Promise<MarketDetectorResponse> {
	const res = await fetch("/api/admin/market-detector", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			baseUrl,
			token,
			symbol,
			period: "BROKER_SUMMARY_PERIOD_LAST_3_MONTHS",
			marketBoard: "MARKET_BOARD_REGULER",
			investorType: "INVESTOR_TYPE_ALL",
			transactionType: "TRANSACTION_TYPE_NET",
			limit: 25,
		}),
		signal,
	});

	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(
			err?.error ?? `Market-detector feed failed (${res.status})`,
		);
	}

	return res.json();
}

export async function fetchRunningTradeChartFeed(
	symbol: string,
	baseUrl: string,
	token: string,
	signal?: AbortSignal,
): Promise<RunningTradeChartResponse> {
	const res = await fetch("/api/admin/running-trade-chart", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			baseUrl,
			token,
			symbol,
			period: "RT_PERIOD_LAST_3_MONTHS",
			investorType: "INVESTOR_TYPE_ALL",
			marketBoard: "BOARD_TYPE_REGULAR",
		}),
		signal,
	});

	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(
			err?.error ?? `Running-trade-chart feed failed (${res.status})`,
		);
	}

	return res.json();
}

export async function fetchBrokerDistributionFeed(
	symbol: string,
	baseUrl: string,
	token: string,
	signal?: AbortSignal,
): Promise<BrokerDistributionResponse> {
	const res = await fetch("/api/admin/broker-distribution", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			baseUrl,
			token,
			symbol,
			period: "TB_PERIOD_LAST_3_MONTHS",
			dataType: "BROKER_DISTRIBUTION_DATA_TYPE_VOLUME",
			marketBoard: "MARKET_TYPE_REGULER",
			investorType: "INVESTOR_TYPE_ALL",
		}),
		signal,
	});

	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(
			err?.error ?? `Broker-distribution feed failed (${res.status})`,
		);
	}

	return res.json();
}

export async function executeSwingAnalysis(params: {
	ticker: string;
	feeBuy?: number;
	feeSell?: number;
	apiEndpoint?: string;
	payloads: FeedPayloads;
	signal?: AbortSignal;
}): Promise<SwingScreenerResponse> {
	const formData = new FormData();
	const symbolUpper = params.ticker.trim().toUpperCase();

	formData.append("ticker", symbolUpper);
	formData.append("fee_buy", String(params.feeBuy ?? 0.15));
	formData.append("fee_sell", String(params.feeSell ?? 0.25));

	// 1. Historical File (Required)
	if (params.payloads.historicalCsv) {
		if (params.payloads.historicalCsv instanceof Blob) {
			formData.append(
				"historical_file",
				params.payloads.historicalCsv,
				`historical-trade_${symbolUpper}.csv`,
			);
		} else {
			formData.append(
				"historical_file",
				new Blob([params.payloads.historicalCsv], {
					type: "text/csv;charset=utf-8",
				}),
				`historical-trade_${symbolUpper}.csv`,
			);
		}
	}

	// 2. Trade Book 5M File (Required)
	if (params.payloads.tradeBookJson) {
		if (params.payloads.tradeBookJson instanceof Blob) {
			formData.append(
				"trade_book_file",
				params.payloads.tradeBookJson,
				`trade-book-5m_${symbolUpper}.json`,
			);
		} else {
			const str =
				typeof params.payloads.tradeBookJson === "string"
					? params.payloads.tradeBookJson
					: JSON.stringify(params.payloads.tradeBookJson);
			formData.append(
				"trade_book_file",
				new Blob([str], { type: "application/json;charset=utf-8" }),
				`trade-book-5m_${symbolUpper}.json`,
			);
		}
	}

	// 3. Market Detector File (Optional)
	if (params.payloads.marketDetectorJson) {
		if (params.payloads.marketDetectorJson instanceof Blob) {
			formData.append(
				"market_detector_file",
				params.payloads.marketDetectorJson,
				`market-detector_${symbolUpper}.json`,
			);
		} else {
			const str =
				typeof params.payloads.marketDetectorJson === "string"
					? params.payloads.marketDetectorJson
					: JSON.stringify(params.payloads.marketDetectorJson);
			formData.append(
				"market_detector_file",
				new Blob([str], { type: "application/json;charset=utf-8" }),
				`market-detector_${symbolUpper}.json`,
			);
		}
	}

	// 4. Running Trade Chart File (Optional)
	if (params.payloads.runningTradeChartJson) {
		if (params.payloads.runningTradeChartJson instanceof Blob) {
			formData.append(
				"running_trade_chart_file",
				params.payloads.runningTradeChartJson,
				`running-trade-chart_${symbolUpper}.json`,
			);
		} else {
			const str =
				typeof params.payloads.runningTradeChartJson === "string"
					? params.payloads.runningTradeChartJson
					: JSON.stringify(params.payloads.runningTradeChartJson);
			formData.append(
				"running_trade_chart_file",
				new Blob([str], { type: "application/json;charset=utf-8" }),
				`running-trade-chart_${symbolUpper}.json`,
			);
		}
	}

	// 5. Broker Distribution File (Optional)
	if (params.payloads.brokerDistributionJson) {
		if (params.payloads.brokerDistributionJson instanceof Blob) {
			formData.append(
				"broker_distribution_file",
				params.payloads.brokerDistributionJson,
				`broker-distribution_${symbolUpper}.json`,
			);
		} else {
			const str =
				typeof params.payloads.brokerDistributionJson === "string"
					? params.payloads.brokerDistributionJson
					: JSON.stringify(params.payloads.brokerDistributionJson);
			formData.append(
				"broker_distribution_file",
				new Blob([str], { type: "application/json;charset=utf-8" }),
				`broker-distribution_${symbolUpper}.json`,
			);
		}
	}

	const endpoint =
		params.apiEndpoint ||
		"https://peoel-screener-py.vercel.app/api/v1/analyze-swing";

	const res = await fetch(endpoint, {
		method: "POST",
		body: formData,
		signal: params.signal,
	});

	if (!res.ok) {
		const err = await res.json().catch(() => null);
		const detail =
			err?.detail ||
			err?.message ||
			err?.error ||
			`Swing analysis failed with status ${res.status}`;
		throw new Error(detail);
	}

	return res.json() as Promise<SwingScreenerResponse>;
}
