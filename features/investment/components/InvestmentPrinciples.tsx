"use client";

import { CheckCircle2, ShieldAlert } from "lucide-react";

export default function InvestmentPrinciples() {
	const principles = [
		{
			title: "Capital Preservation First",
			desc: "Never risk more than 1-2% of total portfolio on a single speculative idea. Survival is the ultimate alpha.",
		},
		{
			title: "Respect the Macro Regime",
			desc: "Don't fight the Fed. Liquidity cycles dictate broad market beta more than individual fundamentals.",
		},
		{
			title: "Agnostic to Narrative",
			desc: "Price is truth. Ignore Twitter euphoria and despair; rely on objective data and established invalidation levels.",
		},
		{
			title: "Mechanical Rebalancing",
			desc: "Trim winners when they exceed target allocations by 20%. Add to high-conviction losers only at technical support.",
		},
	];

	return (
		<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 space-y-6">
			<div className="flex items-center gap-3 border-b border-slate-100 pb-4">
				<div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
					<ShieldAlert className="w-5 h-5" />
				</div>
				<div>
					<h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
						Core Principles
					</h2>
					<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
						Non-Negotiable Trading Rules
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
				{principles.map((p, i) => (
					<div
						key={i}
						className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl p-4 transition-colors"
					>
						<h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2 mb-1.5 min-w-0">
							<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
							<span className="truncate">{p.title}</span>
						</h3>
						<p className="text-xs font-medium text-slate-600 leading-relaxed">
							{p.desc}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
