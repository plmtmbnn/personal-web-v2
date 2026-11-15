import { z } from "zod";
import type {
	CompassBridgeSummary,
	StockPick,
	StockPickThesis,
} from "../types";
import { getIdxPriceTick, roundToIdxTick } from "../utils";

export const MIN_NET_RR = 2;
export const IDX_FEES = { buy: 0.0015, sell: 0.0025, slippageTicks: 1 };
export const SHARES_PER_LOT = 100;

export function modeledFill(
	price: number,
	side: "buy" | "sell",
	costs = IDX_FEES,
) {
	let fill = roundToIdxTick(price, side === "buy" ? "up" : "down");
	for (let i = 0; i < costs.slippageTicks; i++) {
		fill =
			side === "buy"
				? fill + getIdxPriceTick(fill)
				: Math.max(1, fill - getIdxPriceTick(fill - 1));
	}
	return fill * (side === "buy" ? 1 + costs.buy : 1 - costs.sell);
}

export function netTradeRisk(
	entry: number,
	stop: number,
	target: number,
	costs = IDX_FEES,
) {
	if (
		!Number.isFinite(entry) ||
		!Number.isFinite(stop) ||
		stop <= 0 ||
		stop >= entry
	)
		return null;
	const outlay = modeledFill(entry, "buy", costs);
	const loss = outlay - modeledFill(stop, "sell", costs);
	const reward =
		Number.isFinite(target) && target > entry
			? modeledFill(target, "sell", costs) - outlay
			: null;
	return { outlay, loss, reward, ratio: reward == null ? null : reward / loss };
}

export function stockPickBucket(thesis?: StockPickThesis) {
	return thesis === "Compass Core Tranche" ||
		thesis === "Foreign Flow Surge" ||
		thesis === "Value Accumulation"
		? "core"
		: "swing";
}

export type EntryCheck =
	| "data"
	| "regime"
	| "liquidity"
	| "invalidation"
	| "size"
	| "capacity"
	| "net_risk_reward";
export const ENTRY_CHECK_LABELS: Record<EntryCheck, string> = {
	data: "Current market and account data",
	regime: "Compass permission",
	liquidity: "Session turnover",
	invalidation: "Tick-valid entry and stop",
	size: "Risk budget and lot size",
	capacity: "Capital and bucket capacity",
	net_risk_reward: "Net reward to risk of at least 2:1",
};

export const entryRequestSchema = z.object({
	equityIdr: z.number().finite().positive().max(Number.MAX_SAFE_INTEGER),
	overrideReason: z.string().trim().min(1).max(500).optional(),
});
export type EntryRequest = z.infer<typeof entryRequestSchema>;

const checks = z.enum([
	"data",
	"regime",
	"liquidity",
	"invalidation",
	"size",
	"capacity",
	"net_risk_reward",
]);
export const tradeDecisionSchema = z.object({
	version: z.literal(1),
	recordedAt: z.iso.datetime(),
	snapshotId: z.string().nullable(),
	session: z.iso.date().nullable(),
	regime: z.enum([
		"risk_on",
		"selective",
		"defensive",
		"stress",
		"insufficient",
	]),
	setup: z.string(),
	equityIdr: entryRequestSchema.shape.equityIdr,
	entry: z.number().positive(),
	stop: z.number().positive().nullable(),
	target: z.number().positive().nullable(),
	lots: z.number().int().positive(),
	plannedLossIdr: z.number().positive().nullable(),
	plannedNetR: z.number().nullable(),
	failed: z.array(checks).max(7),
	overrideReason: entryRequestSchema.shape.overrideReason,
	costs: z.object({
		buy: z.number().nonnegative(),
		sell: z.number().nonnegative(),
		slippageTicks: z.number().int().nonnegative(),
	}),
});
export type TradeDecisionSnapshot = z.infer<typeof tradeDecisionSchema>;

export function evaluatePaperEntry(input: {
	entry: number;
	stop: number;
	target: number;
	lots: number;
	thesis?: StockPickThesis;
	equityIdr: number;
	turnover?: number;
	current: boolean;
	posture?: CompassBridgeSummary | null;
	picks: readonly StockPick[];
}) {
	const { entry, stop, target, lots, equityIdr, posture } = input;
	const bucket = stockPickBucket(input.thesis);
	const tactic = /scalp|ara hunter/i.test(input.thesis ?? "")
		? "scalp"
		: bucket;
	const permission = posture?.permissions?.[tactic]?.status;
	const eligible = permission === "allowed" || permission === "selective";
	const risk = netTradeRisk(entry, stop, target);
	const budget = (equityIdr * (posture?.riskPerTradePct ?? 0)) / 100;
	const cap =
		equityIdr *
		(bucket === "core" ? 0.45 : (posture?.maxExposurePct ?? 0) / 100);
	let totalCost = 0;
	let bucketCost = 0;
	for (const pick of input.picks) {
		if (pick.status !== "active") continue;
		const cost =
			modeledFill(pick.buyPrice, "buy") * SHARES_PER_LOT * pick.quantityLots;
		totalCost += cost;
		if (stockPickBucket(pick.thesis) === bucket) bucketCost += cost;
	}
	const available = Math.max(
		0,
		Math.min(equityIdr - totalCost, cap - bucketCost),
	);
	const validTick = (price: number) =>
		price > 0 && price === roundToIdxTick(price);
	const outlay = modeledFill(entry, "buy") * SHARES_PER_LOT;
	const lossPerLot = risk ? risk.loss * SHARES_PER_LOT : null;
	const current =
		input.current && Boolean(posture?.snapshotId) && equityIdr > 0;
	const turnoverFloor =
		posture?.effectiveState === "defensive" ||
		posture?.effectiveState === "stress"
			? 5e9
			: 1e9;
	const liquid = (input.turnover ?? 0) >= turnoverFloor;
	const validPlan =
		!!risk &&
		validTick(entry) &&
		validTick(stop) &&
		(!target || validTick(target));
	const canSize =
		current &&
		eligible &&
		liquid &&
		validPlan &&
		lossPerLot != null &&
		outlay > 0;
	const recommendedLots =
		canSize && lossPerLot != null
			? Math.floor(Math.min(budget / lossPerLot, available / outlay))
			: 0;
	const failed: EntryCheck[] = [];
	if (!current) failed.push("data");
	if (!eligible) failed.push("regime");
	if (!liquid) failed.push("liquidity");
	if (!validPlan) failed.push("invalidation");
	if (lossPerLot == null || lots * lossPerLot > budget) failed.push("size");
	if (outlay * lots > available) failed.push("capacity");
	if (risk?.ratio == null || risk.ratio < MIN_NET_RR)
		failed.push("net_risk_reward");
	return {
		failed,
		recommendedLots,
		risk,
		plannedLossIdr: lossPerLot == null ? null : lossPerLot * lots,
	};
}
