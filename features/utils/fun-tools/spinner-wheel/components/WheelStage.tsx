"use client";

import { useEffect } from "react";
import { Play, Volume2, VolumeX, Dices, RotateCcw } from "lucide-react";
import type { WheelItem } from "../types";

// Helper for SVG Arc path calculation
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

interface WheelStageProps {
	items: WheelItem[];
	rotationAngle: number;
	isSpinning: boolean;
	soundEnabled: boolean;
	onToggleSound: () => void;
	onSpin: () => void;
	themeName: string;
}

export default function WheelStage({
	items,
	rotationAngle,
	isSpinning,
	soundEnabled,
	onToggleSound,
	onSpin,
	themeName,
}: WheelStageProps) {
	// Support pressing Space bar to spin
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.code === "Space") {
				const activeTag = document.activeElement?.tagName.toLowerCase();
				if (activeTag !== "textarea" && activeTag !== "input") {
					e.preventDefault();
					if (!isSpinning && items.length > 0) {
						onSpin();
					}
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isSpinning, items.length, onSpin]);

	return (
		<div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-8 shadow-xs flex flex-col items-center justify-between min-h-[520px] sm:min-h-[560px] relative overflow-hidden">
			{/* Top Telemetry & Audio Bar */}
			<div className="w-full flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
				<div className="flex items-center gap-2">
					<span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl">
						<Dices className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
						<span>{items.length} Entries</span>
					</span>
					<span className="hidden sm:inline-flex text-[11px] font-medium text-slate-500 font-mono">
						Palette: {themeName}
					</span>
				</div>

				<div className="flex items-center gap-2">
					{isSpinning ? (
						<span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl font-mono animate-pulse">
							<RotateCcw className="w-3 h-3 animate-spin" />
							<span>Spinning</span>
						</span>
					) : (
						<span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-xl font-mono">
							<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
							<span>Ready</span>
						</span>
					)}

					<button
						type="button"
						onClick={onToggleSound}
						className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer active:scale-95"
						title={soundEnabled ? "Mute audio effects" : "Enable audio effects"}
					>
						{soundEnabled ? (
							<Volume2 className="w-3.5 h-3.5 text-indigo-600" />
						) : (
							<VolumeX className="w-3.5 h-3.5 text-slate-400" />
						)}
						<span className="text-[11px] font-mono">
							{soundEnabled ? "Audio ON" : "Muted"}
						</span>
					</button>
				</div>
			</div>

			{/* Wheel Pointer Needle */}
			<div className="absolute top-[4.75rem] sm:top-[5.25rem] z-30 flex flex-col items-center pointer-events-none">
				<div className="w-7 h-9 bg-rose-600 rounded-b-xl shadow-lg border-2 border-white flex items-center justify-center transform -translate-y-1">
					<div className="w-2 h-2 rounded-full bg-white" />
				</div>
			</div>

			{/* Wheel Rotating Canvas */}
			<div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] lg:w-[380px] lg:h-[380px] my-6 flex items-center justify-center">
				{items.length === 0 ? (
					<div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-full w-full h-full flex flex-col items-center justify-center gap-3">
						<Dices className="w-10 h-10 text-slate-300" />
						<p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
							Add entries to populate wheel
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
							className="w-full h-full drop-shadow-xl overflow-visible"
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
											fontSize={count > 16 ? "10" : count > 10 ? "12" : "13"}
											fontWeight="700"
											textAnchor="middle"
											dominantBaseline="middle"
											transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
											className="select-none tracking-tight drop-shadow-xs"
										>
											{item.text.length > 14
												? `${item.text.substring(0, 12)}…`
												: item.text}
										</text>
									</g>
								);
							})}

							{/* Outer Crisp Edge Ring */}
							<circle
								cx="200"
								cy="200"
								r="192"
								fill="none"
								stroke="rgba(255,255,255,0.6)"
								strokeWidth="3.5"
							/>
						</svg>
					</div>
				)}

				{/* Center Hub Button */}
				<button
					type="button"
					onClick={onSpin}
					disabled={isSpinning || items.length === 0}
					className="absolute z-20 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-900 hover:bg-slate-800 border-4 border-white text-white font-bold text-xs uppercase tracking-wider shadow-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
					title="Click to spin the wheel"
				>
					<Play className="w-5 h-5 fill-current translate-x-0.5 text-white" />
					<span className="text-[10px] text-indigo-400 font-bold font-mono">
						{isSpinning ? "SPINNING" : "SPIN"}
					</span>
				</button>
			</div>

			{/* Primary Spin Button Trigger */}
			<div className="w-full max-w-sm pt-2">
				<button
					type="button"
					onClick={onSpin}
					disabled={isSpinning || items.length === 0}
					className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-xs active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
				>
					<Play className="w-4 h-4 fill-current text-white" />
					<span>
						{isSpinning
							? "Spinning Wheel..."
							: `Spin Wheel (${items.length} Entries)`}
					</span>
					<span className="hidden sm:inline-flex ml-2 px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono font-normal">
						Space
					</span>
				</button>
			</div>
		</div>
	);
}
