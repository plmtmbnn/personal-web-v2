import type { StockPickWithMetrics } from "../../types";
import { ENTRY_CHECK_LABELS, type EntryCheck } from "../../utils/paper-risk";
import { jakartaDate } from "@/services/market-data/provenance";

const idr = (value: number | null | undefined) =>
	value == null
		? "Unavailable"
		: "Rp " + Math.round(value).toLocaleString("id-ID");

export function WeeklyReview({ trades }: { trades: StockPickWithMetrics[] }) {
	const today = jakartaDate(Date.now());
	const daysSinceMonday = (new Date(today).getUTCDay() + 6) % 7;
	const monday = jakartaDate(Date.parse(today) - daysSinceMonday * 86_400_000);
	const week = trades.filter(
		(trade) =>
			trade.closedDate &&
			trade.closedDate >= monday &&
			trade.closedDate <= today,
	);
	const groups = new Map<
		string,
		{ trades: number; sumR: number; measured: number }
	>();
	const failures = new Map<EntryCheck, number>();
	let missing = 0;
	let overrides = 0;
	let overrideWins = 0;
	let overrideLosses = 0;
	let overrideUnmeasured = 0;
	for (const trade of week) {
		const decision = trade.decision;
		if (!decision || trade.review?.realizedR == null) missing++;
		const groupKey = decision
			? decision.setup + " / " + decision.regime.replace("_", " ")
			: "Entry evidence unavailable";
		const group = groups.get(groupKey) ?? { trades: 0, sumR: 0, measured: 0 };
		group.trades++;
		if (trade.review?.realizedR != null) {
			group.measured++;
			group.sumR += trade.review.realizedR;
		}
		groups.set(groupKey, group);
		for (const check of decision?.failed ?? [])
			failures.set(check, (failures.get(check) ?? 0) + 1);
		if (decision?.overrideReason) {
			overrides++;
			if (!trade.review) overrideUnmeasured++;
			else if (trade.review.netPnlIdr > 0) overrideWins++;
			else if (trade.review.netPnlIdr < 0) overrideLosses++;
		}
	}
	return (
		<details className="rounded-3xl border border-slate-200 bg-white px-5 shadow-xs">
			<summary className="flex min-h-12 cursor-pointer items-center font-semibold text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600">
				Weekly review
			</summary>
			<div className="space-y-3 border-t border-slate-100 py-4 text-sm text-slate-700">
				<p className="tabular-nums">
					{monday} to {today} WIB. {week.length} closed trades.
				</p>
				{week.length === 0 ? (
					<p>Closed paper trades from this week will appear here.</p>
				) : (
					<>
						<p>
							{missing} trades lack a measured return in R. {overrides}{" "}
							overrides: {overrideWins} profitable, {overrideLosses} losing,{" "}
							{overrides - overrideWins - overrideLosses - overrideUnmeasured}{" "}
							flat, {overrideUnmeasured} unmeasured.
						</p>
						<ul className="space-y-1">
							{[...groups].map(([key, item]) => (
								<li key={key}>
									{key}: {item.trades} trades.{" "}
									{item.measured
										? `Mean ${(item.sumR / item.measured).toFixed(2)}R (${item.measured} measured).`
										: "No measured return."}
								</li>
							))}
						</ul>
						{failures.size > 0 && (
							<div>
								<h3 className="font-semibold">Failed entry checks</h3>
								<ul>
									{[...failures]
										.sort((a, b) => b[1] - a[1])
										.map(([check, count]) => (
											<li key={check}>
												{ENTRY_CHECK_LABELS[check]} ({count})
											</li>
										))}
								</ul>
							</div>
						)}
						<ul className="divide-y divide-slate-100">
							{week.map((trade) => (
								<li key={trade.id} className="space-y-1 py-2">
									<p className="font-medium">
										{trade.stockCode}, closed {trade.closedDate}
									</p>
									<p>
										Planned risk {idr(trade.decision?.plannedLossIdr)}. Risk at
										recorded entry {idr(trade.review?.actualRiskIdr)}.
									</p>
									<p>
										Net P&amp;L {idr(trade.review?.netPnlIdr)}.{" "}
										{trade.review?.realizedR != null
											? `${trade.review.realizedR.toFixed(2)}R realized.`
											: "Realized R unavailable."}
									</p>
									{trade.decision?.overrideReason && (
										<p className="break-words">
											Override: {trade.decision.overrideReason}
										</p>
									)}
								</li>
							))}
						</ul>
					</>
				)}
			</div>
		</details>
	);
}
