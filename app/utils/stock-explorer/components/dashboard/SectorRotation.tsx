import { useMemo } from "react";
import { motion } from "framer-motion";
import type { ProcessedStock, Sector } from "../../types";

interface SectorRotationProps {
	stocks: ProcessedStock[];
}

interface SectorData {
	name: Sector;
	avgReturn: number;
	volume: number;
	foreignNet: number;
	count: number;
}

export default function SectorRotation({ stocks }: SectorRotationProps) {
	const sectorStats = useMemo(() => {
		const map = new Map<Sector, SectorData>();

		for (const s of stocks) {
			if (!map.has(s.Sector)) {
				map.set(s.Sector, {
					name: s.Sector,
					avgReturn: 0,
					volume: 0,
					foreignNet: 0,
					count: 0,
				});
			}
			const stat = map.get(s.Sector)!;
			stat.avgReturn += s.ChangePct;
			stat.volume += s.Volume;
			stat.foreignNet += s.ForeignNet;
			stat.count += 1;
		}

		return Array.from(map.values())
			.map((s) => ({
				...s,
				avgReturn: s.count > 0 ? s.avgReturn / s.count : 0,
			}))
			.sort((a, b) => b.avgReturn - a.avgReturn);
	}, [stocks]);

	const maxReturn = Math.max(
		...sectorStats.map((s) => Math.abs(s.avgReturn)),
		1,
	);

	return (
		<div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
			<h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
				Sector Rotation
			</h3>

			<div className="space-y-5">
				{sectorStats.slice(0, 8).map((sector) => {
					const isPositive = sector.avgReturn >= 0;
					const widthPct = (Math.abs(sector.avgReturn) / maxReturn) * 100;

					return (
						<div key={sector.name} className="relative">
							<div className="flex justify-between items-end mb-1 z-10 relative">
								<span className="text-xs font-bold text-slate-700 truncate pr-2">
									{sector.name}{" "}
									<span className="text-[9px] text-slate-400 ml-1">
										({sector.count})
									</span>
								</span>
								<span
									className={`text-xs font-black ${isPositive ? "text-emerald-600" : "text-rose-600"}`}
								>
									{isPositive ? "+" : ""}
									{sector.avgReturn.toFixed(2)}%
								</span>
							</div>

							{/* Bidirectional Bar */}
							<div className="flex items-center w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative">
								{/* Negative side */}
								<div className="flex-1 h-full flex justify-end">
									{!isPositive && (
										<motion.div
											initial={{ width: 0 }}
											animate={{ width: `${widthPct}%` }}
											className="h-full bg-rose-500 rounded-l-full"
										/>
									)}
								</div>

								{/* Center divider */}
								<div className="w-px h-full bg-slate-300 z-10" />

								{/* Positive side */}
								<div className="flex-1 h-full flex justify-start">
									{isPositive && (
										<motion.div
											initial={{ width: 0 }}
											animate={{ width: `${widthPct}%` }}
											className="h-full bg-emerald-500 rounded-r-full"
										/>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
