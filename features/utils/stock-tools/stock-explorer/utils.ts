"use client";

/**
 * Formats a number into a compact string (e.g., 1000 → "1K", 1000000 → "1M").
 * @param n - The number to format.
 * @returns The formatted string.
 */
export function fmtCompact(n: number): string {
	if (n < 1e3) return n.toLocaleString();
	if (n < 1e6) return (n / 1e3).toFixed(1) + "K";
	if (n < 1e9) return (n / 1e6).toFixed(1) + "M";
	return (n / 1e9).toFixed(1) + "B";
}

/**
 * Formats a number as a percentage with a sign (e.g., 1.23 → "+1.23%", -0.5 → "-0.50%").
 * @param n - The number to format.
 * @returns The formatted percentage string.
 */
export function fmtPct(n: number): string {
	return (n > 0 ? "+" : "") + n.toFixed(2) + "%";
}
