export type EvidenceOrigin = "live" | "cache" | "backup" | "static" | "unknown";
export type EvidenceState = "current" | "stale" | "missing" | "invalid";

export interface MarketEvidence {
	periodEnd?: string;
	reason?: string;
	provider: string;
	origin: EvidenceOrigin;
	status: EvidenceState;
	asOf: string | null;
	retrievedAt: string | null;
}

export function monthlyPeriodEnd(
	observation: string | undefined,
): string | undefined {
	if (
		!observation ||
		!/^\d{4}-\d{2}-01$/.test(observation) ||
		!Number.isFinite(Date.parse(observation))
	)
		return undefined;
	return new Date(
		Date.UTC(
			Number(observation.slice(0, 4)),
			Number(observation.slice(5, 7)),
			0,
		),
	)
		.toISOString()
		.slice(0, 10);
}

const dayMs = 86_400_000;
// IDX notice Peng-00171/BEI.POP/09-2025. Refresh the schedule with the published calendar each year.
const idxHolidays = new Set([
	"2026-01-01",
	"2026-01-16",
	"2026-02-16",
	"2026-02-17",
	"2026-03-18",
	"2026-03-19",
	"2026-03-20",
	"2026-03-23",
	"2026-03-24",
	"2026-04-03",
	"2026-05-01",
	"2026-05-14",
	"2026-05-15",
	"2026-05-27",
	"2026-05-28",
	"2026-06-01",
	"2026-06-16",
	"2026-08-17",
	"2026-08-25",
	"2026-12-24",
	"2026-12-25",
	"2026-12-31",
]);

export function marketEvidence(
	provider: string,
	origin: EvidenceOrigin,
	observation: string | number | null | undefined,
	now: string,
	maxAgeDays: number,
	retrievedAt: string | null = null,
): MarketEvidence {
	const time =
		typeof observation === "number"
			? observation * 1000
			: Date.parse(observation ?? "");
	const age = Date.parse(now) - time;
	const status =
		observation == null || observation === ""
			? "missing"
			: !Number.isFinite(age) || age < 0
				? "invalid"
				: age > maxAgeDays * dayMs || origin === "static"
					? "stale"
					: "current";
	return {
		reason:
			status === "missing"
				? "No usable observation returned"
				: status === "invalid"
					? "Invalid observation date"
					: status === "stale"
						? "Observation exceeds its freshness limit"
						: undefined,
		provider,
		origin,
		status,
		asOf: Number.isFinite(time) ? new Date(time).toISOString() : null,
		retrievedAt,
	};
}

export function jakartaDate(time: string | number | Date): string {
	return new Date(time).toLocaleDateString("sv-SE", {
		timeZone: "Asia/Jakarta",
	});
}

export function sessionDate(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const date = value.split("T")[0];
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
	const t = Date.parse(date);
	return Number.isFinite(t) && new Date(t).toISOString().startsWith(date)
		? date
		: null;
}

export function completedIdxSession(
	value: unknown,
	now: string,
): string | null {
	const date = sessionDate(value);
	if (!date) return null;
	const dow = new Date(date).getUTCDay();
	if (
		dow === 0 ||
		dow === 6 ||
		idxHolidays.has(date) ||
		Date.parse(`${date}T16:30:00+07:00`) > Date.parse(now)
	)
		return null;
	return date;
}

export function nextIdxSession(session: string): string {
	let time = Date.parse(session);
	for (;;) {
		time += dayMs;
		const date = new Date(time).toISOString().slice(0, 10);
		if (completedIdxSession(date, new Date(time + dayMs).toISOString()))
			return date;
	}
}

export function latestCompletedIdxSession(now: string): string {
	let date = Date.parse(jakartaDate(now));
	while (!completedIdxSession(new Date(date).toISOString().slice(0, 10), now))
		date -= dayMs;
	return new Date(date).toISOString().slice(0, 10);
}

export function idxEvidence(
	date: string | null,
	now: string,
	origin: EvidenceOrigin,
	observedIndexSession?: string | null,
	retrievedAt?: string | null,
): MarketEvidence {
	const evidence = marketEvidence(
		"IDX stock summary",
		origin,
		date,
		now,
		7,
		retrievedAt,
	);
	if (evidence.status !== "current") return evidence;
	if (!completedIdxSession(date, now))
		return { ...evidence, status: "invalid" };
	// shortcut: assume weekdays outside the published holiday calendar, until calendar updates are automated.
	const expectedSession = [
		observedIndexSession ?? "",
		latestCompletedIdxSession(now),
	].sort()[1];
	return date! < expectedSession
		? {
				...evidence,
				status: "stale",
				reason: `Awaiting completed IDX session ${expectedSession}`,
			}
		: evidence;
}
