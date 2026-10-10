"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Dices, Volume2, VolumeX, Shuffle } from "lucide-react";
import UtilHeader from "@/features/utils/components/UtilHeader";
import type { WheelItem, ColorTheme, SpinResult } from "../types";
import { COLOR_THEMES } from "../data/presets";
import { playTickSound, playVictorySound } from "../utils/audio";
import WheelStage from "./WheelStage";
import WheelControls from "./WheelControls";
import WinnerModal from "./WinnerModal";

export default function SpinnerWheelView() {
	// State
	const [rawText, setRawText] = useState(
		"Neapolitan Pizza\nTokyo Ramen\nBaja Fish Tacos\nHandcrafted Burgers\nMediterranean Bowl\nPad Thai\nJapanese Curry\nFresh Sushi",
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

		// Calculate target angle to align top pointer (0deg/top in SVG) with winning slice center
		const sliceCenterAngle = winningIndex * sliceAngle + sliceAngle / 2;

		// Extra rotations (between 5 and 9 full turns for anticipation)
		const extraTurns = 360 * (5 + Math.floor(Math.random() * 4));

		// Calculate exact target angle so sliceCenterAngle lands at pointer
		const desiredFinalModulo = (360 - sliceCenterAngle) % 360;
		const currentModulo = currentAngleRef.current % 360;

		let delta = desiredFinalModulo - currentModulo;
		if (delta <= 0) delta += 360;

		const target = currentAngleRef.current + extraTurns + delta;
		targetAngleRef.current = target;

		const startAngle = currentAngleRef.current;
		const totalDistance = target - startAngle;
		const duration = 5200; // 5.2s spin duration
		const startTime = performance.now();

		const animateSpin = (now: number) => {
			const elapsed = now - startTime;
			const progress = Math.min(1, elapsed / duration);

			// Smooth ease-out cubic deceleration curve
			const easeOut = 1 - (1 - progress) ** 3;
			const currentAngle = startAngle + totalDistance * easeOut;

			currentAngleRef.current = currentAngle;
			setRotationAngle(currentAngle);

			// Sound tick logic when slice boundary passes top pointer
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

				// Record to history
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

	const handleApplyPreset = (presetItems: string[]) => {
		setRawText(presetItems.join("\n"));
		setWinner(null);
	};

	const handleRemoveWinner = () => {
		if (!winner) return;
		const lines = rawText
			.split("\n")
			.map((l) => l.trim())
			.filter(Boolean);
		const filtered = lines.filter((l) => l !== winner.text);
		setRawText(filtered.join("\n"));
		setWinner(null);
	};

	const handleShuffle = () => {
		const lines = rawText
			.split("\n")
			.map((l) => l.trim())
			.filter(Boolean);
		const shuffled = [...lines].sort(() => Math.random() - 0.5);
		setRawText(shuffled.join("\n"));
	};

	const handleSort = () => {
		const lines = rawText
			.split("\n")
			.map((l) => l.trim())
			.filter(Boolean);
		const sorted = [...lines].sort((a, b) => a.localeCompare(b));
		setRawText(sorted.join("\n"));
	};

	const handleClearEntries = () => {
		setRawText("");
		setWinner(null);
	};

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36 font-sans">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 relative z-10">
				{/* Canonical 3-Tier Floating Card Header */}
				<UtilHeader
					title="Spinner Wheel"
					description="Interactive decision wheel and random picker with Web Audio synthesis, physics deceleration, and customizable palettes."
					icon={Dices}
					category={{
						color: "purple",
					}}
					actions={
						<div className="flex flex-wrap items-center justify-between gap-3 w-full">
							<div className="flex items-center gap-2">
								<span className="text-[11px] font-medium text-slate-500">
									Active Palette:
								</span>
								<span className="text-xs font-bold text-slate-900 font-mono bg-slate-100 px-2.5 py-1 rounded-lg">
									{COLOR_THEMES[themeKey].name}
								</span>
								<span className="text-xs font-bold font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
									{items.length} Options
								</span>
							</div>

							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={handleShuffle}
									disabled={isSpinning || items.length === 0}
									className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-all cursor-pointer active:scale-95 disabled:opacity-40"
									title="Shuffle items order"
								>
									<Shuffle className="w-3.5 h-3.5 text-slate-500" />
									<span>Shuffle</span>
								</button>
								<button
									type="button"
									onClick={() => setSoundEnabled((s) => !s)}
									className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
									title="Toggle sound effects"
								>
									{soundEnabled ? (
										<Volume2 className="w-3.5 h-3.5 text-indigo-400" />
									) : (
										<VolumeX className="w-3.5 h-3.5 text-slate-400" />
									)}
									<span>{soundEnabled ? "Audio ON" : "Muted"}</span>
								</button>
							</div>
						</div>
					}
				/>

				{/* Main Workstation 2-Column Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
					{/* Left: Wheel Stage (7 cols) */}
					<div className="lg:col-span-7">
						<WheelStage
							items={items}
							rotationAngle={rotationAngle}
							isSpinning={isSpinning}
							soundEnabled={soundEnabled}
							onToggleSound={() => setSoundEnabled((s) => !s)}
							onSpin={handleSpin}
							themeName={COLOR_THEMES[themeKey].name}
						/>
					</div>

					{/* Right: Consolidated Control Console (5 cols) */}
					<div className="lg:col-span-5">
						<WheelControls
							rawText={rawText}
							onRawTextChange={setRawText}
							itemCount={items.length}
							isSpinning={isSpinning}
							themeKey={themeKey}
							onSelectTheme={setThemeKey}
							history={history}
							onClearHistory={() => setHistory([])}
							onApplyPreset={handleApplyPreset}
							onShuffle={handleShuffle}
							onSort={handleSort}
							onClearEntries={handleClearEntries}
						/>
					</div>
				</div>
			</div>

			{/* Winner Celebration Modal */}
			<WinnerModal
				winner={winner}
				onClose={() => setWinner(null)}
				onSpinAgain={handleSpin}
				onRemoveWinner={handleRemoveWinner}
			/>
		</main>
	);
}
