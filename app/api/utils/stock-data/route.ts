import { z } from "zod";
import { type NextRequest, NextResponse } from "next/server";
import {
	getStockData,
	saveStockData,
	getTickerHistoryRingBuffer,
	updateTickerHistoryRingBuffer,
	redis,
} from "@/lib/core/redis";
import { FALLBACK_IDX_STOCKS } from "@/features/utils/stock-tools/stock-explorer/data/fallbackData";
import { getCachedInvestmentCompass } from "@/features/investment/actions";
import type { CompassBridgeSummary } from "@/features/utils/stock-tools/stock-explorer/types";
import { PEOEL_STOCK_SUMMARY_URL } from "@/services/market-data/idx-flows";

export const dynamic = "force-dynamic";

const FETCH_ATTEMPT_KEY = "idx:last-fetch-attempt";

// Schema for validating query parameters
const stockDataQuerySchema = z
	.object({
		limit: z.coerce.number().optional(),
		offset: z.coerce.number().optional().default(0),
	})
	.partial();

export async function GET(request: NextRequest) {
	try {
		// Validate query parameters
		const url = new URL(request.url);
		const queryParams = {
			limit: url.searchParams.get("limit") || undefined,
			offset: url.searchParams.get("offset") || undefined,
		};
		const parsedQuery = stockDataQuerySchema.safeParse(queryParams);

		if (!parsedQuery.success) {
			return NextResponse.json(
				{
					error: "Invalid query parameters",
					details: parsedQuery.error.format(),
				},
				{ status: 400 },
			);
		}

		// 1. Check query for force refresh
		const forceRefresh = url.searchParams.get("refresh") === "true";

		// 2. Prioritize retrieving data from Redis (checks main cache key then backup key)
		let data = await getStockData();
		let source = data && data.length > 0 ? "redis" : "none";

		// 3. Determine if external API call to IDX is needed
		const shouldFetch = forceRefresh || !data || data.length === 0;

		// 4. Perform fetch from screener proxy only if Redis is empty or forceRefresh is true
		if (shouldFetch) {
			try {
				console.log(
					"Redis cache empty or force refresh requested. Attempting fetch from screener proxy...",
				);

				let body: any = null;

				try {
					const res = await fetch(PEOEL_STOCK_SUMMARY_URL, {
						headers: {
							Accept: "application/json",
						},
						signal: AbortSignal.timeout(15000),
					});

					if (res.ok) {
						body = (await res.json()) as any;
					}
				} catch (fetchErr: any) {
					console.warn(
						"peoel-screener-py fetch failed in stock-data:",
						fetchErr?.message || fetchErr,
					);
				}

				if (body && Array.isArray(body.data) && body.data.length > 0) {
					// Store to Redis (12h TTL + backup key)
					await saveStockData(body.data, 43200);
					data = body.data;
					source = "idx_live";
					console.log(
						`Successfully fetched and cached ${body.data.length} stocks from screener proxy to Redis.`,
					);
				} else {
					throw new Error("No valid stock data returned from screener proxy");
				}

				// Set cooldown key to avoid spamming upstream
				await redis
					.set(FETCH_ATTEMPT_KEY, "true", { ex: 3600 })
					.catch(() => {});
			} catch (fetchError: any) {
				console.warn(
					"Failed to fetch fresh stock data from screener proxy:",
					fetchError?.message || fetchError,
				);
				await redis
					.set(FETCH_ATTEMPT_KEY, "failed", { ex: 900 })
					.catch(() => {});

				// If we don't have cached Redis data, fall back to resilient static dataset
				if (!data || data.length === 0) {
					data = FALLBACK_IDX_STOCKS;
					source = "fallback_static";
				}
			}
		}

		if (!data || data.length === 0) {
			data = FALLBACK_IDX_STOCKS;
			source = "fallback_static";
		}

		// Sync and retrieve 10-trading-day per-ticker ring buffer + live IHSG Compass regime bridge
		let tickerHistory10d = null;
		let compassBridge: CompassBridgeSummary | null = null;

		try {
			const [ringBufferRes, compassRes] = await Promise.allSettled([
				source === "idx_live"
					? updateTickerHistoryRingBuffer(data)
					: getTickerHistoryRingBuffer().then(
							(existing) => existing || updateTickerHistoryRingBuffer(data),
						),
				getCachedInvestmentCompass(),
			]);

			if (ringBufferRes.status === "fulfilled") {
				tickerHistory10d = ringBufferRes.value;
			}

			if (compassRes.status === "fulfilled" && compassRes.value?.engineOutput) {
				const eo = compassRes.value.engineOutput;
				const ihsgRegime = eo.regimes.ihsg;
				const ihsgPlaybook = eo.playbooks.ihsg;
				const ihsgPerms = eo.permissions.ihsg;
				const mandate = ihsgPerms.mandate;
				const flows = compassRes.value.markets.ihsgFlows;

				compassBridge = {
					rawState: ihsgRegime.state,
					effectiveState: ihsgPlaybook.state,
					score: ihsgRegime.score,
					headline: ihsgRegime.headline,
					trendState: ihsgRegime.dualAxis?.trendState || ihsgRegime.state,
					valuationState: ihsgRegime.dualAxis?.valuationState || "neutral",
					maxExposurePct: mandate?.maxPortfolioExposurePct ?? 15,
					riskPerTradePct: mandate?.maxRiskPerTradePct ?? 0.5,
					isTradingLocked: Boolean(mandate?.isTradingLocked),
					streakDays: flows?.streakDays ?? null,
					net5dIdr: flows?.netBuySell5dIdr ?? null,
				};
			}
		} catch (e) {
			console.warn("Non-critical enrichment failed in stock-data route:", e);
		}

		// Apply pagination if requested explicitly
		const { limit, offset } = parsedQuery.data;
		const offsetNum = offset || 0;
		const paginatedData = limit
			? data.slice(offsetNum, offsetNum + limit)
			: data;

		return NextResponse.json({
			data: paginatedData,
			total: data.length,
			limit: limit || data.length,
			offset: offsetNum,
			source,
			tickerHistory10d,
			compassBridge,
			metadata: {
				lastFetchAt: new Date().toISOString(),
				cached: source.startsWith("redis") || source.startsWith("fallback"),
			},
		});
	} catch (error: any) {
		console.error("Stock Data Retrieval Error:", error);
		// Guaranteed resilience fallback: return static market data
		return NextResponse.json({
			data: FALLBACK_IDX_STOCKS,
			total: FALLBACK_IDX_STOCKS.length,
			source: "fallback_error",
			metadata: {
				lastFetchAt: new Date().toISOString(),
				cached: true,
			},
		});
	}
}
