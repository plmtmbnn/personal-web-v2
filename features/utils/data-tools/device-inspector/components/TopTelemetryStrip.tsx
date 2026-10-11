"use client";

import { Monitor, Cpu, Wifi, Activity } from "lucide-react";
import type { DisplayInfo, HardwareInfo, NetworkInfo } from "../types";

interface TopTelemetryStripProps {
	displayInfo: DisplayInfo;
	hardwareInfo: HardwareInfo;
	networkInfo: NetworkInfo;
}

export default function TopTelemetryStrip({
	displayInfo,
	hardwareInfo,
	networkInfo,
}: TopTelemetryStripProps) {
	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
			{/* ── 1. Display System ── */}
			<div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-2 sm:space-y-2.5 transition-all">
				{/* Tier 1: Anchor & Status Row */}
				<div className="flex items-center justify-between">
					<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
						<Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
					</div>
					<span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md ml-auto shrink-0">
						{displayInfo.estimatedHz} Hz
					</span>
				</div>

				{/* Tier 2: Category Label */}
				<span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
					Display System
				</span>

				{/* Tier 3: Primary Metric */}
				<div className="text-sm sm:text-xl lg:text-2xl font-bold font-mono text-slate-900 tracking-tight tabular-nums truncate">
					{displayInfo.screenWidth} × {displayInfo.screenHeight}
				</div>

				{/* Tier 4: Context Sublabel */}
				<span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block truncate">
					{displayInfo.dpr}x DPR / {displayInfo.colorGamut}
				</span>
			</div>

			{/* ── 2. Compute Architecture ── */}
			<div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-2 sm:space-y-2.5 transition-all">
				{/* Tier 1: Anchor & Status Row */}
				<div className="flex items-center justify-between">
					<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
						<Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600" />
					</div>
					<span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200/80 px-2 py-0.5 rounded-md ml-auto shrink-0">
						{hardwareInfo.webgl2Supported ? "WebGL 2" : "WebGL 1"}
					</span>
				</div>

				{/* Tier 2: Category Label */}
				<span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
					Compute Architecture
				</span>

				{/* Tier 3: Primary Metric */}
				<div className="text-sm sm:text-xl lg:text-2xl font-bold font-mono text-slate-900 tracking-tight tabular-nums truncate">
					{hardwareInfo.cpuCores} Threads
				</div>

				{/* Tier 4: Context Sublabel */}
				<span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block truncate">
					{hardwareInfo.gpuVendor || "Generic Hardware Accelerator"}
				</span>
			</div>

			{/* ── 3. Edge Network ── */}
			<div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-2 sm:space-y-2.5 transition-all">
				{/* Tier 1: Anchor & Status Row */}
				<div className="flex items-center justify-between">
					<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
						<Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
					</div>
					<span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md ml-auto shrink-0">
						{networkInfo.effectiveType.toUpperCase()}
					</span>
				</div>

				{/* Tier 2: Category Label */}
				<span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
					Edge Network
				</span>

				{/* Tier 3: Primary Metric */}
				<div className="text-sm sm:text-xl lg:text-2xl font-bold font-mono text-slate-900 tracking-tight tabular-nums truncate">
					~{networkInfo.downlinkMbps} Mbps
				</div>

				{/* Tier 4: Context Sublabel */}
				<span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block truncate">
					RTT ~{networkInfo.rttMs}ms
					{networkInfo.city ? ` / ${networkInfo.city}` : ""}
					{networkInfo.countryCode ? `, ${networkInfo.countryCode}` : ""}
				</span>
			</div>

			{/* ── 4. Memory & Power Health ── */}
			<div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-2 sm:space-y-2.5 transition-all">
				{/* Tier 1: Anchor & Status Row */}
				<div className="flex items-center justify-between">
					<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
						<Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
					</div>
					<span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-md ml-auto shrink-0">
						{hardwareInfo.batteryLevel !== undefined
							? `${hardwareInfo.batteryLevel}%`
							: "AC Power"}
					</span>
				</div>

				{/* Tier 2: Category Label */}
				<span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block truncate">
					System Memory
				</span>

				{/* Tier 3: Primary Metric */}
				<div className="text-sm sm:text-xl lg:text-2xl font-bold font-mono text-slate-900 tracking-tight tabular-nums truncate">
					~{hardwareInfo.ramGb || 8} GB RAM
				</div>

				{/* Tier 4: Context Sublabel */}
				<span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block truncate">
					{hardwareInfo.isCharging
						? "Power Source: Charging"
						: hardwareInfo.batteryLevel !== undefined
							? "Power Source: Battery"
							: "Power Source: Connected Desktop"}
				</span>
			</div>
		</div>
	);
}
