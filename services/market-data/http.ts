import type { FetchPolicy } from "./types";

const DEFAULT_TIMEOUT_MS = 8000;

export const BROWSER_USER_AGENT =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

/**
 * Builds a fetch init honouring the ISR data cache by default,
 * or bypassing it entirely when a fresh read is requested.
 */
export function buildFetchInit(
	policy: FetchPolicy,
	headers: Record<string, string>,
): RequestInit {
	const signal = AbortSignal.timeout(DEFAULT_TIMEOUT_MS);
	if (policy.fresh) {
		return { cache: "no-store", headers, signal };
	}
	return { next: { revalidate: policy.revalidate }, headers, signal };
}

/**
 * Parses provider-formatted numerics such as "7,722.72", "+0.73%",
 * "5.273%" or "UNCH" into finite numbers. Returns null when unparseable.
 */
export function parseNumeric(raw: unknown): number | null {
	if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
	if (typeof raw !== "string") return null;
	const trimmed = raw.trim();
	if (!trimmed) return null;
	if (trimmed.toUpperCase() === "UNCH") return 0;
	const cleaned = trimmed.replace(/[,%\s]/g, "").replace(/^\+/, "");
	if (!cleaned) return null;
	const value = Number(cleaned);
	return Number.isFinite(value) ? value : null;
}
