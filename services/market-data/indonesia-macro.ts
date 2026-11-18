import Papa from "papaparse";
import { buildFetchInit, BROWSER_USER_AGENT } from "./http";
import { marketEvidence } from "./provenance";
import type { FetchPolicy, MacroObservation, MacroSeries } from "./types";
import { DOMESTIC_SERIES } from "./registry";

const base = "https://www.bi.go.id/en/statistik/indikator/";

export function parseBiObservations(
	html: string,
	now = new Date().toISOString(),
): MacroObservation[] {
	const decoded = html.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
	const chart = decoded.match(/\[\[\d{13},[\s\S]*?\]\]/)?.[0];
	let rows: MacroObservation[] = [];
	if (chart) {
		try {
			const points: unknown = JSON.parse(chart);
			if (Array.isArray(points))
				rows = points.flatMap((point) => {
					if (
						!Array.isArray(point) ||
						typeof point[0] !== "number" ||
						typeof point[1] !== "number" ||
						!Number.isFinite(point[1])
					)
						return [];
					const date = new Date(point[0]);
					return Number.isFinite(date.getTime())
						? [{ date: date.toISOString().slice(0, 10), value: point[1] }]
						: [];
				});
		} catch {
			/* The dated table remains available when chart markup changes. */
		}
	}
	if (!rows.length) {
		const cells = [...html.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(
			(match) => match[1].replace(/<[^>]*>/g, "").trim(),
		);
		for (let i = 0; i < cells.length - 1; i++) {
			if (
				!/^(\d{1,2} )?[A-Z][a-z]+ \d{4}$/.test(cells[i]) ||
				!/^-?\d+(\.\d+)?\s*%$/.test(cells[i + 1])
			)
				continue;
			const text = /^\d/.test(cells[i]) ? cells[i] : `1 ${cells[i]}`;
			const time = Date.parse(`${text} 00:00:00 GMT`);
			if (Number.isFinite(time))
				rows.push({
					date: new Date(time).toISOString().slice(0, 10),
					value: Number(cells[i + 1].replace(/[%\s]/g, "")),
				});
		}
	}
	return [
		...new Map(
			rows
				.filter(
					(row) => row.date <= now.slice(0, 10) && Number.isFinite(row.value),
				)
				.map((row) => [row.date, row]),
		).values(),
	].sort((a, b) => a.date.localeCompare(b.date));
}

export function parseBisPolicy(
	csv: string,
	now = new Date().toISOString(),
): MacroObservation[] {
	const parsed = Papa.parse<Record<string, string>>(csv, {
		header: true,
		skipEmptyLines: true,
	});
	const rows = parsed.data
		.filter(
			(row) =>
				row.REF_AREA === "ID" &&
				row.FREQ === "D" &&
				row.OBS_VALUE?.trim() &&
				Number.isFinite(Number(row.OBS_VALUE)) &&
				/^\d{4}-\d{2}-\d{2}$/.test(row.TIME_PERIOD) &&
				row.TIME_PERIOD <= now.slice(0, 10),
		)
		.map((row) => ({ date: row.TIME_PERIOD, value: Number(row.OBS_VALUE) }))
		.sort((a, b) => a.date.localeCompare(b.date));
	if (
		marketEvidence("BIS", "live", rows.at(-1)?.date, now, 7).status !==
		"current"
	)
		return [];
	// Compare the latest daily rate with the prior month's last observation, not yesterday's repeated rate.
	const latest = rows.at(-1)!;
	const previous = rows
		.filter((row) => row.date.slice(0, 7) < latest.date.slice(0, 7))
		.at(-1);
	return previous ? [previous, latest] : [latest];
}

export async function fetchIndonesiaMacro(
	policy: FetchPolicy,
): Promise<Record<string, MacroSeries>> {
	const result: Record<string, MacroSeries> = {};
	await Promise.all(
		DOMESTIC_SERIES.map(async (id) => {
			let provider = "Bank Indonesia";
			let rows: MacroObservation[] = [];
			try {
				const response = await fetch(
					`${base}${id === "BI_POLICY_RATE" ? "bi-rate" : "data-inflasi"}.aspx`,
					buildFetchInit(policy, {
						Accept: "text/html",
						"User-Agent": BROWSER_USER_AGENT,
					}),
				);
				if (response.ok) rows = parseBiObservations(await response.text());
			} catch (error) {
				console.warn(
					`[Indonesia macro] ${id} fetch failed`,
					error instanceof Error ? error.name : "Fetch error",
				);
			}
			const lastPeriod = rows.at(-1)?.date;
			const periodEnd =
				id === "ID_CPI_YOY" && lastPeriod
					? new Date(
							Date.UTC(
								Number(lastPeriod.slice(0, 4)),
								Number(lastPeriod.slice(5, 7)),
								0,
							),
						)
							.toISOString()
							.slice(0, 10)
					: undefined;
			if (
				id === "BI_POLICY_RATE" &&
				marketEvidence(
					provider,
					"live",
					rows.at(-1)?.date,
					new Date().toISOString(),
					75,
				).status !== "current"
			)
				rows = [];
			if (!rows.length && id === "BI_POLICY_RATE") {
				try {
					const start = `${new Date().getUTCFullYear() - 1}-01-01`;
					const response = await fetch(
						`https://stats.bis.org/api/v1/data/WS_CBPOL/D.ID?startPeriod=${start}&format=csv`,
						buildFetchInit(policy, { Accept: "text/csv" }),
					);
					if (response.ok) rows = parseBisPolicy(await response.text());
					provider = "BIS";
				} catch (error) {
					console.warn(
						"[Indonesia macro] BIS fallback failed",
						error instanceof Error ? error.name : "Fetch error",
					);
				}
			}
			if (rows.length)
				result[id] = {
					observationPeriodEnd: periodEnd,
					id,
					name:
						id === "BI_POLICY_RATE" ? "BI policy rate" : "Indonesia CPI YoY",
					frequency: id === "BI_POLICY_RATE" ? "Policy decisions" : "Monthly",
					units: "Percent",
					provider,
					data: rows,
					origin: "live",
					retrievedAt: new Date().toISOString(),
				};
			else
				policy.onError?.(
					`${id}: no current usable observation from approved providers`,
				);
		}),
	);
	return result;
}
