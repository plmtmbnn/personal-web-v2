import { Layers } from "lucide-react";
import type { LayerScores } from "../types";

interface LayerScoresCardProps {
	layerScores: LayerScores;
	compositeScore: number;
}

export default function LayerScoresCard({
	layerScores,
	compositeScore,
}: LayerScoresCardProps) {
	const layers = [
		{
			id: "layer1_price",
			name: "Layer 1: Price Action & Multi-Day Profile",
			desc: "VCP contraction, Ascending Value Area, 10D/20D/60D VPOC, Stage 2 markup, volume breakout",
			data: layerScores?.layer1_price,
			color: "bg-indigo-500",
			text: "text-indigo-600",
		},
		{
			id: "layer2_orderflow",
			name: "Layer 2: Order Flow & PLIR",
			desc: "Parent-order Big Money flows across 1D/5D/10D, anchored delta from low, red-day absorption",
			data: layerScores?.layer2_orderflow,
			color: "bg-emerald-500",
			text: "text-emerald-600",
		},
		{
			id: "layer3_bandar",
			name: "Layer 3: Participant Profile & Bandar Cost Basis",
			desc: "Conviction ratio, institutional classification, active accumulator cost-basis discount",
			data: layerScores?.layer3_bandar,
			color: "bg-sky-500",
			text: "text-sky-600",
		},
		{
			id: "layer4_trajectory",
			name: "Layer 4: Broker Trajectory & Cumulative Slopes",
			desc: "Delta trajectory, seller exhaustion, distributor buyback, crowd capitulation",
			data: layerScores?.layer4_trajectory,
			color: "bg-amber-500",
			text: "text-amber-600",
		},
		{
			id: "layer5_network",
			name: "Layer 5: Network Topology & Anti-Wash",
			desc: "Self-matching ratio, circular wash rotation, Many-to-Few absorption vs dispersion",
			data: layerScores?.layer5_network,
			color: "bg-teal-500",
			text: "text-teal-600",
		},
	];

	return (
		<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
				<div className="flex items-center gap-2.5">
					<div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
						<Layers className="w-4 h-4" aria-hidden />
					</div>
					<div>
						<h3 className="text-base font-extrabold text-slate-900">
							5-Layer Composite Scoring
						</h3>
						<p className="text-xs text-slate-500">
							Multi-dimensional quantitative swing score weighted to 100%
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<span className="text-xs text-slate-500 font-semibold">
						Total Weighted Score:
					</span>
					<span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-mono font-bold">
						{Math.round(compositeScore)} / 100
					</span>
				</div>
			</div>

			{/* Layers Breakdown */}
			<div className="space-y-3.5">
				{layers.map((layer) => {
					const score = layer.data?.score ?? 0;
					const weight =
						layer.data?.effective_weight_pct ?? layer.data?.base_weight ?? 0;

					return (
						<div
							key={layer.id}
							className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 transition-colors hover:bg-slate-50/90"
						>
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
								<div className="space-y-0.5">
									<div className="flex items-center gap-2">
										<span className="font-extrabold text-slate-900">
											{layer.name}
										</span>
										<span className="px-1.5 py-0.2 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-600">
											Weight: {weight}%
										</span>
									</div>
									<p className="text-[11px] text-slate-500 hidden sm:block">
										{layer.desc}
									</p>
								</div>

								<div className="flex items-center gap-2 self-start sm:self-auto font-mono">
									<span
										className={`text-sm sm:text-base font-extrabold ${layer.text}`}
									>
										{Math.round(score)}
									</span>
									<span className="text-xs text-slate-500">/ 100</span>
								</div>
							</div>

							{/* Progress Bar */}
							<div className="w-full h-2 rounded-full bg-slate-200/70 overflow-hidden">
								<div
									className={`h-full rounded-full transition-all duration-500 ${layer.color}`}
									style={{ width: `${Math.max(2, Math.min(100, score))}%` }}
								/>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
