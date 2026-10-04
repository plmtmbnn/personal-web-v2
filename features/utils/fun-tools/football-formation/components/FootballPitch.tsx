"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Award, ArrowLeftRight } from "lucide-react";
import type {
	FormationDefinition,
	PitchSlot,
	PlayerDraft,
	TeamTactics,
} from "../types";
import { PITCH_THEMES } from "../constants";

interface FootballPitchProps {
	formation: FormationDefinition;
	slots: Record<string, PlayerDraft | null>;
	tactics: TeamTactics;
	onSelectSlot: (slot: PitchSlot) => void;
	onRemovePlayer: (slotId: string) => void;
	onToggleCaptain: (playerId: string) => void;
	onSwapSlots: (slotId1: string, slotId2: string) => void;
}

export default function FootballPitch({
	formation,
	slots,
	tactics,
	onSelectSlot,
	onRemovePlayer,
	onToggleCaptain,
	onSwapSlots,
}: FootballPitchProps) {
	const [activeSwapSlotId, setActiveSwapSlotId] = useState<string | null>(null);
	const themeConfig =
		PITCH_THEMES[tactics.theme] || PITCH_THEMES["classic-emerald"];

	const handleSlotClick = (slot: PitchSlot) => {
		if (activeSwapSlotId) {
			if (activeSwapSlotId !== slot.id) {
				onSwapSlots(activeSwapSlotId, slot.id);
			}
			setActiveSwapSlotId(null);
			return;
		}
		onSelectSlot(slot);
	};

	return (
		<div className="relative w-full max-w-2xl mx-auto">
			{/* Swap Mode Notification Bar */}
			<AnimatePresence>
				{activeSwapSlotId && (
					<motion.div
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						className="mb-3 px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-700 font-semibold"
					>
						<span className="flex items-center gap-1.5">
							<ArrowLeftRight className="w-4 h-4 text-amber-600 animate-pulse" />
							Select another position slot to swap players
						</span>
						<button
							type="button"
							onClick={() => setActiveSwapSlotId(null)}
							className="text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
						>
							Cancel
						</button>
					</motion.div>
				)}
			</AnimatePresence>

			{/* ── Football Pitch Container ── */}
			<div
				className={`relative w-full aspect-[3/4.2] sm:aspect-[3/4] rounded-3xl overflow-hidden border-2 shadow-xl select-none transition-colors duration-300 ${themeConfig.bgClass}`}
			>
				{/* Pitch Grass Stripes (Alternating) */}
				<div className="absolute inset-0 flex flex-col pointer-events-none">
					{["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map(
						(stripeId, i) => (
							<div
								key={stripeId}
								className="flex-1 w-full"
								style={{
									backgroundColor:
										i % 2 === 0 ? themeConfig.stripeColor : "transparent",
								}}
							/>
						),
					)}
				</div>

				{/* ── Pitch Vector Lines (SVG Layer) ── */}
				<svg
					className="absolute inset-0 w-full h-full pointer-events-none"
					viewBox="0 0 100 135"
					preserveAspectRatio="none"
				>
					{/* Outer Perimeter */}
					<rect
						x="4"
						y="4"
						width="92"
						height="127"
						fill="none"
						stroke={themeConfig.borderLineColor}
						strokeWidth="0.6"
					/>

					{/* Halfway Line */}
					<line
						x1="4"
						y1="67.5"
						x2="96"
						y2="67.5"
						stroke={themeConfig.borderLineColor}
						strokeWidth="0.6"
					/>

					{/* Center Circle */}
					<circle
						cx="50"
						cy="67.5"
						r="12"
						fill="none"
						stroke={themeConfig.borderLineColor}
						strokeWidth="0.6"
					/>
					{/* Center Spot */}
					<circle
						cx="50"
						cy="67.5"
						r="0.8"
						fill={themeConfig.borderLineColor}
					/>

					{/* Top Penalty Box (Attacking Box) */}
					<rect
						x="26"
						y="4"
						width="48"
						height="20"
						fill="none"
						stroke={themeConfig.borderLineColor}
						strokeWidth="0.6"
					/>
					{/* Top 6-yard Box */}
					<rect
						x="37"
						y="4"
						width="26"
						height="7"
						fill="none"
						stroke={themeConfig.borderLineColor}
						strokeWidth="0.6"
					/>
					{/* Top Penalty Spot */}
					<circle cx="50" cy="15" r="0.8" fill={themeConfig.borderLineColor} />
					{/* Top Penalty Arc */}
					<path
						d="M 40 24 A 10 10 0 0 0 60 24"
						fill="none"
						stroke={themeConfig.borderLineColor}
						strokeWidth="0.6"
					/>

					{/* Bottom Penalty Box (Defensive Box) */}
					<rect
						x="26"
						y="111"
						width="48"
						height="20"
						fill="none"
						stroke={themeConfig.borderLineColor}
						strokeWidth="0.6"
					/>
					{/* Bottom 6-yard Box */}
					<rect
						x="37"
						y="124"
						width="26"
						height="7"
						fill="none"
						stroke={themeConfig.borderLineColor}
						strokeWidth="0.6"
					/>
					{/* Bottom Penalty Spot */}
					<circle cx="50" cy="120" r="0.8" fill={themeConfig.borderLineColor} />
					{/* Bottom Penalty Arc */}
					<path
						d="M 40 111 A 10 10 0 0 1 60 111"
						fill="none"
						stroke={themeConfig.borderLineColor}
						strokeWidth="0.6"
					/>

					{/* Corner Arcs */}
					<path
						d="M 4 7 A 3 3 0 0 0 7 4"
						fill="none"
						stroke={themeConfig.borderLineColor}
						strokeWidth="0.6"
					/>
					<path
						d="M 93 4 A 3 3 0 0 0 96 7"
						fill="none"
						stroke={themeConfig.borderLineColor}
						strokeWidth="0.6"
					/>
					<path
						d="M 4 128 A 3 3 0 0 1 7 131"
						fill="none"
						stroke={themeConfig.borderLineColor}
						strokeWidth="0.6"
					/>
					<path
						d="M 93 131 A 3 3 0 0 1 96 128"
						fill="none"
						stroke={themeConfig.borderLineColor}
						strokeWidth="0.6"
					/>
				</svg>

				{/* ── Interactive Player Nodes ── */}
				<div className="absolute inset-0 p-4">
					{formation.slots.map((slot) => {
						const player = slots[slot.id];
						const isCaptain = player && player.id === tactics.captainId;
						const isSelectedForSwap = activeSwapSlotId === slot.id;

						// Badge colors based on role
						const roleColorMap = {
							GK: "bg-amber-500 text-amber-950 border-amber-300",
							DF: "bg-blue-600 text-white border-blue-400",
							MF: "bg-emerald-600 text-white border-emerald-400",
							FW: "bg-rose-600 text-white border-rose-400",
						};

						return (
							<div
								key={slot.id}
								className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10"
								style={{
									left: `${slot.x}%`,
									top: `${slot.y}%`,
								}}
							>
								{/* Clickable Node Entity */}
								<div className="flex flex-col items-center group relative">
									{/* Quick Action Overlay (Remove / Captain / Swap) on Hover or focus */}
									{player && (
										<div className="absolute -top-7 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-1 bg-slate-950/85 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-slate-700 shadow-md z-20 pointer-events-auto">
											<button
												type="button"
												title={isCaptain ? "Remove Captain" : "Make Captain"}
												onClick={(e) => {
													e.stopPropagation();
													onToggleCaptain(player.id);
												}}
												className={`p-1 rounded-md text-[10px] font-bold ${
													isCaptain
														? "text-yellow-400 bg-yellow-400/20"
														: "text-slate-300 hover:text-yellow-400"
												} cursor-pointer transition-colors`}
											>
												<Award className="w-3 h-3" />
											</button>
											<button
												type="button"
												title="Swap Position"
												onClick={(e) => {
													e.stopPropagation();
													setActiveSwapSlotId(slot.id);
												}}
												className="p-1 rounded-md text-[10px] text-slate-300 hover:text-white cursor-pointer transition-colors"
											>
												<ArrowLeftRight className="w-3 h-3" />
											</button>
											<button
												type="button"
												title="Remove Player"
												onClick={(e) => {
													e.stopPropagation();
													onRemovePlayer(slot.id);
												}}
												className="p-1 rounded-md text-[10px] text-slate-300 hover:text-rose-400 cursor-pointer transition-colors"
											>
												<X className="w-3 h-3" />
											</button>
										</div>
									)}

									{/* Circular Jersey / Avatar / Slot Token */}
									<button
										type="button"
										onClick={() => handleSlotClick(slot)}
										className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-xs sm:text-sm tracking-tight border-2 transition-all cursor-pointer touch-manipulation active:scale-95 shadow-md ${
											isSelectedForSwap
												? "ring-4 ring-amber-400 ring-offset-2 scale-110"
												: ""
										} ${
											player
												? `${roleColorMap[player.role]} shadow-lg hover:scale-105`
												: "bg-slate-900/60 border-dashed border-white/50 text-white/80 hover:bg-slate-900/90 hover:border-white hover:scale-105"
										}`}
										style={{
											backgroundColor: player?.avatarBg || undefined,
										}}
										aria-label={`Position ${slot.label}: ${player ? player.name : "Empty slot"}`}
									>
										{player ? (
											<span className="font-extrabold text-white text-xs sm:text-sm drop-shadow-xs">
												{player.number}
											</span>
										) : (
											<Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white/70 group-hover:text-white transition-colors" />
										)}

										{/* Captain Armband Pip */}
										{isCaptain && (
											<span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 border border-slate-900 text-slate-950 font-black text-[9px] flex items-center justify-center shadow-xs">
												C
											</span>
										)}
									</button>

									{/* Name Tag / Role Label Pill */}
									<button
										type="button"
										onClick={() => handleSlotClick(slot)}
										className="mt-1 px-2 py-0.5 max-w-[76px] sm:max-w-[96px] rounded-md bg-slate-950/85 backdrop-blur-xs border border-white/10 text-center cursor-pointer shadow-xs hover:border-white/30 transition-colors block w-full"
									>
										<p className="text-[10px] sm:text-[11px] font-bold text-white truncate leading-tight">
											{player
												? (player.name.split(" ").slice(-1)[0] ?? player.name)
												: slot.label}
										</p>
										<p className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
											{slot.label}
										</p>
									</button>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
