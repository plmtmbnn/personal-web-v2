"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
	ArrowLeft,
	Gauge,
	Cpu,
	Monitor,
	Zap,
	Wifi,
	Radio,
	ArrowDown,
	ArrowUp,
	CheckCircle2,
	XCircle,
	Copy,
	Check,
	Download,
	RefreshCw,
	Layers,
	BatteryCharging,
	Battery,
	Play,
	Sliders,
	Tv,
	Gamepad2,
	Video,
	CloudUpload,
	Award,
} from "lucide-react";
import type {
	CodecItem,
	DisplayInfo,
	HardwareInfo,
	NetworkInfo,
	SpeedTestMetrics,
	WebApiItem,
} from "../types";
import {
	estimateRefreshRate,
	generateDiagnosticReport,
	getCodecSupportMatrix,
	getDisplayDiagnostics,
	getHardwareDiagnostics,
	getWebApiAudit,
} from "../utils/diagnostics";
import {
	fetchNetworkDiagnostics,
	measureDownloadSpeed,
	measurePingAndJitter,
	measureUploadSpeed,
} from "../utils/speed-test";
import { calculateConnectionSuitability } from "../utils/suitability";
import PeripheralsStudio from "./PeripheralsStudio";

export default function DeviceInspectorView() {
	const reduceMotion = useReducedMotion();

	const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
		online: true,
		effectiveType: "4g",
		downlinkMbps: 10,
		rttMs: 25,
		saveData: false,
	});

	const [hardwareInfo, setHardwareInfo] = useState<HardwareInfo>({
		cpuCores: 8,
		gpuVendor: "Detecting...",
		gpuRenderer: "Detecting...",
		maxTextureSize: 4096,
		webgl2Supported: true,
	});

	const [displayInfo, setDisplayInfo] = useState<DisplayInfo>({
		screenWidth: 1920,
		screenHeight: 1080,
		viewportWidth: 1920,
		viewportHeight: 1080,
		dpr: 1,
		colorDepth: 24,
		isHdr: false,
		colorGamut: "sRGB",
		estimatedHz: 60,
		touchPoints: 0,
		orientation: "landscape-primary",
	});

	const [codecs, setCodecs] = useState<CodecItem[]>([]);
	const [webApis, setWebApis] = useState<WebApiItem[]>([]);

	const [speedMetrics, setSpeedMetrics] = useState<SpeedTestMetrics>({
		phase: "idle",
		pingMs: 0,
		jitterMs: 0,
		downloadMbps: 0,
		uploadMbps: 0,
		progressPercent: 0,
		throughputHistory: [],
	});

	const [throughputHistory, setThroughputHistory] = useState<number[]>([]);
	const [isReportCopied, setIsReportCopied] = useState(false);

	const suitability = calculateConnectionSuitability(speedMetrics);

	// Load initial telemetry
	useEffect(() => {
		async function initDiagnostics() {
			const net = await fetchNetworkDiagnostics();
			setNetworkInfo(net);

			const hw = await getHardwareDiagnostics();
			setHardwareInfo(hw);

			const hz = await estimateRefreshRate();
			const disp = getDisplayDiagnostics(hz);
			setDisplayInfo(disp);

			setCodecs(getCodecSupportMatrix());
			setWebApis(getWebApiAudit());
		}

		initDiagnostics();
	}, []);

	// Run full speed test suite
	const handleRunSpeedTest = useCallback(async () => {
		setThroughputHistory([]);
		setSpeedMetrics({
			phase: "ping",
			pingMs: 0,
			jitterMs: 0,
			downloadMbps: 0,
			uploadMbps: 0,
			progressPercent: 10,
			throughputHistory: [],
		});

		try {
			// Phase 1: Ping & Jitter
			const { pingMs, jitterMs } = await measurePingAndJitter(6);
			setSpeedMetrics((prev) => ({
				...prev,
				pingMs,
				jitterMs,
				phase: "download",
				progressPercent: 30,
			}));

			// Phase 2: Download Speed
			const downloadMbps = await measureDownloadSpeed((currentMbps, ratio) => {
				setThroughputHistory((prev) => [...prev.slice(-24), currentMbps]);
				setSpeedMetrics((prev) => ({
					...prev,
					downloadMbps: currentMbps,
					progressPercent: Math.round(30 + ratio * 35),
				}));
			});

			setSpeedMetrics((prev) => ({
				...prev,
				downloadMbps,
				phase: "upload",
				progressPercent: 70,
			}));

			// Phase 3: Upload Speed
			const uploadMbps = await measureUploadSpeed((currentMbps, ratio) => {
				setThroughputHistory((prev) => [...prev.slice(-24), currentMbps]);
				setSpeedMetrics((prev) => ({
					...prev,
					uploadMbps: currentMbps,
					progressPercent: Math.round(70 + ratio * 28),
				}));
			});

			// Completed
			setSpeedMetrics((prev) => ({
				...prev,
				uploadMbps,
				phase: "completed",
				progressPercent: 100,
				throughputHistory,
			}));
		} catch (err) {
			setSpeedMetrics((prev) => ({
				...prev,
				phase: "error",
				error: err instanceof Error ? err.message : "Speed test interrupted.",
			}));
		}
	}, [throughputHistory]);

	// Copy full diagnostic report
	const handleCopyReport = () => {
		const report = generateDiagnosticReport(
			networkInfo,
			speedMetrics,
			hardwareInfo,
			displayInfo,
			codecs,
			webApis,
			suitability,
		);
		navigator.clipboard.writeText(JSON.stringify(report, null, 2));
		setIsReportCopied(true);
		setTimeout(() => setIsReportCopied(false), 2000);
	};

	// Download full diagnostic report
	const handleDownloadReport = () => {
		const report = generateDiagnosticReport(
			networkInfo,
			speedMetrics,
			hardwareInfo,
			displayInfo,
			codecs,
			webApis,
			suitability,
		);
		const blob = new Blob([JSON.stringify(report, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `device-diagnostics-${Date.now()}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32 pt-24 sm:pt-32 px-4 sm:px-6 lg:px-8">
			<div className="max-w-[1400px] mx-auto space-y-8">
				{/* Top Breadcrumb & Zero-Server Badge */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
				>
					<Link
						href="/utils"
						className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 transition-colors gap-2 group !no-underline"
					>
						<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
						Back to Utilities
					</Link>
					<div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200/80 rounded-full text-xs font-bold text-slate-600 shadow-2xs">
						<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
						WebGL & Web Audio Telemetry • 100% In-Browser
					</div>
				</motion.div>

				{/* Header Section */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="flex flex-col xl:flex-row xl:items-end justify-between gap-6"
				>
					<div className="space-y-3">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
								<Gauge className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
							</div>
							<div>
								<h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
									Device, Speed &{" "}
									<span className="text-indigo-600">Diagnostics Inspector</span>
								</h1>
								<p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
									Real-time internet speed test, hardware telemetry, display &
									refresh rate analysis, and media codec audit.
								</p>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={handleCopyReport}
							className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
						>
							{isReportCopied ? (
								<Check className="w-4 h-4 text-emerald-600" />
							) : (
								<Copy className="w-4 h-4" />
							)}
							<span>{isReportCopied ? "Copied JSON" : "Copy Report"}</span>
						</button>
						<button
							type="button"
							onClick={handleDownloadReport}
							className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
						>
							<Download className="w-4 h-4" />
							<span>Export JSON</span>
						</button>
					</div>
				</motion.div>

				{/* ═══════════════════════════════════════════════════════════════════ */}
				{/* SECTION 1: INTERNET SPEED TEST & LATENCY STUDIO                     */}
				{/* ═══════════════════════════════════════════════════════════════════ */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
				>
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="space-y-0.5">
							<div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
								<Wifi className="w-4 h-4 text-indigo-600" />
								<span>Internet Speed & Latency Telemetry</span>
							</div>
							<p className="text-[11px] font-medium text-slate-500">
								Bandwidth measured in Megabits per second (Mbps)
							</p>
						</div>
						<button
							type="button"
							onClick={handleRunSpeedTest}
							disabled={
								speedMetrics.phase === "ping" ||
								speedMetrics.phase === "download" ||
								speedMetrics.phase === "upload"
							}
							className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-sm disabled:opacity-50"
						>
							{speedMetrics.phase === "ping" ||
							speedMetrics.phase === "download" ||
							speedMetrics.phase === "upload" ? (
								<RefreshCw className="w-4 h-4 animate-spin" />
							) : (
								<Play className="w-4 h-4 fill-white" />
							)}
							<span>
								{speedMetrics.phase === "idle"
									? "Start Speed Test"
									: speedMetrics.phase === "completed"
										? "Test Again"
										: "Testing..."}
							</span>
						</button>
					</div>

					{/* 4 Metrics Grid */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
						{/* Download */}
						<div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-1">
							<div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
								<span className="flex items-center gap-1.5 text-indigo-900">
									<ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
									Download
								</span>
								<span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-100/70 px-1.5 py-0.5 rounded">
									Mbps
								</span>
							</div>
							<p className="font-mono text-3xl sm:text-4xl font-extrabold text-slate-900">
								{speedMetrics.downloadMbps > 0
									? speedMetrics.downloadMbps
									: "--"}
							</p>
							<p className="text-[10px] font-semibold text-slate-500">
								Megabits per second
							</p>
						</div>

						{/* Upload */}
						<div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-1">
							<div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
								<span className="flex items-center gap-1.5 text-emerald-900">
									<ArrowUp className="w-3.5 h-3.5 text-emerald-600" />
									Upload
								</span>
								<span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
									Mbps
								</span>
							</div>
							<p className="font-mono text-3xl sm:text-4xl font-extrabold text-slate-900">
								{speedMetrics.uploadMbps > 0 ? speedMetrics.uploadMbps : "--"}
							</p>
							<p className="text-[10px] font-semibold text-slate-500">
								Megabits per second
							</p>
						</div>

						{/* Ping / Latency */}
						<div className="p-5 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-1">
							<div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
								<span className="flex items-center gap-1.5 text-amber-900">
									<Radio className="w-3.5 h-3.5 text-amber-600" />
									Ping (RTT)
								</span>
								<span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
									ms
								</span>
							</div>
							<p className="font-mono text-3xl sm:text-4xl font-extrabold text-slate-900">
								{speedMetrics.pingMs > 0 ? speedMetrics.pingMs : "--"}
							</p>
							<p className="text-[10px] font-semibold text-slate-500">
								Milliseconds
							</p>
						</div>

						{/* Jitter */}
						<div className="p-5 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-1">
							<div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
								<span className="flex items-center gap-1.5 text-purple-900">
									<Sliders className="w-3.5 h-3.5 text-purple-600" />
									Jitter
								</span>
								<span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100/70 px-1.5 py-0.5 rounded">
									ms
								</span>
							</div>
							<p className="font-mono text-3xl sm:text-4xl font-extrabold text-slate-900">
								{speedMetrics.jitterMs > 0 ? speedMetrics.jitterMs : "--"}
							</p>
							<p className="text-[10px] font-semibold text-slate-500">
								Variation (ms)
							</p>
						</div>
					</div>

					{/* Progress Bar & Real-time Throughput Sparkline (when testing) */}
					{speedMetrics.phase !== "idle" &&
						speedMetrics.phase !== "completed" && (
							<div className="space-y-2.5 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
								<div className="flex items-center justify-between text-xs font-bold text-slate-700">
									<span className="uppercase tracking-wider flex items-center gap-2">
										<RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
										Active Phase: {speedMetrics.phase.toUpperCase()}
									</span>
									<span className="font-mono text-indigo-600 font-extrabold">
										{speedMetrics.progressPercent}% Completed
									</span>
								</div>

								<div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
									<div
										className="h-full bg-indigo-600 transition-all duration-200"
										style={{ width: `${speedMetrics.progressPercent}%` }}
									/>
								</div>

								{/* Live Throughput Sparkline */}
								{throughputHistory.length > 2 && (
									<div className="pt-2 flex items-center justify-between gap-4 text-[10px] text-slate-400 font-mono">
										<span>Real-time Stream Fluctuation:</span>
										<div className="flex items-end gap-1 h-5 flex-1 max-w-[200px]">
											{throughputHistory.map((val, idx) => {
												const maxVal = Math.max(...throughputHistory, 1);
												const barHeight = Math.max(
													15,
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
										<span className="font-bold text-slate-700">
											{throughputHistory[throughputHistory.length - 1]} Mbps
										</span>
									</div>
								)}
							</div>
						)}

					{/* ─── Connection Suitability Matrix (Completed) ─────────────── */}
					{speedMetrics.phase === "completed" && (
						<motion.div
							initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
							animate={{ opacity: 1, scale: 1 }}
							className="p-5 bg-gradient-to-br from-indigo-50/70 via-slate-50 to-white border border-indigo-100 rounded-2xl space-y-4 shadow-2xs"
						>
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100/60 pb-3">
								<div className="flex items-center gap-2">
									<Award className="w-4 h-4 text-indigo-600" />
									<span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
										Real-World Connection Suitability Matrix
									</span>
								</div>
								<div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-indigo-200 rounded-full text-xs font-bold text-indigo-950 shadow-2xs">
									<span className="w-2 h-2 rounded-full bg-emerald-500" />
									<span className="font-mono font-extrabold text-indigo-600">
										Grade {suitability.grade}
									</span>
									<span className="text-slate-400">•</span>
									<span className="text-slate-600">
										{suitability.gradeLabel}
									</span>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
								{suitability.metrics.map((item) => (
									<div
										key={item.title}
										className="p-3.5 bg-white border border-slate-200/80 rounded-xl space-y-1.5 shadow-2xs"
									>
										<div className="flex items-center justify-between">
											<span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase">
												{item.iconName === "tv" && (
													<Tv className="w-3.5 h-3.5 text-indigo-600" />
												)}
												{item.iconName === "gamepad" && (
													<Gamepad2 className="w-3.5 h-3.5 text-purple-600" />
												)}
												{item.iconName === "video" && (
													<Video className="w-3.5 h-3.5 text-emerald-600" />
												)}
												{item.iconName === "cloud-upload" && (
													<CloudUpload className="w-3.5 h-3.5 text-cyan-600" />
												)}
												{item.title}
											</span>
											<span
												className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
													item.status === "optimal"
														? "bg-emerald-50 text-emerald-700 border border-emerald-200"
														: item.status === "good"
															? "bg-indigo-50 text-indigo-700 border border-indigo-200"
															: item.status === "moderate"
																? "bg-amber-50 text-amber-700 border border-amber-200"
																: "bg-rose-50 text-rose-700 border border-rose-200"
												}`}
											>
												{item.status}
											</span>
										</div>
										<p className="text-xs font-extrabold text-slate-900">
											{item.verdict}
										</p>
										<p className="text-[10px] text-slate-500 leading-tight">
											{item.details}
										</p>
									</div>
								))}
							</div>
						</motion.div>
					)}

					{/* Connection Meta Badges */}
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
						<div>
							<span className="text-slate-400 block text-[10px] font-bold uppercase">
								Connection Type
							</span>
							<span className="font-mono font-bold text-slate-800 uppercase">
								{networkInfo.effectiveType}
							</span>
						</div>
						<div>
							<span className="text-slate-400 block text-[10px] font-bold uppercase">
								Network Downlink
							</span>
							<span className="font-mono font-bold text-slate-800">
								~{networkInfo.downlinkMbps} Megabits per second
							</span>
						</div>
						<div>
							<span className="text-slate-400 block text-[10px] font-bold uppercase">
								Public IP & Geo
							</span>
							<span className="font-mono font-bold text-slate-800 truncate block">
								{networkInfo.publicIp || "127.0.0.1"}
								{networkInfo.city
									? ` • ${networkInfo.city}, ${networkInfo.countryCode || networkInfo.country}`
									: ""}
							</span>
						</div>
						<div>
							<span className="text-slate-400 block text-[10px] font-bold uppercase">
								ISP & Organization
							</span>
							<span className="font-mono font-bold text-slate-800 truncate block">
								{networkInfo.isp || networkInfo.org || "Detecting..."}
							</span>
						</div>
					</div>
				</motion.div>

				{/* ═══════════════════════════════════════════════════════════════════ */}
				{/* SECTION 2: PERIPHERALS & MEDIA HARDWARE DIAGNOSTICS                 */}
				{/* ═══════════════════════════════════════════════════════════════════ */}
				<PeripheralsStudio reduceMotion={reduceMotion} />

				{/* ═══════════════════════════════════════════════════════════════════ */}
				{/* SECTION 3 & 4: HARDWARE & DISPLAY TELEMETRY                         */}
				{/* ═══════════════════════════════════════════════════════════════════ */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
					{/* Hardware Diagnostics Card */}
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 flex flex-col justify-between"
					>
						<div className="space-y-4">
							<div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
								<Cpu className="w-4 h-4 text-indigo-600" />
								<span>Hardware & GPU Architecture</span>
							</div>

							<div className="space-y-3">
								<div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
										GPU Graphics Renderer (Unmasked WebGL)
									</span>
									<p className="font-mono text-xs sm:text-sm font-extrabold text-slate-900 break-words">
										{hardwareInfo.gpuRenderer}
									</p>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
										<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
											Logical CPU Cores
										</span>
										<span className="font-mono text-lg font-extrabold text-slate-900">
											{hardwareInfo.cpuCores} Threads
										</span>
									</div>

									<div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
										<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
											Estimated RAM Memory
										</span>
										<span className="font-mono text-lg font-extrabold text-slate-900">
											~{hardwareInfo.ramGb || 8} GB
										</span>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
										<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
											Max Texture Dimension
										</span>
										<span className="font-mono text-sm font-extrabold text-slate-900">
											{hardwareInfo.maxTextureSize} ×{" "}
											{hardwareInfo.maxTextureSize} px
										</span>
									</div>

									<div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
										<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
											Battery Status
										</span>
										<div className="flex items-center gap-1.5 font-mono text-sm font-extrabold text-slate-900">
											{hardwareInfo.isCharging ? (
												<BatteryCharging className="w-4 h-4 text-emerald-600" />
											) : (
												<Battery className="w-4 h-4 text-slate-600" />
											)}
											<span>
												{hardwareInfo.batteryLevel !== undefined
													? `${hardwareInfo.batteryLevel}%`
													: "Desktop / Connected"}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Display & Screen Capabilities */}
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 flex flex-col justify-between"
					>
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
									<Monitor className="w-4 h-4 text-indigo-600" />
									<span>Screen & Display Analysis</span>
								</div>
								<span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold bg-indigo-600 text-white shadow-2xs">
									{displayInfo.estimatedHz} Hz Display
								</span>
							</div>

							<div className="space-y-3">
								<div className="grid grid-cols-2 gap-3">
									<div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
										<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
											Native Resolution
										</span>
										<span className="font-mono text-sm sm:text-base font-extrabold text-slate-900">
											{displayInfo.screenWidth} × {displayInfo.screenHeight} px
										</span>
									</div>

									<div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
										<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
											Device Pixel Ratio (DPR)
										</span>
										<span className="font-mono text-sm sm:text-base font-extrabold text-slate-900">
											{displayInfo.dpr}x{" "}
											{displayInfo.dpr > 1 ? "(Retina/HiDPI)" : "(Standard)"}
										</span>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
										<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
											Color Gamut
										</span>
										<span className="font-mono text-sm font-extrabold text-slate-900">
											{displayInfo.colorGamut}
										</span>
									</div>

									<div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
										<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
											High Dynamic Range (HDR)
										</span>
										<span
											className={`font-mono text-sm font-extrabold ${
												displayInfo.isHdr
													? "text-emerald-600"
													: "text-slate-700"
											}`}
										>
											{displayInfo.isHdr ? "✓ Supported (HDR)" : "SDR Standard"}
										</span>
									</div>
								</div>

								<div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
									<div>
										<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
											Viewport Canvas Bounds
										</span>
										<span className="font-mono text-xs sm:text-sm font-extrabold text-slate-900">
											{displayInfo.viewportWidth} × {displayInfo.viewportHeight}{" "}
											px
										</span>
									</div>
									<span className="text-xs font-mono font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">
										{displayInfo.colorDepth}-bit Color
									</span>
								</div>
							</div>
						</div>
					</motion.div>
				</div>

				{/* ═══════════════════════════════════════════════════════════════════ */}
				{/* SECTION 4: MEDIA CODEC COMPATIBILITY MATRIX                         */}
				{/* ═══════════════════════════════════════════════════════════════════ */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5"
				>
					<div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
						<Layers className="w-4 h-4 text-indigo-600" />
						<span>Audio & Video Media Codec Decoding Matrix</span>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
						{codecs.map((codec) => (
							<div
								key={codec.name}
								className={`p-3 rounded-2xl border flex flex-col justify-between space-y-2 ${
									codec.isSupported
										? "bg-emerald-50/40 border-emerald-200/80 text-emerald-950"
										: "bg-slate-50 border-slate-200/70 text-slate-500 opacity-60"
								}`}
							>
								<div>
									<span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">
										{codec.type}
									</span>
									<h4 className="text-xs font-extrabold truncate">
										{codec.name}
									</h4>
								</div>
								<span
									className={`inline-flex items-center gap-1 text-[10px] font-bold ${
										codec.isSupported ? "text-emerald-700" : "text-slate-400"
									}`}
								>
									{codec.isSupported ? (
										<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
									) : (
										<XCircle className="w-3.5 h-3.5 text-slate-400" />
									)}
									{codec.isSupported ? "Supported" : "Unsupported"}
								</span>
							</div>
						))}
					</div>
				</motion.div>

				{/* ═══════════════════════════════════════════════════════════════════ */}
				{/* SECTION 5: MODERN WEB PLATFORM APIS AUDIT                           */}
				{/* ═══════════════════════════════════════════════════════════════════ */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5"
				>
					<div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
						<Zap className="w-4 h-4 text-indigo-600" />
						<span>Browser Web Platform API Capability Audit</span>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{webApis.map((api) => (
							<div
								key={api.name}
								className={`p-4 rounded-2xl border space-y-1.5 ${
									api.isSupported
										? "bg-slate-50/80 border-slate-200/80"
										: "bg-rose-50/30 border-rose-200/60"
								}`}
							>
								<div className="flex items-center justify-between">
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
										{api.category}
									</span>
									{api.isSupported ? (
										<CheckCircle2 className="w-4 h-4 text-emerald-600" />
									) : (
										<XCircle className="w-4 h-4 text-rose-500" />
									)}
								</div>
								<h4 className="text-xs font-extrabold text-slate-900">
									{api.name}
								</h4>
								<p className="text-[11px] text-slate-500 leading-relaxed">
									{api.desc}
								</p>
							</div>
						))}
					</div>
				</motion.div>
			</div>
		</main>
	);
}
