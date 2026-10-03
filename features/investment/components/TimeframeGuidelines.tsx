"use client";

import { useMemo } from "react";
import {
	Zap,
	TrendingUp,
	Target,
	Clock,
	ShieldCheck,
	AlertCircle,
} from "lucide-react";
import type {
	InvestmentCompassData,
	TimeframeGuideline,
} from "@/features/investment/types";
import { generatePlaybook } from "@/features/investment/lib/engine";

export default function TimeframeGuidelines({
	data,
}: {
	data: InvestmentCompassData;
}) {
	const { timeframes } = useMemo(() => generatePlaybook(data), [data]);

	const renderTimeframeCard = (guideline: TimeframeGuideline) => {
		// Design mapping
		let colorConfig = {
			bg: "bg-slate-50",
			border: "border-slate-200/80",
			text: "text-slate-800",
			badgeBg: "bg-slate-200",
			badgeText: "text-slate-800",
			icon: <Clock className="w-5 h-5 text-slate-500" />,
		};

		if (guideline.status === "Favorable") {
			colorConfig = {
				bg: "bg-emerald-50/50",
				border: "border-emerald-200/70",
				text: "text-emerald-900",
				badgeBg: "bg-emerald-100",
				badgeText: "text-emerald-700",
				icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
			};
		} else if (
			guideline.status === "Selective" ||
			guideline.status === "Hold"
		) {
			colorConfig = {
				bg: "bg-amber-50/50",
				border: "border-amber-200/70",
				text: "text-amber-900",
				badgeBg: "bg-amber-100",
				badgeText: "text-amber-700",
				icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
			};
		} else if (guideline.status === "Avoid") {
			colorConfig = {
				bg: "bg-rose-50/50",
				border: "border-rose-200/70",
				text: "text-rose-900",
				badgeBg: "bg-rose-100",
				badgeText: "text-rose-700",
				icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
			};
		}

		let mainIcon = <Zap className="w-5 h-5" />;
		if (guideline.id === "swing") mainIcon = <TrendingUp className="w-5 h-5" />;
		if (guideline.id === "investment")
			mainIcon = <Target className="w-5 h-5" />;

		return (
			<div
				key={guideline.id}
				className={`rounded-2xl p-4 sm:p-5 border ${colorConfig.border} ${colorConfig.bg} flex flex-col justify-between`}
			>
				<div className="space-y-3.5 sm:space-y-4">
					<div className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-2 min-w-0 flex-1">
							<div
								className={`p-1.5 sm:p-2 rounded-xl bg-white shadow-2xs border ${colorConfig.border} text-slate-700 shrink-0`}
							>
								{mainIcon}
							</div>
							<h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight truncate">
								{guideline.style}
							</h3>
						</div>
						<span
							className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${colorConfig.badgeBg} ${colorConfig.badgeText}`}
						>
							{guideline.status}
						</span>
					</div>
					<div className="flex items-start gap-2.5 sm:gap-3 bg-white/60 p-2.5 sm:p-3 rounded-xl border border-white">
						<div className="shrink-0 mt-0.5">{colorConfig.icon}</div>
						<p className="text-xs font-semibold text-slate-600 leading-relaxed">
							{guideline.reason}
						</p>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 space-y-5 sm:space-y-6">
			<div className="flex items-center gap-3 border-b border-slate-100 pb-4">
				<div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
					<Clock className="w-5 h-5" />
				</div>
				<div>
					<h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
						Trading Timeframe Guidelines
					</h2>
					<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
						Actionable Stances for Scalping, Swing, and Investment
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{timeframes.map(renderTimeframeCard)}
			</div>
		</div>
	);
}
