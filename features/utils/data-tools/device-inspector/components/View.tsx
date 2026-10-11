"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
	Gauge,
	ShieldCheck,
	LayoutGrid,
	Wifi,
	Cpu,
	Sliders,
	Layers,
	Copy,
	Check,
	Download,
	FileText,
} from "lucide-react";
import UtilHeader from "@/features/utils/components/UtilHeader";
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
	generateMarkdownReport,
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

import TopTelemetryStrip from "./TopTelemetryStrip";
import SpeedTestStudio from "./SpeedTestStudio";
import HardwareDisplayStudio from "./HardwareDisplayStudio";
import PeripheralsStudio from "./PeripheralsStudio";
import CompatibilityMatrixStudio from "./CompatibilityMatrixStudio";

type InspectorTab =
	| "all"
	| "speed"
	| "hardware"
	| "peripherals"
	| "compatibility";

export default function DeviceInspectorView() {
	const reduceMotion = useReducedMotion();
	const [activeTab, setActiveTab] = useState<InspectorTab>("all");

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
	const [isJsonCopied, setIsJsonCopied] = useState(false);
	const [isMarkdownCopied, setIsMarkdownCopied] = useState(false);

	const suitability = calculateConnectionSuitability(speedMetrics);

	// Load initial telemetry on mount
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

	// Copy full diagnostic report as JSON
	const handleCopyJson = () => {
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
		setIsJsonCopied(true);
		setTimeout(() => setIsJsonCopied(false), 2000);
	};

	// Copy Markdown table format for GitHub bug reports
	const handleCopyMarkdown = () => {
		const report = generateDiagnosticReport(
			networkInfo,
			speedMetrics,
			hardwareInfo,
			displayInfo,
			codecs,
			webApis,
			suitability,
		);
		const md = generateMarkdownReport(report);
		navigator.clipboard.writeText(md);
		setIsMarkdownCopied(true);
		setTimeout(() => setIsMarkdownCopied(false), 2000);
	};

	// Download full diagnostic report as JSON
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

	const tabs: Array<{
		id: InspectorTab;
		label: string;
		icon: typeof LayoutGrid;
	}> = [
		{ id: "all", label: "All Systems", icon: LayoutGrid },
		{ id: "speed", label: "Speed & Latency", icon: Wifi },
		{ id: "hardware", label: "Hardware & Display", icon: Cpu },
		{ id: "peripherals", label: "Peripherals Studio", icon: Sliders },
		{ id: "compatibility", label: "Compatibility Matrix", icon: Layers },
	];

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36 px-4 sm:px-6 lg:px-8">
			<div className="max-w-[1400px] mx-auto space-y-6 sm:space-y-8">
				{/* ── 1. Canonical 3-Tier Floating Card Header ── */}
				<UtilHeader
					title="Device, Speed & Diagnostics Inspector"
					description="Real-time internet speed test, hardware telemetry, display and refresh rate analysis, and media codec audit."
					category={{
						label: "Security & Diagnostics",
						sublabel: "hardware telemetry & speed test",
						icon: ShieldCheck,
						color: "sky",
					}}
					icon={Gauge}
					badges={
						<div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200/80 text-[10px] font-bold text-emerald-800">
							<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
							<span>Client-Side Diagnostics</span>
						</div>
					}
					actions={
						<>
							<button
								type="button"
								onClick={handleCopyMarkdown}
								className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
							>
								{isMarkdownCopied ? (
									<Check className="w-3.5 h-3.5 text-emerald-600" />
								) : (
									<FileText className="w-3.5 h-3.5 text-slate-500" />
								)}
								<span>
									{isMarkdownCopied ? "Markdown Copied" : "Copy Markdown"}
								</span>
							</button>

							<button
								type="button"
								onClick={handleCopyJson}
								className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
							>
								{isJsonCopied ? (
									<Check className="w-3.5 h-3.5 text-emerald-600" />
								) : (
									<Copy className="w-3.5 h-3.5 text-slate-500" />
								)}
								<span>{isJsonCopied ? "JSON Copied" : "Copy JSON"}</span>
							</button>

							<button
								type="button"
								onClick={handleDownloadReport}
								className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
							>
								<Download className="w-3.5 h-3.5" />
								<span>Export JSON</span>
							</button>
						</>
					}
				/>

				{/* ── 2. Top Telemetry KPI Strip (4-Tier Internal Structure) ── */}
				<TopTelemetryStrip
					displayInfo={displayInfo}
					hardwareInfo={hardwareInfo}
					networkInfo={networkInfo}
				/>

				{/* ── 3. Frameless Workstation Tab Switcher ── */}
				<div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
					{tabs.map((tab) => {
						const Icon = tab.icon;
						const isActive = activeTab === tab.id;
						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveTab(tab.id)}
								className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
									isActive
										? "text-slate-950"
										: "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
								}`}
							>
								{isActive && (
									<motion.div
										layoutId="activeInspectorTab"
										transition={{ type: "spring", stiffness: 380, damping: 30 }}
										className="absolute inset-0 bg-slate-100/90 rounded-xl border border-slate-200/80"
									/>
								)}
								<Icon
									className={`w-3.5 h-3.5 relative z-10 ${
										isActive ? "text-indigo-600" : "text-slate-400"
									}`}
								/>
								<span className="relative z-10">{tab.label}</span>
							</button>
						);
					})}
				</div>

				{/* ── 4. Main Diagnostic Studios ── */}
				<div className="space-y-6 sm:space-y-8">
					{/* Studio A: Speed & Latency */}
					{(activeTab === "all" || activeTab === "speed") && (
						<SpeedTestStudio
							speedMetrics={speedMetrics}
							networkInfo={networkInfo}
							throughputHistory={throughputHistory}
							suitability={suitability}
							onRunTest={handleRunSpeedTest}
							reduceMotion={reduceMotion}
						/>
					)}

					{/* Studio B: Hardware & Display */}
					{(activeTab === "all" || activeTab === "hardware") && (
						<HardwareDisplayStudio
							hardwareInfo={hardwareInfo}
							displayInfo={displayInfo}
							reduceMotion={reduceMotion}
						/>
					)}

					{/* Studio C: Peripherals & Media */}
					{(activeTab === "all" || activeTab === "peripherals") && (
						<PeripheralsStudio reduceMotion={reduceMotion} />
					)}

					{/* Studio D: Media Codecs & Modern Web Platform APIs */}
					{(activeTab === "all" || activeTab === "compatibility") && (
						<CompatibilityMatrixStudio
							codecs={codecs}
							webApis={webApis}
							reduceMotion={reduceMotion}
						/>
					)}
				</div>
			</div>
		</main>
	);
}
