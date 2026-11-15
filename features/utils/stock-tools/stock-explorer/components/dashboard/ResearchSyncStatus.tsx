"use client";

import { useCallback, useEffect, useState } from "react";

type Status = {
	state: string;
	session?: string;
	checkedAt?: string;
	reason?: string;
	retrievedAt?: string;
	covered?: number;
	universe?: number;
	rejected?: number;
	previouslyAttempted?: number;
	backfillFailures?: number;
	backfillBatch?: number;
};

export function ResearchSyncStatus() {
	const [status, setStatus] = useState<Status | null>(null);
	const [busy, setBusy] = useState(false);
	const [failed, setFailed] = useState(false);
	const load = useCallback(async (method: "GET" | "POST") => {
		setBusy(true);
		setFailed(false);
		try {
			const response = await fetch("/api/admin/idx-research", {
				method,
				cache: "no-store",
			});
			const result = await response.json();
			if (!response.ok && !result.status)
				throw new Error("Research sync status unavailable");
			setStatus(result.status);
		} catch {
			setFailed(true);
		} finally {
			setBusy(false);
		}
	}, []);
	useEffect(() => {
		void load("GET");
	}, [load]);
	return (
		<section
			className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs"
			aria-busy={busy}
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="font-semibold text-slate-900">IDX research sync</h2>
					<p
						className="mt-1 text-sm text-slate-700"
						role={failed ? "alert" : "status"}
					>
						{busy
							? "Checking research sync…"
							: failed
								? "Could not load sync status."
								: (status?.reason ??
									(status?.session
										? `Completed session ${status.session}.`
										: status?.state === "busy"
											? "A research batch is running."
											: "No research sync recorded."))}
					</p>
				</div>
				<button
					type="button"
					disabled={busy}
					onClick={() => void load("POST")}
					className="min-h-11 shrink-0 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-60"
				>
					Run research batch
				</button>
			</div>
			{status && (
				<dl className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
					{[
						[
							"Last data retrieval",
							status.retrievedAt
								? new Date(status.retrievedAt).toLocaleString("en-GB", {
										timeZone: "Asia/Jakarta",
									}) + " WIB"
								: undefined,
						],
						[
							"260-session coverage",
							status.covered == null
								? undefined
								: `${status.covered} of ${status.universe}`,
						],
						["Rejected observations", status.rejected],
						[
							"Backfill progress",
							status.previouslyAttempted == null
								? undefined
								: `${status.previouslyAttempted} attempted. Last batch: ${status.backfillFailures} of ${status.backfillBatch} failed.`,
						],
					].map(
						([key, value]) =>
							value != null && (
								<div key={key}>
									<dt>{key}</dt>
									<dd className="font-semibold tabular-nums text-slate-900">
										{value}
									</dd>
								</div>
							),
					)}
				</dl>
			)}
		</section>
	);
}
