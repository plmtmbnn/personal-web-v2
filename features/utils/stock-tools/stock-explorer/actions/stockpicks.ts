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

const closePickSchema = z
	.object({
		exitPrice: z.number().finite().positive(),
		exitDate: pickDate.optional(),
		exitReason: z.string().trim().min(1).max(80),
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
export async function saveCloudStockPickAction(pick: StockPick): Promise<{
	success: boolean;
	error?: string;
}> {
	if (!(await checkAdmin())) {
		return { success: false, error: "Unauthorized" };
	}
	try {
		const parsed = stockPickSchema.safeParse(pick);
		if (!parsed.success) {
			return { success: false, error: "Invalid stock pick payload" };
		}
		const payload = mapPickToDb(parsed.data);
		const supabase = await createAdminClient();
		const { error } = await supabase.from("stock_picks").upsert(payload, {
			onConflict: "id",
		});

		if (error) {
			console.error("[saveCloudStockPickAction] Supabase error:", error);
			return { success: false, error: "Failed to save stock pick" };
		}
		return { success: true };
	} catch (err) {
		console.error("[saveCloudStockPickAction] Exception:", err);
		return { success: false, error: "Failed to save stock pick" };
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
		const { error } = await supabase
			.from("stock_picks")
			.update({
				status: "closed",
				exit_price: parsedPayload.data.exitPrice,
				exit_date: parsedPayload.data.exitDate
					? new Date(parsedPayload.data.exitDate).toISOString()
					: new Date().toISOString(),
				exit_reason: parsedPayload.data.exitReason,
				realized_pnl_idr: parsedPayload.data.realizedPlNominal,
				realized_pnl_pct: parsedPayload.data.realizedPlPct,
				peak_gain_pct: parsedPayload.data.peakGainPct,
				max_drawdown_pct: parsedPayload.data.maxDrawdownPct,
				holding_days: parsedPayload.data.holdingDays,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id);

		if (error) {
			console.error("[closeCloudStockPickAction] Supabase error:", error);
			return { success: false, error: "Failed to close stock pick" };
		}
		return { success: true };
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
