"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
	Search,
	ArrowUpDown,
	TrendingUp,
	TrendingDown,
	Minus,
	RefreshCw,
	ArrowLeft,
	ArrowUp,
	ArrowDown,
	Filter,
	X,
	Settings,
	Activity,
	Globe,
	BarChart2,
	ChevronRight,
	Zap,
	Eye,
	AlertCircle,
	DollarSign,
	Flame,
	ArrowRightLeft,
	ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface IDXStock {
	No: number;
	IDStockSummary: number;
	Date: string;
	StockCode: string;
	StockName: string;
	Remarks: string;
	Previous: number;
	OpenPrice: number;
	FirstTrade: number;
	High: number;
	Low: number;
	Close: number;
	Change: number;
	Volume: number;
	Value: number;
	Frequency: number;
	IndexIndividual: number;
	Offer: number;
	OfferVolume: number;
	Bid: number;
	BidVolume: number;
	ListedShares: number;
	TradebleShares: number;
	WeightForIndex: number;
	ForeignSell: number;
	ForeignBuy: number;
	DelistingDate: string;
	NonRegularVolume: number;
	NonRegularValue: number;
	NonRegularFrequency: number;
	persen: number | null;
	percentage: number | null;
}

interface ProcessedStock extends IDXStock {
	ForeignNet: number;
	ChangePct: number;
	IsHighVolume: boolean;
}

type SortKey = keyof IDXStock | "ForeignNet" | "ChangePct";
interface SortConfig {
	key: SortKey;
	direction: "asc" | "desc" | null;
}

// ─── Formatters ────────────────────────────────────────────────────────────

const fmtCompact = (n: number) =>
	n === 0
		? "0"
		: Intl.NumberFormat("en-US", {
				notation: "compact",
				maximumFractionDigits: 2,
			}).format(n);

const fmtIDR = (n: number) =>
	new Intl.NumberFormat("id-ID", {
		style: "decimal",
		minimumFractionDigits: 0,
	}).format(n);

const fmtPct = (n: number, sign = true) =>
	`${sign && n > 0 ? "+" : ""}${n.toFixed(2)}%`;

// ─── Mini bar ──────────────────────────────────────────────────────────────

function Bar({
	pct,
	color = "amber",
	delay = 0,
}: {
	pct: number;
	color?: string;
	delay?: number;
}) {
	const colorMap: Record<string, string> = {
		amber: "bg-amber-400",
		emerald: "bg-emerald-500",
		rose: "bg-rose-400",
		sky: "bg-sky-400",
		stone: "bg-stone-400",
	};
	return (
		<div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
			<motion.div
				initial={{ width: 0 }}
				animate={{ width: `${Math.min(pct * 100, 100)}%` }}
				transition={{ duration: 0.7, ease: "easeOut", delay }}
				className={`h-full rounded-full ${colorMap[color] || "bg-amber-400"}`}
			/>
		</div>
	);
}

// ─── Breadth Gauge (SVG semicircle) ────────────────────────────────────────

function BreadthGauge({
	advancers,
	decliners,
	unchanged,
	total,
}: {
	advancers: number;
	decliners: number;
	unchanged: number;
	total: number;
}) {
	const r = 52;
	const circ = Math.PI * r;
	const advPct = total > 0 ? advancers / total : 0;
	const decPct = total > 0 ? decliners / total : 0;
	const advDash = advPct * circ;
	const decDash = decPct * circ;

	return (
		<div className="flex flex-col items-center">
			<div className="relative w-40 h-22">
				<svg viewBox="0 0 120 68" className="w-40 h-22">
					<path
						d={`M 8,62 A ${r},${r} 0 0,1 112,62`}
						fill="none"
						stroke="#f5f5f4"
						strokeWidth="10"
						strokeLinecap="round"
					/>
					<path
						d={`M 8,62 A ${r},${r} 0 0,1 112,62`}
						fill="none"
						stroke="#fca5a5"
						strokeWidth="10"
						strokeLinecap="round"
						strokeDasharray={`${decDash} ${circ}`}
						strokeDashoffset={-circ + decDash}
						style={{ transform: "scaleX(-1)", transformOrigin: "60px 62px" }}
					/>
					<path
						d={`M 8,62 A ${r},${r} 0 0,1 112,62`}
						fill="none"
						stroke="#34d399"
						strokeWidth="10"
						strokeLinecap="round"
						strokeDasharray={`${advDash} ${circ}`}
					/>
					<text
						x="60"
						y="57"
						textAnchor="middle"
						fontSize="11"
						fill="#44403c"
						fontWeight="800"
					>
						{(advPct * 100).toFixed(0)}%
					</text>
					<text
						x="60"
						y="66"
						textAnchor="middle"
						fontSize="7"
						fill="#a8a29e"
						fontWeight="700"
						letterSpacing="1"
					>
						ADVANCING
					</text>
				</svg>
			</div>
			<div className="flex gap-4 text-[9px] font-black uppercase tracking-wider mt-1">
				<span className="flex items-center gap-1 text-emerald-600">
					<span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
					{advancers} Up
				</span>
				<span className="flex items-center gap-1 text-stone-400">
					<span className="w-2 h-2 rounded-full bg-stone-300 inline-block" />
					{unchanged} Flat
				</span>
				<span className="flex items-center gap-1 text-rose-500">
					<span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
					{decliners} Down
				</span>
			</div>
		</div>
	);
}

// ─── Summary Panel ─────────────────────────────────────────────────────────

function MarketSummary({
	stocks,
	date,
}: {
	stocks: ProcessedStock[];
	date: string;
}) {
	const [tab, setTab] = useState<"movers" | "foreign" | "volume">("movers");

	const total = stocks.length;
	const advancers = stocks.filter((s) => s.Change > 0).length;
	const decliners = stocks.filter((s) => s.Change < 0).length;
	const unchanged = total - advancers - decliners;
	const totalValue = stocks.reduce((a, s) => a + s.Value, 0);
	const totalVolume = stocks.reduce((a, s) => a + s.Volume, 0);
	const totalFrequency = stocks.reduce((a, s) => a + s.Frequency, 0);
	const totalForeignBuy = stocks.reduce((a, s) => a + (s.ForeignBuy || 0), 0);
	const totalForeignSell = stocks.reduce((a, s) => a + (s.ForeignSell || 0), 0);
	const totalForeignNet = totalForeignBuy - totalForeignSell;
	const avgChangePct =
		total > 0 ? stocks.reduce((a, s) => a + s.ChangePct, 0) / total : 0;
	const highVolCount = stocks.filter((s) => s.IsHighVolume).length;
	const fgnNetBuy = stocks.filter((s) => s.ForeignNet > 0).length;

	const topGainers = [...stocks]
		.sort((a, b) => b.ChangePct - a.ChangePct)
		.slice(0, 5);
	const topLosers = [...stocks]
		.sort((a, b) => a.ChangePct - b.ChangePct)
		.slice(0, 5);
	const topVolume = [...stocks].sort((a, b) => b.Volume - a.Volume).slice(0, 5);
	const topForeignNet = [...stocks]
		.sort((a, b) => b.ForeignNet - a.ForeignNet)
		.slice(0, 5);
	const topForeignBuy = [...stocks]
		.sort((a, b) => b.ForeignBuy - a.ForeignBuy)
		.slice(0, 5);
	const topForeignSell = [...stocks]
		.sort((a, b) => b.ForeignSell - a.ForeignSell)
		.slice(0, 5);

	const tabs = [
		{ key: "movers" as const, label: "Top Movers", icon: TrendingUp },
		{ key: "foreign" as const, label: "Foreign Flow", icon: Globe },
		{ key: "volume" as const, label: "Volume Leaders", icon: Flame },
	];

	return (
		<div className="mb-8 space-y-4">
			{/* ── Row 1: KPI Cards ── */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
				{/* Breadth */}
				<div className="col-span-2 bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center gap-6">
					<BreadthGauge
						advancers={advancers}
						decliners={decliners}
						unchanged={unchanged}
						total={total}
					/>
					<div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-4 w-full">
						{[
							{ label: "Instruments", value: total, color: "text-stone-900" },
							{
								label: "Avg. Change",
								value: fmtPct(avgChangePct),
								color: avgChangePct >= 0 ? "text-emerald-600" : "text-rose-500",
							},
							{
								label: "High Vol.",
								value: highVolCount,
								color: "text-amber-600",
							},
							{
								label: "Fgn. Net Buy",
								value: fgnNetBuy,
								color: "text-sky-600",
							},
						].map(({ label, value, color }) => (
							<div key={label}>
								<p className="text-[8px] font-black uppercase tracking-[0.3em] text-stone-400 mb-0.5">
									{label}
								</p>
								<p
									className={`text-2xl font-black tabular-nums leading-tight ${color}`}
								>
									{value}
								</p>
							</div>
						))}
					</div>
				</div>

				{/* Total Value */}
				<div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors">
					<div className="absolute -top-4 -right-4 w-20 h-20 bg-amber-50 rounded-full opacity-60 group-hover:opacity-100 transition-opacity" />
					<div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
						<DollarSign className="w-4 h-4" />
					</div>
					<p className="text-[8px] font-black uppercase tracking-[0.3em] text-stone-400">
						Total Value
					</p>
					<p className="text-2xl font-black text-stone-900 tabular-nums leading-tight mt-1">
						{fmtCompact(totalValue)}
					</p>
					<p className="text-[9px] font-bold text-stone-400 mt-0.5">
						IDR traded today
					</p>
					<div className="mt-3 pt-3 border-t border-stone-100 space-y-1.5">
						<div className="flex justify-between text-[9px] font-black">
							<span className="text-stone-400 uppercase tracking-wider">
								Volume
							</span>
							<span className="text-stone-700 tabular-nums">
								{fmtCompact(totalVolume)}
							</span>
						</div>
						<div className="flex justify-between text-[9px] font-black">
							<span className="text-stone-400 uppercase tracking-wider">
								Transactions
							</span>
							<span className="text-stone-700 tabular-nums">
								{fmtCompact(totalFrequency)}
							</span>
						</div>
					</div>
				</div>

				{/* Foreign Net */}
				<div
					className={`bg-white rounded-2xl p-5 shadow-sm relative overflow-hidden group transition-colors ${totalForeignNet >= 0 ? "border border-emerald-200 hover:border-emerald-300" : "border border-rose-200 hover:border-rose-300"}`}
				>
					<div
						className={`absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-50 group-hover:opacity-80 transition-opacity ${totalForeignNet >= 0 ? "bg-emerald-50" : "bg-rose-50"}`}
					/>
					<div
						className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${totalForeignNet >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-500"}`}
					>
						<Globe className="w-4 h-4" />
					</div>
					<p className="text-[8px] font-black uppercase tracking-[0.3em] text-stone-400">
						Foreign Net
					</p>
					<p
						className={`text-2xl font-black tabular-nums leading-tight mt-1 ${totalForeignNet >= 0 ? "text-emerald-600" : "text-rose-500"}`}
					>
						{totalForeignNet >= 0 ? "+" : ""}
						{fmtCompact(totalForeignNet)}
					</p>
					<p
						className={`text-[9px] font-bold mt-0.5 ${totalForeignNet >= 0 ? "text-emerald-500" : "text-rose-400"}`}
					>
						{totalForeignNet >= 0 ? "Net Inflow" : "Net Outflow"}
					</p>
					<div className="mt-3 pt-3 border-t border-stone-100 space-y-1.5">
						<div className="flex justify-between text-[9px] font-black">
							<span className="text-stone-400 uppercase tracking-wider">
								Buy
							</span>
							<span className="text-emerald-600 tabular-nums">
								{fmtCompact(totalForeignBuy)}
							</span>
						</div>
						<div className="flex justify-between text-[9px] font-black">
							<span className="text-stone-400 uppercase tracking-wider">
								Sell
							</span>
							<span className="text-rose-500 tabular-nums">
								{fmtCompact(totalForeignSell)}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* ── Row 2: Activity Strip ── */}
			<div className="grid grid-cols-3 md:grid-cols-6 gap-2">
				{[
					{
						label: "Active >20k",
						value: stocks.filter((s) => s.Frequency > 20000).length,
						icon: Zap,
						accent: "amber",
					},
					{
						label: "High Vol.",
						value: highVolCount,
						icon: Flame,
						accent: "orange",
					},
					{
						label: "Fgn. Net Buy",
						value: fgnNetBuy,
						icon: TrendingUp,
						accent: "emerald",
					},
					{
						label: "Fgn. Net Sell",
						value: stocks.filter((s) => s.ForeignNet < 0).length,
						icon: TrendingDown,
						accent: "rose",
					},
					{ label: "Flat", value: unchanged, icon: Minus, accent: "stone" },
					{
						label: "Total Freq.",
						value: fmtCompact(totalFrequency),
						icon: Activity,
						accent: "sky",
					},
				].map(({ label, value, icon: Icon, accent }) => {
					const bg: Record<string, string> = {
						amber: "bg-amber-100 text-amber-600",
						orange: "bg-orange-100 text-orange-600",
						emerald: "bg-emerald-100 text-emerald-600",
						rose: "bg-rose-100 text-rose-500",
						stone: "bg-stone-100 text-stone-500",
						sky: "bg-sky-100 text-sky-600",
					};
					return (
						<div
							key={label}
							className="bg-white border border-stone-200 rounded-xl p-3 text-center hover:border-stone-300 hover:shadow-sm transition-all"
						>
							<div
								className={`w-6 h-6 rounded-lg mx-auto mb-2 flex items-center justify-center ${bg[accent]}`}
							>
								<Icon className="w-3 h-3" />
							</div>
							<p className="text-base font-black text-stone-900 tabular-nums leading-none">
								{value}
							</p>
							<p className="text-[8px] font-black uppercase tracking-wider text-stone-400 mt-1 leading-tight">
								{label}
							</p>
						</div>
					);
				})}
			</div>

			{/* ── Row 3: Tabbed Detail Panel ── */}
			<div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
				{/* Tab nav */}
				<div className="flex items-center border-b border-stone-100 px-2 pt-2 gap-0.5">
					{tabs.map(({ key, label, icon: Icon }) => (
						<button
							key={key}
							onClick={() => setTab(key)}
							className={`relative flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-[9px] font-black uppercase tracking-widest transition-all ${tab === key ? "text-stone-900 bg-stone-50" : "text-stone-400 hover:text-stone-600 hover:bg-stone-50/50"}`}
						>
							<Icon className="w-3 h-3" />
							{label}
							{tab === key && (
								<motion.div
									layoutId="tab-line"
									className="absolute bottom-0 left-3 right-3 h-0.5 bg-amber-400 rounded-t"
								/>
							)}
						</button>
					))}
					<span className="ml-auto pr-4 text-[8px] font-black text-stone-300 uppercase tracking-wider">
						{date || "—"}
					</span>
				</div>

				<AnimatePresence mode="wait">
					{/* MOVERS */}
					{tab === "movers" && (
						<motion.div
							key="movers"
							initial={{ opacity: 0, y: 4 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
							className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-100"
						>
							{[
								{ title: "Top Gainers", list: topGainers, up: true },
								{ title: "Top Losers", list: topLosers, up: false },
							].map(({ title, list, up }) => (
								<div key={title} className="p-5">
									<div className="flex items-center gap-2 mb-4">
										<div
											className={`w-6 h-6 rounded-lg flex items-center justify-center ${up ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-500"}`}
										>
											{up ? (
												<TrendingUp className="w-3.5 h-3.5" />
											) : (
												<TrendingDown className="w-3.5 h-3.5" />
											)}
										</div>
										<span className="text-[9px] font-black uppercase tracking-widest text-stone-700">
											{title}
										</span>
									</div>
									<div className="space-y-2.5">
										{list.map((s, i) => (
											<div
												key={s.StockCode}
												className="flex items-center gap-3"
											>
												<span className="text-[9px] font-black text-stone-300 w-4 text-right">
													{i + 1}
												</span>
												<div
													className={`w-13 min-w-[48px] h-7 px-1 rounded-lg flex items-center justify-center border ${up ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}
												>
													<span
														className={`text-[9px] font-black ${up ? "text-emerald-700" : "text-rose-600"}`}
													>
														{s.StockCode}
													</span>
												</div>
												<div className="flex-1 min-w-0 space-y-1">
													<div className="flex justify-between">
														<span className="text-[10px] font-bold text-stone-600 truncate max-w-[130px]">
															{s.StockName}
														</span>
														<span
															className={`text-[10px] font-black tabular-nums ${up ? "text-emerald-600" : "text-rose-500"}`}
														>
															{fmtPct(s.ChangePct)}
														</span>
													</div>
													<Bar
														pct={Math.abs(s.ChangePct) / 35}
														color={up ? "emerald" : "rose"}
														delay={i * 0.06}
													/>
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</motion.div>
					)}

					{/* FOREIGN */}
					{tab === "foreign" && (
						<motion.div
							key="foreign"
							initial={{ opacity: 0, y: 4 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
							className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-100"
						>
							{[
								{
									title: "Net Buy Leaders",
									list: topForeignNet,
									color: "emerald",
									fn: (s: ProcessedStock) => s.ForeignNet,
								},
								{
									title: "Foreign Buy",
									list: topForeignBuy,
									color: "sky",
									fn: (s: ProcessedStock) => s.ForeignBuy,
								},
								{
									title: "Foreign Sell",
									list: topForeignSell,
									color: "rose",
									fn: (s: ProcessedStock) => s.ForeignSell,
								},
							].map(({ title, list, color, fn }) => {
								const maxVal = fn(list[0]) || 1;
								return (
									<div key={title} className="p-5">
										<div className="flex items-center gap-2 mb-4">
											<div
												className={`w-6 h-6 rounded-lg flex items-center justify-center ${color === "emerald" ? "bg-emerald-100 text-emerald-600" : color === "sky" ? "bg-sky-100 text-sky-600" : "bg-rose-100 text-rose-500"}`}
											>
												<Globe className="w-3.5 h-3.5" />
											</div>
											<span className="text-[9px] font-black uppercase tracking-widest text-stone-700">
												{title}
											</span>
										</div>
										<div className="space-y-2.5">
											{list.map((s, i) => {
												const val = fn(s);
												return (
													<div
														key={s.StockCode}
														className="flex items-center gap-3"
													>
														<span className="text-[9px] font-black text-stone-300 w-4 text-right">
															{i + 1}
														</span>
														<div
															className={`w-13 min-w-[48px] h-7 px-1 rounded-lg flex items-center justify-center border ${color === "emerald" ? "bg-emerald-50 border-emerald-200" : color === "sky" ? "bg-sky-50 border-sky-200" : "bg-rose-50 border-rose-200"}`}
														>
															<span
																className={`text-[9px] font-black ${color === "emerald" ? "text-emerald-700" : color === "sky" ? "text-sky-700" : "text-rose-600"}`}
															>
																{s.StockCode}
															</span>
														</div>
														<div className="flex-1 min-w-0 space-y-1">
															<div className="flex justify-between">
																<span className="text-[10px] font-bold text-stone-600 truncate max-w-[100px]">
																	{s.StockName}
																</span>
																<span
																	className={`text-[10px] font-black tabular-nums ${color === "emerald" ? "text-emerald-600" : color === "sky" ? "text-sky-600" : "text-rose-500"}`}
																>
																	{fmtCompact(val)}
																</span>
															</div>
															<Bar
																pct={val / maxVal}
																color={color}
																delay={i * 0.06}
															/>
														</div>
													</div>
												);
											})}
										</div>
									</div>
								);
							})}
						</motion.div>
					)}

					{/* VOLUME */}
					{tab === "volume" && (
						<motion.div
							key="volume"
							initial={{ opacity: 0, y: 4 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
							className="p-5"
						>
							<div className="flex items-center gap-2 mb-4">
								<div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
									<Flame className="w-3.5 h-3.5" />
								</div>
								<span className="text-[9px] font-black uppercase tracking-widest text-stone-700">
									Volume Leaders — Today
								</span>
							</div>
							<div className="space-y-3">
								{topVolume.map((s, i) => (
									<div key={s.StockCode} className="flex items-center gap-3">
										<span className="text-[9px] font-black text-stone-300 w-4 text-right">
											{i + 1}
										</span>
										<div className="w-14 min-w-[52px] h-7 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-center">
											<span className="text-[9px] font-black text-amber-700">
												{s.StockCode}
											</span>
										</div>
										<div className="flex-1 min-w-0 space-y-1">
											<div className="flex items-center justify-between">
												<span className="text-[10px] font-bold text-stone-600 truncate max-w-[160px]">
													{s.StockName}
												</span>
												<div className="flex items-center gap-2">
													<span className="text-[10px] font-black text-stone-700 tabular-nums">
														{fmtCompact(s.Volume)}
													</span>
													<span
														className={`text-[9px] font-black tabular-nums ${s.ChangePct >= 0 ? "text-emerald-600" : "text-rose-500"}`}
													>
														{fmtPct(s.ChangePct)}
													</span>
												</div>
											</div>
											<Bar
												pct={s.Volume / (topVolume[0].Volume || 1)}
												color="amber"
												delay={i * 0.07}
											/>
										</div>
									</div>
								))}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}

// ─── Sortable Header ───────────────────────────────────────────────────────

function SortableHeader({
	label,
	sortKey,
	currentSort,
	onSort,
	align = "left",
}: {
	label: string;
	sortKey: SortKey;
	currentSort: SortConfig;
	onSort: (k: SortKey) => void;
	align?: "left" | "right" | "center";
}) {
	const isActive = currentSort.key === sortKey;
	const Icon =
		isActive && currentSort.direction
			? currentSort.direction === "asc"
				? ArrowUp
				: ArrowDown
			: ArrowUpDown;
	return (
		<th
			className={`px-4 py-3.5 text-[9px] font-black uppercase tracking-[0.25em] sticky top-0 bg-stone-50 z-20 border-b border-stone-200 transition-colors whitespace-nowrap ${isActive ? "text-amber-600" : "text-stone-400"} ${align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"}`}
		>
			<button
				onClick={() => onSort(sortKey)}
				className={`inline-flex items-center gap-1.5 hover:text-amber-600 transition-colors ${align === "right" ? "flex-row-reverse" : ""}`}
			>
				{label}
				<Icon
					className={`w-2.5 h-2.5 ${isActive ? "opacity-100" : "opacity-30"}`}
				/>
			</button>
		</th>
	);
}

// ─── Stock Row ─────────────────────────────────────────────────────────────

function StockRow({
	stock,
	maxVolume,
	rank,
	isExpanded,
	onToggle,
}: {
	stock: ProcessedStock;
	maxVolume: number;
	rank: number;
	isExpanded: boolean;
	onToggle: () => void;
}) {
	const up = stock.Change > 0;
	const dn = stock.Change < 0;

	return (
		<>
			<motion.tr
				layout
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				onClick={onToggle}
				className={`group border-b border-stone-100 cursor-pointer transition-all ${isExpanded ? "bg-amber-50/70" : "hover:bg-stone-50/80"}`}
			>
				{/* Rank + Instrument */}
				<td className="px-4 py-3.5">
					<div className="flex items-center gap-3">
						<span className="text-[9px] font-black text-stone-300 w-4 text-right tabular-nums flex-shrink-0">
							{rank}
						</span>
						<div
							className={`min-w-[52px] h-8 px-1.5 flex items-center justify-center rounded-lg font-black text-[10px] tracking-tight flex-shrink-0 border ${up ? "bg-emerald-50 text-emerald-700 border-emerald-200" : dn ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-stone-100 text-stone-500 border-stone-200"}`}
						>
							{stock.StockCode}
						</div>
						<div className="min-w-0">
							<p className="text-[11px] font-bold text-stone-800 truncate max-w-[160px] leading-tight">
								{stock.StockName}
							</p>
							<div className="flex items-center gap-1.5 mt-0.5">
								{stock.IsHighVolume && (
									<span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-amber-100 text-amber-700 text-[7px] font-black uppercase tracking-wider rounded border border-amber-200">
										<Flame className="w-2 h-2" /> Hot
									</span>
								)}
								{stock.Frequency > 20000 && (
									<span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-sky-100 text-sky-700 text-[7px] font-black uppercase tracking-wider rounded border border-sky-200">
										<Zap className="w-2 h-2" /> Active
									</span>
								)}
							</div>
						</div>
					</div>
				</td>

				{/* Price */}
				<td className="px-4 py-3.5">
					<p className="text-[12px] font-black text-stone-900 tabular-nums font-mono">
						{fmtIDR(stock.Close)}
					</p>
					<p className="text-[9px] text-stone-400 font-bold mt-0.5 tabular-nums">
						prev {fmtIDR(stock.Previous)}
					</p>
				</td>

				{/* Change */}
				<td className="px-4 py-3.5 text-right">
					<span
						className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black tabular-nums border ${up ? "bg-emerald-50 text-emerald-700 border-emerald-200" : dn ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-stone-100 text-stone-500 border-stone-200"}`}
					>
						{up ? (
							<TrendingUp className="w-3 h-3" />
						) : dn ? (
							<TrendingDown className="w-3 h-3" />
						) : (
							<Minus className="w-3 h-3" />
						)}
						{fmtPct(stock.ChangePct)}
					</span>
					<p
						className={`text-[9px] font-black mt-1 text-right tabular-nums ${up ? "text-emerald-600" : dn ? "text-rose-500" : "text-stone-400"}`}
					>
						{up ? "+" : ""}
						{fmtIDR(stock.Change)}
					</p>
				</td>

				{/* Volume */}
				<td className="px-4 py-3.5 text-right">
					<p className="text-[11px] font-black text-stone-700 tabular-nums font-mono">
						{fmtCompact(stock.Volume)}
					</p>
					<div className="mt-1.5 flex justify-end">
						<div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
							<motion.div
								initial={{ width: 0 }}
								animate={{ width: `${(stock.Volume / maxVolume) * 100}%` }}
								transition={{ duration: 0.5 }}
								className="h-full bg-amber-400 rounded-full"
							/>
						</div>
					</div>
				</td>

				{/* Value */}
				<td className="px-4 py-3.5 text-right">
					<p className="text-[11px] font-black text-stone-700 tabular-nums font-mono">
						{fmtCompact(stock.Value)}
					</p>
					<p className="text-[9px] font-bold text-stone-400 mt-0.5">IDR</p>
				</td>

				{/* Freq */}
				<td className="px-4 py-3.5 text-right">
					<p className="text-[11px] font-black text-stone-700 tabular-nums font-mono">
						{fmtIDR(stock.Frequency)}
					</p>
				</td>

				{/* Bid / Ask */}
				<td className="px-4 py-3.5 text-right">
					<div className="flex flex-col items-end gap-0.5">
						<div className="flex items-center gap-1">
							<span className="text-[7px] font-black text-emerald-500 uppercase">
								B
							</span>
							<span className="text-[10px] font-black text-stone-700 tabular-nums font-mono">
								{fmtIDR(stock.Bid)}
							</span>
						</div>
						<div className="flex items-center gap-1">
							<span className="text-[7px] font-black text-rose-400 uppercase">
								A
							</span>
							<span className="text-[10px] font-black text-stone-700 tabular-nums font-mono">
								{fmtIDR(stock.Offer)}
							</span>
						</div>
					</div>
				</td>

				{/* Foreign */}
				<td className="px-4 py-3.5 text-right">
					<p
						className={`text-[11px] font-black tabular-nums font-mono ${stock.ForeignNet > 0 ? "text-emerald-600" : stock.ForeignNet < 0 ? "text-rose-500" : "text-stone-400"}`}
					>
						{stock.ForeignNet > 0 ? "+" : ""}
						{fmtCompact(stock.ForeignNet)}
					</p>
					{stock.ForeignNet !== 0 && (
						<span
							className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded mt-1 inline-block ${stock.ForeignNet > 0 ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-rose-100 text-rose-600 border border-rose-200"}`}
						>
							{stock.ForeignNet > 0 ? "Net Buy" : "Net Sell"}
						</span>
					)}
				</td>

				{/* Expand toggle */}
				<td className="px-3 py-3.5 text-center">
					<motion.div
						animate={{ rotate: isExpanded ? 180 : 0 }}
						transition={{ duration: 0.2 }}
					>
						<ChevronDown className="w-3.5 h-3.5 text-stone-300 group-hover:text-amber-500 transition-colors mx-auto" />
					</motion.div>
				</td>
			</motion.tr>

			{/* Expanded detail row */}
			<AnimatePresence>
				{isExpanded && (
					<motion.tr
						key={`${stock.StockCode}-detail`}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<td colSpan={9} className="p-0">
							<motion.div
								initial={{ height: 0 }}
								animate={{ height: "auto" }}
								exit={{ height: 0 }}
								className="overflow-hidden"
							>
								<div className="bg-amber-50/80 border-b border-amber-200/60 px-8 py-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-5">
									{[
										{ label: "Open", value: fmtIDR(stock.OpenPrice) },
										{
											label: "High",
											value: fmtIDR(stock.High),
											cls: "text-emerald-700",
										},
										{
											label: "Low",
											value: fmtIDR(stock.Low),
											cls: "text-rose-600",
										},
										{ label: "First Trade", value: fmtIDR(stock.FirstTrade) },
										{
											label: "Foreign Buy",
											value: fmtCompact(stock.ForeignBuy),
											cls: "text-emerald-700",
										},
										{
											label: "Foreign Sell",
											value: fmtCompact(stock.ForeignSell),
											cls: "text-rose-600",
										},
										{ label: "Bid Volume", value: fmtCompact(stock.BidVolume) },
										{
											label: "Offer Volume",
											value: fmtCompact(stock.OfferVolume),
										},
									].map(({ label, value, cls }) => (
										<div key={label}>
											<p className="text-[8px] font-black uppercase tracking-[0.3em] text-stone-400 mb-1">
												{label}
											</p>
											<p
												className={`text-[12px] font-black tabular-nums font-mono ${cls || "text-stone-800"}`}
											>
												{value}
											</p>
										</div>
									))}
								</div>
							</motion.div>
						</td>
					</motion.tr>
				)}
			</AnimatePresence>
		</>
	);
}

// ─── Table ─────────────────────────────────────────────────────────────────

function StockTable({
	stocks,
	isLoading,
	sortConfig,
	handleSort,
	visibleStocks,
}: {
	stocks: IDXStock[];
	isLoading: boolean;
	sortConfig: SortConfig;
	handleSort: (k: SortKey) => void;
	visibleStocks: ProcessedStock[];
}) {
	const maxVolume = useMemo(
		() => Math.max(...visibleStocks.map((s) => s.Volume), 1),
		[visibleStocks],
	);
	const [expanded, setExpanded] = useState<string | null>(null);
	const toggle = (code: string) =>
		setExpanded((p) => (p === code ? null : code));

	return (
		<div className="overflow-x-auto overflow-y-auto max-h-[700px] scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
			<table className="w-full text-left border-collapse min-w-[1020px]">
				<thead>
					<tr>
						<SortableHeader
							label="Instrument"
							sortKey="StockCode"
							currentSort={sortConfig}
							onSort={handleSort}
						/>
						<SortableHeader
							label="Price"
							sortKey="Close"
							currentSort={sortConfig}
							onSort={handleSort}
						/>
						<SortableHeader
							label="Change"
							sortKey="ChangePct"
							currentSort={sortConfig}
							onSort={handleSort}
							align="right"
						/>
						<SortableHeader
							label="Volume"
							sortKey="Volume"
							currentSort={sortConfig}
							onSort={handleSort}
							align="right"
						/>
						<SortableHeader
							label="Value"
							sortKey="Value"
							currentSort={sortConfig}
							onSort={handleSort}
							align="right"
						/>
						<SortableHeader
							label="Freq."
							sortKey="Frequency"
							currentSort={sortConfig}
							onSort={handleSort}
							align="right"
						/>
						<SortableHeader
							label="Bid / Ask"
							sortKey="Bid"
							currentSort={sortConfig}
							onSort={handleSort}
							align="right"
						/>
						<SortableHeader
							label="Foreign Net"
							sortKey="ForeignNet"
							currentSort={sortConfig}
							onSort={handleSort}
							align="right"
						/>
						<th className="px-3 py-3.5 sticky top-0 bg-stone-50 z-20 border-b border-stone-200 text-center text-[9px] font-black text-stone-300 uppercase tracking-widest w-8">
							↕
						</th>
					</tr>
				</thead>
				<tbody>
					<AnimatePresence mode="popLayout">
						{visibleStocks.map((stock, i) => (
							<StockRow
								key={stock.StockCode}
								stock={stock}
								maxVolume={maxVolume}
								rank={i + 1}
								isExpanded={expanded === stock.StockCode}
								onToggle={() => toggle(stock.StockCode)}
							/>
						))}
					</AnimatePresence>
					{isLoading &&
						stocks.length === 0 &&
						[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((id) => (
							<tr
								key={`skel-row-${id}`}
								className="animate-pulse border-b border-stone-100"
							>
								<td className="px-4 py-4">
									<div className="flex items-center gap-3">
										<div className="w-4 h-3 bg-stone-100 rounded" />
										<div className="w-14 h-8 bg-stone-100 rounded-lg" />
										<div className="space-y-1.5">
											<div className="h-2.5 w-28 bg-stone-100 rounded" />
											<div className="h-2 w-16 bg-stone-50 rounded" />
										</div>
									</div>
								</td>
								{[1, 2, 3, 4, 5, 6, 7].map((cellId) => (
									<td
										key={`skel-cell-${cellId}`}
										className="px-4 py-4 text-right"
									>
										<div className="h-3 w-14 bg-stone-100 rounded ml-auto" />
									</td>
								))}
								<td className="px-3 py-4">
									<div className="w-4 h-4 bg-stone-100 rounded mx-auto" />
								</td>
							</tr>
						))}
				</tbody>
			</table>
		</div>
	);
}

// ─── Search Header ─────────────────────────────────────────────────────────

function SearchHeader({
	searchQuery,
	setSearchQuery,
	totalCount,
	filteredCount,
	onRefresh,
	isLoading,
	priceRange,
	setPriceRange,
	changeRange,
	setChangeRange,
	foreignFilter,
	setForeignFilter,
	volumeOnly,
	setVolumeOnly,
}: {
	searchQuery: string;
	setSearchQuery: (v: string) => void;
	totalCount: number;
	filteredCount: number;
	onRefresh: () => void;
	isLoading: boolean;
	priceRange: [number, number];
	setPriceRange: (v: [number, number]) => void;
	changeRange: [number, number];
	setChangeRange: (v: [number, number]) => void;
	foreignFilter: "all" | "buy" | "sell";
	setForeignFilter: (v: "all" | "buy" | "sell") => void;
	volumeOnly: boolean;
	setVolumeOnly: (v: boolean) => void;
}) {
	const [open, setOpen] = useState(false);
	const hasFilters =
		priceRange[0] > 0 ||
		priceRange[1] < 1000000 ||
		changeRange[0] > -100 ||
		changeRange[1] < 100 ||
		foreignFilter !== "all" ||
		volumeOnly;

	return (
		<div className="space-y-3 mb-5">
			<div className="flex flex-col md:flex-row gap-3">
				<div className="relative flex-1 group">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
					<input
						type="text"
						placeholder="Search ticker or company…"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-11 pr-10 py-3 bg-white border border-stone-200 rounded-xl text-[12px] font-bold text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all shadow-sm"
					/>
					{searchQuery && (
						<button
							onClick={() => setSearchQuery("")}
							className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-300 hover:text-rose-400 transition-colors"
						>
							<X className="w-3.5 h-3.5" />
						</button>
					)}
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					{(["all", "buy", "sell"] as const).map((opt) => (
						<button
							key={opt}
							onClick={() =>
								setForeignFilter(
									foreignFilter === opt && opt !== "all" ? "all" : opt,
								)
							}
							className={`hidden md:flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all shadow-sm ${foreignFilter === opt ? (opt === "buy" ? "bg-emerald-600 border-emerald-600 text-white" : opt === "sell" ? "bg-rose-500 border-rose-500 text-white" : "bg-stone-800 border-stone-800 text-white") : "bg-white border-stone-200 text-stone-500 hover:border-stone-300"}`}
						>
							<Globe className="w-3 h-3" />
							{opt === "all"
								? "All Flow"
								: opt === "buy"
									? "Fgn. Buy"
									: "Fgn. Sell"}
						</button>
					))}
					<button
						onClick={() => setVolumeOnly(!volumeOnly)}
						className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all shadow-sm ${volumeOnly ? "bg-amber-500 border-amber-500 text-white" : "bg-white border-stone-200 text-stone-500 hover:border-stone-300"}`}
					>
						<Flame className="w-3 h-3" />
						Hot Only
					</button>
					<button
						onClick={() => setOpen(!open)}
						className={`relative p-2.5 rounded-xl border transition-all shadow-sm ${open || hasFilters ? "bg-amber-500 border-amber-500 text-white" : "bg-white border-stone-200 text-stone-500 hover:border-stone-300"}`}
					>
						<Filter className="w-4 h-4" />
						{hasFilters && (
							<span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[7px] font-black rounded-full flex items-center justify-center">
								!
							</span>
						)}
					</button>
					<button
						onClick={onRefresh}
						disabled={isLoading}
						className="p-2.5 bg-white border border-stone-200 rounded-xl text-stone-500 hover:text-amber-600 hover:border-amber-300 transition-all shadow-sm disabled:opacity-40"
					>
						<RefreshCw
							className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
						/>
					</button>
					<Link
						href="/utils/stock-explorer/admin"
						className="p-2.5 bg-white border border-stone-200 rounded-xl text-stone-400 hover:text-stone-700 hover:border-stone-300 transition-all shadow-sm"
					>
						<Settings className="w-4 h-4" />
					</Link>
					{hasFilters && (
						<button
							onClick={() => {
								setPriceRange([0, 1000000]);
								setChangeRange([-100, 100]);
								setForeignFilter("all");
								setVolumeOnly(false);
								setSearchQuery("");
							}}
							className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all shadow-sm"
						>
							<X className="w-3 h-3" />
							Reset
						</button>
					)}
					<div className="hidden md:flex flex-col items-end pl-3 border-l border-stone-200">
						<span className="text-lg font-black text-stone-900 tabular-nums leading-none">
							{filteredCount}
						</span>
						<span className="text-[8px] font-black uppercase tracking-widest text-stone-400">
							of {totalCount}
						</span>
					</div>
				</div>
			</div>

			{/* Filter Chips */}
			<AnimatePresence>
				{hasFilters && (
					<motion.div
						initial={{ opacity: 0, y: -5 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -5 }}
						className="flex flex-wrap gap-2"
					>
						{priceRange[0] > 0 && (
							<span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-stone-200 shadow-sm">
								Min {fmtIDR(priceRange[0])}{" "}
								<X
									className="w-2.5 h-2.5 cursor-pointer hover:text-rose-500"
									onClick={() => setPriceRange([0, priceRange[1]])}
								/>
							</span>
						)}
						{priceRange[1] < 1000000 && (
							<span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-stone-200 shadow-sm">
								Max {fmtIDR(priceRange[1])}{" "}
								<X
									className="w-2.5 h-2.5 cursor-pointer hover:text-rose-500"
									onClick={() => setPriceRange([priceRange[0], 1000000])}
								/>
							</span>
						)}
						{changeRange[0] > -100 && (
							<span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-stone-200 shadow-sm">
								Min {changeRange[0]}%{" "}
								<X
									className="w-2.5 h-2.5 cursor-pointer hover:text-rose-500"
									onClick={() => setChangeRange([-100, changeRange[1]])}
								/>
							</span>
						)}
						{changeRange[1] < 100 && (
							<span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-stone-200 shadow-sm">
								Max {changeRange[1]}%{" "}
								<X
									className="w-2.5 h-2.5 cursor-pointer hover:text-rose-500"
									onClick={() => setChangeRange([changeRange[0], 100])}
								/>
							</span>
						)}
						{foreignFilter !== "all" && (
							<span
								className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border shadow-sm ${foreignFilter === "buy" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-rose-50 text-rose-600 border-rose-200"}`}
							>
								Fgn. {foreignFilter}{" "}
								<X
									className="w-2.5 h-2.5 cursor-pointer hover:opacity-70"
									onClick={() => setForeignFilter("all")}
								/>
							</span>
						)}
						{volumeOnly && (
							<span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-amber-200 shadow-sm">
								Hot Only{" "}
								<X
									className="w-2.5 h-2.5 cursor-pointer hover:text-rose-500"
									onClick={() => setVolumeOnly(false)}
								/>
							</span>
						)}
						<button
							onClick={() => {
								setPriceRange([0, 1000000]);
								setChangeRange([-100, 100]);
								setForeignFilter("all");
								setVolumeOnly(false);
								setSearchQuery("");
							}}
							className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-700 underline underline-offset-4 ml-1"
						>
							Clear All
						</button>
					</motion.div>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="overflow-hidden"
					>
						<div className="p-5 bg-white border border-stone-200 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-5">
							<div className="space-y-2">
								<p className="text-[9px] font-black uppercase tracking-[0.35em] text-stone-400">
									Price Range (IDR)
								</p>
								<div className="flex items-center gap-2">
									<input
										type="number"
										value={priceRange[0]}
										onChange={(e) =>
											setPriceRange([Number(e.target.value), priceRange[1]])
										}
										className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-[11px] font-bold text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
										placeholder="Min"
									/>
									<span className="text-stone-300">—</span>
									<input
										type="number"
										value={priceRange[1]}
										onChange={(e) =>
											setPriceRange([priceRange[0], Number(e.target.value)])
										}
										className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-[11px] font-bold text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
										placeholder="Max"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<p className="text-[9px] font-black uppercase tracking-[0.35em] text-stone-400">
									Daily Change (%)
								</p>
								<div className="flex items-center gap-2">
									<input
										type="number"
										value={changeRange[0]}
										onChange={(e) =>
											setChangeRange([Number(e.target.value), changeRange[1]])
										}
										className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-[11px] font-bold text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
										placeholder="Min %"
									/>
									<span className="text-stone-300">—</span>
									<input
										type="number"
										value={changeRange[1]}
										onChange={(e) =>
											setChangeRange([changeRange[0], Number(e.target.value)])
										}
										className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-[11px] font-bold text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
										placeholder="Max %"
									/>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function StockExplorerView() {
	const [stocks, setStocks] = useState<IDXStock[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortConfig, setSortConfig] = useState<SortConfig>({
		key: "Volume",
		direction: "desc",
	});
	const [visibleCount, setVisibleCount] = useState(50);
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
	const [changeRange, setChangeRange] = useState<[number, number]>([-100, 100]);
	const [foreignFilter, setForeignFilter] = useState<"all" | "buy" | "sell">(
		"all",
	);
	const [volumeOnly, setVolumeOnly] = useState(false);

	const fetchData = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/utils/stock-data");
			if (res.status === 404) {
				setStocks([]);
				return;
			}
			if (!res.ok) {
				const e = await res.json();
				throw new Error(e.error || "Sync failure");
			}
			const result = await res.json();
			setStocks(Array.isArray(result.data) ? result.data : []);
		} catch (e: any) {
			setError(e.message || "Failed to fetch");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleSort = (key: SortKey) => {
		setSortConfig((prev) => {
			if (prev.key === key) {
				if (prev.direction === "asc") return { key, direction: "desc" };
				if (prev.direction === "desc") return { key, direction: null };
				return { key, direction: "asc" };
			}
			return { key, direction: "asc" };
		});
	};

	const processedStocks = useMemo((): ProcessedStock[] => {
		if (!stocks.length) return [];
		let result: ProcessedStock[] = stocks.map((s) => ({
			...s,
			ForeignNet: (s.ForeignBuy || 0) - (s.ForeignSell || 0),
			ChangePct:
				s.Previous !== 0 ? ((s.Close - s.Previous) / s.Previous) * 100 : 0,
			IsHighVolume: false,
		}));
		const sortedVol = [...result].map((s) => s.Volume).sort((a, b) => b - a);
		const volThresh = sortedVol[Math.floor(result.length * 0.1)] || 0;
		result = result.map((s) => ({
			...s,
			IsHighVolume: s.Volume >= volThresh && s.Volume > 0,
		}));
		if (searchQuery) {
			const q = searchQuery.toLowerCase().trim();
			result = result.filter(
				(s) =>
					s.StockCode.toLowerCase().includes(q) ||
					s.StockName.toLowerCase().includes(q),
			);
		}
		result = result.filter(
			(s) =>
				s.Close >= priceRange[0] &&
				s.Close <= priceRange[1] &&
				s.ChangePct >= changeRange[0] &&
				s.ChangePct <= changeRange[1],
		);
		if (foreignFilter === "buy")
			result = result.filter((s) => s.ForeignNet > 0);
		if (foreignFilter === "sell")
			result = result.filter((s) => s.ForeignNet < 0);
		if (volumeOnly) result = result.filter((s) => s.IsHighVolume);
		if (sortConfig.key && sortConfig.direction) {
			result.sort((a, b) => {
				const k = sortConfig.key as keyof ProcessedStock;
				const va = a[k] ?? 0,
					vb = b[k] ?? 0;
				if (typeof va === "string" && typeof vb === "string")
					return sortConfig.direction === "asc"
						? va.localeCompare(vb)
						: vb.localeCompare(va);
				return sortConfig.direction === "asc"
					? (va as number) - (vb as number)
					: (vb as number) - (va as number);
			});
		}
		return result;
	}, [
		stocks,
		searchQuery,
		sortConfig,
		priceRange,
		changeRange,
		foreignFilter,
		volumeOnly,
	]);

	const visibleStocks = useMemo(
		() => processedStocks.slice(0, visibleCount),
		[processedStocks, visibleCount],
	);
	const hasMore = visibleCount < processedStocks.length;
	const date = stocks[0]?.Date || "";

	return (
		<main className="min-h-screen bg-stone-50 font-sans text-stone-900 pb-24 selection:bg-amber-200 relative">
			{/* Dot grid */}
			<div
				className="fixed inset-0 pointer-events-none opacity-30"
				style={{
					backgroundImage:
						"radial-gradient(circle, #d6d3d1 1px, transparent 1px)",
					backgroundSize: "28px 28px",
				}}
			/>
			{/* Amber top bar */}
			<div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 z-50" />

			{/* Sync Overlay */}
			<AnimatePresence>
				{isLoading && stocks.length > 0 && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-[60] bg-white/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none"
					>
						<div className="bg-stone-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
							<RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
							<span className="text-[10px] font-black uppercase tracking-[0.2em]">
								Synchronizing Registry...
							</span>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<div className="max-w-screen-2xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 relative z-10">
				{/* ── Header ── */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-10">
					<div>
						<Link
							href="/utils"
							className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.35em] text-stone-400 hover:text-amber-600 transition-colors mb-5 group"
						>
							<ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
							Utility Ecosystem
						</Link>
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
								<BarChart2 className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-stone-900 leading-none">
									IDX <span className="text-amber-500">Explorer</span>
								</h1>
								<p className="text-[9px] font-black uppercase tracking-[0.45em] text-stone-400 mt-2">
									Jakarta Stock Exchange · Interactive Dashboard
								</p>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-3">
						{date && (
							<div className="px-4 py-2 bg-white border border-stone-200 rounded-xl shadow-sm text-center">
								<p className="text-[8px] font-black uppercase tracking-widest text-stone-400">
									Session Date
								</p>
								<p className="text-xs font-black text-stone-800 mt-0.5">
									{date}
								</p>
							</div>
						)}
						<div className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl shadow-sm">
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
								<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
							</span>
							<span className="text-[9px] font-black uppercase tracking-widest text-stone-500">
								Live
							</span>
						</div>
					</div>
				</div>

				{/* ── Summary ── */}
				{!isLoading && processedStocks.length > 0 && (
					<MarketSummary stocks={processedStocks} date={date} />
				)}

				{/* ── Search ── */}
				<SearchHeader
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					totalCount={stocks.length}
					filteredCount={processedStocks.length}
					onRefresh={fetchData}
					isLoading={isLoading}
					priceRange={priceRange}
					setPriceRange={setPriceRange}
					changeRange={changeRange}
					setChangeRange={setChangeRange}
					foreignFilter={foreignFilter}
					setForeignFilter={setForeignFilter}
					volumeOnly={volumeOnly}
					setVolumeOnly={setVolumeOnly}
				/>

				{/* ── Error ── */}
				<AnimatePresence>
					{error && (
						<motion.div
							initial={{ opacity: 0, y: -6 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-600 shadow-sm"
						>
							<AlertCircle className="w-4 h-4 flex-shrink-0" />
							<p className="text-[11px] font-bold flex-1">{error}</p>
							<button
								onClick={fetchData}
								className="text-[10px] font-black uppercase tracking-wider hover:text-rose-700 transition-colors"
							>
								Retry
							</button>
						</motion.div>
					)}
				</AnimatePresence>

				{/* ── Table ── */}
				<div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
					<div className="flex items-center justify-between px-5 py-3 border-b border-stone-100 bg-stone-50/50">
						<div className="flex items-center gap-2">
							<Eye className="w-3.5 h-3.5 text-stone-400" />
							<span className="text-[9px] font-black uppercase tracking-[0.35em] text-stone-400">
								Transaction Registry
							</span>
							<span className="text-stone-200 mx-1">·</span>
							<span className="text-[9px] font-bold text-stone-400">
								Click any row to expand details
							</span>
						</div>
						<span className="text-[9px] font-bold text-stone-400">
							{Math.min(visibleCount, processedStocks.length)} /{" "}
							{processedStocks.length}
						</span>
					</div>

					<StockTable
						stocks={stocks}
						isLoading={isLoading}
						sortConfig={sortConfig}
						handleSort={handleSort}
						visibleStocks={visibleStocks}
					/>

					{!isLoading && processedStocks.length > 0 && (
						<div className="flex items-center justify-center p-8 border-t border-stone-100 bg-stone-50/40">
							{hasMore ? (
								<button
									onClick={() => setVisibleCount((c) => c + 100)}
									className="flex items-center gap-2 px-8 py-3 bg-white border border-stone-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-amber-600 hover:border-amber-300 transition-all active:scale-95 shadow-sm"
								>
									Load {Math.min(100, processedStocks.length - visibleCount)}{" "}
									more
									<ChevronRight className="w-3.5 h-3.5" />
								</button>
							) : (
								<p className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-300">
									— End of Registry —
								</p>
							)}
						</div>
					)}

					{!isLoading && processedStocks.length === 0 && (
						<div className="py-32 text-center space-y-5">
							<div className="w-16 h-16 bg-stone-100 border border-stone-200 rounded-2xl flex items-center justify-center mx-auto">
								<Search className="w-7 h-7 text-stone-300" />
							</div>
							<div>
								<p className="text-stone-700 font-black uppercase tracking-widest text-sm">
									No instruments found
								</p>
								<p className="text-stone-400 text-[11px] mt-1.5">
									Try adjusting your search or filters
								</p>
							</div>
							<button
								onClick={() => {
									setSearchQuery("");
									setPriceRange([0, 1000000]);
									setChangeRange([-100, 100]);
									setForeignFilter("all");
									setVolumeOnly(false);
								}}
								className="text-amber-600 font-black text-[10px] uppercase tracking-widest underline underline-offset-4 hover:text-amber-700 transition-colors"
							>
								Reset all filters
							</button>
						</div>
					)}
				</div>

				{/* ── Footer ── */}
				<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
					{[
						{
							icon: Flame,
							accent: "amber",
							title: "Hot Volume",
							body: "Instruments in the top 10% of today's trading volume — signals high liquidity and market activity.",
						},
						{
							icon: ArrowRightLeft,
							accent: "sky",
							title: "Foreign Flow",
							body: "Net foreign buy/sell per instrument and session total. Expand rows for raw buy & sell breakdown.",
						},
						{
							icon: Activity,
							accent: "emerald",
							title: "Expandable Rows",
							body: "Tap any row to reveal Open, High, Low, First Trade, and full bid/offer volume data.",
						},
					].map(({ icon: Icon, accent, title, body }) => (
						<div
							key={title}
							className="p-5 bg-white border border-stone-200 rounded-xl shadow-sm flex items-start gap-4 hover:border-stone-300 transition-colors"
						>
							<div
								className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${accent === "amber" ? "bg-amber-100 text-amber-600" : accent === "sky" ? "bg-sky-100 text-sky-600" : "bg-emerald-100 text-emerald-600"}`}
							>
								<Icon className="w-4 h-4" />
							</div>
							<div>
								<p className="text-[10px] font-black uppercase tracking-widest text-stone-700 mb-1">
									{title}
								</p>
								<p className="text-[10px] font-medium text-stone-400 leading-relaxed">
									{body}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
