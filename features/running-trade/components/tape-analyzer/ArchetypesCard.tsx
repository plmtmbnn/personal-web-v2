import { Award, Layers } from "lucide-react";
import type { ScreenerArchetype } from "../../types/tape-analyzer";

interface ArchetypesCardProps {
	archetypes: ScreenerArchetype[];
}

export default function ArchetypesCard({ archetypes }: ArchetypesCardProps) {
	const sorted = [...archetypes].sort((a, b) => b.score - a.score);
	const dominant = sorted[0];

	return (
		<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
				<div>
					<h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
						<Layers className="w-4 h-4 text-slate-700" />
						BEI Microstructure Archetypes
					</h3>
					<p className="text-xs text-slate-500 mt-0.5">
						Microstructure behavior matched against 10 historical tape patterns
					</p>
				</div>
				{dominant && dominant.score > 0 && (
					<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold self-start sm:self-auto border border-slate-200">
						<Award className="w-3.5 h-3.5 text-slate-600" />
						Dominant: {dominant.name} ({dominant.score.toFixed(0)}%)
					</div>
				)}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
				{sorted.map((arch, idx) => {
					const isTop = idx === 0 && arch.score > 0;
					return (
						<div key={arch.name} className="space-y-1.5">
							<div className="flex items-start justify-between gap-3 text-xs">
								<span
									className={`font-semibold break-words ${
										isTop ? "text-slate-900 font-bold" : "text-slate-700"
									}`}
								>
									{arch.name}
								</span>
								<span
									className={`font-mono text-xs shrink-0 ${
										isTop
											? "text-slate-900 font-bold"
											: arch.score > 40
												? "text-slate-700 font-semibold"
												: "text-slate-400"
									}`}
								>
									{arch.score.toFixed(1)}%
								</span>
							</div>

							<div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
								<div
									className={`h-full rounded-full transition-all duration-500 ${
										isTop
											? "bg-slate-900"
											: arch.score >= 50
												? "bg-slate-600"
												: "bg-slate-300"
									}`}
									style={{
										width: `${Math.min(Math.max(arch.score, 0), 100)}%`,
									}}
								/>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
