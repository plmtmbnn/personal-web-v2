import {
	Activity,
	ArrowDownRight,
	ArrowUpRight,
	Coins,
	ShieldCheck,
	Users,
} from "lucide-react";
import type { BandarDetector, TopDetectorTier } from "../types";

interface BandarDetectorBarometerProps {
	detector: BandarDetector;
	from: string;
	to: string;
	symbol: string;
}

function getVerdictBadge(accdist: string) {
	const upper = (accdist || "").toUpperCase();
	if (upper.includes("ACCUMULATION") || upper.includes("ACC")) {
		return {
			bg: "bg-emerald-50",
			border: "border-emerald-200/80",
			text: "text-emerald-700",
			icon: ArrowUpRight,
		};
	}
	if (upper.includes("DISTRIBUTION") || upper.includes("DIST")) {
		return {
			bg: "bg-rose-50",
			border: "border-rose-200/80",
			text: "text-rose-700",
			icon: ArrowDownRight,
		};
	}
	return {
		bg: "bg-slate-100",
		border: "border-slate-200",
		text: "text-slate-700",
		icon: Activity,
	};
}

export default function BandarDetectorBarometer({
	detector,
	from,
	to,
	symbol,
}: BandarDetectorBarometerProps) {
	const mainVerdict = getVerdictBadge(detector.broker_accdist);
	const VerdictIcon = mainVerdict.icon;

	const tiers: { label: string; tier: TopDetectorTier }[] = [
		{ label: "Top 1", tier: detector.top1 },
		{ label: "Top 3", tier: detector.top3 },
		{ label: "Top 5", tier: detector.top5 },
		{ label: "Top 10", tier: detector.top10 },
	];

	return (
		<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
			{/* Top Barometer Executive Row */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-500">
							Bandar Concentration Barometer
						</span>
						<span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-mono font-bold text-slate-700">
							{symbol}
						</span>
					</div>

					<div className="flex items-center gap-3">
						<span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
							Institutional Verdict:
						</span>
						<div
							className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs sm:text-sm font-extrabold uppercase tracking-wide ${mainVerdict.bg} ${mainVerdict.border} ${mainVerdict.text}`}
						>
							<VerdictIcon className="w-4 h-4 shrink-0" aria-hidden />
							<span>{detector.broker_accdist || "NEUTRAL"}</span>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/60 self-start sm:self-center">
					<span>From: {from}</span>
					<span className="text-slate-300">&bull;</span>
					<span>To: {to}</span>
				</div>
			</div>

			{/* Market Participants & Value Metric Strip */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
				<div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1">
					<div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
						<Users className="w-3.5 h-3.5" aria-hidden />
						<span>Buyer vs Seller</span>
					</div>
					<div className="flex items-baseline gap-1.5">
						<span className="text-lg sm:text-xl font-mono font-extrabold text-emerald-600">
							{detector.total_buyer?.toLocaleString("id-ID") ?? "0"}
						</span>
						<span className="text-xs text-slate-500 font-bold">vs</span>
						<span className="text-lg sm:text-xl font-mono font-extrabold text-rose-600">
							{detector.total_seller?.toLocaleString("id-ID") ?? "0"}
						</span>
					</div>
					<span className="text-[11px] text-slate-500 font-medium block">
						Total Active Traders
					</span>
				</div>

				<div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1">
					<div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
						<Activity className="w-3.5 h-3.5" aria-hidden />
						<span>Total Volume</span>
					</div>
					<span className="text-lg sm:text-xl font-mono font-extrabold text-slate-900 block truncate">
						{detector.volume?.toLocaleString("id-ID") ?? "0"}
					</span>
					<span className="text-[11px] text-slate-500 font-medium block">
						Shares Traded
					</span>
				</div>

				<div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1">
					<div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
						<Coins className="w-3.5 h-3.5" aria-hidden />
						<span>Total Turnover</span>
					</div>
					<span className="text-lg sm:text-xl font-mono font-extrabold text-slate-900 block truncate">
						Rp {detector.value?.toLocaleString("id-ID") ?? "0"}
					</span>
					<span className="text-[11px] text-slate-500 font-medium block">
						Cumulative Value
					</span>
				</div>

				<div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1">
					<div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
						<ShieldCheck className="w-3.5 h-3.5" aria-hidden />
						<span>Weighted Avg Price</span>
					</div>
					<span className="text-lg sm:text-xl font-mono font-extrabold text-slate-900 block truncate">
						Rp {detector.average?.toLocaleString("id-ID") ?? "0"}
					</span>
					<span className="text-[11px] text-slate-500 font-medium block">
						{detector.number_broker_buysell ?? 0} Active Brokers
					</span>
				</div>
			</div>

			{/* Top 1, Top 3, Top 5, Top 10 Concentration Cards */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<span className="text-xs font-bold uppercase tracking-wider text-slate-700">
						Bandar Accumulation / Distribution by Tier
					</span>
					<span className="text-[11px] text-slate-500">
						Ranked by total broker net volume
					</span>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
					{tiers.map(({ label, tier }) => {
						const style = getVerdictBadge(tier?.accdist ?? "");
						const Icon = style.icon;

						return (
							<div
								key={label}
								className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3 transition-colors hover:bg-slate-50"
							>
								<div className="flex items-center justify-between gap-2">
									<span className="text-xs font-extrabold text-slate-900">
										{label}
									</span>
									<span
										className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-[11px] font-extrabold uppercase ${style.bg} ${style.border} ${style.text}`}
									>
										<Icon className="w-3 h-3" aria-hidden />
										<span>{tier?.accdist || "NEUTRAL"}</span>
									</span>
								</div>

								<div className="space-y-1">
									<div className="flex items-baseline justify-between">
										<span className="text-[11px] text-slate-500">
											Net Amount
										</span>
										<span className="text-sm font-mono font-bold text-slate-900">
											Rp {tier?.amount?.toLocaleString("id-ID") ?? "0"}
										</span>
									</div>

									<div className="flex items-baseline justify-between">
										<span className="text-[11px] text-slate-500">
											Share of Turnover
										</span>
										<span className="text-sm font-mono font-extrabold text-slate-900">
											{tier?.percent?.toFixed(2) ?? "0.00"}%
										</span>
									</div>

									<div className="flex items-baseline justify-between">
										<span className="text-[11px] text-slate-500">
											Net Volume
										</span>
										<span className="text-xs font-mono font-medium text-slate-600">
											{tier?.vol?.toLocaleString("id-ID") ?? "0"} lots
										</span>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
