"use client";

import { useCallback, useEffect, useState } from "react";

type Status = {
	state: "ready" | "waiting" | "busy" | "error";
	session?: string;
	reason?: string;
	retrievedAt?: string;
	covered?: number;
	universe?: number;
	rejected?: number;
	previouslyAttempted?: number;
	backfillFailures?: number;
	backfillBatch?: number;
};

const labels = {
	ready: "Completed",
	waiting: "Waiting",
	busy: "In progress",
	error: "Failed",
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
			const result = (await response.json()) as { status: Status | null };
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

	const stateLabel = failed
		? "Unavailable"
		: busy
			? "Updating"
			: status
				? labels[status.state]
				: "No runs";
	const stateStyle =
		failed || (!busy && status?.state === "error")
			? "border-rose-200 bg-rose-50 text-rose-800"
			: status?.state === "ready" && !busy
				? "border-emerald-200 bg-emerald-50 text-emerald-800"
				: status?.state === "waiting" && !busy
					? "border-amber-200 bg-amber-50 text-amber-900"
					: "border-slate-200 bg-slate-50 text-slate-700";
	const message = failed
		? "Could not load research status. Retry to check the latest result."
		: busy
			? status?.state === "ready"
				? "Running research batch. Showing the previous result."
				: status
					? "Running research batch."
					: "Checking research status."
			: (status?.reason ??
				(status?.state === "busy"
					? "A research batch is already running."
					: status?.session
						? `Session ${status.session}`
						: "No research batch recorded yet."));
	const canShowResults = !failed && status?.state === "ready";
	const hasCoverage =
		typeof status?.covered === "number" &&
		typeof status.universe === "number" &&
		status.universe > 0;
	const coverageWidth = hasCoverage
		? Math.min(100, Math.max(0, (status.covered! / status.universe!) * 100))
		: 0;
	const retrievedDate = status?.retrievedAt
		? new Date(status.retrievedAt)
		: null;
	const retrievedAt =
		retrievedDate && !Number.isNaN(retrievedDate.getTime())
			? `${new Intl.DateTimeFormat("en-GB", {
					timeZone: "Asia/Jakarta",
					day: "numeric",
					month: "short",
					year: "numeric",
					hour: "2-digit",
					minute: "2-digit",
					hour12: false,
				}).format(retrievedDate)} WIB`
			: "N/A";

	return (
		<section
			className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6"
			aria-busy={busy}
		>
			<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2.5">
						<h2 className="text-lg font-semibold text-slate-900">
							IDX research sync
						</h2>
						<span
							className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${stateStyle}`}
						>
							{stateLabel}
						</span>
					</div>
					<p
						className="mt-1 text-sm text-slate-700"
						role={
							failed || (!busy && status?.state === "error")
								? "alert"
								: "status"
						}
					>
						{message}
					</p>
				</div>
				<button
					type="button"
					disabled={busy}
					onClick={() =>
						void load(failed || status?.state === "busy" ? "GET" : "POST")
					}
					className="min-h-11 w-full shrink-0 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-60 lg:w-auto"
				>
					{busy
						? status
							? "Running batch…"
							: "Checking status…"
						: failed || status?.state === "busy"
							? "Check status"
							: status?.state === "error"
								? "Retry research batch"
								: "Run research batch"}
				</button>
			</div>
			{busy && !status && (
				<div
					className="mt-5 grid gap-5 border-t border-slate-100 pt-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-7"
					aria-hidden="true"
				>
					<div className="h-36 rounded-2xl border border-slate-200 bg-slate-100 motion-safe:animate-pulse" />
					<div className="grid grid-cols-2 gap-4">
						<div className="h-16 rounded-xl bg-slate-100 motion-safe:animate-pulse" />
						<div className="h-16 rounded-xl bg-slate-100 motion-safe:animate-pulse" />
						<div className="col-span-2 h-16 rounded-xl bg-slate-100 motion-safe:animate-pulse" />
					</div>
				</div>
			)}

			{canShowResults && (
				<div className="mt-5 grid gap-5 border-t border-slate-100 pt-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-7">
					<div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
						<h3 className="text-sm font-semibold text-slate-700">
							260-session history coverage
						</h3>
						<p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
							{hasCoverage ? status.covered!.toLocaleString() : "N/A"}
							{hasCoverage && (
								<span className="ml-1.5 text-base font-medium text-slate-600">
									of {status.universe!.toLocaleString()} stocks
								</span>
							)}
						</p>
						{hasCoverage && (
							<div
								role="progressbar"
								aria-label="Stocks with 260-session history coverage"
								aria-valuemin={0}
								aria-valuemax={status.universe}
								aria-valuenow={status.covered}
								className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200"
							>
								<div
									className="h-full rounded-full bg-indigo-600"
									style={{ width: `${coverageWidth}%` }}
								/>
							</div>
						)}
					</div>
					<dl className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-4 text-sm sm:grid-cols-2">
						<div className="min-w-0">
							<dt className="text-slate-600">Last data retrieval</dt>
							<dd className="mt-1 font-semibold tabular-nums text-slate-900">
								{retrievedAt}
							</dd>
						</div>
						<div>
							<dt className="text-slate-600">Excluded source rows</dt>
							<dd className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
								{status.rejected?.toLocaleString() ?? "N/A"}
							</dd>
						</div>
						<div className="border-t border-slate-100 pt-3 sm:col-span-2">
							<dt className="text-slate-600">History backfill</dt>
							<dd className="mt-1 font-semibold tabular-nums text-slate-900">
								{status.previouslyAttempted == null
									? "N/A"
									: `${status.previouslyAttempted.toLocaleString()} symbols attempted`}
							</dd>
							{status.backfillBatch != null &&
								status.backfillFailures != null && (
									<p className="mt-1 text-sm text-slate-600">
										Latest batch: {status.backfillBatch.toLocaleString()}{" "}
										symbols, {status.backfillFailures.toLocaleString()} failed
									</p>
								)}
						</div>
					</dl>
				</div>
			)}
		</section>
	);
}
