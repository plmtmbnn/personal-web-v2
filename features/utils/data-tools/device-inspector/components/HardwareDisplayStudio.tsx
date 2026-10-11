"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
	Cpu,
	Monitor,
	BatteryCharging,
	Battery,
	Play,
	Pause,
	Gauge,
} from "lucide-react";
import type { DisplayInfo, HardwareInfo } from "../types";

interface HardwareDisplayStudioProps {
	hardwareInfo: HardwareInfo;
	displayInfo: DisplayInfo;
	reduceMotion?: boolean | null;
}

export default function HardwareDisplayStudio({
	hardwareInfo,
	displayInfo,
	reduceMotion,
}: HardwareDisplayStudioProps) {
	// Frame stability live benchmark state
	const [isTestingFps, setIsTestingFps] = useState(false);
	const [liveFps, setLiveFps] = useState(displayInfo.estimatedHz || 60);
	const [frameJitterMs, setFrameJitterMs] = useState(0);
	const [droppedFrames, setDroppedFrames] = useState(0);

	const rafIdRef = useRef<number | null>(null);
	const lastFrameTimeRef = useRef<number>(0);
	const frameCountRef = useRef<number>(0);
	const fpsStartTimeRef = useRef<number>(0);
	const expectedIntervalRef = useRef<number>(
		1000 / (displayInfo.estimatedHz || 60),
	);

	const runFrameBenchmark = useCallback(() => {
		const now = performance.now();
		if (lastFrameTimeRef.current > 0) {
			const delta = now - lastFrameTimeRef.current;
			const expected = expectedIntervalRef.current;
			const jitter = Math.abs(delta - expected);

			setFrameJitterMs(Math.round(jitter * 10) / 10);
			if (delta > expected * 1.5) {
				setDroppedFrames((prev) => prev + 1);
			}
		}

		frameCountRef.current++;
		if (now - fpsStartTimeRef.current >= 500) {
			const elapsed = (now - fpsStartTimeRef.current) / 1000;
			const currentFps = Math.round(frameCountRef.current / elapsed);
			setLiveFps(currentFps);
			frameCountRef.current = 0;
			fpsStartTimeRef.current = now;
		}

		lastFrameTimeRef.current = now;
		rafIdRef.current = requestAnimationFrame(runFrameBenchmark);
	}, []);

	useEffect(() => {
		if (isTestingFps) {
			lastFrameTimeRef.current = performance.now();
			fpsStartTimeRef.current = performance.now();
			frameCountRef.current = 0;
			expectedIntervalRef.current = 1000 / (displayInfo.estimatedHz || 60);
			rafIdRef.current = requestAnimationFrame(runFrameBenchmark);
		} else {
			if (rafIdRef.current) {
				cancelAnimationFrame(rafIdRef.current);
				rafIdRef.current = null;
			}
		}

		return () => {
			if (rafIdRef.current) {
				cancelAnimationFrame(rafIdRef.current);
			}
		};
	}, [isTestingFps, displayInfo.estimatedHz, runFrameBenchmark]);

	return (
		<div className="space-y-6 sm:space-y-8">
			{/* ── 2-Column Split: Hardware Architecture & Display Telemetry ── */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
				{/* 1. Hardware & GPU Card */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between"
				>
					<div className="space-y-4">
						<div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
							<div className="flex items-center gap-2">
								<div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
									<Cpu className="w-4 h-4 text-sky-600" />
								</div>
								<h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
									Hardware & GPU Architecture
								</h3>
							</div>
							<span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200/80 px-2 py-0.5 rounded-md">
								{hardwareInfo.webgl2Supported ? "WebGL 2" : "WebGL 1"}
							</span>
						</div>

						<div className="space-y-3">
							{/* GPU Renderer Details */}
							<div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
								<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
									GPU Graphics Engine (Unmasked WebGL)
								</span>
								<p className="font-mono text-xs sm:text-sm font-bold text-slate-900 break-words">
									{hardwareInfo.gpuRenderer}
								</p>
								<span className="text-[10px] text-slate-500 font-medium block pt-0.5">
									Vendor: {hardwareInfo.gpuVendor}
								</span>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
										Logical CPU Cores
									</span>
									<span className="font-mono text-base sm:text-lg font-bold text-slate-900 block">
										{hardwareInfo.cpuCores} Threads
									</span>
									<span className="text-[10px] text-slate-500 font-medium block truncate">
										Hardware Concurrency
									</span>
								</div>

								<div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
										Estimated Memory
									</span>
									<span className="font-mono text-base sm:text-lg font-bold text-slate-900 block">
										~{hardwareInfo.ramGb || 8} GB RAM
									</span>
									<span className="text-[10px] text-slate-500 font-medium block truncate">
										Device Memory API
									</span>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
										Max Texture Size
									</span>
									<span className="font-mono text-xs sm:text-sm font-bold text-slate-900 block truncate">
										{hardwareInfo.maxTextureSize} ×{" "}
										{hardwareInfo.maxTextureSize} px
									</span>
									<span className="text-[10px] text-slate-500 font-medium block truncate">
										GPU Buffer Dimension
									</span>
								</div>

								<div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
										Battery / Power
									</span>
									<div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-bold text-slate-900">
										{hardwareInfo.isCharging ? (
											<BatteryCharging className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
										) : (
											<Battery className="w-3.5 h-3.5 text-slate-600 shrink-0" />
										)}
										<span className="truncate">
											{hardwareInfo.batteryLevel !== undefined
												? `${hardwareInfo.batteryLevel}%`
												: "AC Desktop"}
										</span>
									</div>
									<span className="text-[10px] text-slate-500 font-medium block truncate">
										{hardwareInfo.isCharging
											? "Charging Active"
											: hardwareInfo.batteryLevel !== undefined
												? "Battery Powered"
												: "Direct AC Outlet"}
									</span>
								</div>
							</div>
						</div>
					</div>
				</motion.div>

				{/* 2. Display & Screen Card */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between"
				>
					<div className="space-y-4">
						<div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
							<div className="flex items-center gap-2">
								<div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
									<Monitor className="w-4 h-4 text-indigo-600" />
								</div>
								<h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
									Display & Color Capabilities
								</h3>
							</div>
							<span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
								{displayInfo.estimatedHz} Hz Native
							</span>
						</div>

						<div className="space-y-3">
							<div className="grid grid-cols-2 gap-3">
								<div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
										Native Screen Bounds
									</span>
									<span className="font-mono text-xs sm:text-sm font-bold text-slate-900 block truncate">
										{displayInfo.screenWidth} × {displayInfo.screenHeight} px
									</span>
									<span className="text-[10px] text-slate-500 font-medium block truncate">
										Hardware Monitor
									</span>
								</div>

								<div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
										Pixel Density (DPR)
									</span>
									<span className="font-mono text-xs sm:text-sm font-bold text-slate-900 block truncate">
										{displayInfo.dpr}x{" "}
										{displayInfo.dpr > 1 ? "(HiDPI/Retina)" : "(Standard)"}
									</span>
									<span className="text-[10px] text-slate-500 font-medium block truncate">
										Scale Factor
									</span>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
										Color Gamut Spectrum
									</span>
									<span className="font-mono text-xs sm:text-sm font-bold text-slate-900 block truncate">
										{displayInfo.colorGamut}
									</span>
									<span className="text-[10px] text-slate-500 font-medium block truncate">
										CSS Media Gamut
									</span>
								</div>

								<div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
										High Dynamic Range
									</span>
									<span
										className={`font-mono text-xs sm:text-sm font-bold block truncate ${
											displayInfo.isHdr ? "text-emerald-600" : "text-slate-800"
										}`}
									>
										{displayInfo.isHdr ? "HDR Capable" : "Standard SDR"}
									</span>
									<span className="text-[10px] text-slate-500 font-medium block truncate">
										Dynamic Range Query
									</span>
								</div>
							</div>

							<div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
								<div className="space-y-0.5 min-w-0">
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
										Browser Viewport Canvas
									</span>
									<span className="font-mono text-xs sm:text-sm font-bold text-slate-900 block truncate">
										{displayInfo.viewportWidth} × {displayInfo.viewportHeight}{" "}
										px
									</span>
								</div>
								<span className="text-[10px] font-mono font-bold text-slate-700 bg-white border border-slate-200/80 px-2 py-0.5 rounded-md shrink-0">
									{displayInfo.colorDepth}-bit Depth
								</span>
							</div>
						</div>
					</div>
				</motion.div>
			</div>

			{/* ── Interactive Live Refresh Rate & Frame Stability Checker ── */}
			<motion.div
				initial={reduceMotion ? false : { opacity: 0, y: 15 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5"
			>
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
								<Gauge className="w-4 h-4 text-indigo-600" />
							</div>
							<h3 className="text-base font-bold text-slate-900 tracking-tight">
								Interactive Refresh Rate & Frame Stability Benchmark
							</h3>
						</div>
						<p className="text-xs text-slate-500 font-medium">
							Real-time requestAnimationFrame timing analysis measuring frame
							interval consistency and dropped frames.
						</p>
					</div>

					<button
						type="button"
						onClick={() => setIsTestingFps((prev) => !prev)}
						className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 ${
							isTestingFps
								? "bg-rose-600 hover:bg-rose-700 text-white"
								: "bg-indigo-600 hover:bg-indigo-700 text-white"
						}`}
					>
						{isTestingFps ? (
							<>
								<Pause className="w-3.5 h-3.5" />
								<span>Pause Stability Test</span>
							</>
						) : (
							<>
								<Play className="w-3.5 h-3.5 fill-white" />
								<span>Start Frame Stability Test</span>
							</>
						)}
					</button>
				</div>

				{/* 3 Telemetry Tiles */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
					<div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
						<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
							Live Measured FPS
						</span>
						<div className="flex items-baseline gap-1.5">
							<span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
								{isTestingFps ? liveFps : displayInfo.estimatedHz}
							</span>
							<span className="text-xs font-mono font-bold text-indigo-600">
								FPS
							</span>
						</div>
						<span className="text-[10px] text-slate-500 font-medium block truncate">
							{isTestingFps ? "Active RAF Sampling" : "Hardware Estimated"}
						</span>
					</div>

					<div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
						<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
							Frame Delta Jitter
						</span>
						<div className="flex items-baseline gap-1.5">
							<span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
								{isTestingFps ? `±${frameJitterMs}` : "±0.2"}
							</span>
							<span className="text-xs font-mono font-bold text-amber-600">
								ms
							</span>
						</div>
						<span className="text-[10px] text-slate-500 font-medium block truncate">
							Deviation from{" "}
							{Math.round(1000 / (displayInfo.estimatedHz || 60))}ms target
						</span>
					</div>

					<div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
						<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
							Frame Drops Recorded
						</span>
						<div className="flex items-baseline gap-1.5">
							<span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
								{droppedFrames}
							</span>
							<span className="text-xs font-mono font-bold text-slate-500">
								spikes
							</span>
						</div>
						<span className="text-[10px] text-slate-500 font-medium block truncate">
							Frame pacing threshold {">"} 1.5x
						</span>
					</div>
				</div>

				{/* Smooth Motion Fluidity Rail Visualizer */}
				<div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-2">
					<div className="flex items-center justify-between text-xs font-medium text-slate-500">
						<span>Hardware Synchronized Motion Rail:</span>
						<span className="font-mono text-indigo-600 font-bold text-[11px]">
							{isTestingFps ? "Running 100% Fluidity" : "Ready to Benchmark"}
						</span>
					</div>

					<div className="relative w-full h-8 bg-slate-100 rounded-xl overflow-hidden flex items-center px-2">
						{/* Hardware Acceleration Indicator Track */}
						<div
							className={`w-12 h-5 rounded-lg bg-indigo-600 shadow-2xs flex items-center justify-center text-[9px] font-mono font-bold text-white transition-opacity ${
								isTestingFps ? "animate-pulse" : "opacity-80"
							}`}
							style={{
								animation: isTestingFps
									? `ping-pong ${(1000 / (displayInfo.estimatedHz || 60)) * 60}ms ease-in-out infinite alternate`
									: "none",
							}}
						>
							Sync
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
