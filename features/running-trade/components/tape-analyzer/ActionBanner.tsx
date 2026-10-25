import {
	Activity,
	Clock,
	ShieldAlert,
	Target,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import type { TapeAnalyzerResponse } from "../../types/tape-analyzer";

interface ActionBannerProps {
	data: TapeAnalyzerResponse;
}

function formatRupiah(value: number): string {
	if (value >= 1_000_000_000_000) {
		return `Rp ${(value / 1_000_000_000_000).toFixed(2)} T`;
	}
	if (value >= 1_000_000_000) {
		return `Rp ${(value / 1_000_000_000).toFixed(2)} B`;
	}
	if (value >= 1_000_000) {
		return `Rp ${(value / 1_000_000).toFixed(2)} M`;
	}
	return `Rp ${value.toLocaleString("id-ID")}`;
}

export default function ActionBanner({ data }: ActionBannerProps) {
	const { action, ohlc, turnover, volume, block_lot, tick, snapshot_time } =
		data;

	const priceChange = ohlc.last - ohlc.prev_close;
	const percentChange =
		ohlc.prev_close > 0 ? (priceChange / ohlc.prev_close) * 100 : 0;
	const isPositive = priceChange > 0;
	const isNegative = priceChange < 0;

	// Resolve badge style and domain icon based on action key without raw emojis
	const actionKey = action.key.toUpperCase();
	let badgeColor = "bg-slate-100 text-slate-800 border-slate-300";
	let ActionIcon = Activity;

	if (
		actionKey.includes("BUY") ||
		actionKey.includes("ACCUM") ||
		actionKey.includes("ENTRY")
	) {
		badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
		ActionIcon = Target;
	} else if (
		actionKey.includes("RANGE") ||
		actionKey.includes("WAIT") ||
		actionKey.includes("HOLD")
	) {
		badgeColor = "bg-amber-50 text-amber-800 border-amber-200";
		ActionIcon = Clock;
	} else if (
		actionKey.includes("DANGER") ||
		actionKey.includes("DUMP") ||
		actionKey.includes("COLLAPSE") ||
		actionKey.includes("CUT")
	) {
		badgeColor = "bg-rose-50 text-rose-800 border-rose-200";
		ActionIcon = ShieldAlert;
	}

	return (
		<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
			{/* Top Action Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
				<div className="space-y-2">
					<div className="flex flex-wrap items-center gap-2.5">
						<span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
							{data.ticker}
						</span>
						<span
							className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${badgeColor}`}
						>
							<ActionIcon className="w-3.5 h-3.5" aria-hidden />
							{action.key}
						</span>
						{data.is_live ? (
							<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
								<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
								LIVE MARKET
							</span>
						) : (
							<span className="text-xs font-medium text-slate-400">
								Snapshot {snapshot_time} ({data.date})
							</span>
						)}
					</div>
					<p className="text-sm sm:text-base font-semibold text-slate-800 leading-snug">
						{action.label}
					</p>
				</div>

				{/* Primary Price Metric */}
				<div className="flex items-baseline md:flex-col md:items-end gap-3 md:gap-1">
					<div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
						{ohlc.last.toLocaleString("id-ID")}
					</div>
					<div
						className={`flex items-center gap-1 text-sm font-bold ${
							isPositive
								? "text-emerald-600"
								: isNegative
									? "text-rose-600"
									: "text-slate-500"
						}`}
					>
						{isPositive ? (
							<TrendingUp className="w-4 h-4" />
						) : isNegative ? (
							<TrendingDown className="w-4 h-4" />
						) : null}
						<span>
							{isPositive ? "+" : ""}
							{priceChange.toLocaleString("id-ID")} ({isPositive ? "+" : ""}
							{percentChange.toFixed(2)}%)
						</span>
					</div>
				</div>
			</div>

			{/* Telemetry Stat Strip */}
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
				<div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60">
					<span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
						Open / Prev
					</span>
					<span className="text-sm font-bold text-slate-800">
						{ohlc.o.toLocaleString()} / {ohlc.prev_close.toLocaleString()}
					</span>
				</div>

				<div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60">
					<span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
						High / Low
					</span>
					<span className="text-sm font-bold text-slate-800">
						{ohlc.h.toLocaleString()} / {ohlc.l.toLocaleString()}
					</span>
				</div>

				<div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60">
					<span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
						ARA / ARB
					</span>
					<div className="flex items-center gap-1.5 text-xs font-bold">
						<span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
							{ohlc.ara.toLocaleString()}
						</span>
						<span className="text-slate-400">/</span>
						<span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
							{ohlc.arb.toLocaleString()}
						</span>
					</div>
				</div>

				<div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60">
					<span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
						Turnover
					</span>
					<span className="text-sm font-bold text-slate-800">
						{formatRupiah(turnover)}
					</span>
				</div>

				<div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60">
					<span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
						Volume
					</span>
					<span className="text-sm font-bold text-slate-800">
						{volume.toLocaleString("id-ID")} lot
					</span>
				</div>

				<div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60">
					<span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
						Adaptive Block / Tick
					</span>
					<span className="text-sm font-bold text-slate-800">
						{block_lot.toLocaleString("id-ID")} lot / {tick}
					</span>
				</div>
			</div>
		</div>
	);
}
