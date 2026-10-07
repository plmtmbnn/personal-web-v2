"use client";

import {
	BookOpen,
	ShieldAlert,
	Scale,
	AlertOctagon,
	CheckSquare2,
	PieChart,
	TrendingUp,
} from "lucide-react";
import {
	CAPITAL_BUCKETS,
	RISK_RULES,
	CIRCUIT_BREAKERS,
	HARD_BANS,
	PRE_TRADE_CHECKLIST,
	RECOVERY_MATH_TABLE,
} from "../data/rulebook";

export default function Rulebook() {
	return (
		<div className="space-y-6 sm:space-y-8">
			{/* Rulebook Header */}
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
					<BookOpen className="w-5 h-5" />
				</div>
				<div>
					<h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
						Disciplined Rebuild Rulebook
					</h2>
					<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
						Non-negotiable protocols for surviving and compounding
					</p>
				</div>
			</div>

			{/* ── 1. Capital Buckets Architecture ────────────────────────────── */}
			<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 space-y-4">
				<div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
					<PieChart className="w-4 h-4 text-indigo-600" />
					<h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
						1. Capital Buckets Architecture (Reference Model)
					</h3>
				</div>

				<p className="text-xs font-semibold text-slate-500 leading-relaxed">
					Separate your wealth into distinct psychological and functional
					accounts. Trading capital must never contaminate core or emergency
					funds.
				</p>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
					{CAPITAL_BUCKETS.map((bucket) => (
						<div
							key={bucket.id}
							className="bg-slate-50/60 p-4 rounded-2xl border border-slate-200/70 flex flex-col justify-between space-y-3"
						>
							<div>
								<div className="flex items-center justify-between gap-1 mb-1">
									<h4 className="text-xs font-black text-slate-900">
										{bucket.title}
									</h4>
									{bucket.sharePct > 0 && (
										<span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
											{bucket.sharePct}%
										</span>
									)}
								</div>
								<span className="text-[10px] font-bold text-slate-400 block mb-2">
									{bucket.badge}
								</span>
								<p className="text-xs text-slate-600 font-medium leading-relaxed mb-3">
									{bucket.purpose}
								</p>
							</div>

							<div className="space-y-1 pt-2 border-t border-slate-200/60">
								<span className="text-[9px] font-extrabold uppercase text-slate-400 block">
									Primary Vehicles
								</span>
								<div className="flex flex-wrap gap-1">
									{bucket.instruments.map((inst, i) => (
										<span
											key={i}
											className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200/80"
										>
											{inst}
										</span>
									))}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* ── 2. The Golden Rules of Survival & Discipline ───────────────── */}
			<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-8 space-y-5">
				<div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
					<Scale className="w-4 h-4 text-emerald-600" />
					<h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
						2. The Six Golden Rules of Trading Discipline
					</h3>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{RISK_RULES.map((rule) => (
						<div
							key={rule.id}
							className="p-4 sm:p-5 rounded-2xl bg-slate-50/50 border border-slate-200/80 flex flex-col justify-between space-y-3"
						>
							<div className="space-y-1.5">
								<div className="flex items-center justify-between">
									<span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">
										{rule.number}
									</span>
									<span className="text-[9px] font-extrabold uppercase text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
										{rule.tag}
									</span>
								</div>
								<h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight pt-1">
									{rule.title}
								</h4>
								<span className="text-[11px] font-extrabold text-indigo-600 block">
									{rule.subtitle}
								</span>
								<p className="text-xs text-slate-600 font-medium leading-relaxed pt-1">
									{rule.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* ── 3. Circuit Breakers & Hard Bans ─────────────────────────────── */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
				{/* Circuit Breakers */}
				<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-4 flex flex-col justify-between">
					<div>
						<div className="flex items-center gap-2 border-b border-slate-100 pb-3">
							<AlertOctagon className="w-4 h-4 text-rose-600" />
							<h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
								3. Mechanical Drawdown Circuit Breakers
							</h3>
						</div>

						<p className="text-xs text-slate-500 font-medium leading-relaxed my-3">
							Automatic defensive downshifts. Remove emotion from loss
							mitigation.
						</p>

						<div className="space-y-3">
							{CIRCUIT_BREAKERS.map((cb, idx) => (
								<div
									key={idx}
									className="p-3.5 sm:p-4 rounded-2xl bg-rose-50/40 border border-rose-200/70 space-y-2 transition-colors"
								>
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
										<div className="flex items-center gap-2">
											<span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
											<h4 className="text-xs sm:text-sm font-black text-rose-950 tracking-tight">
												{cb.drawdown}
											</h4>
										</div>
										<span className="inline-flex items-center self-start sm:self-auto text-[11px] font-bold text-rose-800 bg-rose-100/90 px-2.5 py-0.5 rounded-md border border-rose-200/80 shrink-0">
											{cb.action}
										</span>
									</div>
									<p className="text-xs text-slate-700 font-medium leading-relaxed pt-1.5 border-t border-rose-100/80">
										{cb.protocol}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Hard Bans While Rebuilding */}
				<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-4 flex flex-col justify-between">
					<div>
						<div className="flex items-center gap-2 border-b border-slate-100 pb-3">
							<ShieldAlert className="w-4 h-4 text-rose-600" />
							<h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
								4. Non-Negotiable Hard Bans
							</h3>
						</div>

						<p className="text-xs text-slate-500 font-medium leading-relaxed my-3">
							Violating these rules invalidates your trading license. Total zero
							tolerance during the rebuild.
						</p>

						<ul className="space-y-2.5">
							{HARD_BANS.map((ban, idx) => (
								<li
									key={idx}
									className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-slate-800 p-3 sm:p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70 leading-relaxed"
								>
									<div className="w-5 h-5 rounded-md bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black">
										✕
									</div>
									<span className="flex-1 min-w-0 pt-0.5">{ban}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>

			{/* ── 4. Pre-Trade Checklist & Recovery Math ───────────────────────── */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
				{/* Pre-Trade Checklist (Span 7) */}
				<div className="lg:col-span-7 bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-4">
					<div className="flex items-center gap-2 border-b border-slate-100 pb-3">
						<CheckSquare2 className="w-4 h-4 text-indigo-600" />
						<h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
							5. Pre-Trade Execution Checklist (5 Gates)
						</h3>
					</div>

					<p className="text-xs text-slate-500 font-medium leading-relaxed">
						Every single trade must pass all 5 gates before you click buy.
					</p>

					<div className="space-y-2.5">
						{PRE_TRADE_CHECKLIST.map((check) => (
							<div
								key={check.id}
								className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100"
							>
								<div className="w-5 h-5 rounded-md bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
									✓
								</div>
								<div className="min-w-0 flex-1">
									<span className="text-xs font-black text-slate-900 block leading-tight">
										{check.question}
									</span>
									<span className="text-[11px] font-semibold text-slate-500 block mt-0.5 leading-snug">
										Mandate: {check.mandate}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Recovery Math Table (Span 5) */}
				<div className="lg:col-span-5 bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-4 flex flex-col justify-between">
					<div>
						<div className="flex items-center gap-2 border-b border-slate-100 pb-3">
							<TrendingUp className="w-4 h-4 text-rose-600" />
							<h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
								6. The Brutal Math of Drawdown
							</h3>
						</div>

						<p className="text-xs text-slate-500 font-medium leading-relaxed my-3">
							Why capital preservation is your only edge.
						</p>

						<div className="overflow-x-auto">
							<table className="w-full text-left text-xs">
								<thead>
									<tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400">
										<th className="pb-2 w-16 sm:w-20">Loss</th>
										<th className="pb-2 w-24 sm:w-28">Gain Needed</th>
										<th className="pb-2">Reality</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100/60 font-semibold">
									{RECOVERY_MATH_TABLE.map((row, i) => (
										<tr
											key={i}
											className={
												row.loss === "-80%"
													? "bg-rose-50/70 text-rose-950 font-black"
													: ""
											}
										>
											<td className="py-2.5 font-bold">{row.loss}</td>
											<td className="py-2.5 font-black text-indigo-600">
												{row.gainRequired}
											</td>
											<td className="py-2.5 text-[11px] text-slate-500 leading-snug">
												{row.difficulty}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					<div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[10px] font-semibold text-slate-600 leading-snug">
						After an 80% loss, you need +400% just to return to even. Taking big
						risks to make it back fast will guarantee the remaining 20%
						vanishes. Survival first.
					</div>
				</div>
			</div>
		</div>
	);
}
