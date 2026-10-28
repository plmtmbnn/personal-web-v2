"use client";

import { useState } from "react";
import {
	ArrowDownRight,
	ArrowUpRight,
	ChevronDown,
	ChevronUp,
} from "lucide-react";
import { formatCompact } from "../../market-detector/lib/format";
import type { TopBrokerBuy, TopBrokerSell } from "../types";

interface BrokerDistributionCardsProps {
	buyers: TopBrokerBuy[];
	sellers: TopBrokerSell[];
	dimension: "volume" | "value";
}

function BrokerCard({
	item,
	isBuyer,
	dimension,
}: {
	item: TopBrokerBuy | TopBrokerSell;
	isBuyer: boolean;
	dimension: "volume" | "value";
}) {
	const [expanded, setExpanded] = useState(false);
	const detail = item.detail ?? { code: "-", type: "", amount: 0 };
	const distributeTo = item.distribute_to ?? [];
	const prefix = dimension === "value" ? "Rp " : "";
	const unitSuffix = dimension === "volume" ? " lots" : "";

	// Calculate counterparties
	const topCount = 4;
	const visibleList = expanded ? distributeTo : distributeTo.slice(0, topCount);
	const hasMore = distributeTo.length > topCount;

	const theme = isBuyer
		? {
				badgeBg: "bg-emerald-50",
				badgeText: "text-emerald-700",
				badgeBorder: "border-emerald-200/80",
				barFill: "bg-emerald-500",
				barTrack: "bg-emerald-50",
				amountText: "text-emerald-600",
			}
		: {
				badgeBg: "bg-rose-50",
				badgeText: "text-rose-700",
				badgeBorder: "border-rose-200/80",
				barFill: "bg-rose-500",
				barTrack: "bg-rose-50",
				amountText: "text-rose-600",
			};

	return (
		<div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5 transition-all hover:border-slate-300">
			{/* Broker Header */}
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2.5">
					<span className="text-base font-extrabold text-slate-900 font-mono tracking-tight">
						{detail.code}
					</span>
					{detail.type && (
						<span
							className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
								detail.type.toLowerCase().includes("asing") ||
								detail.type.toUpperCase() === "F"
									? "bg-amber-50 text-amber-800 border border-amber-200/70"
									: "bg-slate-100 text-slate-600 border border-slate-200"
							}`}
						>
							{detail.type}
						</span>
					)}
				</div>

				<div className="text-right">
					<span
						className={`text-sm sm:text-base font-mono font-extrabold ${theme.amountText}`}
						title={`Exact: ${prefix}${detail.amount?.toLocaleString("id-ID")}${unitSuffix}`}
					>
						{formatCompact(detail.amount, prefix)}
					</span>
					<span className="block text-[10px] text-slate-500 font-medium">
						Total {dimension === "volume" ? "Volume" : "Value"}
					</span>
				</div>
			</div>

			{/* Counterparty List */}
			<div className="space-y-2 pt-2 border-t border-slate-100">
				<div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
					<span>
						{isBuyer
							? "Bought From Counterparties"
							: "Distributed To Counterparties"}
					</span>
					<span>{distributeTo.length} Brokers</span>
				</div>

				{distributeTo.length === 0 ? (
					<p className="text-xs text-slate-500 py-2 italic text-center">
						No counterparty data recorded.
					</p>
				) : (
					<div className="space-y-2">
						{visibleList.map((cp, idx) => {
							const pct =
								detail.amount > 0
									? Math.min(100, Math.round((cp.amount / detail.amount) * 100))
									: 0;

							return (
								<div
									key={`${cp.code}-${idx}`}
									className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1.5"
								>
									<div className="flex items-center justify-between text-xs">
										<div className="flex items-center gap-2">
											<span className="font-mono font-bold text-slate-900">
												{cp.code}
											</span>
											{cp.type && (
												<span className="text-[10px] text-slate-500 font-medium">
													({cp.type})
												</span>
											)}
										</div>

										<div className="flex items-center gap-2 font-mono">
											<span
												className="font-bold text-slate-800"
												title={`Exact: ${prefix}${cp.amount?.toLocaleString("id-ID")}${unitSuffix}`}
											>
												{formatCompact(cp.amount, prefix)}
											</span>
											<span className="text-[11px] text-slate-500 font-semibold w-9 text-right">
												{pct}%
											</span>
										</div>
									</div>

									{/* Progress bar */}
									<div
										className={`w-full h-1.5 rounded-full overflow-hidden ${theme.barTrack}`}
									>
										<div
											className={`h-full rounded-full transition-all duration-300 ${theme.barFill}`}
											style={{ width: `${Math.max(2, pct)}%` }}
										/>
									</div>
								</div>
							);
						})}

						{hasMore && (
							<button
								type="button"
								onClick={() => setExpanded(!expanded)}
								className="w-full py-1.5 px-3 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
							>
								{expanded ? (
									<>
										<span>Show less</span>
										<ChevronUp className="w-3.5 h-3.5" aria-hidden />
									</>
								) : (
									<>
										<span>
											Show {distributeTo.length - topCount} more counterparties
										</span>
										<ChevronDown className="w-3.5 h-3.5" aria-hidden />
									</>
								)}
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export default function BrokerDistributionCards({
	buyers,
	sellers,
	dimension,
}: BrokerDistributionCardsProps) {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{/* Buyers Column */}
			<div className="bg-slate-50/70 rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
				<div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600 shrink-0">
							<ArrowUpRight className="w-5 h-5" aria-hidden />
						</div>
						<div>
							<h3 className="text-base font-extrabold text-slate-900">
								Top Net Buyers
							</h3>
							<p className="text-xs text-slate-500">
								Accumulating brokers and where they acquired shares
							</p>
						</div>
					</div>

					<span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-mono font-bold border border-emerald-200/60">
						{buyers.length} Buyers
					</span>
				</div>

				{buyers.length === 0 ? (
					<div className="p-8 text-center bg-white rounded-2xl border border-slate-200/70 text-slate-500 text-sm">
						No buyer distribution data available.
					</div>
				) : (
					<div className="space-y-4">
						{buyers.map((b, idx) => (
							<BrokerCard
								key={`buy-${b.detail?.code || idx}`}
								item={b}
								isBuyer={true}
								dimension={dimension}
							/>
						))}
					</div>
				)}
			</div>

			{/* Sellers Column */}
			<div className="bg-slate-50/70 rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
				<div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200/70 flex items-center justify-center text-rose-600 shrink-0">
							<ArrowDownRight className="w-5 h-5" aria-hidden />
						</div>
						<div>
							<h3 className="text-base font-extrabold text-slate-900">
								Top Net Sellers
							</h3>
							<p className="text-xs text-slate-500">
								Distributing brokers and who absorbed their inventory
							</p>
						</div>
					</div>

					<span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-mono font-bold border border-rose-200/60">
						{sellers.length} Sellers
					</span>
				</div>

				{sellers.length === 0 ? (
					<div className="p-8 text-center bg-white rounded-2xl border border-slate-200/70 text-slate-500 text-sm">
						No seller distribution data available.
					</div>
				) : (
					<div className="space-y-4">
						{sellers.map((s, idx) => (
							<BrokerCard
								key={`sell-${s.detail?.code || idx}`}
								item={s}
								isBuyer={false}
								dimension={dimension}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
