"use client";

import { useMemo } from "react";
import { BellRing, TrendingDown, TrendingUp, AlertOctagon } from "lucide-react";
import type { InvestmentCompassData } from "@/features/investment/types";

export default function MarketDeltaAlerts({
	data,
}: {
	data: InvestmentCompassData;
}) {
	const alerts = useMemo(() => {
		const activeAlerts: {
			message: string;
			type: "danger" | "warning" | "positive";
		}[] = [];

		// 1. VIX Spike Check
		const vix = data.markets.quotes.VIX;
		if (vix?.changePct && vix.changePct >= 10) {
			activeAlerts.push({
				message: `Volatility Shock: VIX spiked +${vix.changePct.toFixed(1)}% today. Markets are pricing in sudden risk.`,
				type: "danger",
			});
		} else if (vix?.changePct && vix.changePct <= -10) {
			activeAlerts.push({
				message: `Volatility Crush: VIX dropped ${vix.changePct.toFixed(1)}%. Markets are highly complacent.`,
				type: "positive",
			});
		}

		// 2. CNN Fear & Greed Rapid Shifts
		const fng = data.sentiment.traditional?.fear_and_greed;
		if (fng) {
			const delta = fng.score - fng.previous_close;
			if (delta <= -15) {
				activeAlerts.push({
					message: `Sentiment Plunge: CNN Fear & Greed dropped ${Math.abs(delta)} points overnight.`,
					type: "danger",
				});
			} else if (delta >= 15) {
				activeAlerts.push({
					message: `Sentiment Surge: CNN Fear & Greed jumped +${delta} points overnight.`,
					type: "positive",
				});
			}
		}

		// 3. Equity Market Shocks
		const spx = data.markets.quotes.SPX;
		const ihsg = data.markets.quotes.IHSG;
		if (spx?.changePct && spx.changePct <= -2.0) {
			activeAlerts.push({
				message: `US Selloff: S&P 500 is down ${spx.changePct.toFixed(2)}%. Global beta is negative.`,
				type: "danger",
			});
		}
		if (ihsg?.changePct && ihsg.changePct <= -1.5) {
			activeAlerts.push({
				message: `Domestic Selloff: IHSG is down ${ihsg.changePct.toFixed(2)}%.`,
				type: "danger",
			});
		}

		// 4. US Dollar Surge (Emerging Market/Crypto Killer)
		const dxy = data.markets.quotes.DXY;
		if (dxy?.changePct && dxy.changePct >= 0.8) {
			activeAlerts.push({
				message: `Dollar Rally: DXY surged +${dxy.changePct.toFixed(2)}%. Expect heavy headwinds for Crypto and IHSG.`,
				type: "warning",
			});
		}

		return activeAlerts;
	}, [data]);

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
							<span className="text-xs font-bold leading-relaxed min-w-0 flex-1 break-words">
								{alert.message}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
