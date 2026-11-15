"use client";

import type { ResearchSummary } from "../../utils/idx-research";

export const RESEARCH_FILTERS = {
	all: "All stocks",
	trend: "Trend leaders",
	strength: "Relative strength",
	contraction: "VCP candidates",
	breakout: "Confirmed breakouts",
} as const;
export type ResearchFilter = keyof typeof RESEARCH_FILTERS;

function coverageText(hits: number, covered: number) {
	return covered
		? `${Math.round((100 * hits) / covered)}% (${hits}/${covered})`
		: "Unavailable";
}

export function ResearchFilters({
	research,
	filter,
	onChange,
}: {
	research: ResearchSummary | null;
	filter: ResearchFilter;
	onChange: (filter: ResearchFilter) => void;
}) {
	const breadth = research?.breadth;
	return (
		<section
			aria-label="IDX research"
			className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs"
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h2 className="font-semibold text-slate-900">IDX research</h2>
					<p className="mt-1 text-sm text-slate-600" aria-live="polite">
						{research?.current
							? `Completed session ${research.session}. Open a ticker for its evidence.`
							: research
								? `Research from ${research.session}. Waiting for the latest verified close.`
								: "No research snapshot yet. The existing screener remains available."}
					</p>
				</div>
				<label className="grid gap-1 text-sm font-medium text-slate-700">
					Screen
					<select
						className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 active:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
						value={filter}
						onChange={(e) => onChange(e.target.value as ResearchFilter)}
					>
						{Object.entries(RESEARCH_FILTERS).map(([key, label]) => (
							<option
								key={key}
								value={key}
								disabled={key !== "all" && !research?.current}
							>
								{label}
							</option>
						))}
					</select>
				</label>
			</div>
			{research?.current && breadth && (
				<details className="mt-3 border-t border-slate-200 text-sm text-slate-700">
					<summary className="flex min-h-11 cursor-pointer items-center font-medium focus-visible:outline-2 focus-visible:outline-indigo-600">
						Market participation
					</summary>
					<p className="tabular-nums">
						{breadth.advancers} advanced, {breadth.decliners} declined,{" "}
						{breadth.unchanged} unchanged across {breadth.total} stocks.
					</p>
					<div className="mt-3 overflow-x-auto">
						<table className="w-full text-left tabular-nums">
							<thead>
								<tr className="border-b border-slate-200">
									<th scope="col" className="py-2 pr-3">
										Universe
									</th>
									<th scope="col" className="py-2 pr-3">
										Above SMA50
									</th>
									<th scope="col" className="py-2">
										Above SMA200
									</th>
								</tr>
							</thead>
							<tbody>
								{[
									["All stocks", breadth] as const,
									...Object.entries(breadth.sectors),
								].map(([name, row]) => (
									<tr key={name} className="border-b border-slate-100">
										<th scope="row" className="py-2 pr-3 font-medium">
											{name} ({row.total})
										</th>
										<td className="py-2 pr-3">
											{coverageText(row.above50, row.covered50)}
										</td>
										<td className="py-2">
											{coverageText(row.above200, row.covered200)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</details>
			)}
		</section>
	);
}
