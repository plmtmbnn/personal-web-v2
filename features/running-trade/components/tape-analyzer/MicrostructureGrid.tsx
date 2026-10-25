import { Activity, BarChart3, Compass, Layers } from "lucide-react";
import type { TapeAnalyzerResponse } from "../../types/tape-analyzer";

interface MicrostructureGridProps {
	data: TapeAnalyzerResponse;
}

export default function MicrostructureGrid({ data }: MicrostructureGridProps) {
	const { levels, recent, bm_recent, bm_divergence, zero_ask_low } = data;

	const isDeltaPositive = recent.delta >= 0;
	const isBmNetPositive = bm_recent.net >= 0;

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
			{/* Card 1: Value Area & Profile */}
			<div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
				<div>
					<div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
							<BarChart3 className="w-3.5 h-3.5 text-slate-700" />
							Value Area & Profile
						</span>
						<span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
							70% Range
						</span>
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-slate-500">
								VPOC (Peak Volume)
							</span>
							<span className="text-sm font-bold text-slate-900">
								{levels.vpoc.toLocaleString("id-ID")}
							</span>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-slate-500">
								VWAP (Benchmark)
							</span>
							<span className="text-sm font-bold text-slate-900">
								{levels.vwap.toFixed(1)}
							</span>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-slate-500">
								Value Area (VAL - VAH)
							</span>
							<span className="text-sm font-semibold text-slate-800">
								{levels.val.toLocaleString()} - {levels.vah.toLocaleString()}
							</span>
						</div>

						<div className="pt-2 border-t border-slate-100">
							<div className="flex items-center justify-between text-xs">
								<span className="font-medium text-slate-500">
									ORB (15m Range)
								</span>
								<span className="font-semibold text-slate-700">
									{levels.orb.low} - {levels.orb.high}
								</span>
							</div>
							<div className="mt-1 text-[11px] font-semibold text-slate-500">
								Status: {levels.orb.status}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Card 2: 15-Minute Tape Flow */}
			<div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
				<div>
					<div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
							<Activity className="w-3.5 h-3.5 text-slate-700" />
							15m Flow Dynamics
						</span>
						<span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
							{recent.n} Prints
						</span>
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-slate-500">
								Tape Speed
							</span>
							<span className="text-sm font-bold text-slate-900">
								{recent.speed.toFixed(2)} ticks/sec
							</span>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-slate-500">
								Recent Delta
							</span>
							<span
								className={`text-sm font-bold ${
									isDeltaPositive ? "text-emerald-600" : "text-rose-600"
								}`}
							>
								{isDeltaPositive ? "+" : ""}
								{recent.delta.toLocaleString("id-ID")} lot
							</span>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-slate-500">
								Buy Aggression
							</span>
							<span className="text-sm font-bold text-slate-900">
								{recent.buy_pct.toFixed(1)}%
							</span>
						</div>

						<div className="pt-2 border-t border-slate-100">
							<div className="flex items-center justify-between text-xs">
								<span className="font-medium text-slate-500">
									Divergence Alert
								</span>
								<span
									className={`text-[11px] font-bold px-2 py-0.5 rounded ${
										recent.bear_div
											? "bg-rose-50 text-rose-700 border border-rose-200"
											: recent.bull_div
												? "bg-emerald-50 text-emerald-700 border border-emerald-200"
												: "bg-slate-50 text-slate-600"
									}`}
								>
									{recent.bear_div
										? "Bearish Div"
										: recent.bull_div
											? "Bullish Div"
											: "None"}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Card 3: Big Money Flow */}
			<div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
				<div>
					<div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
							<Layers className="w-3.5 h-3.5 text-slate-700" />
							Big Money Flow
						</span>
						<span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
							Tape Track
						</span>
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-slate-500">
								BM Buy vs Sell
							</span>
							<span className="text-sm font-semibold text-slate-800">
								{bm_divergence.bm_buy}% / {bm_divergence.bm_sell}%
							</span>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-slate-500">
								BM Net Volume
							</span>
							<span
								className={`text-sm font-bold ${
									isBmNetPositive ? "text-emerald-600" : "text-rose-600"
								}`}
							>
								{isBmNetPositive ? "+" : ""}
								{bm_recent.net.toLocaleString("id-ID")} lot
							</span>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-slate-500">
								Retail RT Buy/Sell
							</span>
							<span className="text-sm font-semibold text-slate-800">
								{bm_divergence.bmrt_buy}% / {bm_divergence.bmrt_sell}%
							</span>
						</div>

						<div className="pt-2 border-t border-slate-100">
							<div className="flex items-center justify-between text-xs">
								<span className="font-medium text-slate-500">
									False Break Risk
								</span>
								<span
									className={`text-[11px] font-bold px-2 py-0.5 rounded ${
										bm_divergence.false_bull || bm_divergence.false_bear
											? "bg-rose-50 text-rose-700 border border-rose-200"
											: "bg-emerald-50 text-emerald-700 border border-emerald-200"
									}`}
								>
									{bm_divergence.false_bull
										? "Bull Trap"
										: bm_divergence.false_bear
											? "Bear Trap"
											: "Normal"}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Card 4: Zero-Ask Low Reversal */}
			<div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
				<div>
					<div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
							<Compass className="w-3.5 h-3.5 text-slate-700" />
							Low Absorption
						</span>
						<span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
							Level {zero_ask_low.level}
						</span>
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-slate-500">
								Support Duration
							</span>
							<span className="text-sm font-bold text-slate-900">
								{zero_ask_low.held_min.toFixed(0)} min
							</span>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-slate-500">
								Buy Ratio at Low
							</span>
							<span className="text-sm font-semibold text-slate-800">
								{zero_ask_low.buy_ratio.toFixed(1)}%
							</span>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-slate-500">
								Recovery High
							</span>
							<span className="text-sm font-bold text-emerald-600">
								{zero_ask_low.recovery_high.toLocaleString("id-ID")}
							</span>
						</div>

						<div className="pt-2 border-t border-slate-100">
							<div className="flex items-center justify-between text-xs">
								<span className="font-medium text-slate-500">
									Support State
								</span>
								<span
									className={`text-[11px] font-bold px-2 py-0.5 rounded ${
										zero_ask_low.recovered
											? "bg-emerald-50 text-emerald-700 border border-emerald-200"
											: "bg-slate-50 text-slate-600"
									}`}
								>
									{zero_ask_low.recovered ? "Recovered" : "Under Test"}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
