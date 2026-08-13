"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
	Play,
	Volume2,
	VolumeX,
	Trophy,
	Sparkles,
	Trash2,
	ArrowLeft,
	Palette,
	List,
	History,
	Shuffle,
	X,
} from "lucide-react";
import Link from "next/link";
import type { WheelItem, ColorTheme, SpinResult } from "../types";
import { COLOR_THEMES, PRESETS } from "../data/presets";
import { playTickSound, playVictorySound } from "../utils/audio";

// ─── Confetti Animation ──────────────────────────────────────────────────────

function Confetti() {
	const pieces = useMemo(
		() =>
			Array.from({ length: 45 }, (_, i) => ({
				id: i,
				x: Math.random() * 100,
				color: ["#fbbf24", "#f43f5e", "#34d399", "#60a5fa", "#a78bfa"][
					Math.floor(Math.random() * 5)
				],
				delay: Math.random() * 0.6,
				size: 7 + Math.random() * 8,
				duration: 2.2 + Math.random() * 1.3,
			})),
		[],
	);

	return (
		<div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
			{pieces.map((p) => (
				<motion.div
					key={`confetti-${p.id}`}
					className="absolute rounded-sm shadow-xs"
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
						x: (Math.random() - 0.5) * 220,
					}}
					transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
				/>
			))}
		</div>
	);
}

// ─── Helper Arc Calculation ─────────────────────────────────────────────────

function getSliceArcPath(
	cx: number,
	cy: number,
	radius: number,
	startAngle: number,
	endAngle: number,
) {
	const startRad = (startAngle - 90) * (Math.PI / 180);
	const endRad = (endAngle - 90) * (Math.PI / 180);

	const x1 = cx + radius * Math.cos(startRad);
	const y1 = cy + radius * Math.sin(startRad);
	const x2 = cx + radius * Math.cos(endRad);
	const y2 = cy + radius * Math.sin(endRad);

	const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

	return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SpinnerWheelView() {
	const reduceMotion = useReducedMotion();

	// State
	const [rawText, setRawText] = useState(
		"Pizza 🍕\nSushi 🍱\nRamen 🍜\nBurgers 🍔\nTacos 🌮\nSalad 🥗\nThai 🍲\nCurry 🍛",
	);
	const [themeKey, setThemeKey] = useState<ColorTheme>("rainbow");
	const [soundEnabled, setSoundEnabled] = useState(true);
	const [isSpinning, setIsSpinning] = useState(false);
	const [winner, setWinner] = useState<WheelItem | null>(null);
	const [history, setHistory] = useState<SpinResult[]>([]);
	const [rotationAngle, setRotationAngle] = useState(0);

	// Refs for animation physics
	const currentAngleRef = useRef(0);
	const targetAngleRef = useRef(0);
	const animationFrameRef = useRef<number | null>(null);
	const lastTickSliceRef = useRef<number>(-1);

	// Parse items from raw text
	const items = useMemo<WheelItem[]>(() => {
		const lines = rawText
			.split("\n")
			.map((l) => l.trim())
			.filter(Boolean);

		const palette = COLOR_THEMES[themeKey].colors;
		return lines.map((text, idx) => ({
			id: `item-${idx}-${text}`,
			text,
			color: palette[idx % palette.length],
		}));
	}, [rawText, themeKey]);

	// Clean up animation on unmount
	useEffect(() => {
		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, []);

	// Spin Trigger Logic
	const handleSpin = useCallback(() => {
		if (isSpinning || items.length === 0) return;

		setIsSpinning(true);
		setWinner(null);

		const count = items.length;
		const sliceAngle = 360 / count;

		// Select random winning index
		const winningIndex = Math.floor(Math.random() * count);

		// Calculate target angle to align top pointer (90deg) with winning slice center
		// In SVG coordinates, 0deg is top. Pointer is at 0deg (top).
		const sliceCenterAngle = winningIndex * sliceAngle + sliceAngle / 2;

		// Extra rotations (between 5 and 9 full 360s for dramatic anticipation)
		const extraTurns = 360 * (5 + Math.floor(Math.random() * 4));

		// Calculate exact target angle so sliceCenterAngle lands at pointer (360 - sliceCenterAngle)
		const desiredFinalModulo = (360 - sliceCenterAngle) % 360;
		const currentModulo = currentAngleRef.current % 360;

		let delta = desiredFinalModulo - currentModulo;
		if (delta <= 0) delta += 360;

		const target = currentAngleRef.current + extraTurns + delta;
		targetAngleRef.current = target;

		const startAngle = currentAngleRef.current;
		const totalDistance = target - startAngle;
		const duration = 5500; // 5.5s spin duration
		const startTime = performance.now();

		const animateSpin = (now: number) => {
			const elapsed = now - startTime;
			const progress = Math.min(1, elapsed / duration);

			// Ease out cubic deceleration curve
			const easeOut = 1 - (1 - progress) ** 3;
			const currentAngle = startAngle + totalDistance * easeOut;

			currentAngleRef.current = currentAngle;
			setRotationAngle(currentAngle);

			// Tick sound logic when slice boundary passes top pointer
			const pointerAngle = (360 - (currentAngle % 360)) % 360;
			const currentSlice = Math.floor(pointerAngle / sliceAngle);

			if (currentSlice !== lastTickSliceRef.current) {
				lastTickSliceRef.current = currentSlice;
				playTickSound(soundEnabled);
			}

			if (progress < 1) {
				animationFrameRef.current = requestAnimationFrame(animateSpin);
			} else {
				// Finished spinning!
				setIsSpinning(false);
				const winningItem = items[winningIndex];
				setWinner(winningItem);
				playVictorySound(soundEnabled);

				// Add to history
				setHistory((prev) => [
					{
						id: `res-${Date.now()}`,
						item: winningItem,
						timestamp: new Date(),
					},
					...prev,
				]);
			}
		};

		animationFrameRef.current = requestAnimationFrame(animateSpin);
	}, [isSpinning, items, soundEnabled]);

	const applyPreset = (presetItems: string[]) => {
		setRawText(presetItems.join("\n"));
		setWinner(null);
	};

	const removeWinner = () => {
		if (!winner) return;
		const lines = rawText
			.split("\n")
			.map((l) => l.trim())
			.filter(Boolean);
		const filtered = lines.filter((l) => l !== winner.text);
		setRawText(filtered.join("\n"));
		setWinner(null);
	};

	const shuffleItems = () => {
		const lines = rawText
			.split("\n")
			.map((l) => l.trim())
			.filter(Boolean);
		const shuffled = [...lines].sort(() => Math.random() - 0.5);
		setRawText(shuffled.join("\n"));
	};

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32 pt-24 sm:pt-28 font-sans">
			{winner && <Confetti />}

			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="space-y-2">
						<Link
							href="/utils"
							className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 transition-colors gap-2 group !no-underline"
						>
							<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
							Back to Utilities
						</Link>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-md shrink-0">
								<Sparkles className="w-5 h-5 text-indigo-400" />
							</div>
							<div>
								<h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
									Spinner <span className="text-indigo-600">Wheel</span>
								</h1>
								<p className="text-xs font-bold text-slate-500 mt-0.5">
									Random name & decision picker with audio feedback & physics.
								</p>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-2 self-start sm:self-auto">
						<button
							onClick={() => setSoundEnabled((s) => !s)}
							className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
							title="Toggle Audio Effects"
						>
							{soundEnabled ? (
								<Volume2 className="w-4 h-4 text-indigo-600" />
							) : (
								<VolumeX className="w-4 h-4 text-slate-400" />
							)}
							<span>{soundEnabled ? "Audio ON" : "Muted"}</span>
						</button>
					</div>
				</div>

				{/* Main Workspace Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
					{/* Left: Wheel Arena */}
					<div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-[2.5rem] p-6 sm:p-10 shadow-xl shadow-slate-200/40 flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden">
						{/* Wheel Pointer Arrow */}
						<div className="absolute top-4 sm:top-6 z-30 flex flex-col items-center">
							<div className="w-7 h-9 bg-rose-600 rounded-b-xl shadow-lg border-2 border-white flex items-center justify-center transform -translate-y-1">
								<div className="w-2 h-2 rounded-full bg-white animate-ping" />
							</div>
						</div>

						{/* Wheel Container */}
						<div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] my-4 flex items-center justify-center">
							{items.length === 0 ? (
								<div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-full w-full h-full flex flex-col items-center justify-center gap-3">
									<Sparkles className="w-8 h-8 text-slate-300" />
									<p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
										Add entries to build wheel
									</p>
								</div>
							) : (
								<div
									className="w-full h-full relative"
									style={{
										transform: `rotate(${rotationAngle}deg)`,
										transition: isSpinning ? "none" : "transform 0.1s ease-out",
									}}
								>
									<svg
										viewBox="0 0 400 400"
										className="w-full h-full drop-shadow-2xl overflow-visible"
									>
										{items.map((item, idx) => {
											const count = items.length;
											const sliceAngle = 360 / count;
											const startAngle = idx * sliceAngle;
											const endAngle = (idx + 1) * sliceAngle;

											const path = getSliceArcPath(
												200,
												200,
												190,
												startAngle,
												endAngle,
											);
											const midAngle = startAngle + sliceAngle / 2 - 90;
											const textRad = (midAngle * Math.PI) / 180;
											const textX = 200 + 115 * Math.cos(textRad);
											const textY = 200 + 115 * Math.sin(textRad);

											return (
												<g key={item.id}>
													<path
														d={path}
														fill={item.color}
														stroke="#ffffff"
														strokeWidth="2.5"
													/>
													<text
														x={textX}
														y={textY}
														fill="#ffffff"
														fontSize={
															count > 16 ? "10" : count > 10 ? "12" : "14"
														}
														fontWeight="800"
														textAnchor="middle"
														dominantBaseline="middle"
														transform={`rotate(${
															midAngle + 90
														}, ${textX}, ${textY})`}
														className="select-none tracking-tight drop-shadow-xs"
													>
														{item.text.length > 14
															? `${item.text.substring(0, 12)}…`
															: item.text}
													</text>
												</g>
											);
										})}

										{/* Outer Ring */}
										<circle
											cx="200"
											cy="200"
											r="192"
											fill="none"
											stroke="rgba(255,255,255,0.4)"
											strokeWidth="4"
										/>
									</svg>
								</div>
							)}

							{/* Center Hub Button */}
							<button
								type="button"
								onClick={handleSpin}
								disabled={isSpinning || items.length === 0}
								className="absolute z-20 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-900 hover:bg-slate-800 border-4 border-white text-white font-black text-sm uppercase tracking-widest shadow-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
							>
								<Play className="w-6 h-6 fill-current translate-x-0.5" />
								<span className="text-[10px] text-indigo-400">
									{isSpinning ? "SPINNING" : "SPIN"}
								</span>
							</button>
						</div>

						{/* Spin Trigger Bar */}
						<div className="w-full max-w-sm mt-6">
							<button
								type="button"
								onClick={handleSpin}
								disabled={isSpinning || items.length === 0}
								className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/25 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
							>
								<Play className="w-4 h-4 fill-current" />
								<span>
									{isSpinning
										? "Spinning Decision Wheel..."
										: `Spin Wheel (${items.length} Entries)`}
								</span>
							</button>
						</div>
					</div>

					{/* Right: Controls, Presets & Items Input */}
					<div className="lg:col-span-5 space-y-6">
						{/* Preset Packs */}
						<div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
									<List className="w-4 h-4 text-indigo-600" />
									<span>Quick Presets</span>
								</h3>
								<button
									type="button"
									onClick={shuffleItems}
									disabled={isSpinning || items.length === 0}
									className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
									title="Shuffle Items"
								>
									<Shuffle className="w-3 h-3" /> Shuffle
								</button>
							</div>

							<div className="flex flex-wrap gap-2">
								{PRESETS.map((p) => (
									<button
										key={p.id}
										type="button"
										onClick={() => applyPreset(p.items)}
										disabled={isSpinning}
										className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200/80 text-xs font-bold text-slate-700 transition-all cursor-pointer active:scale-95"
									>
										{p.name}
									</button>
								))}
							</div>
						</div>

						{/* Theme Selector */}
						<div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-3">
							<h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
								<Palette className="w-4 h-4 text-indigo-600" />
								<span>Color Theme Palette</span>
							</h3>
							<div className="grid grid-cols-3 gap-2">
								{(Object.keys(COLOR_THEMES) as ColorTheme[]).map((tKey) => {
									const theme = COLOR_THEMES[tKey];
									const isActive = themeKey === tKey;
									return (
										<button
											key={tKey}
											type="button"
											onClick={() => setThemeKey(tKey)}
											className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
												isActive
													? "bg-slate-900 border-slate-900 text-white shadow-md"
													: "bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100"
											}`}
										>
											<div className="flex gap-1 mb-1.5">
												{theme.colors.slice(0, 4).map((c, i) => (
													<span
														key={`dot-${c}-${i}`}
														className="w-2.5 h-2.5 rounded-full"
														style={{ background: c }}
													/>
												))}
											</div>
											<span className="text-[10px] font-black uppercase tracking-wider block truncate">
												{theme.name}
											</span>
										</button>
									);
								})}
							</div>
						</div>

						{/* Batch Entries Textarea */}
						<div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-3">
							<div className="flex items-center justify-between">
								<h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
									Wheel Entries ({items.length})
								</h3>
								<span className="text-[10px] font-bold text-slate-400 uppercase">
									1 entry per line
								</span>
							</div>

							<textarea
								value={rawText}
								onChange={(e) => setRawText(e.target.value)}
								disabled={isSpinning}
								placeholder="Enter items line by line..."
								className="w-full h-44 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-mono font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 transition-all resize-none leading-relaxed"
							/>
						</div>

						{/* Winner History Log */}
						{history.length > 0 && (
							<div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-3">
								<div className="flex items-center justify-between border-b border-slate-100 pb-2">
									<h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
										<History className="w-4 h-4 text-indigo-600" />
										<span>Recent Winners</span>
									</h3>
									<button
										type="button"
										onClick={() => setHistory([])}
										className="text-[10px] font-bold text-rose-500 hover:text-rose-700 uppercase"
									>
										Clear
									</button>
								</div>
								<div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-hide">
									{history.map((h) => (
										<div
											key={h.id}
											className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-800"
										>
											<div className="flex items-center gap-2">
												<Trophy className="w-3.5 h-3.5 text-amber-500" />
												<span>{h.item.text}</span>
											</div>
											<span className="text-[10px] text-slate-400 font-mono">
												{h.timestamp.toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Winner Announcement Modal */}
			<AnimatePresence>
				{winner && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
					>
						<motion.div
							initial={reduceMotion ? false : { scale: 0.85, y: 20 }}
							animate={{ scale: 1, y: 0 }}
							exit={{ scale: 0.9, opacity: 0 }}
							className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-slate-200 max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
						>
							{/* Background glow */}
							<div
								className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
								style={{ background: winner.color }}
							/>

							<button
								type="button"
								onClick={() => setWinner(null)}
								className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
							>
								<X className="w-4 h-4" />
							</button>

							<div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/10">
								<Trophy className="w-10 h-10" />
							</div>

							<div className="space-y-2">
								<span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600">
									Winner Selected!
								</span>
								<h2
									className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight"
									style={{ color: winner.color }}
								>
									{winner.text}
								</h2>
							</div>

							<div className="flex flex-col gap-2 pt-2">
								<button
									type="button"
									onClick={handleSpin}
									className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-extrabold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
								>
									<Play className="w-4 h-4 fill-current" /> Spin Again
								</button>
								<button
									type="button"
									onClick={removeWinner}
									className="w-full py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
								>
									<Trash2 className="w-4 h-4" /> Remove "{winner.text}" From
									Wheel
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}
