import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatCompact, parseRawNum } from "../lib/format";
import type { BrokerSummary } from "../types";

interface BrokerSummaryTablesProps {
	summary: BrokerSummary;
}

export default function BrokerSummaryTables({
	summary,
}: BrokerSummaryTablesProps) {
	const buyers = summary.brokers_buy ?? [];
	const sellers = summary.brokers_sell ?? [];

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{/* Top Net Buyers Card */}
			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
				<div className="flex items-center justify-between pb-3 border-b border-slate-100">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600 shrink-0">
							<ArrowUpRight className="w-5 h-5" aria-hidden />
						</div>
						<div>
							<h3 className="text-base font-extrabold text-slate-900">
								Top Net Buyers
							</h3>
							<p className="text-xs text-slate-500">
								Brokers accumulating net long positions
							</p>
						</div>
					</div>

					<span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-mono font-bold">
						{buyers.length} Brokers
					</span>
				</div>

				<div className="overflow-x-auto border border-slate-200 rounded-2xl">
					<table className="w-full text-xs text-left">
						<thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
							<tr>
								<th className="py-2.5 px-3">Broker</th>
								<th className="py-2.5 px-3 text-right">Lots</th>
								<th className="py-2.5 px-3 text-right">Value</th>
								<th className="py-2.5 px-3 text-right">Avg Price</th>
								<th className="py-2.5 px-3 text-right">Freq</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 font-mono">
							{buyers.length === 0 ? (
								<tr>
									<td
										colSpan={5}
										className="py-6 text-center text-slate-500 font-sans"
									>
										No buyer data available.
									</td>
								</tr>
							) : (
								buyers.map((b, idx) => {
									const rawLots = parseRawNum(
										b.blot != null && b.blot !== "" ? b.blot : b.blotv,
									);
									const rawVal = parseRawNum(
										b.bval != null && b.bval !== "" ? b.bval : b.bvalv,
									);
									const exactVal =
										rawVal < 0
											? `-Rp ${Math.abs(rawVal).toLocaleString("id-ID")}`
											: `Rp ${rawVal.toLocaleString("id-ID")}`;

									return (
										<tr
											key={`${b.netbs_broker_code}-${idx}`}
											className="hover:bg-slate-50/70 transition-colors"
										>
											<td className="py-2.5 px-3">
												<div className="flex items-center gap-2">
													<span className="font-extrabold text-slate-900">
														{b.netbs_broker_code}
													</span>
													{b.type && (
														<span
															className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
																b.type.toUpperCase() === "F"
																	? "bg-amber-100 text-amber-800"
																	: "bg-slate-100 text-slate-600"
															}`}
														>
															{b.type}
														</span>
													)}
												</div>
											</td>
											<td
												className="py-2.5 px-3 text-right font-medium text-slate-700"
												title={`Exact: ${rawLots.toLocaleString("id-ID")} lots`}
											>
												{formatCompact(rawLots)}
											</td>
											<td
												className="py-2.5 px-3 text-right font-bold text-emerald-600"
												title={`Exact: ${exactVal}`}
											>
												{formatCompact(rawVal, "Rp ")}
											</td>
											<td className="py-2.5 px-3 text-right font-semibold text-slate-900">
												{Number(b.netbs_buy_avg_price || 0).toLocaleString(
													"id-ID",
												)}
											</td>
											<td className="py-2.5 px-3 text-right text-slate-500">
												{Number(b.freq || 0).toLocaleString("id-ID")}
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Top Net Sellers Card */}
			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
				<div className="flex items-center justify-between pb-3 border-b border-slate-100">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200/70 flex items-center justify-center text-rose-600 shrink-0">
							<ArrowDownRight className="w-5 h-5" aria-hidden />
						</div>
						<div>
							<h3 className="text-base font-extrabold text-slate-900">
								Top Net Sellers
							</h3>
							<p className="text-xs text-slate-500">
								Brokers offloading net short positions
							</p>
						</div>
					</div>

					<span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-mono font-bold">
						{sellers.length} Brokers
					</span>
				</div>

				<div className="overflow-x-auto border border-slate-200 rounded-2xl">
					<table className="w-full text-xs text-left">
						<thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
							<tr>
								<th className="py-2.5 px-3">Broker</th>
								<th className="py-2.5 px-3 text-right">Lots</th>
								<th className="py-2.5 px-3 text-right">Value</th>
								<th className="py-2.5 px-3 text-right">Avg Price</th>
								<th className="py-2.5 px-3 text-right">Freq</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 font-mono">
							{sellers.length === 0 ? (
								<tr>
									<td
										colSpan={5}
										className="py-6 text-center text-slate-500 font-sans"
									>
										No seller data available.
									</td>
								</tr>
							) : (
								sellers.map((s, idx) => {
									const rawLots = parseRawNum(
										s.slot != null && s.slot !== "" ? s.slot : s.slotv,
									);
									const rawVal = parseRawNum(
										s.sval != null && s.sval !== "" ? s.sval : s.svalv,
									);
									const exactVal =
										rawVal < 0
											? `-Rp ${Math.abs(rawVal).toLocaleString("id-ID")}`
											: `Rp ${rawVal.toLocaleString("id-ID")}`;

									return (
										<tr
											key={`${s.netbs_broker_code}-${idx}`}
											className="hover:bg-slate-50/70 transition-colors"
										>
											<td className="py-2.5 px-3">
												<div className="flex items-center gap-2">
													<span className="font-extrabold text-slate-900">
														{s.netbs_broker_code}
													</span>
													{s.type && (
														<span
															className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
																s.type.toUpperCase() === "F"
																	? "bg-amber-100 text-amber-800"
																	: "bg-slate-100 text-slate-600"
															}`}
														>
															{s.type}
														</span>
													)}
												</div>
											</td>
											<td
												className="py-2.5 px-3 text-right font-medium text-slate-700"
												title={`Exact: ${rawLots.toLocaleString("id-ID")} lots`}
											>
												{formatCompact(rawLots)}
											</td>
											<td
												className="py-2.5 px-3 text-right font-bold text-rose-600"
												title={`Exact: ${exactVal}`}
											>
												{formatCompact(rawVal, "Rp ")}
											</td>
											<td className="py-2.5 px-3 text-right font-semibold text-slate-900">
												{Number(s.netbs_sell_avg_price || 0).toLocaleString(
													"id-ID",
												)}
											</td>
											<td className="py-2.5 px-3 text-right text-slate-500">
												{Number(s.freq || 0).toLocaleString("id-ID")}
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
