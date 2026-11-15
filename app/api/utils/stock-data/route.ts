import { z } from "zod";
import { type NextRequest, NextResponse } from "next/server";
import {
	getStockDataSnapshot,
	getTickerHistoryRingBuffer,
	redis,
} from "@/lib/core/redis";
import { FALLBACK_IDX_STOCKS } from "@/features/utils/stock-tools/stock-explorer/data/fallbackData";
import { getCachedInvestmentCompass } from "@/features/investment/actions";
import { getIdxPosture } from "@/features/investment/lib/idx-posture";
import { idxEvidence, sessionDate } from "@/services/market-data/provenance";
import { syncIdxStockSummary } from "@/services/market-data/idx-flows";
import { readIdxResearch } from "@/services/market-data/idx-research-store";

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

		let snapshot = await getStockDataSnapshot();
		const startedAt = new Date().toISOString();
		const cooldown = await redis.get(FETCH_ATTEMPT_KEY).catch(() => true);
		if (
			(forceRefresh ||
				!snapshot?.data.length ||
				idxEvidence(
					sessionDate(snapshot.data[0]?.Date),
					startedAt,
					snapshot.origin,
				).status !== "current") &&
			!cooldown
		) {
			const claimed = await redis
				.set(FETCH_ATTEMPT_KEY, "syncing", { nx: true, ex: 900 })
				.catch(() => null);
			if (claimed) {
				const update = await syncIdxStockSummary(true);
				if (update.success) snapshot = await getStockDataSnapshot();
			}
		}
		const data = snapshot?.data.length ? snapshot.data : FALLBACK_IDX_STOCKS;
		const source = data === FALLBACK_IDX_STOCKS ? "fallback_static" : "redis";
		const [tickerHistory10d, compass, research] = await Promise.all([
			source === "redis" ? getTickerHistoryRingBuffer() : null,
			getCachedInvestmentCompass().catch(() => null),
			readIdxResearch().catch(() => null),
		]);
		const now = new Date().toISOString();
		const observedSession = sessionDate(data[0]?.Date);
		const stockEvidence = idxEvidence(
			observedSession,
			now,
			source === "fallback_static" ? "static" : (snapshot?.origin ?? "unknown"),
			compass?.markets.ihsgFlows?.asOf,
			snapshot?.retrievedAt,
		);
		if (
			source === "redis" &&
			snapshot?.origin === "unknown" &&
			stockEvidence.status === "current"
		)
			stockEvidence.status = "invalid";
		const compassBridge = compass ? getIdxPosture(compass) : null;
		if (compassBridge) compassBridge.stockEvidence = stockEvidence;
		const researchIsCurrent =
			stockEvidence.status === "current" &&
			research?.session === observedSession;

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
			research: research
				? {
						session: research.session,
						version: research.version,
						current: researchIsCurrent,
						breadth: research.breadth,
						signals: Object.fromEntries(
							Object.entries(research.results).map(([symbol, item]) => [
								symbol,
								{
									state: item.state,
									trendLeader: item.trendLeader,
									relativeStrength: item.relativeStrength,
								},
							]),
						),
					}
				: null,
			metadata: {
				lastFetchAt: snapshot?.retrievedAt ?? null,
				stockEvidence,
				cached: true,
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
				lastFetchAt: null,
				stockEvidence: idxEvidence(null, new Date().toISOString(), "static"),
				cached: true,
			},
		});
	}
}
