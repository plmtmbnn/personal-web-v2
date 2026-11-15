import { getStockDataSnapshot, redis } from "@/lib/core/redis";
import { getCachedInvestmentCompass } from "@/features/investment/actions";
import { getIdxPosture } from "@/features/investment/lib/idx-posture";
import {
	idxEvidence,
	jakartaDate,
	sessionDate,
} from "@/services/market-data/provenance";
import {
	entryRequestSchema,
	evaluatePaperEntry,
	IDX_FEES,
	netTradeRisk,
	tradeDecisionSchema,
	type EntryRequest,
	type TradeDecisionSnapshot,
} from "../utils/paper-risk";
import { checkAdmin } from "@/features/auth/actions";
import { createAdminClient } from "@/lib/core/supabase-server";
import { z } from "zod";
import type { StockPick, ClosePickPayload, Sector } from "../types";
import { isValidUuid, ensureValidUuid } from "../utils/uuid";

const pickDate = z
	.string()
	.max(40)
	.refine((value) => Number.isFinite(Date.parse(value)));

const stockPickSchema = z.object({
	id: z.string().trim().min(1).max(64),
	stockCode: z
		.string()
		.trim()
		.regex(/^[A-Za-z0-9]{1,10}$/),
	stockName: z.string().trim().min(1).max(160),
	sector: z.string().trim().min(1).max(80),
	status: z.enum(["active", "closed"]),
	buyPrice: z.number().finite().positive(),
	quantityLots: z.number().int().positive().max(1_000_000),
	entryDate: pickDate,
	targetPrice: z.number().finite().positive().optional(),
	stopLossPrice: z.number().finite().positive().optional(),
	notes: z.string().max(2_000).optional(),
	highestPriceTraced: z.number().finite().nonnegative(),
	lowestPriceTraced: z.number().finite().nonnegative(),
	highestPriceDate: pickDate.optional(),
	lowestPriceDate: pickDate.optional(),
	closedDate: pickDate.optional(),
	closedPrice: z.number().positive().optional(),
	thesis: z.string().max(80).optional(),
	exitReason: z.string().max(80).optional(),
	realizedPlNominal: z.number().optional(),
	realizedPlPct: z.number().optional(),
});

const tradeReviewSchema = z.object({
	netPnlIdr: z.number().finite(),
	actualRiskIdr: z.number().finite().positive().nullable(),
	realizedR: z.number().finite().nullable(),
});

const closePickSchema = z
	.object({
		exitPrice: z.number().finite().positive(),
		exitDate: pickDate.optional(),
		exitReason: z.enum([
			"target_hit",
			"stop_loss_hit",
			"trailing_stop",
			"thesis_invalidated",
			"manual_profit",
			"manual_cut",
		]),
		exitNotes: z.string().trim().max(2000).optional(),
		peakGainPct: z.number().finite(),
		maxDrawdownPct: z.number().finite(),
		holdingDays: z.number().int().nonnegative().max(36_500),
		realizedPlNominal: z.number().finite(),
		realizedPlPct: z.number().finite(),
	})
	.passthrough();

const watermarkUpdatesSchema = z
	.array(
		z.object({
			id: z.string().uuid(),
			highestPriceTraced: z.number().finite().nonnegative(),
			lowestPriceTraced: z.number().finite().nonnegative(),
			highestPriceDate: pickDate.optional(),
			lowestPriceDate: pickDate.optional(),
		}),
	)
	.max(500);

interface DbStockPick {
	trade_decision?: unknown;
	trade_review?: unknown;
	id: string;
	user_id?: string | null;
	ticker?: string;
	stock_code?: string;
	company_name?: string;
	stock_name?: string;
	sector?: string | null;
	status: "active" | "closed" | "cancelled";
	buy_price: number | string;
	lots?: number | null;
	quantity_lots?: number | null;
	shares?: number | string | null;
	target_price?: number | string | null;
	stop_loss?: number | string | null;
	stop_loss_price?: number | string | null;
	entry_date: string;
	high_watermark?: number | string;
	highest_price_traced?: number | string;
	high_watermark_date?: string | null;
	highest_price_date?: string | null;
	low_watermark?: number | string;
	lowest_price_traced?: number | string;
	low_watermark_date?: string | null;
	lowest_price_date?: string | null;
	thesis?: string | null;
	notes?: string | null;
	exit_price?: number | string | null;
	closed_price?: number | string | null;
	exit_date?: string | null;
	closed_date?: string | null;
	exit_reason: string | null;
	exit_notes?: string | null;
	realized_pnl_idr?: number | string | null;
	realized_pl_nominal?: number | string | null;
	realized_pnl_pct?: number | string | null;
	realized_pl_pct?: number | string | null;
	peak_gain_pct?: number | string | null;
	max_drawdown_pct?: number | string | null;
	holding_days?: number | null;
	created_at: string;
	updated_at: string;
}

function mapDbToStockPick(row: DbStockPick): StockPick {
	const buyPrice = Number(row.buy_price) || 0;
	const lots =
		Number(row.quantity_lots ?? row.lots) ||
		Math.max(1, Math.round((Number(row.shares) || 100) / 100));
	const stockCode = (row.stock_code || row.ticker || "").toUpperCase().trim();
	const stockName = row.stock_name || row.company_name || stockCode;
	const stopLossPrice =
		row.stop_loss_price != null
			? Number(row.stop_loss_price)
			: row.stop_loss != null
				? Number(row.stop_loss)
				: undefined;
	const highestPriceTraced =
		Number(row.highest_price_traced ?? row.high_watermark) || buyPrice;
	const highestPriceDate =
		(row.highest_price_date || row.high_watermark_date)?.split("T")[0] ||
		undefined;
	const lowestPriceTraced =
		Number(row.lowest_price_traced ?? row.low_watermark) || buyPrice;
	const lowestPriceDate =
		(row.lowest_price_date || row.low_watermark_date)?.split("T")[0] ||
		undefined;
	const closedPrice =
		row.closed_price != null
			? Number(row.closed_price)
			: row.exit_price != null
				? Number(row.exit_price)
				: undefined;
	const closedDate =
		(row.closed_date || row.exit_date)?.split("T")[0] || undefined;
	const realizedPlPct =
		row.realized_pl_pct != null
			? Number(row.realized_pl_pct)
			: row.realized_pnl_pct != null
				? Number(row.realized_pnl_pct)
				: undefined;
	const realizedPlNominal =
		row.realized_pl_nominal != null
			? Number(row.realized_pl_nominal)
			: row.realized_pnl_idr != null
				? Number(row.realized_pnl_idr)
				: undefined;

	return {
		id: row.id,
		stockCode,
		stockName,
		sector: (row.sector as Sector) || "Unknown",
		status: row.status === "closed" ? "closed" : "active",
		buyPrice,
		quantityLots: lots,
		entryDate:
			row.entry_date?.split("T")[0] || new Date().toISOString().split("T")[0],
		targetPrice: row.target_price ? Number(row.target_price) : undefined,
		stopLossPrice,
		thesis: (row.thesis as StockPick["thesis"]) || "Custom",
		notes: row.notes || undefined,
		highestPriceTraced,
		highestPriceDate,
		lowestPriceTraced,
		lowestPriceDate,
		closedPrice,
		closedDate,
		realizedPlPct,
		realizedPlNominal,
		exitReason: (row.exit_reason as StockPick["exitReason"]) || undefined,
		exitNotes: row.exit_notes || undefined,
		decision: tradeDecisionSchema.safeParse(row.trade_decision).data,
		review: tradeReviewSchema.safeParse(row.trade_review).data,
		createdAt: new Date(row.created_at).getTime() || Date.now(),
		updatedAt: new Date(row.updated_at).getTime() || Date.now(),
	};
}

function mapPickToDb(pick: z.infer<typeof stockPickSchema>) {
	const lots = pick.quantityLots || 1;
	const shares = lots * 100;
	const buyPrice = pick.buyPrice;
	const highWatermark = pick.highestPriceTraced || buyPrice;
	const lowWatermark =
		pick.lowestPriceTraced && pick.lowestPriceTraced > 0
			? pick.lowestPriceTraced
			: buyPrice;

	return {
		id: ensureValidUuid(pick.id),
		ticker: (pick.stockCode || "").toUpperCase().trim(),
		company_name: pick.stockName || pick.stockCode,
		sector: pick.sector || null,
		status: pick.status,
		buy_price: buyPrice,
		lots: lots,
		shares: shares,
		target_price: pick.targetPrice ?? null,
		stop_loss: pick.stopLossPrice ?? null,
		entry_date: pick.entryDate
			? new Date(pick.entryDate).toISOString()
			: new Date().toISOString(),
		high_watermark: highWatermark,
		high_watermark_date: pick.highestPriceDate
			? new Date(pick.highestPriceDate).toISOString()
			: null,
		low_watermark: lowWatermark,
		low_watermark_date: pick.lowestPriceDate
			? new Date(pick.lowestPriceDate).toISOString()
			: null,
		thesis: pick.thesis ?? "Compass Core Tranche",
		notes: pick.notes ?? null,
		exit_price: pick.closedPrice ?? null,
		exit_date: pick.closedDate ? new Date(pick.closedDate).toISOString() : null,
		exit_reason: pick.exitReason ?? null,
		realized_pnl_idr: pick.realizedPlNominal ?? null,
		realized_pnl_pct: pick.realizedPlPct ?? null,
		updated_at: new Date().toISOString(),
	};
}

function currentPickColumns(payload: ReturnType<typeof mapPickToDb>) {
	const {
		ticker,
		company_name,
		lots,
		shares: _shares,
		stop_loss,
		high_watermark,
		high_watermark_date,
		low_watermark,
		low_watermark_date,
		exit_price,
		exit_date,
		realized_pnl_idr,
		realized_pnl_pct,
		...common
	} = payload;
	return {
		...common,
		stock_code: ticker,
		stock_name: company_name,
		quantity_lots: lots,
		stop_loss_price: stop_loss,
		highest_price_traced: high_watermark,
		highest_price_date: high_watermark_date,
		lowest_price_traced: low_watermark,
		lowest_price_date: low_watermark_date,
		closed_price: exit_price,
		closed_date: exit_date,
		realized_pl_nominal: realized_pnl_idr,
		realized_pl_pct: realized_pnl_pct,
	};
}

/**
 * Fetch all stock picks directly from Supabase cloud database.
 */
export async function fetchCloudStockPicksAction(): Promise<{
	success: boolean;
	data: StockPick[];
	error?: string;
}> {
	if (!(await checkAdmin())) {
		return { success: false, data: [], error: "Unauthorized" };
	}
	try {
		const supabase = await createAdminClient();
		const { data, error } = await supabase
			.from("stock_picks")
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			console.error("[fetchCloudStockPicksAction] Supabase error:", error);
			return { success: false, data: [], error: "Failed to fetch stock picks" };
		}

		const picks = (data as unknown as DbStockPick[]).map(mapDbToStockPick);
		return { success: true, data: picks };
	} catch (err) {
		console.error("[fetchCloudStockPicksAction] Exception:", err);
		return { success: false, data: [], error: "Failed to fetch stock picks" };
	}
}

/**
 * Upsert a stock pick in Supabase cloud database.
 */
export async function saveCloudStockPickAction(
	pick: StockPick,
	request?: EntryRequest,
	historicalImport = false,
): Promise<{ success: boolean; error?: string; data?: StockPick }> {
	if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };
	const parsed = stockPickSchema.safeParse(pick);
	const entryRequest = entryRequestSchema.safeParse(request);
	if (!parsed.success || (request && !entryRequest.success))
		return { success: false, error: "Invalid stock pick payload" };
	const lock = "idx:paper:entry";
	const token = crypto.randomUUID();
	let claimed = false;
	try {
		const [market, compass] = entryRequest.success
			? await Promise.all([
					getStockDataSnapshot(),
					getCachedInvestmentCompass().catch(() => null),
				])
			: [null, null];
		if (parsed.data.status === "active") {
			claimed = !!(await redis.set(lock, token, { nx: true, ex: 45 }));
			if (!claimed)
				return {
					success: false,
					error: "Another paper entry is saving. Retry in a moment.",
				};
		}
		const supabase = await createAdminClient();
		const payload = mapPickToDb(parsed.data);
		const { data: existing, error: readError } = await supabase
			.from("stock_picks")
			.select("*")
			.eq("id", payload.id)
			.maybeSingle();
		if (readError) throw readError;
		const previous = existing ? mapDbToStockPick(existing) : null;
		if (historicalImport && previous) return { success: true, data: previous };
		const isNewEntry =
			parsed.data.status === "active" && previous?.status !== "active";
		const now = new Date().toISOString();
		let decision: TradeDecisionSnapshot | undefined;
		if (isNewEntry) {
			const isLegacyImport =
				historicalImport &&
				!existing &&
				jakartaDate(parsed.data.entryDate) < jakartaDate(now);
			if (!entryRequest.success && !isLegacyImport && !existing) {
				return {
					success: false,
					error: "Review the paper entry before saving.",
				};
			}
			if (entryRequest.success) {
				const { data: holdings, error } = await supabase
					.from("stock_picks")
					.select("*")
					.eq("status", "active")
					.limit(1000);
				if (error) throw error;
				if (holdings?.length === 1000)
					return {
						success: false,
						error: "Too many active positions to verify paper capacity.",
					};
				const posture = compass ? getIdxPosture(compass) : null;
				const stock = market?.data.find(
					(row) => row.StockCode === payload.ticker,
				);
				const session = sessionDate(stock?.Date);
				const evidence = idxEvidence(
					session,
					now,
					market?.origin ?? "unknown",
					posture?.session,
					market?.retrievedAt,
				);
				const result = evaluatePaperEntry({
					entry: parsed.data.buyPrice,
					stop: parsed.data.stopLossPrice ?? 0,
					target: parsed.data.targetPrice ?? 0,
					lots: parsed.data.quantityLots,
					thesis: parsed.data.thesis as StockPick["thesis"],
					equityIdr: entryRequest.data.equityIdr,
					turnover: stock?.Value,
					posture,
					current:
						!!stock &&
						market?.origin !== "unknown" &&
						evidence.status === "current" &&
						session === posture?.session,
					picks: (holdings ?? []).map(mapDbToStockPick),
				});
				if (result.failed.length && !entryRequest.data.overrideReason) {
					return {
						success: false,
						error:
							"Market or account checks changed. Review the entry and provide a reason to proceed.",
					};
				}
				const candidate = tradeDecisionSchema.safeParse({
					version: 1,
					recordedAt: now,
					snapshotId: posture?.snapshotId ?? null,
					session,
					regime: posture?.effectiveState ?? "insufficient",
					setup: parsed.data.thesis ?? "Custom",
					equityIdr: entryRequest.data.equityIdr,
					entry: parsed.data.buyPrice,
					stop: parsed.data.stopLossPrice ?? null,
					target: parsed.data.targetPrice ?? null,
					lots: parsed.data.quantityLots,
					plannedLossIdr: result.plannedLossIdr,
					plannedNetR: result.risk?.ratio ?? null,
					failed: result.failed,
					overrideReason: result.failed.length
						? entryRequest.data.overrideReason
						: undefined,
					costs: IDX_FEES,
				});
				if (!candidate.success)
					return {
						success: false,
						error: "Unable to record a valid paper decision.",
					};
				decision = candidate.data;
			}
		}
		const metadata = {
			...(!existing && decision ? { trade_decision: decision } : {}),
			...(existing && previous?.review && parsed.data.status === "active"
				? { trade_review: null }
				: {}),
		};
		const write = (columns: object) => {
			const query = supabase.from("stock_picks");
			const writeQuery = existing
				? query
						.update({ ...columns, ...metadata })
						.eq("id", payload.id)
						.eq("updated_at", existing.updated_at)
				: query.insert({ ...columns, ...metadata });
			return writeQuery.select("*").maybeSingle();
		};
		let response = await write(currentPickColumns(payload));
		if (response.error?.code === "PGRST204") response = await write(payload);
		if (response.error) throw response.error;
		if (!response.data)
			return {
				success: false,
				error: "This paper pick changed. Reload the ledger and try again.",
			};
		return { success: true, data: mapDbToStockPick(response.data) };
	} catch (err) {
		console.error("[saveCloudStockPickAction] Exception:", err);
		return { success: false, error: "Failed to save stock pick" };
	} finally {
		if (claimed)
			await redis
				.eval(
					"if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) end return 0",
					[lock],
					[token],
				)
				.catch(() => {});
	}
}

/**
 * Close a stock pick with snapshot analytics in Supabase.
 */
export async function closeCloudStockPickAction(
	id: string,
	payload: ClosePickPayload & {
		peakGainPct: number;
		maxDrawdownPct: number;
		holdingDays: number;
		realizedPlNominal: number;
		realizedPlPct: number;
	},
): Promise<{ success: boolean; error?: string }> {
	if (!(await checkAdmin())) {
		return { success: false, error: "Unauthorized" };
	}
	if (!isValidUuid(id)) {
		return { success: false, error: "Invalid stock pick ID" };
	}
	const parsedPayload = closePickSchema.safeParse(payload);
	if (!parsedPayload.success) {
		return { success: false, error: "Invalid close payload" };
	}
	try {
		const supabase = await createAdminClient();
		const found = await supabase
			.from("stock_picks")
			.select("*")
			.eq("id", id)
			.maybeSingle();
		if (found.error) throw found.error;
		if (!found.data || found.data.status !== "active")
			return { success: false, error: "Active paper position not found." };
		const pick = mapDbToStockPick(found.data);
		const input = parsedPayload.data;
		const costs = pick.decision?.costs ?? IDX_FEES;
		const shares = pick.quantityLots * 100;
		const gross = (input.exitPrice - pick.buyPrice) * shares;
		const grossPct = 100 * (input.exitPrice / pick.buyPrice - 1);
		const netPnlIdr =
			shares *
			(input.exitPrice * (1 - costs.sell) - pick.buyPrice * (1 + costs.buy));
		const actualRisk = netTradeRisk(
			pick.buyPrice,
			pick.stopLossPrice ?? 0,
			0,
			costs,
		);
		const review = tradeReviewSchema.parse({
			netPnlIdr,
			actualRiskIdr: actualRisk ? shares * actualRisk.loss : null,
			realizedR: pick.decision?.plannedLossIdr
				? netPnlIdr / pick.decision.plannedLossIdr
				: null,
		});
		const closedDate = input.exitDate
			? new Date(input.exitDate).toISOString()
			: new Date().toISOString();
		if (jakartaDate(closedDate) < pick.entryDate)
			return { success: false, error: "Exit date cannot be before entry." };
		const common = {
			status: "closed",
			exit_reason: input.exitReason,
			exit_notes: input.exitNotes ?? null,
			peak_gain_pct: input.peakGainPct,
			max_drawdown_pct: input.maxDrawdownPct,
			holding_days: input.holdingDays,
			updated_at: new Date().toISOString(),
		};
		const canonical = {
			closed_price: input.exitPrice,
			closed_date: closedDate,
			realized_pl_nominal: gross,
			realized_pl_pct: grossPct,
		};
		const legacy = {
			exit_price: input.exitPrice,
			exit_date: closedDate,
			realized_pnl_idr: gross,
			realized_pnl_pct: grossPct,
		};
		const write = (columns: object, includeReview: boolean) =>
			supabase
				.from("stock_picks")
				.update({
					...common,
					...columns,
					...(includeReview ? { trade_review: review } : {}),
				})
				.eq("id", id)
				.eq("updated_at", found.data.updated_at)
				.select("id")
				.maybeSingle();
		const migrated = Object.hasOwn(found.data, "trade_review");
		let response = await write(canonical, migrated);
		if (response.error?.code === "PGRST204")
			response = await write(legacy, migrated);
		if (response.error) throw response.error;
		return response.data
			? { success: true }
			: {
					success: false,
					error: "This position changed. Reload the ledger and try again.",
				};
	} catch (err) {
		console.error("[closeCloudStockPickAction] Exception:", err);
		return { success: false, error: "Failed to close stock pick" };
	}
}

/**
 * Delete a stock pick from Supabase.
 */
export async function deleteCloudStockPickAction(id: string): Promise<{
	success: boolean;
	error?: string;
}> {
	if (!(await checkAdmin())) {
		return { success: false, error: "Unauthorized" };
	}
	if (!isValidUuid(id)) {
		return { success: false, error: "Invalid stock pick ID" };
	}
	try {
		const supabase = await createAdminClient();
		const { error } = await supabase.from("stock_picks").delete().eq("id", id);
		if (error) {
			console.error("[deleteCloudStockPickAction] Supabase error:", error);
			return { success: false, error: "Failed to delete stock pick" };
		}
		return { success: true };
	} catch (err) {
		console.error("[deleteCloudStockPickAction] Exception:", err);
		return { success: false, error: "Failed to delete stock pick" };
	}
}

/**
 * Batch update watermarks for open picks in Supabase.
 */
export async function syncCloudWatermarksAction(
	updates: Array<{
		id: string;
		highestPriceTraced: number;
		lowestPriceTraced: number;
		highestPriceDate?: string;
		lowestPriceDate?: string;
	}>,
): Promise<{ success: boolean; error?: string }> {
	if (!(await checkAdmin())) {
		return { success: false, error: "Unauthorized" };
	}
	const parsedUpdates = watermarkUpdatesSchema.safeParse(updates);
	if (!parsedUpdates.success) {
		return { success: false, error: "Invalid watermark updates" };
	}
	if (!parsedUpdates.data.length) return { success: true };
	try {
		const supabase = await createAdminClient();
		for (const u of parsedUpdates.data) {
			const { error } = await supabase
				.from("stock_picks")
				.update({
					high_watermark: u.highestPriceTraced,
					high_watermark_date: u.highestPriceDate
						? new Date(u.highestPriceDate).toISOString()
						: null,
					low_watermark: u.lowestPriceTraced,
					low_watermark_date: u.lowestPriceDate
						? new Date(u.lowestPriceDate).toISOString()
						: null,
					updated_at: new Date().toISOString(),
				})
				.eq("id", u.id);

			if (error) {
				console.error("[syncCloudWatermarksAction] Supabase error:", error);
			}
		}
		return { success: true };
	} catch (err) {
		console.error("[syncCloudWatermarksAction] Exception:", err);
		return { success: false, error: "Failed to sync stock pick watermarks" };
	}
}
