"use client";

/**
 * Formats a number into a compact string (e.g., 1000 → "1K", 1000000 → "1M").
 * @param n - The number to format.
 * @returns The formatted string.
 */
export function fmtCompact(n: number): string {
	if (n < 1e3) return n.toLocaleString();
	if (n < 1e6) return `${(n / 1e3).toFixed(1)}K`;
	if (n < 1e9) return `${(n / 1e6).toFixed(1)}M`;
	return `${(n / 1e9).toFixed(1)}B`;
}

/**
 * Formats a number as a percentage with a sign (e.g., 1.23 → "+1.23%", -0.5 → "-0.50%").
 * @param n - The number to format.
 * @returns The formatted percentage string.
 */
export function fmtPct(n: number): string {
	return `${(n > 0 ? "+" : "") + n.toFixed(2)}%`;
}

/**
 * Formats a share quantity into standard Indonesian Exchange (IDX) Lots (1 lot = 100 shares).
 * @param shares - Total share volume.
 * @returns Formatted lot count string (e.g. "785.0K lots").
 */
export function fmtLots(shares: number): string {
	const lots = Math.round(shares / 100);
	return `${fmtCompact(lots)} lots`;
}

/**
 * Formats monetary amounts in IDR billions/trillions with leading sign (+/-).
 * @param val - Value in IDR.
 * @returns Formatted string (e.g. "+24.5B" or "-1.2T").
 */
export function fmtIDRNet(val: number): string {
	if (val === 0) return "0";
	const isNeg = val < 0;
	const absVal = Math.abs(val);
	if (absVal >= 1e12) {
		return `${isNeg ? "-" : "+"}${(absVal / 1e12).toFixed(1)}T`;
	}
	return `${isNeg ? "-" : "+"}${(absVal / 1e9).toFixed(1)}B`;
}

/**
 * Formats an unsigned nominal IDR value for turnover or transaction size.
 * @param val - Value in IDR.
 * @returns Formatted string (e.g. "45.2M", "1.52B", "12.45T").
 */
export function fmtIDRValue(val: number): string {
	if (!val || val <= 0) return "0";
	if (val >= 1e12) return `${(val / 1e12).toFixed(2)}T`;
	if (val >= 1e9) return `${(val / 1e9).toFixed(2)}B`;
	if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
	if (val >= 1e3) return `${(val / 1e3).toFixed(0)}K`;
	return Math.round(val).toLocaleString();
}

/**
 * Returns the IDX price tick (Fraksi Harga) based on BEI rules.
 */
export function getIdxPriceTick(price: number): number {
	if (price < 200) return 1;
	if (price < 500) return 2;
	if (price < 2000) return 5;
	if (price < 5000) return 10;
	return 25;
}

/**
 * Rounds a price to the valid IDX price tick.
 */
export function roundToIdxTick(
	price: number,
	direction: "down" | "up" = "down",
): number {
	if (price <= 1) return 1;
	const tick = getIdxPriceTick(price);
	if (direction === "down") {
		return Math.floor(price / tick) * tick;
	}
	return Math.ceil(price / tick) * tick;
}

/**
 * Calculates symmetric Auto Rejection (ARA & ARB) price limits for IDX regular & special boards.
 * - Price <= 200: 35%
 * - Price 201 - 5,000: 25%
 * - Price > 5,000: 20%
 * Minimum price on BEI (Akselerasi/FCA) is Rp 1.
 */
export function getIdxAutoRejectionLimits(previousPrice: number): {
	araPrice: number;
	arbPrice: number;
	araPct: number;
	arbPct: number;
} {
	if (!previousPrice || previousPrice <= 0) {
		return { araPrice: 0, arbPrice: 0, araPct: 0, arbPct: 0 };
	}

	let limitPct = 0.25;
	if (previousPrice <= 200) {
		limitPct = 0.35;
	} else if (previousPrice > 5000) {
		limitPct = 0.2;
	}

	const rawAra = previousPrice * (1 + limitPct);
	const rawArb = previousPrice * (1 - limitPct);

	const araPrice = roundToIdxTick(rawAra, "down");
	const arbPrice = Math.max(1, roundToIdxTick(rawArb, "up"));

	const araPct =
		previousPrice > 0 ? ((araPrice - previousPrice) / previousPrice) * 100 : 0;
	const arbPct =
		previousPrice > 0 ? ((arbPrice - previousPrice) / previousPrice) * 100 : 0;

	return {
		araPrice,
		arbPrice,
		araPct,
		arbPct,
	};
}

export type TurnoverTier = "Illiquid" | "Low" | "Mid" | "High" | "Mega";

/**
 * Categorizes stock liquidity by daily turnover (Value in IDR).
 */
export function getTurnoverTier(val: number): TurnoverTier {
	if (val >= 50_000_000_000) return "Mega";
	if (val >= 20_000_000_000) return "High";
	if (val >= 5_000_000_000) return "Mid";
	if (val >= 1_000_000_000) return "Low";
	return "Illiquid";
}
