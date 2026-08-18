"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
	Volume2,
	Mic,
	MicOff,
	Camera,
	CameraOff,
	Play,
	Radio,
	Sparkles,
	Sliders,
	CheckCircle2,
	AlertCircle,
} from "lucide-react";
import type { CameraDeviceInfo, MicTelemetry, SpeakerChannel } from "../types";
import {
	getAvailableCameras,
	playSpeakerTestTone,
	startMicDiagnostics,
} from "../utils/audio-diagnostics";

interface PeripheralsStudioProps {
	reduceMotion?: boolean | null;
}

export default function PeripheralsStudio({
	reduceMotion,
}: PeripheralsStudioProps) {
	// Speaker test state
	const [activeSpeakerTone, setActiveSpeakerTone] =
		useState<SpeakerChannel | null>(null);

	// Mic test state
	const [isMicTesting, setIsMicTesting] = useState(false);
	const [micTelemetry, setMicTelemetry] = useState<MicTelemetry>({
		active: false,
		peakLevel: 0,
		volumeDb: -60,
		sampleRate: 48000,
		channelCount: 1,
		deviceLabel: "Not Connected",
	});
	const [freqBars, setFreqBars] = useState<number[]>(new Array(16).fill(0));
	const [micError, setMicError] = useState<string | null>(null);
	const micCleanupRef = useRef<(() => void) | null>(null);

	// Camera test state
	const [cameras, setCameras] = useState<CameraDeviceInfo[]>([]);
	const [isCameraActive, setIsCameraActive] = useState(false);
	const [cameraError, setCameraError] = useState<string | null>(null);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const cameraStreamRef = useRef<MediaStream | null>(null);

	// Load cameras on mount
	useEffect(() => {
		getAvailableCameras().then(setCameras);
		return () => {
			if (micCleanupRef.current) micCleanupRef.current();
			if (cameraStreamRef.current) {
				for (const t of cameraStreamRef.current.getTracks()) {
					t.stop();
				}
			}
		};
	}, []);

	// Handle Speaker Channel Audio Trigger
	const handlePlaySpeaker = async (channel: SpeakerChannel) => {
		setActiveSpeakerTone(channel);
		const duration = channel === "sweep" ? 2000 : 1200;
		await playSpeakerTestTone(channel, duration);
		setActiveSpeakerTone(null);
	};

	// Toggle Microphone Testing
	const handleToggleMic = async () => {
		if (isMicTesting) {
			if (micCleanupRef.current) {
				micCleanupRef.current();
				micCleanupRef.current = null;
			}
			setIsMicTesting(false);
			setMicTelemetry((prev) => ({
				...prev,
				active: false,
				peakLevel: 0,
				volumeDb: -60,
			}));
			setFreqBars(new Array(16).fill(0));
		} else {
			setMicError(null);
			setIsMicTesting(true);
			const cleanup = await startMicDiagnostics(
				(telemetry, freqData) => {
					setMicTelemetry(telemetry);
					const normalizedBars = Array.from(freqData).map((v) =>
						Math.round((v / 255) * 100),
					);
					setFreqBars(normalizedBars);
				},
				(err) => {
					setMicError(err);
					setIsMicTesting(false);
				},
			);
			micCleanupRef.current = cleanup;
		}
	};

	// Toggle Camera Testing
	const handleToggleCamera = async () => {
		if (isCameraActive) {
			if (cameraStreamRef.current) {
				for (const t of cameraStreamRef.current.getTracks()) {
					t.stop();
				}
				cameraStreamRef.current = null;
			}
			if (videoRef.current) {
				videoRef.current.srcObject = null;
			}
			setIsCameraActive(false);
		} else {
			setCameraError(null);
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: {
						width: { ideal: 1920 },
						height: { ideal: 1080 },
						facingMode: "user",
					},
				});
				cameraStreamRef.current = stream;
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
					videoRef.current.play();
				}
				setIsCameraActive(true);
				getAvailableCameras().then(setCameras);
			} catch (err) {
				setCameraError(
					err instanceof Error
						? err.message
						: "Camera permission denied or device busy.",
				);
				setIsCameraActive(false);
			}
		}
	};

	return (
		<motion.div
			initial={reduceMotion ? false : { opacity: 0, y: 15 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.15 }}
			className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
		>
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="space-y-0.5">
					<div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
						<Sliders className="w-4 h-4 text-indigo-600" />
						<span>Peripherals & Media Hardware Diagnostics</span>
					</div>
					<p className="text-[11px] font-medium text-slate-500">
						Interactive Web Audio API speaker channel testing, live microphone
						VU meter, and webcam capabilities.
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* ─── 1. Stereo Speaker Channel Studio ────────────────────────── */}
				<div className="p-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-4 flex flex-col justify-between">
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
								<Volume2 className="w-4 h-4 text-indigo-600" />
								Stereo Speakers
							</span>
							<span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full">
								Acoustic Test
							</span>
						</div>
						<p className="text-[11px] text-slate-500 leading-relaxed">
							Verify stereo channel separation, panning balance, and acoustic
							frequency response.
						</p>

						{/* Visual Speaker Balance Graphic */}
						<div className="p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-around">
							<div
								className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
									activeSpeakerTone === "left" || activeSpeakerTone === "both"
										? "bg-indigo-50 text-indigo-600 ring-2 ring-indigo-500/50 scale-105"
										: "text-slate-400"
								}`}
							>
								<Volume2 className="w-5 h-5" />
								<span className="text-[10px] font-extrabold font-mono uppercase">
									L Channel
								</span>
							</div>

							<div className="w-px h-8 bg-slate-200" />

							<div
								className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
									activeSpeakerTone === "right" || activeSpeakerTone === "both"
										? "bg-indigo-50 text-indigo-600 ring-2 ring-indigo-500/50 scale-105"
										: "text-slate-400"
								}`}
							>
								<Volume2 className="w-5 h-5" />
								<span className="text-[10px] font-extrabold font-mono uppercase">
									R Channel
								</span>
							</div>
						</div>
					</div>

					{/* Speaker Channel Action Buttons */}
					<div className="grid grid-cols-2 gap-2 pt-2">
						<button
							type="button"
							onClick={() => handlePlaySpeaker("left")}
							disabled={activeSpeakerTone !== null}
							className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-2xs"
						>
							<Play className="w-3 h-3 text-indigo-600 fill-indigo-600" />
							<span>Left (440Hz)</span>
						</button>
						<button
							type="button"
							onClick={() => handlePlaySpeaker("right")}
							disabled={activeSpeakerTone !== null}
							className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-2xs"
						>
							<Play className="w-3 h-3 text-indigo-600 fill-indigo-600" />
							<span>Right (880Hz)</span>
						</button>
						<button
							type="button"
							onClick={() => handlePlaySpeaker("both")}
							disabled={activeSpeakerTone !== null}
							className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-2xs"
						>
							<Radio className="w-3 h-3 text-indigo-600" />
							<span>Stereo Center</span>
						</button>
						<button
							type="button"
							onClick={() => handlePlaySpeaker("sweep")}
							disabled={activeSpeakerTone !== null}
							className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-900 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-2xs"
						>
							<Sparkles className="w-3 h-3 text-indigo-600" />
							<span>Freq Sweep</span>
						</button>
					</div>
				</div>

				{/* ─── 2. Live Microphone Level & VU Meter ────────────────────── */}
				<div className="p-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-4 flex flex-col justify-between">
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
								<Mic className="w-4 h-4 text-emerald-600" />
								Microphone Stream
							</span>
							<span
								className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
									isMicTesting
										? "text-emerald-700 bg-emerald-100 animate-pulse"
										: "text-slate-500 bg-slate-200"
								}`}
							>
								{isMicTesting ? "Live Audio" : "Idle"}
							</span>
						</div>

						{/* VU Meter & Decibel Indicator */}
						<div className="p-3.5 bg-white border border-slate-200/80 rounded-xl space-y-2">
							<div className="flex items-center justify-between text-xs">
								<span className="text-[10px] font-bold text-slate-400 uppercase">
									Peak Level (VU Meter)
								</span>
								<span className="font-mono font-extrabold text-slate-800">
									{isMicTesting ? `${micTelemetry.volumeDb} dBFS` : "-- dB"}
								</span>
							</div>

							{/* Gradient Level Bar */}
							<div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
								<div
									className="h-full rounded-full transition-all duration-75 bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500"
									style={{
										width: `${isMicTesting ? micTelemetry.peakLevel : 0}%`,
									}}
								/>
							</div>

							{/* Real-time 16-Bar Spectrum Visualizer */}
							<div className="flex items-end justify-between gap-1 h-8 pt-1">
								{freqBars.map((bar, idx) => (
									<div
										key={`freq-${idx}`}
										className="w-full bg-emerald-500/80 rounded-t-xs transition-all duration-75"
										style={{
											height: isMicTesting ? `${Math.max(10, bar)}%` : "10%",
											opacity: isMicTesting ? 0.3 + (bar / 100) * 0.7 : 0.2,
										}}
									/>
								))}
							</div>
						</div>

						{micError && (
							<div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg">
								<AlertCircle className="w-3.5 h-3.5 shrink-0" />
								<span>{micError}</span>
							</div>
						)}

						{/* Mic Telemetry specs */}
						{isMicTesting && (
							<div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-mono">
								<div className="truncate">
									<span className="text-slate-400 block">Rate:</span>
									<span className="font-bold text-slate-700">
										{micTelemetry.sampleRate} Hz
									</span>
								</div>
								<div className="truncate">
									<span className="text-slate-400 block">Channels:</span>
									<span className="font-bold text-slate-700">
										{micTelemetry.channelCount === 2 ? "Stereo" : "Mono"}
									</span>
								</div>
							</div>
						)}
					</div>

					<button
						type="button"
						onClick={handleToggleMic}
						className={`w-full py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
							isMicTesting
								? "bg-rose-600 hover:bg-rose-700 text-white"
								: "bg-emerald-600 hover:bg-emerald-700 text-white"
						}`}
					>
						{isMicTesting ? (
							<>
								<MicOff className="w-4 h-4" />
								<span>Stop Mic Test</span>
							</>
						) : (
							<>
								<Mic className="w-4 h-4" />
								<span>Start Mic Test</span>
							</>
						)}
					</button>
				</div>

				{/* ─── 3. Camera & Webcam Inspector ───────────────────────────── */}
				<div className="p-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-4 flex flex-col justify-between">
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
								<Camera className="w-4 h-4 text-indigo-600" />
								Camera & Webcam
							</span>
							<span
								className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
									isCameraActive
										? "text-indigo-700 bg-indigo-100"
										: "text-slate-500 bg-slate-200"
								}`}
							>
								{isCameraActive ? "Active" : "Standby"}
							</span>
						</div>

						{/* Camera Video Preview Container */}
						<div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200/80 shadow-inner">
							<video
								ref={videoRef}
								playsInline
								muted
								className={`w-full h-full object-cover scale-x-[-1] ${
									isCameraActive ? "block" : "hidden"
								}`}
							/>
							{!isCameraActive && (
								<div className="flex flex-col items-center gap-1.5 text-slate-500 p-4 text-center">
									<CameraOff className="w-6 h-6 text-slate-600" />
									<span className="text-xs font-bold text-slate-400">
										Camera Preview Standby
									</span>
									<span className="text-[10px] text-slate-500">
										Click below to verify video capture
									</span>
								</div>
							)}
						</div>

						{cameraError && (
							<div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg">
								<AlertCircle className="w-3.5 h-3.5 shrink-0" />
								<span>{cameraError}</span>
							</div>
						)}

						{/* Detected Cameras List */}
						{cameras.length > 0 && (
							<div className="space-y-1">
								<span className="text-[10px] font-bold text-slate-400 uppercase block">
									Detected Sensor ({cameras.length})
								</span>
								<p className="text-xs font-bold text-slate-800 truncate flex items-center gap-1">
									<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
									{cameras[0]?.label || "Integrated Video Sensor"}
								</p>
							</div>
						)}
					</div>

					<button
						type="button"
						onClick={handleToggleCamera}
						className={`w-full py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
							isCameraActive
								? "bg-slate-800 hover:bg-slate-900 text-white"
								: "bg-indigo-600 hover:bg-indigo-700 text-white"
						}`}
					>
						{isCameraActive ? (
							<>
								<CameraOff className="w-4 h-4" />
								<span>Stop Camera</span>
							</>
						) : (
							<>
								<Camera className="w-4 h-4" />
								<span>Test Camera Preview</span>
							</>
						)}
					</button>
				</div>
			</div>
		</motion.div>
	);
}
