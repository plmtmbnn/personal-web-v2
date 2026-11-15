"use client";

import { useState } from "react";
import type { StockResearch } from "../../utils/idx-research";

type EvidenceResponse = {
	session: string | null;
	version: string | null;
	evidence: StockResearch | null;
	outcomes: {
		session: string;
		observedSessions: number;
		forward5: number | null;
		forward20: number | null;
		replayNetR: number | null;
	}[];
};
const label: Record<string, string> = {
	history: "Continuous daily history",
	liquidity: "Liquidity",
	above150And200: "Close above SMA150 and SMA200",
	sma150Above200: "SMA150 above SMA200",
	sma200Rising: "Rising SMA200",
	aboveSma50: "Close above SMA50",
	distanceFromLow: "Distance from 52-week low",
	distanceFromHigh: "Distance from 52-week high",
	relativeStrength: "Relative strength rank",
	contraction: "Tightening contractions",
	volumeDryUp: "Volume dry-up",
	breakoutVolume: "Breakout volume",
	pivotCross: "Close crossed the pivot",
};
const number = (value: number | null, unit = "") =>
	value == null
		? "Unavailable"
		: value.toLocaleString("en-US", { maximumFractionDigits: 2 }) + unit;

export function ResearchEvidence({
	symbol,
	stockSession,
}: {
	symbol: string;
	stockSession: string | null;
}) {
	const [data, setData] = useState<EvidenceResponse | null>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState(false);
	const load = async () => {
		setBusy(true);
		setError(false);
		try {
			const response = await fetch(
				`/api/utils/stock-research?symbol=${encodeURIComponent(symbol)}`,
				{ signal: AbortSignal.timeout(10_000) },
			);
			if (!response.ok) throw new Error("Research unavailable");
			setData(await response.json());
		} catch {
			setError(true);
		} finally {
			setBusy(false);
		}
	};
	const item = data?.evidence;
	return (
		<details
			className="rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700"
			onToggle={(event) => {
				if (event.currentTarget.open && !data && !busy && !error) void load();
			}}
		>
			<summary className="flex min-h-11 cursor-pointer items-center font-semibold text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600">
				Research evidence
			</summary>
			<div className="space-y-3 pb-4" aria-busy={busy}>
				{busy && (
					<p role="status" className="min-h-12">
						Loading completed-session evidence…
					</p>
				)}
				{error && (
					<p role="alert">
						Research could not load.{" "}
						<button
							type="button"
							onClick={load}
							disabled={busy}
							className="min-h-11 text-indigo-700 underline active:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-60"
						>
							Retry
						</button>
					</p>
				)}
				{data && !item && <p>No completed research snapshot for {symbol}.</p>}
				{data && item && (
					<>
						<p>
							{data.session}
							{data.session !== stockSession ? " (historical snapshot)" : ""}.{" "}
							{data.version}. {item.sessions} usable sessions.
						</p>
						<p>
							{item.provider === "yahoo"
								? "Yahoo Finance"
								: item.provider
									? "IDX daily summary"
									: "Source unavailable"}
							{item.verifiedOverlap
								? " with verified Yahoo and IDX overlap"
								: ""}
							. {item.reason}
						</p>
						<dl className="grid grid-cols-1 gap-2 tabular-nums sm:grid-cols-2">
							{[
								[
									"SMA50 / 150 / 200",
									[item.sma50, item.sma150, item.sma200]
										.map((x) => number(x))
										.join(" / "),
								],
								["SMA200 slope", number(item.slope200Pct, "%")],
								["52-week range position", number(item.rangePositionPct, "%")],
								[
									"63-session return vs IHSG",
									number(item.relativeStrength, " pp"),
								],
								["Eligible-universe percentile", number(item.percentile)],
								[
									"Pivot / invalidation",
									`${number(item.pivot)} / ${number(item.stop)}`,
								],
								[
									"Contraction depths",
									item.contractions.map((x) => number(x, "%")).join(", ") ||
										"Unavailable",
								],
								[
									"Dry-up / breakout volume",
									`${number(item.volumeDryUp, "×")} / ${number(item.breakoutVolume, "×")}`,
								],
							].map(([key, value]) => (
								<div key={key}>
									<dt className="text-slate-600">{key}</dt>
									<dd className="font-medium text-slate-900">{value}</dd>
								</div>
							))}
						</dl>
						<ul className="divide-y divide-slate-100">
							{Object.entries(item.criteria).map(([key, state]) => (
								<li
									key={key}
									className="flex flex-wrap justify-between gap-x-3 py-1.5"
								>
									<span>{label[key] ?? key}</span>
									<span className="capitalize">{state}</span>
								</li>
							))}
						</ul>
						{data.outcomes.length > 0 && (
							<div className="border-t border-slate-200 pt-3">
								<h3 className="font-semibold">
									Recent breakout outcomes ({data.outcomes.length})
								</h3>
								<p className="py-1">
									Forward returns and simulated results depend on available
									prices. History can omit delisted stocks and corporate
									actions.
								</p>
								<ul className="space-y-2 tabular-nums">
									{data.outcomes.map((row) => (
										<li key={row.session}>
											{row.session}: 5 sessions {number(row.forward5, "%")}, 20
											sessions{" "}
											{row.observedSessions < 20
												? "Pending"
												: number(row.forward20, "%")}
											; replay {number(row.replayNetR, "R")}.
										</li>
									))}
								</ul>
							</div>
						)}
					</>
				)}
			</div>
		</details>
	);
}
