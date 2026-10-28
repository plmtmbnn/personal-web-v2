"use client";

import {
	AlertTriangle,
	ArrowUpRight,
	Clock,
	Compass,
	ShieldAlert,
	Target,
} from "lucide-react";
import type { SwingAction, TradePlan } from "../types";

interface ActionTradePlanBannerProps {
	ticker: string;
	date: string;
	horizon: string;
	swingScore: number;
	activeLayers: number;
	action: SwingAction;
	tradePlan: TradePlan;
}

function getActionStyle(actionKey: string) {
	const key = (actionKey || "").toUpperCase();
	if (key === "STRONG_BUY") {
		return {
			bg: "bg-emerald-50",
			border: "border-emerald-300",
			text: "text-emerald-800",
			scoreBg: "bg-emerald-600 text-white",
			icon: ArrowUpRight,
		};
	}
	if (key === "BUY_ON_WEAKNESS") {
		return {
			bg: "bg-sky-50",
			border: "border-sky-300",
			text: "text-sky-800",
			scoreBg: "bg-sky-600 text-white",
			icon: Compass,
		};
	}
	if (key === "WAIT_FOR_TRIGGER") {
		return {
			bg: "bg-amber-50",
			border: "border-amber-300",
			text: "text-amber-800",
			scoreBg: "bg-amber-500 text-white",
			icon: Clock,
		};
	}
	if (key.includes("DISTRIBUTION") || key === "AVOID_DISTRIBUTION") {
		return {
			bg: "bg-rose-50",
			border: "border-rose-300",
			text: "text-rose-800",
			scoreBg: "bg-rose-600 text-white",
			icon: AlertTriangle,
		};
	}
	return {
		bg: "bg-slate-100",
		border: "border-slate-300",
		text: "text-slate-800",
		scoreBg: "bg-slate-700 text-white",
		icon: ShieldAlert,
	};
}

export default function ActionTradePlanBanner({
	ticker,
	date,
	horizon,
	swingScore,
	activeLayers,
	action,
	tradePlan,
}: ActionTradePlanBannerProps) {
	const style = getActionStyle(action?.key);
	const ActionIcon = style.icon;

	return (
		<div className="space-y-6">
			{/* Executive Action Banner */}
			<div
				className={`p-6 sm:p-7 rounded-3xl border ${style.bg} ${style.border} shadow-xs space-y-4`}
			>
				<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
					<div className="space-y-2">
						<div className="flex flex-wrap items-center gap-2">
							<span className="px-3 py-1 rounded-xl bg-slate-900 text-white font-mono font-extrabold text-sm sm:text-base">
								{ticker}
							</span>
							<span className="px-2.5 py-0.5 rounded-lg bg-white/80 border border-slate-200 text-slate-700 text-xs font-semibold">
								{horizon}
							</span>
							<span className="text-xs font-mono text-slate-500">{date}</span>
							<span className="px-2 py-0.5 rounded-md bg-white/70 border border-slate-200 text-slate-600 text-[11px] font-mono font-bold">
								{activeLayers}/5 Active Layers
							</span>
						</div>

						<div className="flex items-center gap-2.5">
							<div className="w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center shrink-0">
								<ActionIcon className={`w-5 h-5 ${style.text}`} aria-hidden />
							</div>
							<h2
								className={`text-lg sm:text-xl font-black tracking-tight ${style.text}`}
							>
								{action?.label || action?.key}
							</h2>
						</div>

						{action?.best_setup && (
							<p className="text-xs sm:text-sm text-slate-700 font-medium">
								<span className="font-bold">Primary Setup:</span>{" "}
								{action.best_setup}
							</p>
						)}
					</div>

					{/* Composite Score Pill */}
					<div className="flex items-center gap-4 self-start lg:self-center bg-white/90 p-4 rounded-2xl border border-slate-200/80 shadow-xs">
						<div className="text-right">
							<span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
								Composite Score
							</span>
							<span className="text-xs text-slate-600 font-medium">
								Conviction: {action?.conviction || "MEDIUM"}
							</span>
						</div>
						<div
							className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-black text-2xl shadow-xs shrink-0 ${style.scoreBg}`}
						>
							{Math.round(swingScore)}
						</div>
					</div>
				</div>
			</div>

			{/* Actionable Trade Plan Card */}
			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
					<div className="flex items-center gap-2.5">
						<div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shrink-0">
							<Target className="w-4 h-4" aria-hidden />
						</div>
						<div>
							<h3 className="text-base font-extrabold text-slate-900">
								Execution Trade Plan
							</h3>
							<p className="text-xs text-slate-500">
								{tradePlan?.strategy ||
									"Swing execution targets and stop boundary"}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<span
							className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
								tradePlan?.status === "READY"
									? "bg-emerald-50 text-emerald-700 border border-emerald-200"
									: "bg-amber-50 text-amber-700 border border-amber-200"
							}`}
						>
							{tradePlan?.status || "DEVELOPING"}
						</span>
						<span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono font-bold">
							Net RRR: {tradePlan?.rr_net ?? 0}
						</span>
					</div>
				</div>

				{/* 4-Box Key Trade Metrics */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
					{/* Entry Zone */}
					<div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1">
						<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
							Entry Zone
						</span>
						<span className="text-base sm:text-lg font-mono font-extrabold text-slate-900 block truncate">
							{tradePlan?.entry_zone || `Rp ${tradePlan?.entry_ref ?? 0}`}
						</span>
						<span className="text-[11px] text-slate-500 font-medium block">
							Ref: Rp {tradePlan?.entry_ref ?? 0}
						</span>
					</div>

					{/* Invalidation Stop Loss */}
					<div className="p-4 bg-rose-50/60 border border-rose-200/70 rounded-2xl space-y-1">
						<span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
							Stop Loss (SL)
						</span>
						<span className="text-base sm:text-lg font-mono font-extrabold text-rose-700 block truncate">
							Rp {tradePlan?.sl ?? 0}
						</span>
						<span className="text-[11px] text-rose-600 font-semibold block font-mono">
							{tradePlan?.sl_pct_net ?? 0}% Net
						</span>
					</div>

					{/* Target Profit 1 */}
					<div className="p-4 bg-emerald-50/60 border border-emerald-200/70 rounded-2xl space-y-1">
						<span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
							Target Profit 1 (TP1)
						</span>
						<span className="text-base sm:text-lg font-mono font-extrabold text-emerald-700 block truncate">
							Rp {tradePlan?.tp1 ?? 0}
						</span>
						<span className="text-[11px] text-emerald-600 font-semibold block font-mono">
							+{tradePlan?.tp1_pct_net ?? 0}% ({tradePlan?.rr_tp1_net ?? 0} RRR)
						</span>
					</div>

					{/* Target Profit 2 */}
					<div className="p-4 bg-emerald-50/60 border border-emerald-200/70 rounded-2xl space-y-1">
						<span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
							Target Profit 2 (TP2)
						</span>
						<span className="text-base sm:text-lg font-mono font-extrabold text-emerald-700 block truncate">
							Rp {tradePlan?.tp2 ?? 0}
						</span>
						<span className="text-[11px] text-emerald-600 font-semibold block font-mono">
							+{tradePlan?.tp2_pct_net ?? 0}% ({tradePlan?.rr_tp2_net ?? 0} RRR)
						</span>
					</div>
				</div>

				{/* Trigger Rule & Horizon Note */}
				{tradePlan?.trigger_rule && (
					<div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs space-y-1">
						<span className="font-bold text-slate-800 block">
							Execution Trigger Rule:
						</span>
						<p className="text-slate-600">{tradePlan.trigger_rule}</p>
					</div>
				)}
			</div>
		</div>
	);
}
