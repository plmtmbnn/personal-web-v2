"use client";

import {
	ShieldAlert,
	CheckCircle2,
	XCircle,
	AlertTriangle,
	ListChecks,
	PauseCircle,
	Lock,
} from "lucide-react";
import type { PermissionsMatrixData, ActionPermission } from "../types";

export default function PermissionsMatrix({
	permissions,
}: {
	permissions: PermissionsMatrixData;
}) {
	const getPermissionBadge = (perm: {
		status: ActionPermission;
		label: string;
	}) => {
		switch (perm.status) {
			case "allowed":
				return {
					bg: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
					icon: (
						<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
					),
				};
			case "selective":
				return {
					bg: "bg-amber-50 text-amber-800 border-amber-200/80",
					icon: (
						<AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
					),
				};
			case "not_allowed":
				return {
					bg: "bg-rose-50 text-rose-800 border-rose-200/80",
					icon: <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />,
				};
			case "paused":
				return {
					bg: "bg-slate-100 text-slate-700 border-slate-200",
					icon: <PauseCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />,
				};
		}
	};

	const rows = [
		{
			market: "Indonesia (IHSG)",
			subtitle: "Equities & LQ45 Constituents",
			data: permissions.ihsg,
		},
		{
			market: "Crypto Majors",
			subtitle: "Bitcoin (BTC) & Ethereum (ETH) Spot",
			data: permissions.crypto,
		},
		{
			market: "Speculative Altcoins",
			subtitle: "High-Beta Tokens & Non-Majors",
			data: permissions.altcoins,
			isGated: true,
		},
	];

	return (
		<div className="space-y-5 sm:space-y-6">
			{/* ── 1. Capital Preservation Banner (if in Stress/Defensive) ────── */}
			{permissions.globalStressActive && (
				<div className="bg-rose-50 border border-rose-200/90 rounded-[2rem] p-5 sm:p-7 shadow-xs text-rose-950 animate-in fade-in duration-500">
					<div className="flex flex-col sm:flex-row items-start gap-3.5 sm:gap-4">
						<div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0 shadow-2xs">
							<ShieldAlert className="w-5 h-5" />
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex items-center gap-2 mb-1">
								<h3 className="text-base sm:text-lg font-black tracking-tight text-rose-900">
									Capital Preservation Protocol Active
								</h3>
								<span className="px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[10px] font-extrabold uppercase">
									Defensive
								</span>
							</div>
							<p className="text-xs sm:text-sm text-rose-800 font-semibold leading-relaxed mb-3">
								Systemic macro liquidity tightening or trend breakdown detected.
								All active tactical trading is locked down to protect your
								capital base. Do not average down on losing trades.
							</p>
							<div className="flex flex-wrap gap-2 text-[11px] font-bold text-rose-900">
								<span className="px-3 py-1 bg-white/80 border border-rose-200 rounded-xl">
									✓ Zero New Margin / Leverage
								</span>
								<span className="px-3 py-1 bg-white/80 border border-rose-200 rounded-xl">
									✓ Hold Dry Powder in SBN / Cash
								</span>
								<span className="px-3 py-1 bg-white/80 border border-rose-200 rounded-xl">
									✓ No Catching Falling Knives
								</span>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* ── 2. Master Permissions Matrix ────────────────────────────── */}
			<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 space-y-5">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
							<ListChecks className="w-5 h-5" />
						</div>
						<div>
							<h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
								Tactical Permissions Matrix
							</h3>
							<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
								What you are permitted to execute today
							</p>
						</div>
					</div>

					<div className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 self-start sm:self-auto">
						Single source of truth driven by composite regimes
					</div>
				</div>

				{/* Desktop Table View */}
				<div className="hidden lg:block overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
								<th className="pb-3 pr-4">Asset Class</th>
								<th className="pb-3 px-3">Scalping (Intraday)</th>
								<th className="pb-3 px-3">Swing Trade</th>
								<th className="pb-3 px-3">Core DCA</th>
								<th className="pb-3 pl-4">Max Exposure Cap</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100/80 text-xs">
							{rows.map((row, idx) => {
								const scalpBadge = getPermissionBadge(row.data.scalp);
								const swingBadge = getPermissionBadge(row.data.swing);
								const dcaBadge = getPermissionBadge(row.data.dca);

								return (
									<tr
										key={idx}
										className="hover:bg-slate-50/50 transition-colors"
									>
										<td className="py-4 pr-4 align-top w-1/4">
											<div className="flex items-center gap-2">
												{row.isGated && (
													<Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
												)}
												<span className="font-extrabold text-slate-900 text-sm block">
													{row.market}
												</span>
											</div>
											<span className="text-[11px] text-slate-400 font-medium block mt-0.5">
												{row.subtitle}
											</span>
										</td>

										{/* Scalping */}
										<td className="py-4 px-3 align-top w-1/5">
											<div className="space-y-1">
												<span
													className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-[11px] ${scalpBadge.bg}`}
												>
													{scalpBadge.icon}
													{row.data.scalp.label}
												</span>
												<p className="text-[10px] text-slate-500 font-medium leading-tight">
													{row.data.scalp.reason}
												</p>
											</div>
										</td>

										{/* Swing */}
										<td className="py-4 px-3 align-top w-1/5">
											<div className="space-y-1">
												<span
													className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-[11px] ${swingBadge.bg}`}
												>
													{swingBadge.icon}
													{row.data.swing.label}
												</span>
												<p className="text-[10px] text-slate-500 font-medium leading-tight">
													{row.data.swing.reason}
												</p>
											</div>
										</td>

										{/* DCA */}
										<td className="py-4 px-3 align-top w-1/5">
											<div className="space-y-1">
												<span
													className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-[11px] ${dcaBadge.bg}`}
												>
													{dcaBadge.icon}
													{row.data.dca.label}
												</span>
												<p className="text-[10px] text-slate-500 font-medium leading-tight">
													{row.data.dca.reason}
												</p>
											</div>
										</td>

										{/* Max Exposure & Sizing */}
										<td className="py-4 pl-4 align-top w-1/6">
											<div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
												<span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">
													Cap &amp; Risk
												</span>
												<span className="text-[11px] font-extrabold text-slate-800 leading-snug block">
													{row.data.maxExposure}
												</span>
												{row.data.riskPerTrade && (
													<span className="text-[10px] font-bold text-indigo-600 mt-1 block">
														{row.data.riskPerTrade}
													</span>
												)}
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>

				{/* Mobile Stacked Card View */}
				<div className="lg:hidden space-y-4">
					{rows.map((row, idx) => {
						const scalpBadge = getPermissionBadge(row.data.scalp);
						const swingBadge = getPermissionBadge(row.data.swing);
						const dcaBadge = getPermissionBadge(row.data.dca);

						return (
							<div
								key={idx}
								className="bg-slate-50/60 rounded-2xl p-4 border border-slate-200/80 space-y-3"
							>
								{/* Card Header */}
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200/70 pb-3">
									<div>
										<h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
											{row.isGated && (
												<Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
											)}
											<span>{row.market}</span>
										</h4>
										<p className="text-[11px] text-slate-500 font-medium">
											{row.subtitle}
										</p>
									</div>
									<div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
										<span className="text-[10px] font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
											Cap: {row.data.maxExposure}
										</span>
										{row.data.riskPerTrade && (
											<span className="text-[10px] font-bold text-indigo-700 bg-indigo-50/90 px-2.5 py-1 rounded-lg border border-indigo-100">
												{row.data.riskPerTrade}
											</span>
										)}
									</div>
								</div>

								{/* Action Rows */}
								<div className="space-y-2 pt-0.5">
									{/* Scalping */}
									<div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1.5 shadow-2xs">
										<div className="flex items-center justify-between gap-2">
											<span className="text-xs font-bold text-slate-700">
												Scalping (Intraday)
											</span>
											<span
												className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${scalpBadge.bg}`}
											>
												{scalpBadge.icon}
												{row.data.scalp.label}
											</span>
										</div>
										<p className="text-[11px] text-slate-500 font-medium leading-relaxed">
											{row.data.scalp.reason}
										</p>
									</div>

									{/* Swing */}
									<div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1.5 shadow-2xs">
										<div className="flex items-center justify-between gap-2">
											<span className="text-xs font-bold text-slate-700">
												Swing Trade
											</span>
											<span
												className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${swingBadge.bg}`}
											>
												{swingBadge.icon}
												{row.data.swing.label}
											</span>
										</div>
										<p className="text-[11px] text-slate-500 font-medium leading-relaxed">
											{row.data.swing.reason}
										</p>
									</div>

									{/* DCA */}
									<div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1.5 shadow-2xs">
										<div className="flex items-center justify-between gap-2">
											<span className="text-xs font-bold text-slate-700">
												Core DCA
											</span>
											<span
												className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${dcaBadge.bg}`}
											>
												{dcaBadge.icon}
												{row.data.dca.label}
											</span>
										</div>
										<p className="text-[11px] text-slate-500 font-medium leading-relaxed">
											{row.data.dca.reason}
										</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
