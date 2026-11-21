"use client";

import {
	ShieldAlert,
	CheckCircle2,
	XCircle,
	AlertTriangle,
	PauseCircle,
	Lock,
	ChevronDown,
} from "lucide-react";
import type { PermissionsMatrixData, ActionPermission } from "../types";

function SectorNotes({ gates }: { gates?: string[] }) {
	if (!gates?.length) return null;
	const labels: Record<string, string> = {
		"STRICT AVOID": "Avoid",
		"LIVE ROTATION": "Rotation",
		"BREADTH GATE": "Market breadth",
		"COMMODITY HEADWIND": "Commodity pressure",
	};
	return (
		<details className="group mt-2 text-xs">
			<summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 py-2 font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 [&::-webkit-details-marker]:hidden">
				Sector notes <span className="tabular-nums">({gates.length})</span>
				<ChevronDown
					aria-hidden="true"
					className="h-3.5 w-3.5 group-open:rotate-180"
				/>
			</summary>
			<ul className="space-y-3 pb-2">
				{gates.map((gate) => {
					const separator = gate.indexOf(":");
					const prefix = gate.slice(0, separator);
					const label = labels[prefix];
					return (
						<li key={gate} className="space-y-0.5">
							{label && (
								<p
									className={`font-semibold ${prefix === "STRICT AVOID" ? "text-rose-800" : "text-slate-700"}`}
								>
									{label}
								</p>
							)}
							<p className="font-normal leading-relaxed text-slate-600">
								{label ? gate.slice(separator + 1).trim() : gate}
							</p>
						</li>
					);
				})}
			</ul>
		</details>
	);
}

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
						<CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
					),
				};
			case "selective":
				return {
					bg: "bg-amber-50 text-amber-800 border-amber-200/80",
					icon: (
						<AlertTriangle className="w-3.5 h-3.5 text-amber-800 shrink-0" />
					),
				};
			case "not_allowed":
				return {
					bg: "bg-rose-50 text-rose-800 border-rose-200/80",
					icon: <XCircle className="w-3.5 h-3.5 text-rose-700 shrink-0" />,
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
			market: "IHSG",
			subtitle: "Indonesian stocks",
			data: permissions.ihsg,
			gates: permissions.ihsgSectorGates,
		},
		{
			market: "Crypto",
			subtitle: "BTC and ETH spot",
			data: permissions.crypto,
		},
		{
			market: "Altcoins",
			subtitle: "Higher-risk tokens",
			data: permissions.altcoins,
			isGated: permissions.altcoins.scalp.status === "not_allowed",
		},
	];

	return (
		<div className="space-y-4">
			<div>
				<h2 className="text-xl font-bold tracking-tight text-slate-900">
					Trading limits
				</h2>
				<p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
					Allowed actions and exposure limits by market.
				</p>
			</div>

			{/* 1. Capital Preservation Banner (if in Stress/Defensive) */}
			{permissions.globalStressActive && (
				<div className="bg-white border border-rose-200/90 border-l-4 border-l-rose-600 rounded-3xl p-5 sm:p-6 shadow-xs text-slate-900">
					<div className="flex flex-col sm:flex-row items-start gap-3.5 sm:gap-4">
						<div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 flex items-center justify-center shrink-0">
							<ShieldAlert className="w-5 h-5" />
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-center gap-2 mb-1">
								<h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
									Capital protection active
								</h3>
								<span className="px-2.5 py-0.5 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-800 text-xs font-bold">
									Defensive
								</span>
							</div>
							<p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-3">
								Systemic macro liquidity tightening or trend breakdown detected.
								All active tactical trading is locked down to protect your
								capital base. Do not average down on losing trades.
							</p>
							<div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-800">
								<span className="px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-xl">
									No new margin or leverage
								</span>
								<span className="px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-xl">
									Hold SBN or cash
								</span>
								<span className="px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-xl">
									Avoid falling prices
								</span>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* 2. Master Permissions Matrix */}
			<div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-5">
				{/* Desktop Table View */}
				<div className="hidden xl:block overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="border-b border-slate-100 text-xs font-bold text-slate-500">
								<th scope="col" className="pb-3 pr-4">
									Market
								</th>
								<th scope="col" className="pb-3 px-3">
									Intraday
								</th>
								<th scope="col" className="pb-3 px-3">
									Swing
								</th>
								<th scope="col" className="pb-3 px-3">
									Core DCA
								</th>
								<th scope="col" className="pb-3 pl-4">
									Exposure limit
								</th>
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
												<span className="font-bold text-slate-900 text-sm block">
													{row.market}
												</span>
											</div>
											<span className="text-xs text-slate-500 font-medium block mt-0.5">
												{row.subtitle}
											</span>
											<SectorNotes gates={row.gates} />
										</td>

										{/* Scalping */}
										<td className="py-4 px-3 align-top w-1/5">
											<div className="space-y-1">
												<span
													className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-xs ${scalpBadge.bg}`}
												>
													{scalpBadge.icon}
													{row.data.scalp.label}
												</span>
												<p className="text-xs text-slate-500 font-medium leading-tight">
													{row.data.scalp.reason}
												</p>
											</div>
										</td>

										{/* Swing */}
										<td className="py-4 px-3 align-top w-1/5">
											<div className="space-y-1">
												<span
													className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-xs ${swingBadge.bg}`}
												>
													{swingBadge.icon}
													{row.data.swing.label}
												</span>
												<p className="text-xs text-slate-500 font-medium leading-tight">
													{row.data.swing.reason}
												</p>
											</div>
										</td>

										{/* DCA */}
										<td className="py-4 px-3 align-top w-1/5">
											<div className="space-y-1">
												<span
													className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-xs ${dcaBadge.bg}`}
												>
													{dcaBadge.icon}
													{row.data.dca.label}
												</span>
												<p className="text-xs text-slate-500 font-medium leading-tight">
													{row.data.dca.reason}
												</p>
											</div>
										</td>

										{/* Max Exposure & Sizing */}
										<td className="py-4 pl-4 align-top w-1/6">
											<div className="min-w-0 break-words bg-slate-50 p-3 rounded-xl border border-slate-100">
												<span className="text-xs font-bold text-slate-500 block mb-0.5">
													Cap &amp; Risk
												</span>
												<span className="text-xs font-bold text-slate-800 leading-snug block">
													{row.data.maxExposure}
												</span>
												{row.data.riskPerTrade && (
													<span className="text-xs font-bold text-indigo-600 mt-1 block">
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
				<div className="xl:hidden space-y-4">
					{rows.map((row, idx) => {
						const scalpBadge = getPermissionBadge(row.data.scalp);
						const swingBadge = getPermissionBadge(row.data.swing);
						const dcaBadge = getPermissionBadge(row.data.dca);

						return (
							<div
								key={idx}
								className="space-y-3 rounded-2xl bg-slate-50/60 border border-slate-200/80 p-4"
							>
								{/* Card Header */}
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200/70 pb-3">
									<div>
										<h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
											{row.isGated && (
												<Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
											)}
											<span>{row.market}</span>
										</h3>
										<p className="text-xs text-slate-500 font-medium">
											{row.subtitle}
										</p>
										<SectorNotes gates={row.gates} />
									</div>
									<div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
										<span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
											Cap: {row.data.maxExposure}
										</span>
										{row.data.riskPerTrade && (
											<span className="text-xs font-bold text-indigo-700 bg-indigo-50/90 px-2.5 py-1 rounded-lg border border-indigo-100">
												{row.data.riskPerTrade}
											</span>
										)}
									</div>
								</div>

								{/* Action Rows */}
								<div className="space-y-2 pt-0.5">
									{/* Scalping */}
									<div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1.5 shadow-2xs">
										<div className="flex flex-wrap items-start justify-between gap-2">
											<span className="text-xs font-bold text-slate-700">
												Intraday
											</span>
											<span
												className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${scalpBadge.bg}`}
											>
												{scalpBadge.icon}
												{row.data.scalp.label}
											</span>
										</div>
										<p className="text-xs text-slate-500 font-medium leading-relaxed">
											{row.data.scalp.reason}
										</p>
									</div>

									{/* Swing */}
									<div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1.5 shadow-2xs">
										<div className="flex flex-wrap items-start justify-between gap-2">
											<span className="text-xs font-bold text-slate-700">
												Swing
											</span>
											<span
												className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${swingBadge.bg}`}
											>
												{swingBadge.icon}
												{row.data.swing.label}
											</span>
										</div>
										<p className="text-xs text-slate-500 font-medium leading-relaxed">
											{row.data.swing.reason}
										</p>
									</div>

									{/* DCA */}
									<div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1.5 shadow-2xs">
										<div className="flex flex-wrap items-start justify-between gap-2">
											<span className="text-xs font-bold text-slate-700">
												Core DCA
											</span>
											<span
												className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${dcaBadge.bg}`}
											>
												{dcaBadge.icon}
												{row.data.dca.label}
											</span>
										</div>
										<p className="text-xs text-slate-500 font-medium leading-relaxed">
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
