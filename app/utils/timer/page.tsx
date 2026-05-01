"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Play,
	Pause,
	RotateCcw,
	SkipForward,
	Flame,
	Dumbbell,
	TimerReset,
	ArrowLeft,
	Volume2,
	VolumeX,
	Lock,
	Unlock,
	Trophy,
	Activity,
	CheckCircle2,
	Zap,
} from "lucide-react";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────────────────

type PhaseType = "warmup" | "speed" | "rest" | "cooldown";

interface Phase {
	type: PhaseType;
	duration: number;
	label: string;
}

interface LapEntry {
	label: string;
	type: PhaseType;
	duration: number;
	completedAt: number; // totalElapsed when done
}

// ─── Theme Map ───────────────────────────────────────────────────────────────

const PHASE_THEME: Record<
	PhaseType,
	{ bg: string; accent: string; ring: string; pill: string; text: string }
> = {
	warmup: {
		bg: "from-amber-950 via-amber-900 to-orange-950",
		accent: "#f59e0b",
		ring: "#fbbf24",
		pill: "bg-amber-500/20 text-amber-300 border-amber-500/30",
		text: "text-amber-300",
	},
	speed: {
		bg: "from-rose-950 via-red-900 to-rose-950",
		accent: "#f43f5e",
		ring: "#fb7185",
		pill: "bg-rose-500/20 text-rose-300 border-rose-500/30",
		text: "text-rose-300",
	},
	rest: {
		bg: "from-emerald-950 via-teal-900 to-emerald-950",
		accent: "#10b981",
		ring: "#34d399",
		pill: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
		text: "text-emerald-300",
	},
	cooldown: {
		bg: "from-blue-950 via-indigo-900 to-blue-950",
		accent: "#3b82f6",
		ring: "#60a5fa",
		pill: "bg-blue-500/20 text-blue-300 border-blue-500/30",
		text: "text-blue-300",
	},
};

const PHASE_ICONS: Record<PhaseType, React.FC<{ className?: string }>> = {
	warmup: ({ className }) => <Flame className={className} />,
	speed: ({ className }) => <Zap className={className} />,
	rest: ({ className }) => <TimerReset className={className} />,
	cooldown: ({ className }) => <Activity className={className} />,
};

// ─── Circular Progress Ring ──────────────────────────────────────────────────

function CountdownRing({
	progress,
	color,
	size = 320,
	strokeWidth = 10,
	children,
}: {
	progress: number; // 0–1
	color: string;
	size?: number;
	strokeWidth?: number;
	children?: React.ReactNode;
}) {
	const r = (size - strokeWidth * 2) / 2;
	const circ = 2 * Math.PI * r;
	const offset = circ * (1 - Math.max(0, Math.min(1, progress)));

	return (
		<div className="relative" style={{ width: size, height: size }}>
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				className="-rotate-90"
			>
				{/* Track */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={r}
					fill="none"
					stroke="rgba(255,255,255,0.07)"
					strokeWidth={strokeWidth}
				/>
				{/* Progress arc */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={r}
					fill="none"
					stroke={color}
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					strokeDasharray={circ}
					strokeDashoffset={offset}
					style={{
						transition: "stroke-dashoffset 0.9s linear, stroke 0.6s ease",
					}}
					filter="url(#glow)"
				/>
				<defs>
					<filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
						<feGaussianBlur stdDeviation="6" result="blur" />
						<feMerge>
							<feMergeNode in="blur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				{children}
			</div>
		</div>
	);
}

// ─── Phase Queue Timeline ────────────────────────────────────────────────────

function PhaseTimeline({
	queue,
	currentIndex,
}: {
	queue: Phase[];
	currentIndex: number;
}) {
	const total = queue.reduce((a, p) => a + p.duration, 0);
	return (
		<div className="w-full max-w-2xl px-2">
			<div className="flex h-3 rounded-full overflow-hidden gap-[2px]">
				{queue.map((phase, i) => {
					const w = (phase.duration / total) * 100;
					const colors = {
						warmup: i <= currentIndex ? "bg-amber-400" : "bg-amber-900/50",
						speed: i <= currentIndex ? "bg-rose-400" : "bg-rose-900/50",
						rest: i <= currentIndex ? "bg-emerald-400" : "bg-emerald-900/50",
						cooldown: i <= currentIndex ? "bg-blue-400" : "bg-blue-900/50",
					};
					return (
						<div
							key={`timeline-${phase.label}-${phase.duration}`}
							className={`${colors[phase.type]} rounded-sm transition-all duration-500 ${
								i === currentIndex ? "ring-1 ring-white/40" : ""
							}`}
							style={{ width: `${w}%` }}
							title={phase.label}
						/>
					);
				})}
			</div>
			<div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-widest opacity-40 text-white">
				<span>Start</span>
				<span>{queue.length} phases</span>
				<span>Finish</span>
			</div>
		</div>
	);
}

// ─── Next Phase Preview ──────────────────────────────────────────────────────

function NextPhasePreview({ phase }: { phase: Phase }) {
	const theme = PHASE_THEME[phase.type];
	const Icon = PHASE_ICONS[phase.type];
	return (
		<motion.div
			initial={{ opacity: 0, y: 6 }}
			animate={{ opacity: 1, y: 0 }}
			className={`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-xl ${theme.pill} text-xs text-white uppercase tracking-widest`}
		>
			<span className="opacity-50">Next →</span>
			<Icon className="w-3.5 h-3.5" />
			<span>{phase.label}</span>
		</motion.div>
	);
}

// ─── Lap History ─────────────────────────────────────────────────────────────

function LapLog({ laps }: { laps: LapEntry[] }) {
	if (laps.length === 0) return null;
	return (
		<div className="w-full max-w-sm space-y-1.5 max-h-40 overflow-y-auto scrollbar-hide pr-1">
			{[...laps].reverse().map((lap) => {
				const theme = PHASE_THEME[lap.type];
				return (
					<motion.div
						key={`lap-${lap.completedAt}`}
						initial={{ opacity: 0, x: -8 }}
						animate={{ opacity: 1, x: 0 }}
						className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/5 border border-white/5"
					>
						<div className="flex items-center gap-2.5">
							<CheckCircle2 className={`w-3.5 h-3.5 ${theme.text}`} />
							<span className="text-xs font-bold opacity-70 text-white">
								{lap.label}
							</span>
						</div>
						<span className="text-xs text-white tabular-nums opacity-50">
							{formatTime(lap.duration)}
						</span>
					</motion.div>
				);
			})}
		</div>
	);
}

// ─── Pulse Ring for Speed Phase ──────────────────────────────────────────────

function SpeedPulse() {
	return (
		<div className="absolute inset-0 pointer-events-none flex items-center justify-center">
			{[0, 0.4, 0.8].map((delay) => (
				<span
					key={`pulse-delay-${delay}`}
					className="absolute rounded-full border border-rose-400/30"
					style={{
						width: "110%",
						height: "110%",
						animation: `ping 1.8s ease-out ${delay}s infinite`,
					}}
				/>
			))}
			<style>{`
        @keyframes ping {
          0% { transform: scale(0.85); opacity: 0.6; }
          100% { transform: scale(1.25); opacity: 0; }
        }
      `}</style>
		</div>
	);
}

// ─── Confetti ────────────────────────────────────────────────────────────────

function Confetti() {
	const pieces = Array.from({ length: 40 }, (_, i) => ({
		id: i,
		x: Math.random() * 100,
		color: ["#fbbf24", "#f43f5e", "#34d399", "#60a5fa", "#a78bfa"][
			Math.floor(Math.random() * 5)
		],
		delay: Math.random() * 0.8,
		size: 6 + Math.random() * 8,
		duration: 2.5 + Math.random() * 1.5,
	}));

	return (
		<div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
			{pieces.map((p) => (
				<motion.div
					key={`confetti-${p.id}`}
					className="absolute rounded-sm"
					style={{
						left: `${p.x}%`,
						top: "-2%",
						width: p.size,
						height: p.size,
						background: p.color,
					}}
					initial={{ y: 0, opacity: 1, rotate: 0 }}
					animate={{
						y: "105vh",
						opacity: [1, 1, 0],
						rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
						x: (Math.random() - 0.5) * 200,
					}}
					transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
				/>
			))}
		</div>
	);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(seconds: number) {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ─── Setup Input Card ────────────────────────────────────────────────────────

function SetupCard({
	label,
	icon: Icon,
	color,
	min,
	sec,
	onMinChange,
	onSecChange,
}: {
	label: string;
	icon: any;
	color: string;
	min: number;
	sec: number;
	onMinChange: (v: number) => void;
	onSecChange: (v: number) => void;
}) {
	return (
		<div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:bg-white/[0.08] transition-all">
			<div className="flex items-center gap-4">
				<div className={`p-3.5 rounded-2xl bg-white/10 ${color}`}>
					<Icon className="w-7 h-7" />
				</div>
				<span className="font-bold uppercase text-sm tracking-widest text-white">
					{label}
				</span>
			</div>
			<div className="flex items-center gap-3">
				<div className="flex items-center bg-white/10 border border-white/20 rounded-2xl px-3 py-2 gap-1">
					<input
						type="number"
						inputMode="numeric"
						value={min}
						min={0}
						onChange={(e) =>
							onMinChange(Math.max(0, parseInt(e.target.value, 10) || 0))
						}
						className="w-12 bg-transparent text-center text-white text-xl focus:outline-none tabular-nums"
					/>
					<span className="text-[10px] text-white opacity-40">m</span>
					<div className="w-px h-8 bg-white/15 mx-1" />
					<input
						type="number"
						inputMode="numeric"
						value={sec}
						min={0}
						max={59}
						onChange={(e) =>
							onSecChange(
								Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)),
							)
						}
						className="w-12 bg-transparent text-center text-white text-xl focus:outline-none tabular-nums"
					/>
					<span className="text-[10px] text-white opacity-40">s</span>
				</div>
			</div>
		</div>
	);
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function RunningTimerPage() {
	// Input state
	const [warmupMin, setWarmupMin] = useState(5);
	const [warmupSec, setWarmupSec] = useState(0);
	const [speedMin, setSpeedMin] = useState(1);
	const [speedSec, setSpeedSec] = useState(0);
	const [restMin, setRestMin] = useState(0);
	const [restSec, setRestSec] = useState(30);
	const [reps, setReps] = useState(8);
	const [cooldownMin, setCooldownMin] = useState(5);
	const [cooldownSec, setCooldownSec] = useState(0);

	// Timer state
	const [isActive, setIsActive] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
	const [timeLeft, setTimeLeft] = useState(0);
	const [totalElapsed, setTotalElapsed] = useState(0);
	const [soundEnabled, setSoundEnabled] = useState(true);
	const [wakeLockActive, setWakeLockActive] = useState(false);
	const [isComplete, setIsComplete] = useState(false);
	const [laps, setLaps] = useState<LapEntry[]>([]);
	const [_phaseStartElapsed, setPhaseStartElapsed] = useState(0);

	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const wakeLockRef = useRef<any>(null);
	const audioCtxRef = useRef<AudioContext | null>(null);

	// ── Queue ────────────────────────────────────────────────────────────────

	const queue = useMemo<Phase[]>(() => {
		const q: Phase[] = [];
		const warmupTotal = warmupMin * 60 + warmupSec;
		if (warmupTotal > 0)
			q.push({ type: "warmup", duration: warmupTotal, label: "Warmup" });

		const speedTotal = speedMin * 60 + speedSec;
		const restTotal = restMin * 60 + restSec;
		const cooldownTotal = cooldownMin * 60 + cooldownSec;

		for (let i = 1; i <= reps; i++) {
			if (speedTotal > 0)
				q.push({ type: "speed", duration: speedTotal, label: `Speed #${i}` });
			const isLast = i === reps;
			if (restTotal > 0 && (!isLast || cooldownTotal === 0))
				q.push({ type: "rest", duration: restTotal, label: `Rest #${i}` });
		}

		if (cooldownTotal > 0)
			q.push({ type: "cooldown", duration: cooldownTotal, label: "Cooldown" });

		return q;
	}, [
		warmupMin,
		warmupSec,
		speedMin,
		speedSec,
		restMin,
		restSec,
		reps,
		cooldownMin,
		cooldownSec,
	]);

	const totalSessionSeconds = useMemo(
		() => queue.reduce((a, p) => a + p.duration, 0),
		[queue],
	);

	// ── Audio ────────────────────────────────────────────────────────────────

	const playBeep = useCallback(
		(freq = 440, dur = 0.1, type: OscillatorType = "sine") => {
			if (!soundEnabled) return;
			try {
				if (!audioCtxRef.current)
					audioCtxRef.current = new (
						window.AudioContext || (window as any).webkitAudioContext
					)();
				const ctx = audioCtxRef.current;
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();
				osc.type = type;
				osc.frequency.setValueAtTime(freq, ctx.currentTime);
				gain.gain.setValueAtTime(0.25, ctx.currentTime);
				gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
				osc.connect(gain);
				gain.connect(ctx.destination);
				osc.start();
				osc.stop(ctx.currentTime + dur);
			} catch {}
		},
		[soundEnabled],
	);

	const playPhaseStart = useCallback(
		(type: PhaseType) => {
			const map: Record<PhaseType, [number, number]> = {
				warmup: [523, 0.3],
				speed: [880, 0.25],
				rest: [440, 0.3],
				cooldown: [660, 0.35],
			};
			const [f, d] = map[type];
			playBeep(f, d, "triangle");
			setTimeout(() => playBeep(f * 1.5, d * 0.6, "triangle"), 160);
		},
		[playBeep],
	);

	// ── Wake Lock ────────────────────────────────────────────────────────────

	const requestWakeLock = useCallback(async () => {
		if ("wakeLock" in navigator) {
			try {
				wakeLockRef.current = await (navigator as any).wakeLock.request(
					"screen",
				);
				setWakeLockActive(true);
				wakeLockRef.current.addEventListener("release", () =>
					setWakeLockActive(false),
				);
			} catch {}
		}
	}, []);

	const releaseWakeLock = useCallback(() => {
		wakeLockRef.current?.release();
		wakeLockRef.current = null;
	}, []);

	// ── Controls ─────────────────────────────────────────────────────────────

	const startTimer = () => {
		if (queue.length === 0) return;
		setIsActive(true);
		setIsPaused(false);
		setIsComplete(false);
		setLaps([]);
		setTimeLeft(queue[0].duration);
		setCurrentPhaseIndex(0);
		setTotalElapsed(0);
		setPhaseStartElapsed(0);
		requestWakeLock();
		playPhaseStart(queue[0].type);
	};

	const pauseTimer = () => {
		setIsPaused(true);
		releaseWakeLock();
	};

	const resumeTimer = () => {
		setIsPaused(false);
		requestWakeLock();
	};

	const resetTimer = () => {
		setIsActive(false);
		setIsPaused(false);
		setIsComplete(false);
		setCurrentPhaseIndex(0);
		setTimeLeft(0);
		setTotalElapsed(0);
		setLaps([]);
		releaseWakeLock();
		if (timerRef.current) clearInterval(timerRef.current);
	};

	const skipPhase = () => {
		if (currentPhaseIndex < queue.length - 1) {
			// Log skipped phase
			const current = queue[currentPhaseIndex];
			setLaps((prev) => [
				...prev,
				{
					label: current.label,
					type: current.type,
					duration: current.duration - timeLeft,
					completedAt: totalElapsed,
				},
			]);
			const nextIdx = currentPhaseIndex + 1;
			setCurrentPhaseIndex(nextIdx);
			setTimeLeft(queue[nextIdx].duration);
			setPhaseStartElapsed(totalElapsed);
			playPhaseStart(queue[nextIdx].type);
		} else {
			handleComplete();
		}
	};

	const handleComplete = useCallback(() => {
		setIsActive(false);
		setIsComplete(true);
		releaseWakeLock();
		// Victory sound
		[523, 659, 784, 1047].forEach((f, i) => {
			setTimeout(() => playBeep(f, 0.3, "triangle"), i * 120);
		});
	}, [releaseWakeLock, playBeep]);

	// ── Tick ─────────────────────────────────────────────────────────────────

	useEffect(() => {
		if (isActive && !isPaused) {
			timerRef.current = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev === 3 || prev === 2) playBeep(440, 0.07);
					if (prev === 1) playBeep(880, 0.2, "square");

					if (prev <= 1) {
						// Log completed phase
						setLaps((lapsPrev) => [
							...lapsPrev,
							{
								label: queue[currentPhaseIndex].label,
								type: queue[currentPhaseIndex].type,
								duration: queue[currentPhaseIndex].duration,
								completedAt: totalElapsed + 1,
							},
						]);

						if (currentPhaseIndex < queue.length - 1) {
							const nextIdx = currentPhaseIndex + 1;
							setCurrentPhaseIndex(nextIdx);
							setPhaseStartElapsed((e) => e);
							setTimeout(() => playPhaseStart(queue[nextIdx].type), 50);
							return queue[nextIdx].duration;
						} else {
							setTimeout(handleComplete, 100);
							return 0;
						}
					}
					return prev - 1;
				});
				setTotalElapsed((e) => e + 1);
			}, 1000);
		} else {
			if (timerRef.current) clearInterval(timerRef.current);
		}
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [
		isActive,
		isPaused,
		currentPhaseIndex,
		queue,
		totalElapsed,
		playPhaseStart,
		playBeep,
		handleComplete,
	]);

	// ── Derived ───────────────────────────────────────────────────────────────

	const currentPhase = queue[currentPhaseIndex];
	const nextPhase =
		isActive && currentPhaseIndex < queue.length - 1
			? queue[currentPhaseIndex + 1]
			: null;

	const phaseProgress = currentPhase ? 1 - timeLeft / currentPhase.duration : 0;
	const overallProgress =
		totalSessionSeconds > 0 ? totalElapsed / totalSessionSeconds : 0;

	const theme = isActive
		? PHASE_THEME[currentPhase?.type ?? "warmup"]
		: PHASE_THEME.cooldown;

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<main
			className={`min-h-screen bg-gradient-to-br transition-[background] duration-700 ${
				isComplete
					? "from-emerald-950 via-teal-950 to-emerald-950"
					: isActive
						? theme.bg
						: "from-slate-950 via-slate-900 to-zinc-950"
			} relative overflow-hidden font-sans`}
		>
			{isComplete && <Confetti />}

			{/* Background texture */}
			<div className="absolute inset-0 pointer-events-none">
				<div
					className="absolute inset-0 opacity-[0.03]"
					style={{
						backgroundImage:
							"repeating-linear-gradient(0deg, #fff 0px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #fff 0px, transparent 1px, transparent 40px)",
					}}
				/>
				{isActive && currentPhase?.type === "speed" && <SpeedPulse />}
				<div
					className="absolute -top-1/4 -right-1/4 w-[80%] h-[80%] rounded-full blur-[160px] opacity-10 transition-colors duration-700"
					style={{ background: isActive ? theme.accent : "#6366f1" }}
				/>
				<div
					className="absolute -bottom-1/4 -left-1/4 w-[80%] h-[80%] rounded-full blur-[160px] opacity-10 transition-colors duration-700"
					style={{ background: isActive ? theme.accent : "#3b82f6" }}
				/>
			</div>

			<div className="max-w-xl mx-auto px-5 pt-10 pb-14 relative z-10 flex flex-col min-h-screen">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<Link
						href="/utils"
						className="p-3.5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/20 transition-all active:scale-90 text-white"
					>
						<ArrowLeft className="w-5 h-5" />
					</Link>

					{!isActive && !isComplete && (
						<div className="text-center">
							<h1 className="text-xl text-white tracking-tighter text-white">
								Interval Timer
							</h1>
							{queue.length > 0 && (
								<p className="text-[11px] font-bold uppercase tracking-widest opacity-40 text-white">
									{queue.length} phases · {formatTime(totalSessionSeconds)}
								</p>
							)}
						</div>
					)}

					<div className="flex gap-2">
						<button
							onClick={() => setSoundEnabled((s) => !s)}
							className="p-3.5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 transition-all active:scale-90 text-white"
						>
							{soundEnabled ? (
								<Volume2 className="w-5 h-5" />
							) : (
								<VolumeX className="w-5 h-5" />
							)}
						</button>
						<div className="p-3.5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 opacity-40 text-white">
							{wakeLockActive ? (
								<Lock className="w-5 h-5" />
							) : (
								<Unlock className="w-5 h-5" />
							)}
						</div>
					</div>
				</div>

				{/* ── VIEWS ─────────────────────────────────────────────────────── */}
				<AnimatePresence mode="wait">
					{/* ── COMPLETE ── */}
					{isComplete && (
						<motion.div
							key="complete"
							initial={{ opacity: 0, scale: 0.92 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.4 }}
							className="flex-1 flex flex-col items-center justify-center text-center gap-8"
						>
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ type: "spring", stiffness: 180, delay: 0.2 }}
								className="w-36 h-36 bg-white/10 rounded-full flex items-center justify-center border border-white/20"
							>
								<Trophy className="w-16 h-16 text-white" />
							</motion.div>

							<div>
								<h2 className="text-5xl text-white tracking-tighter text-white">
									Session Done!
								</h2>
								<p className="text-white/50 text-xs font-bold uppercase tracking-[0.4em] mt-2">
									All intervals completed
								</p>
							</div>

							<div className="w-full p-8 bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 space-y-5">
								<div className="flex justify-between items-center text-white">
									<span className="text-xs text-white uppercase tracking-widest opacity-50">
										Total Time
									</span>
									<span className="text-3xl text-white tabular-nums">
										{formatTime(totalSessionSeconds)}
									</span>
								</div>
								<div className="flex justify-between items-center text-white">
									<span className="text-xs text-white uppercase tracking-widest opacity-50">
										Intervals
									</span>
									<span className="text-3xl text-white">{reps}×</span>
								</div>
								<div className="flex justify-between items-center text-white">
									<span className="text-xs text-white uppercase tracking-widest opacity-50">
										Phases Done
									</span>
									<span className="text-3xl text-white">{laps.length}</span>
								</div>
							</div>

							{/* Lap summary */}
							{laps.length > 0 && (
								<div className="w-full space-y-2 max-h-52 overflow-y-auto scrollbar-hide">
									{laps.map((lap, i) => {
										const t = PHASE_THEME[lap.type];
										const Icon = PHASE_ICONS[lap.type];
										return (
											<div
												key={String(i)}
												className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/5 text-white"
											>
												<div className="flex items-center gap-2.5">
													<Icon className={`w-4 h-4 ${t.text}`} />
													<span className="text-sm font-bold opacity-70">
														{lap.label}
													</span>
												</div>
												<span className="text-sm text-white tabular-nums opacity-50">
													{formatTime(lap.duration)}
												</span>
											</div>
										);
									})}
								</div>
							)}

							<button
								onClick={resetTimer}
								className="px-12 py-5 bg-white text-emerald-900 rounded-[2rem] text-white text-lg tracking-tight hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3"
							>
								<RotateCcw className="w-5 h-5" /> New Session
							</button>
						</motion.div>
					)}

					{/* ── SETUP ── */}
					{!isActive && !isComplete && (
						<motion.div
							key="setup"
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.96 }}
							transition={{ duration: 0.35 }}
							className="flex-1 space-y-5"
						>
							<SetupCard
								label="Warmup"
								icon={Flame}
								color="text-amber-400"
								min={warmupMin}
								sec={warmupSec}
								onMinChange={setWarmupMin}
								onSecChange={setWarmupSec}
							/>
							<SetupCard
								label="Speed"
								icon={Zap}
								color="text-rose-400"
								min={speedMin}
								sec={speedSec}
								onMinChange={setSpeedMin}
								onSecChange={setSpeedSec}
							/>
							<SetupCard
								label="Rest"
								icon={TimerReset}
								color="text-emerald-400"
								min={restMin}
								sec={restSec}
								onMinChange={setRestMin}
								onSecChange={setRestSec}
							/>

							{/* Reps */}
							<div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-between hover:bg-white/[0.08] transition-all">
								<div className="flex items-center gap-4">
									<div className="p-3.5 rounded-2xl bg-white/10 text-blue-400">
										<Dumbbell className="w-7 h-7" />
									</div>
									<span className="text-white uppercase text-sm tracking-widest text-white">
										Repetitions
									</span>
								</div>
								<div className="flex items-center gap-2">
									<button
										onClick={() => setReps((r) => Math.max(1, r - 1))}
										className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 text-white text-white text-lg hover:bg-white/20 active:scale-90 transition-all flex items-center justify-center"
									>
										−
									</button>
									<span className="w-10 text-center text-white text-2xl text-white tabular-nums">
										{reps}
									</span>
									<button
										onClick={() => setReps((r) => r + 1)}
										className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 text-white text-white text-lg hover:bg-white/20 active:scale-90 transition-all flex items-center justify-center"
									>
										+
									</button>
								</div>
							</div>

							<SetupCard
								label="Cooldown"
								icon={Activity}
								color="text-blue-400"
								min={cooldownMin}
								sec={cooldownSec}
								onMinChange={setCooldownMin}
								onSecChange={setCooldownSec}
							/>

							{/* Session summary strip */}
							{queue.length > 0 && (
								<div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
									<PhaseTimeline queue={queue} currentIndex={-1} />
									<p className="text-center text-xs text-white/30 font-bold mt-3 !text-white">
										{queue.length} phases · {formatTime(totalSessionSeconds)}{" "}
										total
									</p>
								</div>
							)}

							<button
								onClick={startTimer}
								disabled={queue.length === 0}
								className="w-full py-7 bg-white text-black rounded-[2.5rem] text-xl tracking-tighter hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-40"
							>
								<Play className="w-7 h-7 fill-current" /> Start Session
							</button>
						</motion.div>
					)}

					{/* ── ACTIVE ── */}
					{isActive && (
						<motion.div
							key={`active-${currentPhaseIndex}`}
							initial={{ opacity: 0, scale: 1.04 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.96 }}
							transition={{ duration: 0.45 }}
							className="flex-1 flex flex-col items-center justify-between text-center gap-4"
						>
							{/* Phase label + step */}
							<div className="space-y-2">
								<span
									className={`inline-block px-5 py-1.5 rounded-full border text-xs text-white uppercase tracking-[0.3em] backdrop-blur-xl ${
										theme.pill
									}`}
								>
									{currentPhaseIndex + 1} / {queue.length}
								</span>
								<motion.h2
									key={currentPhase.label}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									className="text-4xl text-white tracking-tighter text-white"
								>
									{currentPhase.label}
								</motion.h2>
							</div>

							{/* Circular ring countdown */}
							<div className="relative">
								<CountdownRing
									progress={phaseProgress}
									color={theme.ring}
									size={280}
									strokeWidth={8}
								>
									<motion.span
										key={timeLeft}
										initial={{ scale: 0.92, opacity: 0.5 }}
										animate={{ scale: 1, opacity: 1 }}
										className="text-7xl text-white tabular-nums text-white drop-shadow-xl"
									>
										{formatTime(timeLeft)}
									</motion.span>
									<span
										className={`text-xs text-white uppercase tracking-widest mt-1 ${theme.text}`}
									>
										{isPaused ? "Paused" : currentPhase.type}
									</span>
								</CountdownRing>
							</div>

							{/* Next phase preview */}
							<div className="h-9 flex items-center justify-center">
								<AnimatePresence>
									{nextPhase && !isPaused && (
										<NextPhasePreview phase={nextPhase} />
									)}
								</AnimatePresence>
							</div>

							{/* Overall progress bar + timeline */}
							<div className="w-full space-y-3 px-1">
								<PhaseTimeline queue={queue} currentIndex={currentPhaseIndex} />
								<div className="h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
									<motion.div
										className="h-full rounded-full"
										style={{ background: theme.ring }}
										animate={{ width: `${overallProgress * 100}%` }}
										transition={{ duration: 1 }}
									/>
								</div>
								<div className="flex justify-between text-[10px] text-white uppercase tracking-widest text-white/40 px-1">
									<span>{formatTime(totalElapsed)} elapsed</span>
									<span>
										{formatTime(totalSessionSeconds - totalElapsed)} left
									</span>
								</div>
							</div>

							{/* Lap log */}
							<LapLog laps={laps} />

							{/* Controls */}
							<div className="flex items-center gap-5 pb-2">
								<button
									onClick={resetTimer}
									className="p-5 bg-white/10 backdrop-blur-xl rounded-[1.5rem] border border-white/10 text-white hover:bg-white/20 transition-all active:scale-90"
								>
									<RotateCcw className="w-7 h-7" />
								</button>
								<button
									onClick={isPaused ? resumeTimer : pauseTimer}
									className="p-12 bg-white text-black rounded-[2.5rem] shadow-2xl hover:scale-105 transition-all active:scale-90"
								>
									{isPaused ? (
										<Play className="w-12 h-12 fill-current" />
									) : (
										<Pause className="w-12 h-12 fill-current" />
									)}
								</button>
								<button
									onClick={skipPhase}
									className="p-5 bg-white/10 backdrop-blur-xl rounded-[1.5rem] border border-white/10 text-white hover:bg-white/20 transition-all active:scale-90"
								>
									<SkipForward className="w-7 h-7" />
								</button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</main>
	);
}
