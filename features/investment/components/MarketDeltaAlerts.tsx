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
		<section
			aria-label="Critical Market Delta Alerts"
			className="bg-white rounded-3xl border border-amber-200/90 shadow-xs p-5 sm:p-6 space-y-4"
		>
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 flex items-center justify-center shrink-0">
					<BellRing className="w-5 h-5" />
				</div>
				<div>
					<h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
						Market alerts
					</h2>
					<p className="text-xs font-medium text-slate-500">
						Changes since the previous reading
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				{alerts.map((alert, idx) => {
					let icon = <AlertOctagon className="w-4 h-4" />;
					let cardBorder = "border-slate-200/80 border-l-4 border-l-amber-500";
					let iconBadge = "bg-amber-50 text-amber-800 border-amber-200/80";

					if (alert.type === "danger") {
						icon = <TrendingDown className="w-4 h-4" />;
						cardBorder = "border-slate-200/80 border-l-4 border-l-rose-600";
						iconBadge = "bg-rose-50 text-rose-800 border-rose-200/80";
					} else if (alert.type === "positive") {
						icon = <TrendingUp className="w-4 h-4" />;
						cardBorder = "border-slate-200/80 border-l-4 border-l-emerald-600";
						iconBadge = "bg-emerald-50 text-emerald-800 border-emerald-200/80";
					}

					return (
						<div
							key={idx}
							className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border ${cardBorder}`}
						>
							<div
								className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${iconBadge}`}
							>
								{icon}
							</div>
							<div className="min-w-0 flex-1">
								{alert.title && (
									<span className="text-xs font-bold text-slate-900 block mb-0.5">
										{alert.title}
									</span>
								)}
								<p className="text-xs font-medium text-slate-600 leading-relaxed break-words">
									{alert.message}
								</p>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
