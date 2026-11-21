"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ProcessedStock, Sector } from "../../types";
import { PieChart } from "lucide-react";

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
	const reduceMotion = useReducedMotion();
	const sectorStats = useMemo(() => {
		const map = new Map<Sector, SectorData>();

		for (const s of stocks) {
			if (s.Sector === "Unclassified" || s.Sector === "Unknown") continue;
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
		<div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs">
			<div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
				<div className="flex items-center gap-2.5">
					<div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
						<PieChart className="w-4 h-4" />
					</div>
					<div>
						<h3 className="text-sm font-bold text-slate-900 tracking-tight">
							Sector performance
						</h3>
						<p className="text-xs font-medium text-slate-600">
							Average return by industry group
						</p>
					</div>
				</div>
				<span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg">
					{sectorStats.length} Sectors
				</span>
			</div>

			<div className="space-y-3.5">
				{sectorStats.slice(0, 8).map((sector) => {
					const isPositive = sector.avgReturn >= 0;
					const widthPct = (Math.abs(sector.avgReturn) / maxReturn) * 100;

					return (
						<div key={sector.name} className="relative">
							<div className="flex justify-between items-center mb-1 text-xs">
								<span className="font-bold text-slate-800 truncate pr-2">
									{sector.name}{" "}
									<span className="text-xs font-medium text-slate-600">
										({sector.count})
									</span>
								</span>
								<span
									className={`font-bold tabular-nums ${
										isPositive ? "text-emerald-700" : "text-rose-700"
									}`}
								>
									{isPositive ? "+" : ""}
									{sector.avgReturn.toFixed(2)}%
								</span>
							</div>

							{/* Bidirectional Bar */}
							<div className="flex items-center w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
								{/* Negative side */}
								<div className="flex-1 h-full flex justify-end">
									{!isPositive && (
										<motion.div
											initial={reduceMotion ? false : { width: 0 }}
											animate={{ width: `${widthPct}%` }}
											className="h-full bg-rose-500 rounded-l-full"
										/>
									)}
								</div>

								{/* Center divider */}
								<div className="w-0.5 h-full bg-slate-300 z-10" />

								{/* Positive side */}
								<div className="flex-1 h-full flex justify-start">
									{isPositive && (
										<motion.div
											initial={reduceMotion ? false : { width: 0 }}
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
