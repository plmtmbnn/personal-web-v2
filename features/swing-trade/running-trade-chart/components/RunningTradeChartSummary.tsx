"use client";

import { Activity, Calendar, Clock, Users } from "lucide-react";

interface RunningTradeChartSummaryProps {
	from?: string;
	to?: string;
	dataLastUpdated?: string;
	dateSessionInfo?: string;
	totalPricePoints: number;
	brokers: string[];
	symbol: string;
}

export default function RunningTradeChartSummary({
	from,
	to,
	dataLastUpdated,
	dateSessionInfo,
	totalPricePoints,
	brokers,
	symbol,
}: RunningTradeChartSummaryProps) {
	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
				<h3 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
					Running Trade Flow Telemetry
				</h3>
				{(from || to) && (
					<span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60 self-start sm:self-auto">
						{from} &rarr; {to}
					</span>
				)}
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Active Span */}
				<div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-500">
							Active Span
						</span>
						<div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/70 flex items-center justify-center text-slate-700">
							<Calendar className="w-4 h-4" aria-hidden />
						</div>
					</div>
					<div>
						<div className="text-lg font-extrabold text-slate-900 tracking-tight">
							{symbol.toUpperCase()}
						</div>
						<div className="text-xs font-mono text-slate-500 truncate">
							{from && to ? `${from} to ${to}` : "N/A"}
						</div>
					</div>
					<div className="pt-1 border-t border-slate-100 text-xs text-slate-500">
						<span>Total Price Intervals: </span>
						<span className="font-bold text-slate-800 font-mono">
							{totalPricePoints}
						</span>
					</div>
				</div>

				{/* Last Updated */}
				<div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-500">
							Data Last Updated
						</span>
						<div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/70 flex items-center justify-center text-slate-700">
							<Clock className="w-4 h-4" aria-hidden />
						</div>
					</div>
					<div>
						<div className="text-base font-extrabold text-slate-900 tracking-tight font-mono">
							{dataLastUpdated || "Live Session"}
						</div>
						<div className="text-xs font-medium text-slate-500">
							Exchange timestamp
						</div>
					</div>
					<div className="pt-1 border-t border-slate-100 text-xs text-slate-500">
						<span>Board: </span>
						<span className="font-bold text-slate-800 font-mono">Regular</span>
					</div>
				</div>

				{/* Session Info */}
				<div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-500">
							Session Status
						</span>
						<div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/70 flex items-center justify-center text-slate-700">
							<Activity className="w-4 h-4" aria-hidden />
						</div>
					</div>
					<div>
						<div className="text-base font-extrabold text-slate-900 tracking-tight truncate">
							{dateSessionInfo || "Continuous"}
						</div>
						<div className="text-xs font-medium text-slate-500">
							Trading session
						</div>
					</div>
					<div className="pt-1 border-t border-slate-100 text-xs text-slate-500">
						<span>Investor Type: </span>
						<span className="font-bold text-slate-800 font-mono">All</span>
					</div>
				</div>

				{/* Tracked Brokers */}
				<div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-500">
							Tracked Brokers
						</span>
						<div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/70 flex items-center justify-center text-indigo-700">
							<Users className="w-4 h-4" aria-hidden />
						</div>
					</div>
					<div>
						<div className="text-2xl font-extrabold text-indigo-900 tracking-tight">
							{brokers.length}{" "}
							<span className="text-xs font-semibold text-slate-500">
								participants
							</span>
						</div>
					</div>
					<div className="pt-1 border-t border-slate-100 text-xs text-slate-500 truncate">
						{brokers.length > 0 ? brokers.join(", ") : "No broker traces"}
					</div>
				</div>
			</div>
		</div>
	);
}
