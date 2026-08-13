"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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
	Zap,
	Sparkles,
	Clock,
	Plus,
	Minus,
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
		bg: "bg-amber-950",
		accent: "#f59e0b",
		ring: "#fbbf24",
		pill: "bg-amber-500/20 text-amber-300 border-amber-500/30",
		text: "text-amber-300",
	},
	speed: {
		bg: "bg-rose-950",
		accent: "#f43f5e",
		ring: "#fb7185",
		pill: "bg-rose-500/20 text-rose-300 border-rose-500/30",
		text: "text-rose-300",
	},
	rest: {
		bg: "bg-emerald-950",
		accent: "#10b981",
		ring: "#34d399",
		pill: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
		text: "text-emerald-300",
	},
	cooldown: {
		bg: "bg-blue-950",
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
	size = 300,
	strokeWidth = 9,
	children,
	onClick,
}: {
	progress: number; // 0–1
	color: string;
	size?: number;
	strokeWidth?: number;
	children?: React.ReactNode;
	onClick?: () => void;
}) {
	const r = (size - strokeWidth * 2) / 2;
	const circ = 2 * Math.PI * r;
	const offset = circ * (1 - Math.max(0, Math.min(1, progress)));

	return (
		<div
			className={`relative group ${onClick ? "cursor-pointer" : ""}`}
			style={{ width: size, height: size }}
			onClick={onClick}
		>
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				className="-rotate-90 transition-transform duration-500 group-hover:scale-[1.02]"
			>
				{/* Ambient back glow */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={r}
					fill="none"
					stroke={color}
					strokeWidth={strokeWidth * 1.5}
					strokeOpacity={0.15}
					className="blur-xs"
				/>
				{/* Track */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={r}
					fill="none"
					stroke="rgba(255,255,255,0.08)"
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
					<filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
						<feGaussianBlur stdDeviation="8" result="blur" />
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
	const isSetup = currentIndex === -1;

	return (
		<div className="w-full max-w-xl px-1 space-y-1.5">
			<div className="flex h-3.5 rounded-2xl overflow-hidden gap-[3px] bg-black/30 p-1 border border-white/10 shadow-inner">
				{queue.map((phase, i) => {
					const w = (phase.duration / total) * 100;
					const colors = {
						warmup:
							i < currentIndex
								? "bg-amber-500/50"
								: i === currentIndex
									? "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]"
									: isSetup
										? "bg-amber-500/80"
										: "bg-amber-950/40",
						speed:
							i < currentIndex
								? "bg-rose-500/50"
								: i === currentIndex
									? "bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.8)]"
									: isSetup
										? "bg-rose-500/80"
										: "bg-rose-950/40",
						rest:
							i < currentIndex
								? "bg-emerald-500/50"
								: i === currentIndex
									? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
									: isSetup
										? "bg-emerald-500/80"
										: "bg-emerald-950/40",
						cooldown:
							i < currentIndex
								? "bg-blue-500/50"
								: i === currentIndex
									? "bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)]"
									: isSetup
										? "bg-blue-500/80"
										: "bg-blue-950/40",
					};
					return (
						<div
							key={`timeline-${phase.label}-${phase.duration}-${i}`}
							className={`${colors[phase.type]} rounded-xs transition-all duration-500 relative ${
								i === currentIndex ? "scale-y-110 z-10" : ""
							}`}
							style={{ width: `${w}%` }}
							title={`${phase.label} (${formatTime(phase.duration)})`}
						/>
					);
				})}
			</div>
		</div>
	);
}

// ─── Next Phase Preview ──────────────────────────────────────────────────────

function NextPhasePreview({ phase }: { phase: Phase }) {
	const reduceMotion = useReducedMotion();
	const theme = PHASE_THEME[phase.type];
	const Icon = PHASE_ICONS[phase.type];
	return (
		<motion.div
			initial={reduceMotion ? false : { opacity: 0, y: 6 }}
			animate={{ opacity: 1, y: 0 }}
			className={`flex items-center gap-2.5 px-4 py-1.5 rounded-full border backdrop-blur-2xl ${theme.pill} text-xs font-bold text-white tracking-wide shadow-lg`}
		>
			<span className="text-[10px] uppercase font-black tracking-widest opacity-60">
				Up Next
			</span>
			<div className="w-px h-3 bg-white/20" />
			<Icon className="w-3.5 h-3.5" />
			<span>{phase.label}</span>
			<span className="text-[11px] font-mono opacity-80 tabular-nums">
				({formatTime(phase.duration)})
			</span>
		</motion.div>
	);
}

// ─── Lap History ─────────────────────────────────────────────────────────────

function LapLog({ laps }: { laps: LapEntry[] }) {
	const reduceMotion = useReducedMotion();
	if (laps.length === 0) return null;
	return (
		<div className="w-full max-w-md space-y-1.5 max-h-36 overflow-y-auto scrollbar-hide pr-1">
			<div className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 mb-1 text-left px-1">
				Completed Laps ({laps.length})
			</div>
			{[...laps].reverse().map((lap, idx) => {
				const theme = PHASE_THEME[lap.type];
				const Icon = PHASE_ICONS[lap.type];
				return (
					<motion.div
						key={`lap-${lap.completedAt}-${idx}`}
						initial={reduceMotion ? false : { opacity: 0, x: -8 }}
						animate={{ opacity: 1, x: 0 }}
						className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
					>
						<div className="flex items-center gap-2.5">
							<Icon className={`w-3.5 h-3.5 ${theme.text}`} />
							<span className="text-xs font-extrabold text-white/90">
								{lap.label}
							</span>
						</div>
						<div className="flex items-center gap-3">
							<span className="text-[10px] font-semibold text-white/40 uppercase">
								@ {formatTime(lap.completedAt)}
							</span>
							<span className="text-xs text-white font-mono font-bold tabular-nums">
								{formatTime(lap.duration)}
							</span>
						</div>
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

// ─── Preset Configs ─────────────────────────────────────────────────────────

interface WorkoutPreset {
	id: string;
	name: string;
	desc: string;
	warmupMin: number;
	warmupSec: number;
	speedMin: number;
	speedSec: number;
	restMin: number;
	restSec: number;
	reps: number;
	cooldownMin: number;
	cooldownSec: number;
}

const WORKOUT_PRESETS: WorkoutPreset[] = [
	{
		id: "hiit-20-10",
		name: "HIIT 20/10",
		desc: "8× 20s work / 10s rest",
		warmupMin: 3,
		warmupSec: 0,
		speedMin: 0,
		speedSec: 20,
		restMin: 0,
		restSec: 10,
		reps: 8,
		cooldownMin: 3,
		cooldownSec: 0,
	},
	{
		id: "track-400m",
		name: "4×400m Repeats",
		desc: "4× 1m30s speed / 1m rest",
		warmupMin: 5,
		warmupSec: 0,
		speedMin: 1,
		speedSec: 30,
		restMin: 1,
		restSec: 0,
		reps: 4,
		cooldownMin: 5,
		cooldownSec: 0,
	},
	{
		id: "sprint-30-30",
		name: "30/30 Sprints",
		desc: "10× 30s sprint / 30s rest",
		warmupMin: 5,
		warmupSec: 0,
		speedMin: 0,
		speedSec: 30,
		restMin: 0,
		restSec: 30,
		reps: 10,
		cooldownMin: 5,
		cooldownSec: 0,
	},
	{
		id: "tabata",
		name: "Tabata Protocol",
		desc: "Classic 4-min Tabata",
		warmupMin: 2,
		warmupSec: 0,
		speedMin: 0,
		speedSec: 20,
		restMin: 0,
		restSec: 10,
		reps: 8,
		cooldownMin: 2,
		cooldownSec: 0,
	},
];

// ─── Setup Input Card ────────────────────────────────────────────────────────

function SetupCard({
	label,
	icon: Icon,
	color,
	bgColor,
	min,
	sec,
	onMinChange,
	onSecChange,
}: {
	label: string;
	icon: any;
	color: string;
	bgColor: string;
	min: number;
	sec: number;
	onMinChange: (v: number) => void;
	onSecChange: (v: number) => void;
}) {
	const stepTime = (deltaSec: number) => {
		const currentTotal = min * 60 + sec;
		const nextTotal = Math.max(0, currentTotal + deltaSec);
		onMinChange(Math.floor(nextTotal / 60));
		onSecChange(nextTotal % 60);
	};

	return (
		<div className="p-4 sm:p-5 bg-white border border-slate-200/80 rounded-3xl shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
			<div className="flex items-center gap-3.5">
				<div className={`p-3 rounded-2xl border ${bgColor} ${color}`}>
					<Icon className="w-5 h-5 sm:w-6 sm:h-6" />
				</div>
				<div>
					<span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 block">
						{label}
					</span>
					<span className="text-[11px] font-semibold text-slate-500">
						{formatTime(min * 60 + sec)}
					</span>
				</div>
			</div>

			<div className="flex items-center gap-2 self-end sm:self-auto">
				{/* Quick steppers for mobile & touch accessibility */}
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={() => stepTime(-15)}
						className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 font-bold text-xs hover:bg-slate-200 active:scale-90 transition-all flex items-center justify-center cursor-pointer"
						title="-15 seconds"
					>
						-15s
					</button>
					<button
						type="button"
						onClick={() => stepTime(15)}
						className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 font-bold text-xs hover:bg-slate-200 active:scale-90 transition-all flex items-center justify-center cursor-pointer"
						title="+15 seconds"
					>
						+15s
					</button>
				</div>

				<div className="flex items-center bg-slate-50/80 border border-slate-200/80 rounded-xl px-2.5 py-1.5 gap-1 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all">
					<input
						type="number"
						inputMode="numeric"
						value={min}
						min={0}
						onChange={(e) =>
							onMinChange(Math.max(0, parseInt(e.target.value, 10) || 0))
						}
						className="w-9 bg-transparent text-center text-slate-900 font-black text-sm sm:text-base focus:outline-none tabular-nums"
					/>
					<span className="text-xs font-bold text-slate-400">m</span>
					<div className="w-px h-5 bg-slate-200/80 mx-0.5" />
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
						className="w-9 bg-transparent text-center text-slate-900 font-black text-sm sm:text-base focus:outline-none tabular-nums"
					/>
					<span className="text-xs font-bold text-slate-400">s</span>
				</div>
			</div>
		</div>
	);
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function TimerView() {
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

	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const wakeLockRef = useRef<any>(null);
	const audioCtxRef = useRef<AudioContext | null>(null);

	// Background persistence refs
	const phaseStartTimeRef = useRef<number>(0);
	const sessionStartTimeRef = useRef<number>(0);
	const pausedTimeLeftRef = useRef<number>(0);
	const pausedTotalElapsedRef = useRef<number>(0);

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
			if (restTotal > 0)
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

	const totalWorkSeconds = useMemo(
		() => reps * (speedMin * 60 + speedSec),
		[reps, speedMin, speedSec],
	);

	const totalRestSeconds = useMemo(
		() => reps * (restMin * 60 + restSec),
		[reps, restMin, restSec],
	);

	const workRestRatioLabel = useMemo(() => {
		if (totalWorkSeconds === 0) return "Setup Workout";
		if (totalRestSeconds === 0) return "100% Work";
		const ratio = (totalWorkSeconds / totalRestSeconds).toFixed(1);
		return `${ratio}:1 Work:Rest`;
	}, [totalWorkSeconds, totalRestSeconds]);

	const applyPreset = useCallback((preset: WorkoutPreset) => {
		setWarmupMin(preset.warmupMin);
		setWarmupSec(preset.warmupSec);
		setSpeedMin(preset.speedMin);
		setSpeedSec(preset.speedSec);
		setRestMin(preset.restMin);
		setRestSec(preset.restSec);
		setReps(preset.reps);
		setCooldownMin(preset.cooldownMin);
		setCooldownSec(preset.cooldownSec);
	}, []);

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
		const now = Date.now();
		setIsActive(true);
		setIsPaused(false);
		setIsComplete(false);
		setLaps([]);
		setTimeLeft(queue[0].duration);
		setCurrentPhaseIndex(0);
		setTotalElapsed(0);
		phaseStartTimeRef.current = now;
		sessionStartTimeRef.current = now;
		requestWakeLock();
		playPhaseStart(queue[0].type);
	};

	const pauseTimer = () => {
		setIsPaused(true);
		pausedTimeLeftRef.current = timeLeft;
		pausedTotalElapsedRef.current = totalElapsed;
		releaseWakeLock();
	};

	const resumeTimer = () => {
		const now = Date.now();
		phaseStartTimeRef.current =
			now -
			(queue[currentPhaseIndex].duration - pausedTimeLeftRef.current) * 1000;
		sessionStartTimeRef.current = now - pausedTotalElapsedRef.current * 1000;
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
			const now = Date.now();
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
			const nextDuration = queue[nextIdx].duration;
			setTimeLeft(nextDuration);
			phaseStartTimeRef.current = now;
			// sessionStartTime adjustment happens in next tick calculation
			playPhaseStart(queue[nextIdx].type);
		} else {
			handleComplete();
		}
	};

	const adjustTime = useCallback(
		(deltaSeconds: number) => {
			if (!isActive || queue.length === 0) return;
			const currentPhase = queue[currentPhaseIndex];
			if (!currentPhase) return;

			if (isPaused) {
				const nextLeft = Math.max(0, pausedTimeLeftRef.current + deltaSeconds);
				pausedTimeLeftRef.current = nextLeft;
				setTimeLeft(nextLeft);
			} else {
				phaseStartTimeRef.current += deltaSeconds * 1000;
				const now = Date.now();
				const elapsedInPhase = Math.floor(
					(now - phaseStartTimeRef.current) / 1000,
				);
				const newTimeLeft = Math.max(0, currentPhase.duration - elapsedInPhase);
				setTimeLeft(newTimeLeft);
			}
		},
		[isActive, isPaused, queue, currentPhaseIndex],
	);

	const handleComplete = useCallback(() => {
		setIsActive(false);
		setIsComplete(true);
		releaseWakeLock();
		// Victory sound
		[523, 659, 784, 1047].forEach((f, i) => {
			setTimeout(() => playBeep(f, 0.3, "triangle"), i * 120);
		});
	}, [releaseWakeLock, playBeep]);

	// ── Sync Logic ───────────────────────────────────────────────────────────

	const syncTimer = useCallback(() => {
		if (!isActive || isPaused || isComplete) return;

		const now = Date.now();
		const currentPhase = queue[currentPhaseIndex];
		const elapsedInPhase = Math.floor((now - phaseStartTimeRef.current) / 1000);
		const newTimeLeft = Math.max(0, currentPhase.duration - elapsedInPhase);
		const newTotalElapsed = Math.floor(
			(now - sessionStartTimeRef.current) / 1000,
		);

		if (newTimeLeft === 0) {
			// Phase finished while in background or during tick
			setLaps((lapsPrev) => [
				...lapsPrev,
				{
					label: queue[currentPhaseIndex].label,
					type: queue[currentPhaseIndex].type,
					duration: queue[currentPhaseIndex].duration,
					completedAt: newTotalElapsed,
				},
			]);

			if (currentPhaseIndex < queue.length - 1) {
				const nextIdx = currentPhaseIndex + 1;
				setCurrentPhaseIndex(nextIdx);
				phaseStartTimeRef.current = now;
				setTimeLeft(queue[nextIdx].duration);
				setTimeout(() => playPhaseStart(queue[nextIdx].type), 50);
			} else {
				handleComplete();
			}
		} else {
			setTimeLeft(newTimeLeft);
			setTotalElapsed(newTotalElapsed);

			// Sound alerts
			if (newTimeLeft === 3 || newTimeLeft === 2) playBeep(440, 0.07);
			if (newTimeLeft === 1) playBeep(880, 0.2, "square");
		}
	}, [
		isActive,
		isPaused,
		isComplete,
		currentPhaseIndex,
		queue,
		handleComplete,
		playPhaseStart,
		playBeep,
	]);

	// ── Tick ─────────────────────────────────────────────────────────────────

	useEffect(() => {
		if (isActive && !isPaused) {
			timerRef.current = setInterval(syncTimer, 1000);
		} else {
			if (timerRef.current) clearInterval(timerRef.current);
		}
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [isActive, isPaused, syncTimer]);

	// ── Visibility Change ────────────────────────────────────────────────────

	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				syncTimer();
			}
		};
		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () =>
			document.removeEventListener("visibilitychange", handleVisibilityChange);
	}, [syncTimer]);

	// ── Derived ───────────────────────────────────────────────────────────────

	const currentPhase = queue[currentPhaseIndex];
	const PhaseIcon = currentPhase ? PHASE_ICONS[currentPhase.type] : null;
	const nextPhase =
		isActive && currentPhaseIndex < queue.length - 1
			? queue[currentPhaseIndex + 1]
			: null;

	const phaseProgress = currentPhase ? 1 - timeLeft / currentPhase.duration : 0;
	const overallProgress =
		totalSessionSeconds > 0 ? totalElapsed / totalSessionSeconds : 0;

	const finishEta = useMemo(() => {
		if (!isActive || totalSessionSeconds === 0) return null;
		const remainingSec = Math.max(0, totalSessionSeconds - totalElapsed);
		const etaDate = new Date(Date.now() + remainingSec * 1000);
		return etaDate.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	}, [isActive, totalSessionSeconds, totalElapsed]);

	const theme = isActive
		? PHASE_THEME[currentPhase?.type ?? "warmup"]
		: PHASE_THEME.cooldown;

	const reduceMotion = useReducedMotion();

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<main
			className={`min-h-screen transition-[background] duration-700 ${
				isComplete
					? "bg-emerald-950"
					: isActive
						? theme.bg
						: "bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32 pt-24 sm:pt-32 px-4 sm:px-6 lg:px-8"
			} font-sans`}
		>
			{isComplete && <Confetti />}

			{/* Background texture (active/complete modes) */}
			{(isActive || isComplete) && (
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
			)}

			<div
				className={`max-w-xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col ${isActive || isComplete ? "min-h-screen pt-10 pb-14" : ""}`}
			>
				{/* Header */}
				{!isActive && !isComplete ? (
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
						<div className="space-y-3">
							<Link
								href="/utils"
								className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 transition-colors gap-2 group !no-underline"
							>
								<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
								Back to Utilities
							</Link>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-md shrink-0">
									<Activity className="w-5 h-5 text-indigo-400" />
								</div>
								<div>
									<h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
										Running <span className="text-indigo-600">Timer</span>
									</h1>
									<p className="text-xs font-semibold text-slate-600 mt-0.5">
										Interval workout timer with wake-lock & sound alerts.
									</p>
								</div>
							</div>
						</div>

						<div className="flex items-center gap-2 self-start sm:self-auto">
							<button
								onClick={() => setSoundEnabled((s) => !s)}
								className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
								title="Toggle Sound"
							>
								{soundEnabled ? (
									<Volume2 className="w-4 h-4 text-indigo-600" />
								) : (
									<VolumeX className="w-4 h-4 text-slate-400" />
								)}
								<span>{soundEnabled ? "Audio ON" : "Muted"}</span>
							</button>
							<div
								className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 shadow-xs"
								title="Wake Lock Status"
							>
								{wakeLockActive ? (
									<Lock className="w-4 h-4 text-emerald-600" />
								) : (
									<Unlock className="w-4 h-4 text-slate-400" />
								)}
								<span>{wakeLockActive ? "Screen Awake" : "Wake Lock"}</span>
							</div>
						</div>
					</div>
				) : (
					<div className="flex items-center justify-between mb-8">
						<Link
							href="/utils"
							className="p-3.5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/20 transition-all active:scale-90 text-white"
						>
							<ArrowLeft className="w-5 h-5" />
						</Link>

						<div className="flex gap-2">
							<button
								onClick={() => setSoundEnabled((s) => !s)}
								className="p-3.5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 transition-all active:scale-90 text-white cursor-pointer"
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
				)}

				{/* ── VIEWS ─────────────────────────────────────────────────────── */}
				<AnimatePresence mode="wait">
					{/* ── COMPLETE ── */}
					{isComplete && (
						<motion.div
							key="complete"
							initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.4 }}
							className="flex-1 flex flex-col items-center justify-center text-center gap-6"
						>
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ type: "spring", stiffness: 180, delay: 0.2 }}
								className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center border border-white/20 shadow-2xl backdrop-blur-xl"
							>
								<Trophy className="w-14 h-14 text-amber-300 drop-shadow-lg" />
							</motion.div>

							<div>
								<h2 className="text-4xl sm:text-5xl tracking-tight text-white font-black">
									Session Complete!
								</h2>
								<p className="text-xs font-extrabold uppercase tracking-widest mt-2 text-emerald-300">
									All interval phases finished
								</p>
							</div>

							<div className="w-full p-6 bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/10 space-y-4 shadow-2xl">
								<div className="grid grid-cols-2 gap-3 pb-3 border-b border-white/10">
									<div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-left">
										<span className="text-[10px] text-white uppercase tracking-widest opacity-60 font-bold block">
											Total Time
										</span>
										<span className="text-2xl text-white font-black tabular-nums">
											{formatTime(totalSessionSeconds)}
										</span>
									</div>
									<div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-left">
										<span className="text-[10px] text-white uppercase tracking-widest opacity-60 font-bold block">
											Work Time
										</span>
										<span className="text-2xl text-rose-300 font-black tabular-nums">
											{formatTime(totalWorkSeconds)}
										</span>
									</div>
								</div>

								<div className="flex justify-between items-center text-white px-1">
									<span className="text-xs uppercase tracking-widest opacity-60 font-bold">
										Interval Reps
									</span>
									<span className="text-xl font-black">{reps}× cycles</span>
								</div>
								<div className="flex justify-between items-center text-white px-1">
									<span className="text-xs uppercase tracking-widest opacity-60 font-bold">
										Work:Rest Ratio
									</span>
									<span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
										{workRestRatioLabel}
									</span>
								</div>
								<div className="flex justify-between items-center text-white px-1">
									<span className="text-xs uppercase tracking-widest opacity-60 font-bold">
										Phases Logged
									</span>
									<span className="text-xl font-black">{laps.length}</span>
								</div>
							</div>

							{/* Lap summary */}
							{laps.length > 0 && (
								<div className="w-full space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
									{laps.map((lap, i) => {
										const t = PHASE_THEME[lap.type];
										const Icon = PHASE_ICONS[lap.type];
										return (
											<div
												key={`lap-complete-${lap.completedAt}-${i}`}
												className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/5 border border-white/5 text-white"
											>
												<div className="flex items-center gap-2.5">
													<Icon className={`w-4 h-4 ${t.text}`} />
													<span className="text-xs font-extrabold opacity-80">
														{lap.label}
													</span>
												</div>
												<span className="text-xs text-white tabular-nums opacity-60 font-bold">
													{formatTime(lap.duration)}
												</span>
											</div>
										);
									})}
								</div>
							)}

							<button
								type="button"
								onClick={resetTimer}
								className="w-full sm:w-auto px-10 py-4 bg-white text-emerald-950 rounded-2xl text-sm font-black uppercase tracking-wider hover:bg-slate-100 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 cursor-pointer"
							>
								<RotateCcw className="w-5 h-5" /> Start New Workout Session
							</button>
						</motion.div>
					)}

					{/* ── SETUP ── */}
					{!isActive && !isComplete && (
						<motion.div
							key="setup"
							initial={reduceMotion ? false : { opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.96 }}
							transition={{ duration: 0.35 }}
							className="flex-1 space-y-4"
						>
							{/* Quick Workout Presets */}
							<div className="space-y-2 mb-2">
								<div className="flex items-center justify-between px-1">
									<span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
										<Sparkles className="w-3.5 h-3.5 text-indigo-600" />
										Quick Presets
									</span>
									<span className="text-[10px] font-bold text-slate-400">
										Tap to load preset
									</span>
								</div>
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
									{WORKOUT_PRESETS.map((preset) => (
										<button
											key={preset.id}
											type="button"
											onClick={() => applyPreset(preset)}
											className="p-3 bg-white border border-slate-200/80 rounded-2xl text-left hover:border-indigo-300 hover:shadow-xs active:scale-95 transition-all group cursor-pointer"
										>
											<div className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
												{preset.name}
											</div>
											<div className="text-[10px] font-semibold text-slate-500 truncate mt-0.5">
												{preset.desc}
											</div>
										</button>
									))}
								</div>
							</div>

							<SetupCard
								label="Warmup"
								icon={Flame}
								color="text-amber-600"
								bgColor="bg-amber-50 border-amber-100"
								min={warmupMin}
								sec={warmupSec}
								onMinChange={setWarmupMin}
								onSecChange={setWarmupSec}
							/>
							<SetupCard
								label="Speed"
								icon={Zap}
								color="text-rose-600"
								bgColor="bg-rose-50 border-rose-100"
								min={speedMin}
								sec={speedSec}
								onMinChange={setSpeedMin}
								onSecChange={setSpeedSec}
							/>
							<SetupCard
								label="Rest"
								icon={TimerReset}
								color="text-emerald-600"
								bgColor="bg-emerald-50 border-emerald-100"
								min={restMin}
								sec={restSec}
								onMinChange={setRestMin}
								onSecChange={setRestSec}
							/>

							{/* Reps */}
							<div className="p-4 sm:p-5 bg-white border border-slate-200/80 rounded-3xl shadow-xs hover:shadow-md transition-all flex items-center justify-between">
								<div className="flex items-center gap-3.5">
									<div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
										<Dumbbell className="w-5 h-5 sm:w-6 sm:h-6" />
									</div>
									<div>
										<span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 block">
											Repetitions
										</span>
										<span className="text-[11px] font-semibold text-slate-500">
											{reps} interval cycles
										</span>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={() => setReps((r) => Math.max(1, r - 1))}
										className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 font-extrabold text-base hover:bg-slate-200 active:scale-90 transition-all flex items-center justify-center cursor-pointer"
										title="Decrease Reps"
									>
										<Minus className="w-4 h-4" />
									</button>
									<span className="w-8 text-center text-slate-900 font-black text-xl tabular-nums">
										{reps}
									</span>
									<button
										type="button"
										onClick={() => setReps((r) => r + 1)}
										className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 font-extrabold text-base hover:bg-slate-200 active:scale-90 transition-all flex items-center justify-center cursor-pointer"
										title="Increase Reps"
									>
										<Plus className="w-4 h-4" />
									</button>
								</div>
							</div>

							<SetupCard
								label="Cooldown"
								icon={Activity}
								color="text-blue-600"
								bgColor="bg-blue-50 border-blue-100"
								min={cooldownMin}
								sec={cooldownSec}
								onMinChange={setCooldownMin}
								onSecChange={setCooldownSec}
							/>

							{/* Workout Intelligence Summary */}
							{queue.length > 0 && (
								<div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-3">
									<div className="flex items-center justify-between border-b border-slate-100 pb-3">
										<div className="flex items-center gap-2">
											<Clock className="w-4 h-4 text-indigo-600" />
											<span className="text-xs font-black uppercase tracking-wider text-slate-700">
												Workout Intelligence
											</span>
										</div>
										<span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-extrabold text-indigo-600">
											{workRestRatioLabel}
										</span>
									</div>

									<PhaseTimeline queue={queue} currentIndex={-1} />

									<div className="grid grid-cols-3 gap-2 pt-1 text-center">
										<div className="p-2 bg-slate-50/80 rounded-2xl border border-slate-100">
											<span className="text-[10px] font-bold text-slate-400 block uppercase">
												Total Time
											</span>
											<span className="text-sm font-black text-slate-900 tabular-nums">
												{formatTime(totalSessionSeconds)}
											</span>
										</div>
										<div className="p-2 bg-slate-50/80 rounded-2xl border border-slate-100">
											<span className="text-[10px] font-bold text-slate-400 block uppercase">
												Work Time
											</span>
											<span className="text-sm font-black text-rose-600 tabular-nums">
												{formatTime(totalWorkSeconds)}
											</span>
										</div>
										<div className="p-2 bg-slate-50/80 rounded-2xl border border-slate-100">
											<span className="text-[10px] font-bold text-slate-400 block uppercase">
												Rest Time
											</span>
											<span className="text-sm font-black text-emerald-600 tabular-nums">
												{formatTime(totalRestSeconds)}
											</span>
										</div>
									</div>
								</div>
							)}

							<button
								type="button"
								onClick={startTimer}
								disabled={queue.length === 0}
								className="w-full py-4 sm:py-5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-3xl text-sm sm:text-base font-extrabold tracking-wider uppercase transition-all active:scale-[0.98] shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 cursor-pointer"
							>
								<Play className="w-5 h-5 fill-current" /> Start Workout Session
							</button>
						</motion.div>
					)}

					{/* ── ACTIVE ── */}
					{isActive && (
						<motion.div
							key={`active-${currentPhaseIndex}`}
							initial={reduceMotion ? false : { opacity: 0, scale: 1.02 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.98 }}
							transition={{ duration: 0.4 }}
							className="flex-1 flex flex-col items-center justify-between text-center gap-4 sm:gap-5 py-2"
						>
							{/* Top Bar: Status Badge + Controls */}
							<div className="w-full flex items-center justify-between px-1">
								<div className="flex items-center gap-2">
									<div
										className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-xl text-xs font-black uppercase tracking-wider ${
											isPaused
												? "bg-amber-500/20 text-amber-300 border-amber-500/30"
												: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
										}`}
									>
										<span
											className={`w-2 h-2 rounded-full ${
												isPaused
													? "bg-amber-400"
													: "bg-emerald-400 animate-ping"
											}`}
										/>
										<span>{isPaused ? "Paused" : "Live Session"}</span>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={() => setSoundEnabled((s) => !s)}
										className="p-2.5 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 rounded-xl text-white transition-all cursor-pointer"
										title="Toggle Audio Beeps"
									>
										{soundEnabled ? (
											<Volume2 className="w-4 h-4 text-emerald-400" />
										) : (
											<VolumeX className="w-4 h-4 text-white/40" />
										)}
									</button>
									<div
										className="p-2.5 bg-white/10 border border-white/15 rounded-xl text-white/70"
										title="Wake Lock (Screen Awake)"
									>
										{wakeLockActive ? (
											<Lock className="w-4 h-4 text-emerald-400" />
										) : (
											<Unlock className="w-4 h-4 text-white/30" />
										)}
									</div>
								</div>
							</div>

							{/* Phase label & Rep step pill */}
							<div className="space-y-2">
								<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-[0.25em] backdrop-blur-xl bg-white/10 border-white/15 text-white/90 shadow-md">
									{PhaseIcon && (
										<PhaseIcon className={`w-3.5 h-3.5 ${theme.text}`} />
									)}
									<span>
										Phase {currentPhaseIndex + 1} of {queue.length}
									</span>
								</div>
								<motion.h2
									key={currentPhase.label}
									initial={reduceMotion ? false : { opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									className="text-4xl sm:text-6xl font-black text-white tracking-tight drop-shadow-lg"
								>
									{currentPhase.label}
								</motion.h2>
							</div>

							{/* Hero Ring & Countdown Display */}
							<div className="relative my-1 flex flex-col items-center">
								<CountdownRing
									progress={phaseProgress}
									color={theme.ring}
									size={290}
									strokeWidth={9}
									onClick={isPaused ? resumeTimer : pauseTimer}
								>
									<span
										className={`text-[11px] font-black uppercase tracking-[0.3em] mb-1 px-3 py-0.5 rounded-full bg-white/10 border border-white/10 ${theme.text}`}
									>
										{isPaused ? "Paused" : `${currentPhase.type} mode`}
									</span>

									<motion.span
										key={timeLeft}
										initial={
											reduceMotion ? false : { scale: 0.94, opacity: 0.7 }
										}
										animate={{ scale: 1, opacity: 1 }}
										className="text-7xl sm:text-8xl font-black text-white tabular-nums drop-shadow-2xl font-mono"
									>
										{formatTime(timeLeft)}
									</motion.span>

									<span className="text-[11px] font-mono font-bold uppercase tracking-widest text-white/50 mt-1">
										{Math.round(phaseProgress * 100)}% complete
									</span>
								</CountdownRing>
							</div>

							{/* Up Next Phase Preview */}
							<div className="h-9 flex items-center justify-center">
								<AnimatePresence>
									{nextPhase && !isPaused && (
										<NextPhasePreview phase={nextPhase} />
									)}
								</AnimatePresence>
							</div>

							{/* Session Intelligence Dashboard */}
							<div className="w-full max-w-md bg-black/40 backdrop-blur-2xl rounded-3xl p-4 border border-white/10 space-y-3 shadow-2xl">
								{/* Segmented Phase Timeline */}
								<PhaseTimeline queue={queue} currentIndex={currentPhaseIndex} />

								{/* Session Progress Bar */}
								<div className="space-y-1">
									<div className="h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
										<motion.div
											className="h-full rounded-full"
											style={{ background: theme.ring }}
											animate={{ width: `${overallProgress * 100}%` }}
											transition={{ duration: 1 }}
										/>
									</div>
									<div className="flex justify-between text-[10px] font-extrabold uppercase tracking-widest text-white/50 px-0.5">
										<span>{Math.round(overallProgress * 100)}% overall</span>
										<span>
											{formatTime(totalSessionSeconds - totalElapsed)} remaining
										</span>
									</div>
								</div>

								{/* Metrics Grid */}
								<div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/10 text-center">
									<div className="p-2 bg-white/5 rounded-2xl border border-white/5">
										<span className="text-[9px] font-extrabold text-white/40 block uppercase tracking-wider">
											Elapsed
										</span>
										<span className="text-xs font-black text-white tabular-nums">
											{formatTime(totalElapsed)}
										</span>
									</div>
									<div className="p-2 bg-white/5 rounded-2xl border border-white/5">
										<span className="text-[9px] font-extrabold text-white/40 block uppercase tracking-wider">
											Remaining
										</span>
										<span className="text-xs font-black text-rose-300 tabular-nums">
											{formatTime(totalSessionSeconds - totalElapsed)}
										</span>
									</div>
									<div className="p-2 bg-white/5 rounded-2xl border border-white/5">
										<span className="text-[9px] font-extrabold text-white/40 block uppercase tracking-wider">
											Finish ETA
										</span>
										<span className="text-xs font-black text-emerald-300 tabular-nums">
											{finishEta || "--:--"}
										</span>
									</div>
								</div>
							</div>

							{/* Lap Log */}
							<LapLog laps={laps} />

							{/* Floating Ergonomic Control Dock */}
							<div className="w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-3xl p-3 border border-white/15 flex items-center justify-between shadow-2xl">
								{/* Reset */}
								<button
									type="button"
									onClick={resetTimer}
									className="p-3.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-2xl text-white active:scale-90 transition-all cursor-pointer"
									title="Reset Workout Session"
								>
									<RotateCcw className="w-5 h-5" />
								</button>

								{/* Quick Adjustment -10s */}
								<button
									type="button"
									onClick={() => adjustTime(-10)}
									className="px-3 py-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-2xl text-white text-xs font-black tracking-wider active:scale-90 transition-all cursor-pointer flex items-center gap-1"
									title="Subtract 10 seconds from current phase"
								>
									-10s
								</button>

								{/* Primary Hero Play/Pause Button */}
								<button
									type="button"
									onClick={isPaused ? resumeTimer : pauseTimer}
									className="p-6 bg-white text-slate-950 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
									title={isPaused ? "Resume Workout" : "Pause Workout"}
								>
									{isPaused ? (
										<Play className="w-8 h-8 fill-current translate-x-0.5" />
									) : (
										<Pause className="w-8 h-8 fill-current" />
									)}
								</button>

								{/* Quick Adjustment +10s */}
								<button
									type="button"
									onClick={() => adjustTime(10)}
									className="px-3 py-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-2xl text-white text-xs font-black tracking-wider active:scale-90 transition-all cursor-pointer flex items-center gap-1"
									title="Add 10 seconds to current phase"
								>
									+10s
								</button>

								{/* Skip Phase */}
								<button
									type="button"
									onClick={skipPhase}
									className="p-3.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-2xl text-white active:scale-90 transition-all cursor-pointer"
									title="Skip to Next Phase"
								>
									<SkipForward className="w-5 h-5" />
								</button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</main>
	);
}
