"use client";

import { motion } from "framer-motion";
import {
	Wifi,
	ArrowDown,
	ArrowUp,
	Radio,
	Sliders,
	Play,
	RefreshCw,
	Award,
	Tv,
	Gamepad2,
	Video,
	CloudUpload,
	Globe,
	Server,
} from "lucide-react";
import type {
	ConnectionSuitability,
	NetworkInfo,
	SpeedTestMetrics,
} from "../types";

interface SpeedTestStudioProps {
	speedMetrics: SpeedTestMetrics;
	networkInfo: NetworkInfo;
	throughputHistory: number[];
	suitability: ConnectionSuitability;
	onRunTest: () => void;
	reduceMotion?: boolean | null;
}

export default function SpeedTestStudio({
	speedMetrics,
	networkInfo,
	throughputHistory,
	suitability,
	onRunTest,
	reduceMotion,
}: SpeedTestStudioProps) {
	const isTesting =
		speedMetrics.phase === "ping" ||
		speedMetrics.phase === "download" ||
		speedMetrics.phase === "upload";

	return (
		<motion.div
			initial={reduceMotion ? false : { opacity: 0, y: 15 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-8 shadow-xs space-y-6 sm:space-y-7"
		>
			{/* ── Top Header Strip ── */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
							<Wifi className="w-4 h-4 text-indigo-600" />
						</div>
						<h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
							Internet Bandwidth & Latency Studio
						</h2>
					</div>
					<p className="text-xs text-slate-500 font-medium">
						Sub-millisecond RTT latency, jitter variance, multi-stream download,
						and parallel upload throughput.
					</p>
				</div>

				<button
					type="button"
					onClick={onRunTest}
					disabled={isTesting}
					className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
				>
					{isTesting ? (
						<RefreshCw className="w-3.5 h-3.5 animate-spin" />
					) : (
						<Play className="w-3.5 h-3.5 fill-white" />
					)}
					<span>
						{speedMetrics.phase === "idle"
							? "Start Speed Test"
							: speedMetrics.phase === "completed"
								? "Run Test Again"
								: `Testing (${speedMetrics.phase.toUpperCase()})...`}
					</span>
				</button>
			</div>

			{/* ── 4-Metric Grid (Canonical 4-Tier Internal Layout) ── */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
				{/* 1. Download */}
				<div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-2 sm:space-y-2.5 transition-all">
					{/* Tier 1: Anchor & Status Row */}
					<div className="flex items-center justify-between">
						<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
							<ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
						</div>
						<span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md ml-auto shrink-0">
							Mbps
						</span>
					</div>

					{/* Tier 2: Category Label */}
					<span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
						Download Speed
					</span>

					{/* Tier 3: Primary Metric */}
					<div className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono text-slate-900 tracking-tight tabular-nums truncate">
						{speedMetrics.downloadMbps > 0
							? speedMetrics.downloadMbps.toFixed(1)
							: "--"}
					</div>

					{/* Tier 4: Context Sublabel */}
					<span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block truncate">
						Megabits per second
					</span>
				</div>

				{/* 2. Upload */}
				<div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-2 sm:space-y-2.5 transition-all">
					{/* Tier 1: Anchor & Status Row */}
					<div className="flex items-center justify-between">
						<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
							<ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
						</div>
						<span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md ml-auto shrink-0">
							Mbps
						</span>
					</div>

					{/* Tier 2: Category Label */}
					<span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
						Upload Speed
					</span>

					{/* Tier 3: Primary Metric */}
					<div className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono text-slate-900 tracking-tight tabular-nums truncate">
						{speedMetrics.uploadMbps > 0
							? speedMetrics.uploadMbps.toFixed(1)
							: "--"}
					</div>

					{/* Tier 4: Context Sublabel */}
					<span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block truncate">
						Megabits per second
					</span>
				</div>

				{/* 3. Ping / RTT */}
				<div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-2 sm:space-y-2.5 transition-all">
					{/* Tier 1: Anchor & Status Row */}
					<div className="flex items-center justify-between">
						<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
							<Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
						</div>
						<span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md ml-auto shrink-0">
							ms RTT
						</span>
					</div>

					{/* Tier 2: Category Label */}
					<span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
						Ping Latency
					</span>

					{/* Tier 3: Primary Metric */}
					<div className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono text-slate-900 tracking-tight tabular-nums truncate">
						{speedMetrics.pingMs > 0 ? speedMetrics.pingMs : "--"}
					</div>

					{/* Tier 4: Context Sublabel */}
					<span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block truncate">
						Round-trip time
					</span>
				</div>

				{/* 4. Jitter */}
				<div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-2 sm:space-y-2.5 transition-all">
					{/* Tier 1: Anchor & Status Row */}
					<div className="flex items-center justify-between">
						<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
							<Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
						</div>
						<span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-md ml-auto shrink-0">
							ms Delta
						</span>
					</div>

					{/* Tier 2: Category Label */}
					<span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
						Jitter Variance
					</span>

					{/* Tier 3: Primary Metric */}
					<div className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono text-slate-900 tracking-tight tabular-nums truncate">
						{speedMetrics.jitterMs > 0
							? speedMetrics.jitterMs.toFixed(1)
							: "--"}
					</div>

					{/* Tier 4: Context Sublabel */}
					<span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block truncate">
						Latency deviation
					</span>
				</div>
			</div>

			{/* ── Active Phase Progress & Throughput Stream ── */}
			{isTesting && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					className="p-4 sm:p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3"
				>
					<div className="flex items-center justify-between text-xs font-bold text-slate-700">
						<span className="uppercase tracking-wider flex items-center gap-2">
							<RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
							Phase: {speedMetrics.phase.toUpperCase()}
						</span>
						<span className="font-mono text-indigo-600 font-bold">
							{speedMetrics.progressPercent}% Complete
						</span>
					</div>

					<div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
						<div
							className="h-full bg-indigo-600 transition-all duration-200"
							style={{ width: `${speedMetrics.progressPercent}%` }}
						/>
					</div>

					{/* Real-time Stream Fluctuation Bar Visualizer */}
					{throughputHistory.length > 2 && (
						<div className="pt-2 flex items-center justify-between gap-4 text-[10px] text-slate-500 font-mono">
							<span className="truncate">Active Stream Sample History:</span>
							<div className="flex items-end gap-1 h-6 flex-1 max-w-[240px]">
								{throughputHistory.map((val, idx) => {
									const maxVal = Math.max(...throughputHistory, 1);
									const barHeight = Math.max(
										12,
										Math.round((val / maxVal) * 100),
									);
									return (
										<div
											key={`sparkline-${idx}`}
											className="w-full bg-indigo-500 rounded-t-xs transition-all duration-75"
											style={{ height: `${barHeight}%` }}
										/>
									);
								})}
							</div>
							<span className="font-bold text-slate-800">
								{throughputHistory[throughputHistory.length - 1]} Mbps
							</span>
						</div>
					)}
				</motion.div>
			)}

			{/* ── Real-World Connection Suitability Matrix ── */}
			{speedMetrics.phase === "completed" && (
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
					animate={{ opacity: 1, scale: 1 }}
					className="p-5 sm:p-6 bg-slate-50/50 border border-slate-200/80 rounded-2xl space-y-4"
				>
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
						<div className="flex items-center gap-2">
							<div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
								<Award className="w-3.5 h-3.5 text-indigo-600" />
							</div>
							<span className="text-xs font-bold uppercase tracking-wider text-slate-800">
								Real-World Workload Suitability Matrix
							</span>
						</div>

						<div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-indigo-200/80 rounded-lg text-xs font-bold text-indigo-950 shadow-2xs">
							<span className="w-2 h-2 rounded-full bg-emerald-500" />
							<span className="font-mono font-bold text-indigo-600">
								Grade {suitability.grade}
							</span>
							<span className="text-slate-300">/</span>
							<span className="text-slate-600 font-medium">
								{suitability.gradeLabel}
							</span>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
						{suitability.metrics.map((item) => (
							<div
								key={item.title}
								className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-3 shadow-2xs flex flex-col justify-between transition-all"
							>
								<div className="space-y-2">
									{/* Tier 1: Domain Icon Squircle & Status Badge */}
									<div className="flex items-center justify-between gap-2">
										<div
											className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
												item.iconName === "tv"
													? "bg-indigo-50 border-indigo-100 text-indigo-600"
													: item.iconName === "gamepad"
														? "bg-purple-50 border-purple-100 text-purple-600"
														: item.iconName === "video"
															? "bg-emerald-50 border-emerald-100 text-emerald-600"
															: "bg-cyan-50 border-cyan-100 text-cyan-600"
											}`}
										>
											{item.iconName === "tv" && <Tv className="w-3.5 h-3.5" />}
											{item.iconName === "gamepad" && (
												<Gamepad2 className="w-3.5 h-3.5" />
											)}
											{item.iconName === "video" && (
												<Video className="w-3.5 h-3.5" />
											)}
											{item.iconName === "cloud-upload" && (
												<CloudUpload className="w-3.5 h-3.5" />
											)}
										</div>

										<span
											className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 border ${
												item.status === "optimal"
													? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
													: item.status === "good"
														? "bg-indigo-50 text-indigo-700 border-indigo-200/80"
														: item.status === "moderate"
															? "bg-amber-50 text-amber-700 border-amber-200/80"
															: "bg-rose-50 text-rose-700 border-rose-200/80"
											}`}
										>
											{item.status}
										</span>
									</div>

									{/* Tier 2 & Tier 3: Workload Category & Verdict */}
									<div className="space-y-0.5">
										<span
											className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate"
											title={item.title}
										>
											{item.title}
										</span>
										<p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
											{item.verdict}
										</p>
									</div>
								</div>

								{/* Tier 4: Operational Details */}
								<p className="text-[10px] text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
									{item.details}
								</p>
							</div>
						))}
					</div>
				</motion.div>
			)}

			{/* ── Network Telemetry Metadata Bar ── */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
				<div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 space-y-0.5">
					<span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
						<Globe className="w-3 h-3 text-slate-400" />
						Gateway Type
					</span>
					<span className="font-mono font-bold text-slate-800 uppercase block truncate">
						{networkInfo.effectiveType}
					</span>
				</div>

				<div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 space-y-0.5">
					<span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
						Nominal Downlink
					</span>
					<span className="font-mono font-bold text-slate-800 block truncate">
						~{networkInfo.downlinkMbps} Mbps
					</span>
				</div>

				<div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 space-y-0.5">
					<span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
						Public IP & Geo
					</span>
					<span className="font-mono font-bold text-slate-800 truncate block">
						{networkInfo.publicIp || "127.0.0.1"}
						{networkInfo.city
							? ` (${networkInfo.city}, ${networkInfo.countryCode || networkInfo.country})`
							: ""}
					</span>
				</div>

				<div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 space-y-0.5">
					<span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
						<Server className="w-3 h-3 text-slate-400" />
						ISP / Organization
					</span>
					<span className="font-mono font-bold text-slate-800 truncate block">
						{networkInfo.isp || networkInfo.org || "Client Edge Network"}
					</span>
				</div>
			</div>
		</motion.div>
	);
}
