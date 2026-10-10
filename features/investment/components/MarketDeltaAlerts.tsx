"use client";

import { useMemo } from "react";
import { BellRing, TrendingDown, TrendingUp, AlertOctagon } from "lucide-react";
import type {
	InvestmentCompassData,
	CompassAlert,
} from "@/features/investment/types";
import { deriveAlerts } from "../lib/engine/alerts";
import { DEFAULT_THRESHOLDS } from "../config/thresholds";

export default function MarketDeltaAlerts({
	data,
	alerts: propAlerts,
}: {
	data: InvestmentCompassData;
	alerts?: CompassAlert[];
}) {
	const alerts: CompassAlert[] = useMemo(() => {
		if (propAlerts) {
			return propAlerts;
		}
		if (data.engineOutput?.alerts) {
			return data.engineOutput.alerts;
		}
		return deriveAlerts(data, DEFAULT_THRESHOLDS);
	}, [data, propAlerts]);

	if (alerts.length === 0) return null;

	return (
		<div className="bg-amber-50 rounded-[2rem] border-2 border-amber-400/50 shadow-lg shadow-amber-900/5 p-4 sm:p-7 space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
					<BellRing className="w-5 h-5 animate-pulse" />
				</div>
				<div>
					<h3 className="text-lg font-black text-amber-900 tracking-tight">
						Significant Market Shifts
					</h3>
					<p className="text-[10px] font-bold text-amber-700/80 uppercase tracking-wider">
						Overnight Delta Alerts
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				{alerts.map((alert, idx) => {
					let icon = <AlertOctagon className="w-4 h-4" />;
					let colors = "bg-amber-100/50 text-amber-800 border-amber-200/60";

					if (alert.type === "danger") {
						icon = <TrendingDown className="w-4 h-4" />;
						colors = "bg-rose-100 text-rose-800 border-rose-200";
					} else if (alert.type === "positive") {
						icon = <TrendingUp className="w-4 h-4" />;
						colors = "bg-emerald-100 text-emerald-800 border-emerald-200";
					}

					return (
						<div
							key={idx}
							className={`flex items-start gap-2.5 p-3 sm:p-3.5 rounded-xl border ${colors}`}
						>
							<div className="mt-0.5 shrink-0">{icon}</div>
							<div className="min-w-0 flex-1">
								{alert.title && (
									<span className="text-[10px] font-black uppercase tracking-wider block mb-0.5">
										{alert.title}
									</span>
								)}
								<p className="text-xs font-semibold leading-relaxed break-words">
									{alert.message}
								</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
