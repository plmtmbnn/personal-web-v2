"use client";

import { ChevronDown } from "lucide-react";
import { Fragment, useState } from "react";
import {
	Line,
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type {
	SwingCandidate,
	SwingScanResponse,
} from "../../utils/idx-research";

const number = new Intl.NumberFormat("id-ID");
const multiple = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });
const date = new Intl.DateTimeFormat("en-GB", {
	day: "numeric",
	month: "short",
	year: "numeric",
	timeZone: "Asia/Jakarta",
});
const rupiah = (value: number) => `Rp ${number.format(value)}`;

export function swingSessionLabel(session: string) {
	return date.format(new Date(session));
}

const cellClass = "font-mono text-sm font-semibold tabular-nums text-slate-900";

function tradeFields(candidate: SwingCandidate) {
	return [
		[
			"Buy range",
			candidate.entryLow === candidate.entryHigh
				? rupiah(candidate.entryLow)
				: `${rupiah(candidate.entryLow)} to ${rupiah(candidate.entryHigh)}`,
		],
		["Stop", rupiah(candidate.stop)],
		["First target", rupiah(candidate.target)],
		["Net R at buy cap", `${multiple.format(candidate.netRAtCap)}R`],
	] as const;
}

function SwingEvidence({ candidate }: { candidate: SwingCandidate }) {
	const closes = candidate.chart.map(({ close }) => close);
	return (
		<div className="grid min-w-0 gap-4 border-t border-slate-100 bg-slate-50/70 p-4 lg:grid-cols-[minmax(0,1fr)_13rem] sm:p-5">
			<figure className="min-w-0">
				<figcaption className="mb-2 text-sm font-semibold text-slate-900">
					Recent daily closes
				</figcaption>
				<div className="h-44 w-full min-w-0">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart
							data={candidate.chart}
							margin={{ top: 6, right: 8, bottom: 0, left: 0 }}
						>
							<XAxis
								dataKey="session"
								tickFormatter={(value: string) => value.slice(5)}
								minTickGap={28}
								tick={{ fontSize: 11 }}
							/>
							<YAxis
								width={57}
								dataKey="close"
								domain={[
									Math.floor(Math.min(candidate.stop, ...closes) * 0.995),
									Math.ceil(Math.max(candidate.target, ...closes) * 1.005),
								]}
								tickFormatter={(value: number) => number.format(value)}
								tick={{ fontSize: 11 }}
							/>
							<Tooltip
								formatter={(value) => [rupiah(Number(value)), "Close"]}
							/>
							<ReferenceLine
								y={candidate.pivot}
								stroke="#64748b"
								strokeDasharray="4 4"
							/>
							<ReferenceLine
								y={candidate.stop}
								stroke="#be123c"
								strokeDasharray="4 4"
							/>
							<ReferenceLine
								y={candidate.target}
								stroke="#047857"
								strokeDasharray="4 4"
							/>
							<Line
								dataKey="close"
								type="linear"
								stroke="#1e40af"
								strokeWidth={2}
								dot={false}
								isAnimationActive={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</figure>
			<dl className="grid content-start gap-2.5 text-sm">
				<div>
					<dt className="text-slate-600">Breakout pivot</dt>
					<dd className={cellClass}>{rupiah(candidate.pivot)}</dd>
				</div>
				<div>
					<dt className="text-slate-600">Prior resistance</dt>
					<dd className={cellClass}>{rupiah(candidate.resistance)}</dd>
					<dd className="text-xs text-slate-600">
						{swingSessionLabel(candidate.resistanceSession)}
					</dd>
				</div>
				<div>
					<dt className="text-slate-600">20-session median turnover</dt>
					<dd className={cellClass}>{rupiah(candidate.medianTurnover)}</dd>
				</div>
			</dl>
		</div>
	);
}

function TickerButton({
	candidate,
	open,
	onClick,
}: {
	candidate: SwingCandidate;
	open: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			aria-expanded={open}
			onClick={onClick}
			className="inline-flex min-h-11 items-center gap-2 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-blue-700"
		>
			<span>
				<span className="block font-semibold text-slate-900">
					{candidate.symbol}
				</span>
				<span className="block text-xs text-slate-600">
					Above {rupiah(candidate.pivot)} on{" "}
					{multiple.format(candidate.breakoutVolume)}× volume
				</span>
			</span>
			<ChevronDown
				aria-hidden="true"
				className={`size-4 shrink-0 text-slate-500 ${open ? "rotate-180" : ""}`}
			/>
		</button>
	);
}

export function SwingShortlistSkeleton() {
	return (
		<section
			aria-label="Loading opening shortlist"
			aria-busy="true"
			className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6"
		>
			<div className="h-5 w-44 rounded bg-slate-200 motion-safe:animate-pulse" />
			<div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-100 motion-safe:animate-pulse" />
			<div className="mt-5 h-24 rounded-xl border border-slate-100 bg-slate-50 motion-safe:animate-pulse" />
		</section>
	);
}

export default function SwingShortlist({ scan }: { scan: SwingScanResponse }) {
	const [expanded, setExpanded] = useState<{
		symbol: string;
		layout: "table" | "cards";
	} | null>(null);
	const toggle = (symbol: string, layout: "table" | "cards") =>
		setExpanded((current) =>
			current?.symbol === symbol && current.layout === layout
				? null
				: { symbol, layout },
		);
	const tableSymbol = expanded?.layout === "table" ? expanded.symbol : null;
	const cardSymbol = expanded?.layout === "cards" ? expanded.symbol : null;
	return (
		<section
			aria-labelledby="swing-shortlist-title"
			className="rounded-3xl border border-slate-200/80 bg-white shadow-xs"
		>
			<div className="p-5 sm:px-6">
				<h2
					id="swing-shortlist-title"
					className="text-lg font-semibold text-slate-900"
				>
					Opening shortlist
				</h2>
				{scan.candidates.length > 0 && (
					<p className="mt-1 text-sm text-slate-600">
						Check your broker’s first tradable ask. Pass for the day if it falls
						outside the buy range.
					</p>
				)}
			</div>
			{scan.candidates.length === 0 ? (
				<p
					role="status"
					className="border-t border-slate-100 px-5 py-5 text-sm text-slate-700 sm:px-6"
				>
					{scan.reason ?? "No qualifying breakouts"}
				</p>
			) : (
				<>
					<table className="hidden w-full table-fixed border-collapse text-left lg:table">
						<thead className="border-y border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
							<tr>
								<th scope="col" className="w-[28%] px-6 py-3">
									Ticker
								</th>
								<th scope="col" className="w-[27%] px-3 py-3">
									Buy range
								</th>
								<th scope="col" className="w-[13%] px-3 py-3">
									Stop
								</th>
								<th scope="col" className="w-[16%] px-3 py-3">
									First target
								</th>
								<th scope="col" className="px-3 py-3">
									Net R at buy cap
								</th>
							</tr>
						</thead>
						<tbody>
							{scan.candidates.map((candidate) => (
								<Fragment key={candidate.symbol}>
									<tr className="border-b border-slate-100 last:border-b-0">
										<th scope="row" className="px-6 py-2">
											<TickerButton
												candidate={candidate}
												open={tableSymbol === candidate.symbol}
												onClick={() => toggle(candidate.symbol, "table")}
											/>
										</th>
										{tradeFields(candidate).map(([label, value]) => (
											<td key={label} className={`${cellClass} px-3 py-2`}>
												{value}
											</td>
										))}
									</tr>
									{tableSymbol === candidate.symbol && (
										<tr>
											<td colSpan={5}>
												<SwingEvidence candidate={candidate} />
											</td>
										</tr>
									)}
								</Fragment>
							))}
						</tbody>
					</table>
					<ul className="divide-y divide-slate-100 border-t border-slate-100 lg:hidden">
						{scan.candidates.map((candidate) => (
							<li key={candidate.symbol}>
								<div className="px-5 py-3 sm:px-6">
									<TickerButton
										candidate={candidate}
										open={cardSymbol === candidate.symbol}
										onClick={() => toggle(candidate.symbol, "cards")}
									/>
									<dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 min-[600px]:grid-cols-[1.5fr_1fr_1fr_1fr]">
										{tradeFields(candidate).map(([label, value]) => (
											<div
												key={label}
												className={
													label === "Buy range"
														? "col-span-2 min-[600px]:col-span-1"
														: ""
												}
											>
												<dt className="text-xs text-slate-600">{label}</dt>
												<dd className={cellClass}>{value}</dd>
											</div>
										))}
									</dl>
								</div>
								{cardSymbol === candidate.symbol && (
									<SwingEvidence candidate={candidate} />
								)}
							</li>
						))}
					</ul>
				</>
			)}
		</section>
	);
}
